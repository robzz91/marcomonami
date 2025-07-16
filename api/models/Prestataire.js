const Model = require('./Model');

class Prestataire extends Model {
    constructor() {
        super('prestataires');
    }

    /**
     * Trouve un prestataire par ID utilisateur
     */
    async findByUserId(userId) {
        const query = `
            SELECT p.*, u.email, u.nom, u.prenom, u.telephone, u.adresse
            FROM prestataires p
            JOIN utilisateurs u ON p.utilisateur_id = u.id
            WHERE p.utilisateur_id = ?`;
        const [rows] = await this.db.execute(query, [userId]);
        return rows[0];
    }

    /**
     * Récupère les statistiques d'un prestataire
     */
    async getStats(prestataireId, periode = 30) {
        const query = `
            SELECT 
                COUNT(DISTINCT ps.id) as total_prestations,
                SUM(CASE WHEN ps.statut = 'terminee' THEN 1 ELSE 0 END) as prestations_completees,
                SUM(CASE WHEN ps.statut = 'annulee' THEN 1 ELSE 0 END) as prestations_annulees,
                AVG(ps.note_client) as note_moyenne,
                SUM(f.montant_total) as revenus_total,
                COUNT(DISTINCT ps.client_id) as clients_uniques
            FROM prestataires p
            LEFT JOIN prestations_services ps ON p.id = ps.prestataire_id
            LEFT JOIN factures f ON f.entite_id = p.id AND f.type_entite = 'prestataire'
            WHERE p.id = ?
            AND ps.date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
        
        const [stats] = await this.db.execute(query, [prestataireId, periode]);
        return stats[0];
    }

    /**
     * Récupère les prestations d'un prestataire
     */
    async getPrestations(prestataireId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT ps.*, 
                   s.nom as service_nom,
                   s.description as service_description,
                   c.utilisateur_id as client_user_id,
                   uc.nom as client_nom,
                   uc.prenom as client_prenom,
                   uc.telephone as client_telephone
            FROM prestations_services ps
            JOIN services s ON ps.service_id = s.id
            JOIN clients c ON ps.client_id = c.id
            JOIN utilisateurs uc ON c.utilisateur_id = uc.id
            WHERE ps.prestataire_id = ?`;
        
        const params = [prestataireId];
        
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
        let countQuery = 'SELECT COUNT(*) as total FROM prestations_services WHERE prestataire_id = ?';
        const countParams = [prestataireId];
        
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
     * Récupère les disponibilités d'un prestataire
     */
    async getDisponibilites(prestataireId) {
        const query = `
            SELECT * FROM disponibilites_prestataires 
            WHERE prestataire_id = ?
            ORDER BY jour_semaine ASC, heure_debut ASC`;
        
        const [disponibilites] = await this.db.execute(query, [prestataireId]);
        return disponibilites;
    }

    /**
     * Met à jour les disponibilités d'un prestataire
     */
    async updateDisponibilites(prestataireId, disponibilites) {
        const db = this.db;
        let connection;
        
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            
            // Supprimer les anciennes disponibilités
            await connection.execute(
                'DELETE FROM disponibilites_prestataires WHERE prestataire_id = ?',
                [prestataireId]
            );
            
            // Ajouter les nouvelles disponibilités
            for (const dispo of disponibilites) {
                await connection.execute(
                    `INSERT INTO disponibilites_prestataires 
                    (prestataire_id, jour_semaine, heure_debut, heure_fin, date_creation)
                    VALUES (?, ?, ?, ?, NOW())`,
                    [prestataireId, dispo.jour_semaine, dispo.heure_debut, dispo.heure_fin]
                );
            }
            
            await connection.commit();
            return await this.getDisponibilites(prestataireId);
            
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Récupère les indisponibilités d'un prestataire
     */
    async getIndisponibilites(prestataireId, dateDebut = null, dateFin = null) {
        let query = `
            SELECT * FROM indisponibilites_prestataires 
            WHERE prestataire_id = ?`;
        
        const params = [prestataireId];
        
        if (dateDebut) {
            query += ' AND DATE(date_debut) >= ?';
            params.push(dateDebut);
        }
        
        if (dateFin) {
            query += ' AND DATE(date_fin) <= ?';
            params.push(dateFin);
        }
        
        query += ' ORDER BY date_debut ASC';
        
        const [indisponibilites] = await this.db.execute(query, params);
        return indisponibilites;
    }

    /**
     * Ajouter une indisponibilité
     */
    async addIndisponibilite(prestataireId, data) {
        const indisponibiliteData = {
            prestataire_id: prestataireId,
            date_debut: data.date_debut,
            date_fin: data.date_fin,
            motif: data.motif,
            type_indisponibilite: data.type_indisponibilite || 'personnelle',
            date_creation: new Date()
        };
        
        const query = `
            INSERT INTO indisponibilites_prestataires 
            (prestataire_id, date_debut, date_fin, motif, type_indisponibilite, date_creation)
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        const [result] = await this.db.execute(query, Object.values(indisponibiliteData));
        
        if (result.insertId) {
            const [indisponibilite] = await this.db.execute(
                'SELECT * FROM indisponibilites_prestataires WHERE id = ?',
                [result.insertId]
            );
            return indisponibilite[0];
        }
        
        return null;
    }

    /**
     * Récupère les compétences d'un prestataire
     */
    async getCompetences(prestataireId) {
        const query = `
            SELECT c.*, pc.niveau_competence, pc.certifiee
            FROM competences_prestataires c
            JOIN prestataire_competence pc ON c.id = pc.competence_id
            WHERE pc.prestataire_id = ?
            ORDER BY c.nom ASC`;
        
        const [competences] = await this.db.execute(query, [prestataireId]);
        return competences;
    }

    /**
     * Ajouter/Mettre à jour une compétence
     */
    async updateCompetence(prestataireId, competenceId, niveau, certifiee = false) {
        const query = `
            INSERT INTO prestataire_competence 
            (prestataire_id, competence_id, niveau_competence, certifiee, date_creation)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            niveau_competence = VALUES(niveau_competence),
            certifiee = VALUES(certifiee),
            date_modification = NOW()`;
        
        await this.db.execute(query, [prestataireId, competenceId, niveau, certifiee]);
        return await this.getCompetences(prestataireId);
    }

    /**
     * Accepter une prestation
     */
    async accepterPrestation(prestationId, prestataireId) {
        const [prestation] = await this.db.execute(
            'SELECT * FROM prestations_services WHERE id = ? AND prestataire_id = ?',
            [prestationId, prestataireId]
        );
        
        if (!prestation[0]) {
            throw new Error('Prestation non trouvée ou non autorisée');
        }
        
        if (prestation[0].statut !== 'reservee') {
            throw new Error('Cette prestation ne peut pas être acceptée');
        }
        
        await this.db.execute(
            `UPDATE prestations_services 
            SET statut = 'confirmee', date_confirmation = NOW() 
            WHERE id = ?`,
            [prestationId]
        );
        
        return await this.db.execute(
            'SELECT * FROM prestations_services WHERE id = ?',
            [prestationId]
        ).then(([rows]) => rows[0]);
    }

    /**
     * Démarrer une prestation
     */
    async demarrerPrestation(prestationId, prestataireId) {
        const [prestation] = await this.db.execute(
            'SELECT * FROM prestations_services WHERE id = ? AND prestataire_id = ?',
            [prestationId, prestataireId]
        );
        
        if (!prestation[0]) {
            throw new Error('Prestation non trouvée ou non autorisée');
        }
        
        if (prestation[0].statut !== 'confirmee') {
            throw new Error('Cette prestation ne peut pas être démarrée');
        }
        
        await this.db.execute(
            `UPDATE prestations_services 
            SET statut = 'en_cours', date_debut_reelle = NOW() 
            WHERE id = ?`,
            [prestationId]
        );
        
        return await this.db.execute(
            'SELECT * FROM prestations_services WHERE id = ?',
            [prestationId]
        ).then(([rows]) => rows[0]);
    }

    /**
     * Terminer une prestation
     */
    async terminerPrestation(prestationId, prestataireId, compteRendu = null) {
        const [prestation] = await this.db.execute(
            'SELECT * FROM prestations_services WHERE id = ? AND prestataire_id = ?',
            [prestationId, prestataireId]
        );
        
        if (!prestation[0]) {
            throw new Error('Prestation non trouvée ou non autorisée');
        }
        
        if (prestation[0].statut !== 'en_cours') {
            throw new Error('Cette prestation ne peut pas être terminée');
        }
        
        await this.db.execute(
            `UPDATE prestations_services 
            SET statut = 'terminee', 
                date_fin_reelle = NOW(),
                compte_rendu = ?
            WHERE id = ?`,
            [compteRendu, prestationId]
        );
        
        return await this.db.execute(
            'SELECT * FROM prestations_services WHERE id = ?',
            [prestationId]
        ).then(([rows]) => rows[0]);
    }

    /**
     * Récupère les évaluations d'un prestataire
     */
    async getEvaluations(prestataireId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT ps.note_client, ps.commentaire_client, ps.date_fin_reelle,
                   s.nom as service_nom,
                   c.utilisateur_id as client_user_id,
                   uc.nom as client_nom,
                   uc.prenom as client_prenom
            FROM prestations_services ps
            JOIN services s ON ps.service_id = s.id
            JOIN clients c ON ps.client_id = c.id
            JOIN utilisateurs uc ON c.utilisateur_id = uc.id
            WHERE ps.prestataire_id = ?
            AND ps.note_client IS NOT NULL`;
        
        const params = [prestataireId];
        
        if (options.noteMin) {
            query += ' AND ps.note_client >= ?';
            params.push(options.noteMin);
        }
        
        query += ' ORDER BY ps.date_fin_reelle DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM prestations_services 
            WHERE prestataire_id = ? AND note_client IS NOT NULL`;
        const countParams = [prestataireId];
        
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
     * Générer une facture mensuelle pour un prestataire
     */
    async genererFactureMensuelle(prestataireId, mois, annee) {
        const dateDebut = `${annee}-${mois.toString().padStart(2, '0')}-01`;
        const dateFin = new Date(annee, mois, 0).toISOString().split('T')[0];
        
        // Récupérer les prestations terminées du mois
        const [prestations] = await this.db.execute(`
            SELECT ps.*, s.nom as service_nom, s.prix
            FROM prestations_services ps
            JOIN services s ON ps.service_id = s.id
            WHERE ps.prestataire_id = ?
            AND ps.statut = 'terminee'
            AND DATE(ps.date_fin_reelle) >= ?
            AND DATE(ps.date_fin_reelle) <= ?`,
            [prestataireId, dateDebut, dateFin]
        );
        
        if (prestations.length === 0) {
            return null; // Pas de prestations ce mois-ci
        }
        
        const montantTotal = prestations.reduce((total, prestation) => {
            return total + (prestation.prix || 0);
        }, 0);
        
        // Appliquer le taux de commission (stocké dans la table prestataires)
        const [prestataire] = await this.db.execute(
            'SELECT taux_commission FROM prestataires WHERE id = ?',
            [prestataireId]
        );
        
        const tauxCommission = prestataire[0]?.taux_commission || 0.15; // 15% par défaut
        const montantCommission = montantTotal * tauxCommission;
        const montantNet = montantTotal - montantCommission;
        
        const db = this.db;
        let connection;
        
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            
            // Créer la facture
            const numeroFacture = this.generateNumeroFacture('PREST', prestataireId);
            
            const [factureResult] = await connection.execute(
                `INSERT INTO factures 
                (numero_facture, type_entite, entite_id, montant_total, statut, date_creation)
                VALUES (?, 'prestataire', ?, ?, 'generee', NOW())`,
                [numeroFacture, prestataireId, montantNet]
            );
            
            const factureId = factureResult.insertId;
            
            // Ajouter les lignes de facture
            for (const prestation of prestations) {
                await connection.execute(
                    `INSERT INTO lignes_factures 
                    (facture_id, description, quantite, prix_unitaire, montant, date_creation)
                    VALUES (?, ?, 1, ?, ?, NOW())`,
                    [
                        factureId,
                        `${prestation.service_nom} - ${prestation.date_prestation}`,
                        prestation.prix,
                        prestation.prix
                    ]
                );
            }
            
            // Ligne de commission
            await connection.execute(
                `INSERT INTO lignes_factures 
                (facture_id, description, quantite, prix_unitaire, montant, date_creation)
                VALUES (?, ?, 1, ?, ?, NOW())`,
                [
                    factureId,
                    `Commission EcoDeli (${(tauxCommission * 100).toFixed(1)}%)`,
                    -montantCommission,
                    -montantCommission
                ]
            );
            
            await connection.commit();
            
            // Récupérer la facture créée
            const [facture] = await this.db.execute(
                'SELECT * FROM factures WHERE id = ?',
                [factureId]
            );
            
            return facture[0];
            
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Générer un numéro de facture
     */
    generateNumeroFacture(prefix = 'PREST', prestataireId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prestataireStr = prestataireId.toString().padStart(4, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${year}${month}-${prestataireStr}-${random}`;
    }
}

module.exports = new Prestataire();