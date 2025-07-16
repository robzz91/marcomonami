const Model = require('./Model');

class Client extends Model {
    constructor() {
        super('clients');
    }

    /**
     * Trouve un client par ID utilisateur
     */
    async findByUserId(userId) {
        const query = `
            SELECT c.*, u.email, u.nom, u.prenom, u.telephone, u.adresse
            FROM clients c
            JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE c.utilisateur_id = ?`;
        const [rows] = await this.db.execute(query, [userId]);
        return rows[0];
    }

    /**
     * Récupère les statistiques d'un client
     */
    async getStats(clientId, periode = 30) {
        const query = `
            SELECT 
                COUNT(DISTINCT a.id) as total_annonces,
                COUNT(DISTINCT l.id) as total_livraisons,
                COUNT(DISTINCT ps.id) as total_prestations,
                SUM(CASE WHEN l.statut = 'livree' THEN 1 ELSE 0 END) as livraisons_completees,
                SUM(CASE WHEN ps.statut = 'terminee' THEN 1 ELSE 0 END) as prestations_completees,
                SUM(p.montant) as montant_total_depense,
                AVG(l.note_client) as note_moyenne_donnee
            FROM clients c
            LEFT JOIN annonces a ON a.utilisateur_id = c.utilisateur_id AND a.type_createur = 'client'
            LEFT JOIN livraisons l ON l.annonce_id = a.id
            LEFT JOIN prestations_services ps ON ps.client_id = c.id
            LEFT JOIN paiements p ON (
                (p.entite_id = l.id AND p.type_entite = 'livraison') OR
                (p.entite_id = ps.id AND p.type_entite = 'prestation')
            )
            WHERE c.id = ?
            AND c.date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
        
        const [stats] = await this.db.execute(query, [clientId, periode]);
        return stats[0];
    }

    /**
     * Récupère les prestations réservées par un client
     */
    async getPrestations(clientId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT ps.*, 
                   s.nom as service_nom,
                   s.description as service_description,
                   s.prix as service_prix,
                   prest.utilisateur_id as prestataire_user_id,
                   up.nom as prestataire_nom,
                   up.prenom as prestataire_prenom,
                   up.telephone as prestataire_telephone,
                   prest.note_moyenne as prestataire_note
            FROM prestations_services ps
            JOIN services s ON ps.service_id = s.id
            JOIN prestataires prest ON ps.prestataire_id = prest.id
            JOIN utilisateurs up ON prest.utilisateur_id = up.id
            WHERE ps.client_id = ?`;
        
        const params = [clientId];
        
        if (options.statut) {
            query += ' AND ps.statut = ?';
            params.push(options.statut);
        }
        
        if (options.dateDebut) {
            query += ' AND DATE(ps.date_prestation) >= ?';
            params.push(options.dateDebut);
        }
        
        if (options.dateFin) {
            query += ' AND DATE(ps.date_prestation) <= ?';
            params.push(options.dateFin);
        }
        
        query += ' ORDER BY ps.date_prestation DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        let countQuery = 'SELECT COUNT(*) as total FROM prestations_services WHERE client_id = ?';
        const countParams = [clientId];
        
        if (options.statut) {
            countQuery += ' AND statut = ?';
            countParams.push(options.statut);
        }
        
        const [countResult] = await this.db.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        return {
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Réserve un service
     */
    async reserverService(clientId, serviceId, prestataireId, data) {
        // Vérifier la disponibilité du prestataire
        const disponibilite = await this.checkPrestataireDisponibilite(
            prestataireId, 
            data.date_prestation, 
            data.heure_debut,
            data.heure_fin
        );
        
        if (!disponibilite.disponible) {
            throw new Error('Prestataire non disponible à cette date/heure');
        }
        
        // Créer la prestation
        const prestationData = {
            client_id: clientId,
            prestataire_id: prestataireId,
            service_id: serviceId,
            date_prestation: data.date_prestation,
            heure_debut: data.heure_debut,
            heure_fin: data.heure_fin,
            adresse_prestation: data.adresse_prestation,
            instructions_specifiques: data.instructions_specifiques || null,
            statut: 'reservee',
            date_creation: new Date()
        };
        
        const db = this.db;
        let connection;
        
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            
            // Créer la prestation
            const [prestationResult] = await connection.execute(
                `INSERT INTO prestations_services 
                (client_id, prestataire_id, service_id, date_prestation, heure_debut, heure_fin, 
                 adresse_prestation, instructions_specifiques, statut, date_creation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                Object.values(prestationData)
            );
            
            const prestationId = prestationResult.insertId;
            
            // Marquer le créneau comme indisponible
            await connection.execute(
                `INSERT INTO indisponibilites_prestataires 
                (prestataire_id, date_debut, date_fin, motif, type_indisponibilite, date_creation)
                VALUES (?, ?, ?, 'Prestation réservée', 'reservation', NOW())`,
                [
                    prestataireId,
                    `${data.date_prestation} ${data.heure_debut}`,
                    `${data.date_prestation} ${data.heure_fin}`,
                ]
            );
            
            await connection.commit();
            
            // Récupérer la prestation créée avec les détails
            const [prestation] = await this.db.execute(`
                SELECT ps.*, 
                       s.nom as service_nom,
                       s.description as service_description,
                       prest.utilisateur_id as prestataire_user_id,
                       up.nom as prestataire_nom,
                       up.prenom as prestataire_prenom
                FROM prestations_services ps
                JOIN services s ON ps.service_id = s.id
                JOIN prestataires prest ON ps.prestataire_id = prest.id
                JOIN utilisateurs up ON prest.utilisateur_id = up.id
                WHERE ps.id = ?`,
                [prestationId]
            );
            
            return prestation[0];
            
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Vérifier la disponibilité d'un prestataire
     */
    async checkPrestataireDisponibilite(prestataireId, date, heureDebut, heureFin) {
        // Vérifier les disponibilités normales
        const jourSemaine = new Date(date).getDay();
        const [disponibilites] = await this.db.execute(`
            SELECT * FROM disponibilites_prestataires 
            WHERE prestataire_id = ? 
            AND jour_semaine = ?
            AND heure_debut <= ? 
            AND heure_fin >= ?`,
            [prestataireId, jourSemaine, heureDebut, heureFin]
        );
        
        if (disponibilites.length === 0) {
            return { disponible: false, raison: 'Hors créneau de disponibilité' };
        }
        
        // Vérifier les indisponibilités
        const [indisponibilites] = await this.db.execute(`
            SELECT * FROM indisponibilites_prestataires 
            WHERE prestataire_id = ?
            AND DATE(date_debut) <= ? 
            AND DATE(date_fin) >= ?
            AND TIME(date_debut) < ? 
            AND TIME(date_fin) > ?`,
            [prestataireId, date, date, heureFin, heureDebut]
        );
        
        if (indisponibilites.length > 0) {
            return { disponible: false, raison: 'Créneau déjà réservé' };
        }
        
        return { disponible: true };
    }

    /**
     * Rechercher des services disponibles
     */
    async searchServices(options = {}) {
        let query = `
            SELECT s.*, 
                   c.nom as categorie_nom,
                   COUNT(DISTINCT ps.id) as nombre_prestations,
                   AVG(ps.note_client) as note_moyenne,
                   MIN(s.prix) as prix_min,
                   MAX(s.prix) as prix_max
            FROM services s
            LEFT JOIN categories_services c ON s.categorie_id = c.id
            LEFT JOIN prestations_services ps ON s.id = ps.service_id
            WHERE s.est_actif = 1`;
        
        const params = [];
        
        if (options.categorieId) {
            query += ' AND s.categorie_id = ?';
            params.push(options.categorieId);
        }
        
        if (options.prixMin) {
            query += ' AND s.prix >= ?';
            params.push(options.prixMin);
        }
        
        if (options.prixMax) {
            query += ' AND s.prix <= ?';
            params.push(options.prixMax);
        }
        
        if (options.motCle) {
            query += ' AND (s.nom LIKE ? OR s.description LIKE ?)';
            params.push(`%${options.motCle}%`, `%${options.motCle}%`);
        }
        
        query += ' GROUP BY s.id ORDER BY s.nom ASC';
        
        const [services] = await this.db.execute(query, params);
        return services;
    }

    /**
     * Récupère l'historique des paiements d'un client
     */
    async getPaiements(clientId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT p.*, 
                   CASE 
                       WHEN p.type_entite = 'livraison' THEN CONCAT('Livraison - ', a.titre)
                       WHEN p.type_entite = 'prestation' THEN CONCAT('Service - ', s.nom)
                       ELSE 'Autre'
                   END as description
            FROM paiements p
            LEFT JOIN livraisons l ON p.entite_id = l.id AND p.type_entite = 'livraison'
            LEFT JOIN annonces a ON l.annonce_id = a.id
            LEFT JOIN prestations_services ps ON p.entite_id = ps.id AND p.type_entite = 'prestation'
            LEFT JOIN services s ON ps.service_id = s.id
            WHERE (
                (p.type_entite = 'livraison' AND a.utilisateur_id = (SELECT utilisateur_id FROM clients WHERE id = ?)) OR
                (p.type_entite = 'prestation' AND ps.client_id = ?)
            )`;
        
        const params = [clientId, clientId];
        
        if (options.statut) {
            query += ' AND p.statut = ?';
            params.push(options.statut);
        }
        
        query += ' ORDER BY p.date_creation DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total - requête simplifiée
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total FROM paiements p
            LEFT JOIN livraisons l ON p.entite_id = l.id AND p.type_entite = 'livraison'
            LEFT JOIN annonces a ON l.annonce_id = a.id
            LEFT JOIN prestations_services ps ON p.entite_id = ps.id AND p.type_entite = 'prestation'
            WHERE (
                (p.type_entite = 'livraison' AND a.utilisateur_id = (SELECT utilisateur_id FROM clients WHERE id = ?)) OR
                (p.type_entite = 'prestation' AND ps.client_id = ?)
            )`;
        
        const [countResult] = await this.db.execute(countQuery, [clientId, clientId]);
        const total = countResult[0].total;
        
        return {
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Mettre à jour les préférences de tutoriel
     */
    async updateTutorialStatus(userId, tutorialCompleted = true) {
        const client = await this.findByUserId(userId);
        if (!client) {
            throw new Error('Client non trouvé');
        }
        
        return await this.update(client.id, {
            tutoriel_complete: tutorialCompleted,
            date_modification: new Date()
        });
    }
}

module.exports = new Client();