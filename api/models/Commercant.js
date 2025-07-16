const Model = require('./Model');

class Commercant extends Model {
    constructor() {
        super('commercants');
    }

    /**
     * Trouve un commerçant par ID utilisateur
     */
    async findByUserId(userId) {
        const query = `
            SELECT c.*, u.email, u.nom, u.prenom, u.telephone
            FROM commercants c
            JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE c.utilisateur_id = ?`;
        const [rows] = await this.db.execute(query, [userId]);
        return rows[0];
    }

    /**
     * Récupère les contrats d'un commerçant
     */
    async getContrats(commercantId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT cc.*
            FROM contrats_commercants cc
            WHERE cc.commercant_id = ?`;
        
        const params = [commercantId];
        
        if (options.statut) {
            query += ' AND cc.statut = ?';
            params.push(options.statut);
        }
        
        query += ' ORDER BY cc.date_creation DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        let countQuery = 'SELECT COUNT(*) as total FROM contrats_commercants WHERE commercant_id = ?';
        const countParams = [commercantId];
        
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
     * Récupère les statistiques d'un commerçant
     */
    async getStats(commercantId, periode = 30) {
        const query = `
            SELECT 
                COUNT(DISTINCT a.id) as total_annonces,
                COUNT(DISTINCT l.id) as total_livraisons,
                SUM(CASE WHEN l.statut = 'livree' THEN 1 ELSE 0 END) as livraisons_completees,
                SUM(CASE WHEN a.statut = 'publiee' THEN 1 ELSE 0 END) as annonces_actives,
                AVG(l.note_client) as note_moyenne,
                SUM(f.montant_total) as chiffre_affaires
            FROM commercants c
            LEFT JOIN annonces a ON a.utilisateur_id = c.utilisateur_id AND a.type_createur = 'commercant'
            LEFT JOIN livraisons l ON l.annonce_id = a.id
            LEFT JOIN factures f ON f.entite_id = c.id AND f.type_entite = 'commercant'
            WHERE c.id = ?
            AND a.date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
        
        const [stats] = await this.db.execute(query, [commercantId, periode]);
        return stats[0];
    }

    /**
     * Récupère les factures d'un commerçant
     */
    async getFactures(commercantId, options = {}) {
        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT f.*, 
                   COUNT(lf.id) as nombre_lignes,
                   SUM(lf.montant) as montant_total_calcule
            FROM factures f
            LEFT JOIN lignes_factures lf ON f.id = lf.facture_id
            WHERE f.entite_id = ? AND f.type_entite = 'commercant'`;
        
        const params = [commercantId];
        
        if (options.statut) {
            query += ' AND f.statut = ?';
            params.push(options.statut);
        }
        
        if (options.dateDebut) {
            query += ' AND DATE(f.date_creation) >= ?';
            params.push(options.dateDebut);
        }
        
        if (options.dateFin) {
            query += ' AND DATE(f.date_creation) <= ?';
            params.push(options.dateFin);
        }
        
        query += ' GROUP BY f.id ORDER BY f.date_creation DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await this.db.execute(query, params);
        
        // Compter le total
        let countQuery = `
            SELECT COUNT(DISTINCT f.id) as total 
            FROM factures f 
            WHERE f.entite_id = ? AND f.type_entite = 'commercant'`;
        const countParams = [commercantId];
        
        if (options.statut) {
            countQuery += ' AND f.statut = ?';
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
     * Créer une facture pour un commerçant
     */
    async createFacture(commercantId, data) {
        const db = this.db;
        let connection;
        
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            
            // Créer la facture
            const [factureResult] = await connection.execute(
                `INSERT INTO factures 
                (numero_facture, type_entite, entite_id, montant_total, statut, date_echeance, date_creation)
                VALUES (?, 'commercant', ?, ?, 'en_attente', ?, NOW())`,
                [
                    data.numero_facture || this.generateNumeroFacture(),
                    commercantId,
                    data.montant_total,
                    data.date_echeance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
                ]
            );
            
            const factureId = factureResult.insertId;
            
            // Ajouter les lignes de facture
            if (data.lignes && data.lignes.length > 0) {
                for (const ligne of data.lignes) {
                    await connection.execute(
                        `INSERT INTO lignes_factures 
                        (facture_id, description, quantite, prix_unitaire, montant, date_creation)
                        VALUES (?, ?, ?, ?, ?, NOW())`,
                        [
                            factureId,
                            ligne.description,
                            ligne.quantite,
                            ligne.prix_unitaire,
                            ligne.montant || (ligne.quantite * ligne.prix_unitaire)
                        ]
                    );
                }
            }
            
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
    generateNumeroFacture() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `FC-${year}${month}-${random}`;
    }

    /**
     * Récupère le contrat actif d'un commerçant
     */
    async getContratActif(commercantId) {
        const query = `
            SELECT * FROM contrats_commercants 
            WHERE commercant_id = ? 
            AND statut = 'actif'
            AND date_fin >= NOW()
            ORDER BY date_debut DESC
            LIMIT 1`;
        
        const [rows] = await this.db.execute(query, [commercantId]);
        return rows[0];
    }

    /**
     * Vérifier si un commerçant peut créer des annonces
     */
    async canCreateAnnonce(commercantId) {
        const contratActif = await this.getContratActif(commercantId);
        
        if (!contratActif) {
            return { canCreate: false, reason: 'Aucun contrat actif' };
        }
        
        // Vérifier le nombre d'annonces selon le contrat
        const [annonceCount] = await this.db.execute(
            `SELECT COUNT(*) as count 
            FROM annonces a
            JOIN commercants c ON a.utilisateur_id = c.utilisateur_id
            WHERE c.id = ?
            AND a.statut = 'publiee'
            AND MONTH(a.date_creation) = MONTH(NOW())
            AND YEAR(a.date_creation) = YEAR(NOW())`,
            [commercantId]
        );
        
        const limit = contratActif.nombre_annonces_max || 999999;
        
        if (annonceCount[0].count >= limit) {
            return { 
                canCreate: false, 
                reason: `Limite d'annonces atteinte (${limit} annonces/mois)` 
            };
        }
        
        return { canCreate: true };
    }
}

module.exports = new Commercant();