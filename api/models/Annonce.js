const Model = require('./Model');

class Annonce extends Model {
    constructor() {
        super('annonces');
    }

    /**
     * Liste les annonces avec filtres et pagination
     */
    async listWithDetails(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                a.*,
                u.nom as client_nom,
                u.prenom as client_prenom,
                u.email as client_email
            FROM annonces a
            LEFT JOIN clients c ON a.client_id = c.id
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
        `;
        
        const params = [];
        const whereConditions = [];

        // Filtres
        if (options.client_id) {
            whereConditions.push(`a.client_id = ?`);
            params.push(options.client_id);
        }

        if (options.createur_id) {
            whereConditions.push(`a.createur_id = ?`);
            params.push(options.createur_id);
        }

        if (options.type_createur) {
            whereConditions.push(`a.type_createur = ?`);
            params.push(options.type_createur);
        }

        if (options.statut) {
            whereConditions.push(`a.statut = ?`);
            params.push(options.statut);
        }

        if (options.type_annonce) {
            whereConditions.push(`a.type_annonce = ?`);
            params.push(options.type_annonce);
        }

        if (options.search) {
            whereConditions.push(`(a.titre LIKE ? OR a.description LIKE ?)`);
            const searchTerm = `%${options.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Filtres de budget
        if (options.budget_min) {
            whereConditions.push(`a.budget_max >= ?`);
            params.push(options.budget_min);
        }

        if (options.budget_max) {
            whereConditions.push(`a.budget_max <= ?`);
            params.push(options.budget_max);
        }

        if (options.urgence) {
            whereConditions.push(`a.urgence = ?`);
            params.push(options.urgence);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        // Tri
        const orderBy = options.orderBy || 'date_creation';
        const order = options.order || 'DESC';
        query += ` ORDER BY a.${orderBy} ${order}`;

        // Pagination
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await this.db.execute(query, params);

        // Compter le total
        let countQuery = `SELECT COUNT(DISTINCT a.id) as total FROM annonces a
            LEFT JOIN clients c ON a.client_id = c.id
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id`;
        if (whereConditions.length > 0) {
            countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        const [countResult] = await this.db.execute(countQuery, params.slice(0, -2));
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
     * Trouve une annonce par ID avec tous les détails
     */
    async findByIdWithDetails(id) {
        const query = `
            SELECT 
                a.*,
                u.id as auteur_id,
                u.nom as client_nom,
                u.prenom as client_prenom,
                u.email as client_email,
                u.telephone as client_telephone
            FROM annonces a
            LEFT JOIN clients c ON a.client_id = c.id
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE a.id = ?
            LIMIT 1
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        return rows[0];
    }

    /**
     * Crée une nouvelle annonce
     */
    async create(annonceData) {
        // Définir les valeurs par défaut
        annonceData.date_creation = new Date();
        annonceData.statut = annonceData.statut || 'ouverte';

        return super.create(annonceData);
    }

    /**
     * Incrémente le nombre de vues
     */
    async incrementViews(id) {
        const query = `UPDATE annonces SET nombre_vues = nombre_vues + 1 WHERE id = ?`;
        await this.db.execute(query, [id]);
    }

    /**
     * Met à jour le statut d'une annonce
     */
    async updateStatus(id, statut) {
        const validStatuts = ['ouverte', 'en_cours', 'terminee', 'annulee'];
        if (!validStatuts.includes(statut)) {
            throw new Error('Statut invalide');
        }

        return this.update(id, { statut });
    }

    /**
     * Récupère les annonces d'un utilisateur
     */
    async findByAuteur(auteurId, options = {}) {
        options.auteur_id = auteurId;
        return this.listWithDetails(options);
    }

    /**
     * Récupère les annonces d'un créateur spécifique
     */
    async findByCreateur(createurId, typeCreateur = 'client', options = {}) {
        options.createur_id = createurId;
        options.type_createur = typeCreateur;
        return this.listWithDetails(options);
    }

    /**
     * Récupère les annonces d'un client spécifique
     */
    async findByClient(utilisateurId, options = {}) {
        // D'abord récupérer l'ID du client
        const clientQuery = 'SELECT id FROM clients WHERE utilisateur_id = ?';
        const [clientResults] = await this.db.execute(clientQuery, [utilisateurId]);
        
        if (!clientResults || clientResults.length === 0) {
            return {
                data: [],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 0,
                    totalPages: 0
                }
            };
        }
        
        options.client_id = clientResults[0].id;
        return this.listWithDetails(options);
    }

    /**
     * Récupère les statistiques des annonces
     */
    async getStatistics(auteurId = null) {
        let query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN statut = 'active' THEN 1 ELSE 0 END) as actives,
                SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
                SUM(CASE WHEN statut = 'terminee' THEN 1 ELSE 0 END) as terminees,
                SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees,
                SUM(nombre_vues) as total_vues,
                AVG(prix) as prix_moyen
            FROM annonces
        `;

        const params = [];
        if (auteurId) {
            query += ` WHERE auteur_id = ?`;
            params.push(auteurId);
        }

        const [rows] = await this.db.execute(query, params);
        return rows[0];
    }

    /**
     * Récupère les catégories disponibles
     */
    async getCategories() {
        const query = `
            SELECT 
                ca.*,
                COUNT(a.id) as nb_annonces
            FROM categories_annonces ca
            LEFT JOIN annonces a ON ca.id = a.categorie_id
            GROUP BY ca.id
            ORDER BY ca.nom
        `;
        
        const [rows] = await this.db.execute(query);
        return rows;
    }
}

module.exports = new Annonce();