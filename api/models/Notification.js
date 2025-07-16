const db = require('../config/db');

class Notification {
    constructor() {
        this.db = db;
    }

    /**
     * Créer une nouvelle notification
     */
    async create(notificationData) {
        const { utilisateur_id, titre, message, type, lien } = notificationData;
        
        const [result] = await this.db.execute(
            `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [utilisateur_id, titre, message, type, lien]
        );
        
        return {
            id: result.insertId,
            ...notificationData,
            lue: false,
            date_lecture: null,
            created_at: new Date()
        };
    }

    /**
     * Récupérer les notifications d'un utilisateur (solution ultra-simple)
     */
    async getByUserId(utilisateurId, options = {}) {
        console.log('=== SOLUTION ULTRA-SIMPLE getByUserId notifications called with:', { utilisateurId, options });
        
        try {
            // Récupérer toutes les notifications et filtrer en JavaScript
            const query = `SELECT * FROM notifications ORDER BY created_at DESC`;
            const [allNotifications] = await this.db.execute(query);
            
            console.log('=== SOLUTION ULTRA-SIMPLE toutes les notifications récupérées:', allNotifications.length);
            
            // Filtrer par utilisateur
            const userNotifications = allNotifications.filter(notif => notif.utilisateur_id === parseInt(utilisateurId));
            console.log('=== SOLUTION ULTRA-SIMPLE notifications utilisateur:', userNotifications.length);
            
            // Filtrer par statut lu/non lu si spécifié
            let filteredNotifications = userNotifications;
            if (options.lue !== null && options.lue !== undefined) {
                const isRead = options.lue === 'false' ? false : Boolean(options.lue);
                filteredNotifications = userNotifications.filter(notif => Boolean(notif.lue) === isRead);
                console.log('=== SOLUTION ULTRA-SIMPLE notifications filtrées par statut lu:', filteredNotifications.length);
            }
            
            // Limiter le nombre de résultats
            const limit = parseInt(options.limit) || 20;
            const limitedNotifications = filteredNotifications.slice(0, limit);
            
            // Formater les notifications pour le frontend
            const formattedNotifications = limitedNotifications.map(notif => ({
                id: notif.id,
                title: notif.titre || 'Notification',
                message: notif.message || notif.contenu || '',
                lue: Boolean(notif.lue),
                created_at: notif.created_at
            }));
            
            console.log('=== SOLUTION ULTRA-SIMPLE notifications formatées:', formattedNotifications.length);
            
            return {
                notifications: formattedNotifications,
                pagination: {
                    page: 1,
                    limit: limit,
                    total: filteredNotifications.length,
                    totalPages: 1
                }
            };
            
        } catch (error) {
            console.error('=== SOLUTION ULTRA-SIMPLE erreur notifications:', error);
            throw error;
        }
    }

    /**
     * Marquer une notification comme lue
     */
    async markAsRead(notificationId, utilisateurId) {
        const [result] = await this.db.execute(
            `UPDATE notifications 
             SET lue = TRUE, date_lecture = NOW() 
             WHERE id = ? AND utilisateur_id = ?`,
            [notificationId, utilisateurId]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    async markAllAsRead(utilisateurId) {
        const [result] = await this.db.execute(
            `UPDATE notifications 
             SET lue = TRUE, date_lecture = NOW() 
             WHERE utilisateur_id = ? AND lue = FALSE`,
            [utilisateurId]
        );
        
        return result.affectedRows;
    }

    /**
     * Supprimer une notification
     */
    async delete(notificationId, utilisateurId) {
        const [result] = await this.db.execute(
            `DELETE FROM notifications 
             WHERE id = ? AND utilisateur_id = ?`,
            [notificationId, utilisateurId]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Compter les notifications non lues (solution ultra-simple)
     */
    async getUnreadCount(utilisateurId) {
        try {
            const query = `SELECT * FROM notifications WHERE utilisateur_id = ? AND lue = FALSE`;
            const [rows] = await this.db.execute(query, [utilisateurId]);
            return rows.length;
        } catch (error) {
            console.error('=== SOLUTION ULTRA-SIMPLE erreur getUnreadCount:', error);
            return 0;
        }
    }

    /**
     * Récupérer une notification par ID
     */
    async findById(notificationId, utilisateurId) {
        const [rows] = await this.db.execute(
            `SELECT * FROM notifications 
             WHERE id = ? AND utilisateur_id = ?`,
            [notificationId, utilisateurId]
        );
        
        return rows[0] || null;
    }

    /**
     * Créer une notification pour un nouveau message
     */
    async createMessageNotification(messageData) {
        const { destinataire_id, expediteur_nom, expediteur_prenom, annonce_titre } = messageData;
        
        let titre = `Nouveau message de ${expediteur_prenom} ${expediteur_nom}`;
        let message = 'Vous avez reçu un nouveau message';
        let lien = '/app/messages';
        
        if (annonce_titre) {
            message = `concernant votre annonce "${annonce_titre}"`;
            titre = `Message pour votre annonce`;
        }
        
        return await this.create({
            utilisateur_id: destinataire_id,
            titre,
            message,
            type: 'message',
            lien
        });
    }

    /**
     * Supprimer les anciennes notifications (nettoyage)
     */
    async deleteOldNotifications(daysOld = 30) {
        const [result] = await this.db.execute(
            `DELETE FROM notifications 
             WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [daysOld]
        );
        
        return result.affectedRows;
    }
}

module.exports = new Notification();