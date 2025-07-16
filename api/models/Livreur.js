const Model = require('./Model');

class Livreur extends Model {
    constructor() {
        super('livreurs');
    }

    /**
     * Trouve un livreur par utilisateur ID
     */
    async findByUserId(userId) {
        const query = `
            SELECT l.*, u.nom, u.prenom, u.email, u.telephone
            FROM livreurs l
            JOIN utilisateurs u ON l.id_utilisateur = u.id
            WHERE l.id_utilisateur = ?
            LIMIT 1
        `;
        
        const [rows] = await this.db.execute(query, [userId]);
        return rows[0] || null;
    }

    /**
     * Liste des livreurs avec informations utilisateur
     */
    async listWithUserInfo(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT l.*, u.nom, u.prenom, u.email, u.telephone, u.compte_actif
            FROM livreurs l
            JOIN utilisateurs u ON l.id_utilisateur = u.id
        `;
        
        const params = [];
        const whereConditions = [];

        if (options.statut) {
            whereConditions.push(`l.statut = ?`);
            params.push(options.statut);
        }

        if (options.search) {
            whereConditions.push(`(u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)`);
            const searchTerm = `%${options.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += ` ORDER BY l.date_creation DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await this.db.execute(query, params);

        // Compter le total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM livreurs l
            JOIN utilisateurs u ON l.id_utilisateur = u.id
        `;
        
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
}

module.exports = new Livreur();