const Model = require('./Model');

class Livraison extends Model {
    constructor() {
        super('livraisons');
    }

    /**
     * Trouve les livraisons d'un livreur avec détails
     */
    async findByLivreurId(livreurId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT l.*, 
                   a.titre as annonce_titre,
                   a.description as annonce_description,
                   uc.nom as client_nom, 
                   uc.prenom as client_prenom,
                   uc.telephone as client_telephone
            FROM livraisons l
            JOIN annonces a ON l.annonce_id = a.id
            JOIN utilisateurs uc ON a.utilisateur_id = uc.id
            WHERE l.livreur_id = ?`;
        
        const params = [livreurId];
        
        // Filtrer par statut
        if (options.statut) {
            query += ' AND l.statut = ?';
            params.push(options.statut);
        }
        
        // Filtrer par date
        if (options.dateDebut) {
            query += ' AND DATE(l.date_livraison) >= ?';
            params.push(options.dateDebut);
        }
        
        if (options.dateFin) {
            query += ' AND DATE(l.date_livraison) <= ?';
            params.push(options.dateFin);
        }
        
        query += ' ORDER BY l.date_creation DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        let countQuery = 'SELECT COUNT(*) as total FROM livraisons WHERE livreur_id = ?';
        const countParams = [livreurId];
        
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
     * Trouve les livraisons d'un client
     */
    async findByClientId(clientId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT l.*, 
                   a.titre as annonce_titre,
                   livreur.utilisateur_id as livreur_user_id,
                   ul.nom as livreur_nom, 
                   ul.prenom as livreur_prenom,
                   ul.telephone as livreur_telephone
            FROM livraisons l
            JOIN annonces a ON l.annonce_id = a.id
            LEFT JOIN livreurs livreur ON l.livreur_id = livreur.id
            LEFT JOIN utilisateurs ul ON livreur.utilisateur_id = ul.id
            WHERE a.utilisateur_id = ?`;
        
        const params = [clientId];
        
        if (options.statut) {
            query += ' AND l.statut = ?';
            params.push(options.statut);
        }
        
        query += ' ORDER BY l.date_creation DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM livraisons l
            JOIN annonces a ON l.annonce_id = a.id
            WHERE a.utilisateur_id = ?`;
        
        const [countResult] = await this.db.execute(countQuery, [clientId]);
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
     * Accepter une livraison
     */
    async accepterLivraison(livraisonId, livreurId) {
        const livraison = await this.findById(livraisonId);
        
        if (!livraison) {
            throw new Error('Livraison non trouvée');
        }
        
        if (livraison.statut !== 'en_attente') {
            throw new Error('Cette livraison n\'est plus disponible');
        }
        
        return await this.update(livraisonId, {
            livreur_id: livreurId,
            statut: 'assigne',
            date_acceptation: new Date(),
            date_modification: new Date()
        });
    }

    /**
     * Démarrer une livraison
     */
    async demarrerLivraison(livraisonId, livreurId) {
        const livraison = await this.findOne({ id: livraisonId, livreur_id: livreurId });
        
        if (!livraison) {
            throw new Error('Livraison non trouvée ou non autorisée');
        }
        
        if (livraison.statut !== 'assigne') {
            throw new Error('Statut de livraison invalide');
        }
        
        return await this.update(livraisonId, {
            statut: 'en_cours',
            date_debut: new Date(),
            date_modification: new Date()
        });
    }

    /**
     * Confirmer une livraison
     */
    async confirmerLivraison(livraisonId, livreurId, codeConfirmation, signature = null) {
        const livraison = await this.findOne({ id: livraisonId, livreur_id: livreurId });
        
        if (!livraison) {
            throw new Error('Livraison non trouvée ou non autorisée');
        }
        
        if (livraison.statut !== 'en_cours') {
            throw new Error('Statut de livraison invalide');
        }
        
        if (livraison.code_confirmation !== codeConfirmation) {
            throw new Error('Code de confirmation invalide');
        }
        
        return await this.update(livraisonId, {
            statut: 'livree',
            date_livraison_reelle: new Date(),
            signature_livraison: signature,
            date_modification: new Date()
        });
    }

    /**
     * Annuler une livraison
     */
    async annulerLivraison(livraisonId, userId, motif, role = 'client') {
        const livraison = await this.findById(livraisonId);
        
        if (!livraison) {
            throw new Error('Livraison non trouvée');
        }
        
        // Vérifier les droits
        if (role === 'livreur') {
            const [livreur] = await this.db.execute(
                'SELECT id FROM livreurs WHERE utilisateur_id = ?',
                [userId]
            );
            if (!livreur[0] || livreur[0].id !== livraison.livreur_id) {
                throw new Error('Non autorisé');
            }
        } else if (role === 'client') {
            const [annonce] = await this.db.execute(
                'SELECT utilisateur_id FROM annonces WHERE id = ?',
                [livraison.annonce_id]
            );
            if (!annonce[0] || annonce[0].utilisateur_id !== userId) {
                throw new Error('Non autorisé');
            }
        }
        
        if (['livree', 'annulee'].includes(livraison.statut)) {
            throw new Error('Cette livraison ne peut plus être annulée');
        }
        
        return await this.update(livraisonId, {
            statut: 'annulee',
            motif_annulation: motif,
            date_annulation: new Date(),
            date_modification: new Date()
        });
    }

    /**
     * Générer un code de confirmation
     */
    generateConfirmationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Créer une livraison depuis une annonce
     */
    async createFromAnnonce(annonceId, livreurId = null) {
        // Récupérer l'annonce
        const [annonce] = await this.db.execute(
            'SELECT * FROM annonces WHERE id = ? AND statut = "publiee"',
            [annonceId]
        );
        
        if (!annonce[0]) {
            throw new Error('Annonce non trouvée ou indisponible');
        }
        
        const code = this.generateConfirmationCode();
        
        const livraisonData = {
            annonce_id: annonceId,
            livreur_id: livreurId,
            statut: livreurId ? 'assigne' : 'en_attente',
            date_livraison: annonce[0].date_livraison_souhaitee,
            adresse_depart: annonce[0].adresse_depart,
            adresse_arrivee: annonce[0].adresse_arrivee,
            code_confirmation: code,
            prix_livraison: annonce[0].prix_propose || 0,
            date_creation: new Date()
        };
        
        if (livreurId) {
            livraisonData.date_acceptation = new Date();
        }
        
        return await this.create(livraisonData);
    }

    /**
     * Obtenir le suivi d'une livraison
     */
    async getTracking(livraisonId) {
        const query = `
            SELECT 
                sl.*,
                l.code_confirmation,
                l.statut as statut_actuel,
                a.titre as annonce_titre,
                livreur.utilisateur_id as livreur_user_id,
                ul.nom as livreur_nom,
                ul.prenom as livreur_prenom,
                ul.telephone as livreur_telephone
            FROM suivi_livraisons sl
            JOIN livraisons l ON sl.livraison_id = l.id
            JOIN annonces a ON l.annonce_id = a.id
            LEFT JOIN livreurs livreur ON l.livreur_id = livreur.id
            LEFT JOIN utilisateurs ul ON livreur.utilisateur_id = ul.id
            WHERE sl.livraison_id = ?
            ORDER BY sl.date_evenement DESC`;
        
        const [tracking] = await this.db.execute(query, [livraisonId]);
        return tracking;
    }

    /**
     * Ajouter un événement de suivi
     */
    async addTrackingEvent(livraisonId, statut, description, latitude = null, longitude = null) {
        const query = `
            INSERT INTO suivi_livraisons 
            (livraison_id, statut, description, latitude, longitude, date_evenement)
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        await this.db.execute(query, [
            livraisonId,
            statut,
            description,
            latitude,
            longitude,
            new Date()
        ]);
    }
}

module.exports = new Livraison();