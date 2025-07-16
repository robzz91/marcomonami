const Model = require('./Model');
const bcrypt = require('bcryptjs');

class Utilisateur extends Model {
    constructor() {
        super('utilisateurs');
    }

    /**
     * Trouve un utilisateur par email avec ses rôles
     */
    async findByEmailWithRoles(email) {
        const query = `
            SELECT u.*, 
                   GROUP_CONCAT(r.nom_role) as roles,
                   GROUP_CONCAT(r.id) as role_ids
            FROM utilisateurs u
            LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
            LEFT JOIN roles r ON ru.role_id = r.id
            WHERE u.email = ?
            GROUP BY u.id
            LIMIT 1
        `;
        
        const [rows] = await this.db.execute(query, [email]);
        if (rows[0]) {
            const user = rows[0];
            // Transformer les rôles en tableau
            user.roles = user.roles ? user.roles.split(',') : [];
            user.role_ids = user.role_ids ? user.role_ids.split(',').map(Number) : [];
            return user;
        }
        return null;
    }

    /**
     * Trouve un utilisateur par ID avec ses rôles
     */
    async findByIdWithRoles(id) {
        const query = `
            SELECT u.*, 
                   GROUP_CONCAT(r.nom_role) as roles,
                   GROUP_CONCAT(r.id) as role_ids
            FROM utilisateurs u
            LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
            LEFT JOIN roles r ON ru.role_id = r.id
            WHERE u.id = ?
            GROUP BY u.id
            LIMIT 1
        `;
        
        const [rows] = await this.db.execute(query, [id]);
        if (rows[0]) {
            const user = rows[0];
            user.roles = user.roles ? user.roles.split(',') : [];
            user.role_ids = user.role_ids ? user.role_ids.split(',').map(Number) : [];
            return user;
        }
        return null;
    }

    /**
     * Crée un nouvel utilisateur avec hash du mot de passe
     */
    async create(userData) {
        // Hasher le mot de passe
        if (userData.mot_de_passe) {
            userData.mot_de_passe = await bcrypt.hash(userData.mot_de_passe, 10);
        }
        // Support de l'ancien nom pour compatibilité
        if (userData.password) {
            userData.mot_de_passe = await bcrypt.hash(userData.password, 10);
            delete userData.password;
        }

        // Générer un code de vérification email
        userData.code_verification_email = Math.random().toString(36).substring(2, 8).toUpperCase();
        userData.date_inscription = new Date();

        return super.create(userData);
    }

    /**
     * Met à jour un utilisateur (hash le mot de passe si modifié)
     */
    async update(id, userData) {
        // Si le mot de passe est modifié, le hasher
        if (userData.mot_de_passe) {
            userData.mot_de_passe = await bcrypt.hash(userData.mot_de_passe, 10);
        }
        // Support de l'ancien nom pour compatibilité
        if (userData.password) {
            userData.mot_de_passe = await bcrypt.hash(userData.password, 10);
            delete userData.password;
        }

        return super.update(id, userData);
    }

    /**
     * Vérifie le mot de passe
     */
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Ajoute un rôle à un utilisateur
     */
    async addRole(userId, roleId) {
        const query = `INSERT INTO role_utilisateur (utilisateur_id, role_id) VALUES (?, ?)`;
        try {
            await this.db.execute(query, [userId, roleId]);
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Le rôle est déjà assigné
                return true;
            }
            throw error;
        }
    }

    /**
     * Retire un rôle à un utilisateur
     */
    async removeRole(userId, roleId) {
        const query = `DELETE FROM role_utilisateur WHERE utilisateur_id = ? AND role_id = ?`;
        const [result] = await this.db.execute(query, [userId, roleId]);
        return result.affectedRows > 0;
    }

    /**
     * Vérifie l'email d'un utilisateur
     */
    async verifyEmail(userId) {
        return this.update(userId, {
            email_verifie: true,
            code_verification_email: null
        });
    }

    /**
     * Liste les utilisateurs avec pagination et filtres
     */
    async listWithRoles(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT u.id, u.nom, u.prenom, u.email, u.telephone, 
                   u.email_verifie, u.compte_actif, u.date_inscription,
                   GROUP_CONCAT(r.nom_role) as roles
            FROM utilisateurs u
            LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
            LEFT JOIN roles r ON ru.role_id = r.id
        `;
        
        const params = [];
        const whereConditions = [];

        // Filtres
        if (options.role) {
            whereConditions.push(`r.nom_role = ?`);
            params.push(options.role);
        }
        
        if (options.search) {
            whereConditions.push(`(u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)`);
            const searchTerm = `%${options.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (options.active !== undefined) {
            whereConditions.push(`u.compte_actif = ?`);
            params.push(options.active);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += ` GROUP BY u.id ORDER BY u.date_inscription DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await this.db.execute(query, params);
        
        // Transformer les rôles en tableau
        rows.forEach(user => {
            user.roles = user.roles ? user.roles.split(',') : [];
        });

        // Compter le total
        let countQuery = `SELECT COUNT(DISTINCT u.id) as total FROM utilisateurs u`;
        if (options.role) {
            countQuery += ` LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id`;
            countQuery += ` LEFT JOIN roles r ON ru.role_id = r.id`;
        }
        
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

module.exports = new Utilisateur();