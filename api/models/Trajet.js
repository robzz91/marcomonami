const Model = require('./Model');

class Trajet extends Model {
    constructor() {
        super('trajets_livreurs');
    }

    /**
     * Trouve les trajets d'un livreur
     */
    async findByLivreurId(livreurId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT t.*, l.utilisateur_id,
                   u.nom as livreur_nom, u.prenom as livreur_prenom
            FROM trajets_livreurs t
            JOIN livreurs l ON t.livreur_id = l.id
            JOIN utilisateurs u ON l.utilisateur_id = u.id
            WHERE t.livreur_id = ?`;
        
        const params = [livreurId];
        
        // Filtrer par statut si spécifié
        if (options.statut) {
            query += ' AND t.statut = ?';
            params.push(options.statut);
        }
        
        // Filtrer par date si spécifiée
        if (options.dateDebut) {
            query += ' AND DATE(t.date_depart) >= ?';
            params.push(options.dateDebut);
        }
        
        if (options.dateFin) {
            query += ' AND DATE(t.date_depart) <= ?';
            params.push(options.dateFin);
        }
        
        query += ' ORDER BY t.date_depart DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM trajets_livreurs t 
            WHERE t.livreur_id = ?`;
        const countParams = [livreurId];
        
        if (options.statut) {
            countQuery += ' AND t.statut = ?';
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
     * Trouve les trajets compatibles avec une annonce
     */
    async findCompatibleWithAnnonce(annonce) {
        const query = `
            SELECT t.*, l.utilisateur_id,
                   u.nom as livreur_nom, u.prenom as livreur_prenom,
                   l.note_moyenne, l.nombre_livraisons
            FROM trajets_livreurs t
            JOIN livreurs l ON t.livreur_id = l.id
            JOIN utilisateurs u ON l.utilisateur_id = u.id
            WHERE t.statut = 'actif'
            AND t.date_depart >= NOW()
            AND (
                (t.point_depart LIKE ? OR t.ville_depart = ?)
                AND (t.point_arrivee LIKE ? OR t.ville_arrivee = ?)
            )
            AND t.capacite_disponible >= ?
            ORDER BY t.date_depart ASC`;
        
        const params = [
            `%${annonce.adresse_depart}%`,
            annonce.ville_depart,
            `%${annonce.adresse_arrivee}%`,
            annonce.ville_arrivee,
            annonce.poids || 0
        ];
        
        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    /**
     * Met à jour la capacité disponible d'un trajet
     */
    async updateCapacite(trajetId, capaciteUtilisee) {
        const trajet = await this.findById(trajetId);
        if (!trajet) {
            throw new Error('Trajet non trouvé');
        }
        
        const nouvelleCapacite = trajet.capacite_disponible - capaciteUtilisee;
        if (nouvelleCapacite < 0) {
            throw new Error('Capacité insuffisante');
        }
        
        return await this.update(trajetId, {
            capacite_disponible: nouvelleCapacite,
            date_modification: new Date()
        });
    }

    /**
     * Active ou désactive un trajet
     */
    async toggleStatus(trajetId, statut) {
        return await this.update(trajetId, {
            statut: statut,
            date_modification: new Date()
        });
    }

    /**
     * Vérifie si un trajet appartient à un livreur
     */
    async belongsToLivreur(trajetId, livreurId) {
        const trajet = await this.findOne({ id: trajetId, livreur_id: livreurId });
        return !!trajet;
    }

    /**
     * Récupère les trajets à venir d'un livreur
     */
    async getUpcomingTrajets(livreurId, limit = 5) {
        const query = `
            SELECT t.*, 
                   COUNT(DISTINCT a.id) as nombre_annonces_compatibles
            FROM trajets_livreurs t
            LEFT JOIN annonces a ON 
                a.statut = 'publiee' AND
                a.ville_depart = t.ville_depart AND
                a.ville_arrivee = t.ville_arrivee
            WHERE t.livreur_id = ?
            AND t.date_depart >= NOW()
            AND t.statut = 'actif'
            GROUP BY t.id
            ORDER BY t.date_depart ASC
            LIMIT ?`;
        
        const [rows] = await this.db.execute(query, [livreurId, limit]);
        return rows;
    }
}

module.exports = new Trajet();