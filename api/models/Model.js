const db = require('../config/db');

/**
 * Classe de base pour tous les modèles
 * Fournit des méthodes CRUD génériques
 */
class Model {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = db;
    }

    /**
     * Trouve tous les enregistrements avec pagination
     * @param {Object} options - Options de requête
     * @param {number} options.page - Numéro de page (défaut: 1)
     * @param {number} options.limit - Nombre d'éléments par page (défaut: 10)
     * @param {string} options.orderBy - Colonne de tri
     * @param {string} options.order - Direction du tri (ASC/DESC)
     * @param {Object} options.where - Conditions WHERE
     */
    async findAll(options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        const orderBy = options.orderBy || 'id';
        const order = options.order || 'DESC';
        
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];

        // Ajouter les conditions WHERE si présentes
        if (options.where && Object.keys(options.where).length > 0) {
            const whereConditions = Object.keys(options.where)
                .map(key => {
                    params.push(options.where[key]);
                    return `${key} = ?`;
                })
                .join(' AND ');
            query += ` WHERE ${whereConditions}`;
        }

        // Ajouter ORDER BY
        query += ` ORDER BY ${orderBy} ${order}`;

        // Ajouter LIMIT et OFFSET pour la pagination
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        try {
            // Récupérer les données
            const [rows] = await this.db.execute(query, params);

            // Compter le total pour la pagination
            let countQuery = `SELECT COUNT(*) as total FROM ${this.tableName}`;
            const countParams = [];
            
            if (options.where && Object.keys(options.where).length > 0) {
                const whereConditions = Object.keys(options.where)
                    .map(key => {
                        countParams.push(options.where[key]);
                        return `${key} = ?`;
                    })
                    .join(' AND ');
                countQuery += ` WHERE ${whereConditions}`;
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
        } catch (error) {
            throw error;
        }
    }

    /**
     * Trouve un enregistrement par ID
     */
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.execute(query, [id]);
        return rows[0];
    }

    /**
     * Trouve un enregistrement par critères
     */
    async findOne(where) {
        const keys = Object.keys(where);
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        const values = keys.map(key => where[key]);

        const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`;
        const [rows] = await this.db.execute(query, values);
        return rows[0];
    }

    /**
     * Crée un nouvel enregistrement
     */
    async create(data) {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(key => data[key]);
        
        // Debug - vérifier les valeurs
        console.log('Model.create debug:', {
            tableName: this.tableName,
            keys,
            values,
            hasUndefined: values.some(v => v === undefined)
        });

        const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        const [result] = await this.db.execute(query, values);
        
        // Retourner l'enregistrement créé
        if (result.insertId) {
            return await this.findById(result.insertId);
        }
        return null;
    }

    /**
     * Met à jour un enregistrement
     */
    async update(id, data) {
        const keys = Object.keys(data);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(key => data[key]), id];

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        const [result] = await this.db.execute(query, values);
        
        if (result.affectedRows > 0) {
            return await this.findById(id);
        }
        return null;
    }

    /**
     * Supprime un enregistrement
     */
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const [result] = await this.db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Exécute une requête SQL personnalisée
     */
    async query(sql, params = []) {
        const [rows] = await this.db.execute(sql, params);
        return rows;
    }

    /**
     * Commence une transaction
     */
    async beginTransaction() {
        await this.db.beginTransaction();
    }

    /**
     * Valide une transaction
     */
    async commit() {
        await this.db.commit();
    }

    /**
     * Annule une transaction
     */
    async rollback() {
        await this.db.rollback();
    }
}

module.exports = Model;