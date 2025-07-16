const NotificationModel = require('../models/Notification');

/**
 * Récupérer les notifications de l'utilisateur connecté
 */
exports.getNotifications = async (req, res) => {
    try {
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            lue: req.query.lue !== undefined ? req.query.lue === 'true' : null
        };

        const result = await NotificationModel.getByUserId(req.user.id, options);
        
        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Erreur getNotifications:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Marquer une notification comme lue
 */
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await NotificationModel.findById(id, req.user.id);
        if (!notification) {
            return res.status(404).json({ 
                success: false,
                error: 'Notification non trouvée' 
            });
        }

        const success = await NotificationModel.markAsRead(id, req.user.id);
        
        if (success) {
            res.json({
                success: true,
                message: 'Notification marquée comme lue'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Impossible de marquer la notification comme lue'
            });
        }

    } catch (error) {
        console.error('Erreur markAsRead:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Marquer toutes les notifications comme lues
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const updatedCount = await NotificationModel.markAllAsRead(req.user.id);
        
        res.json({
            success: true,
            message: `${updatedCount} notification(s) marquée(s) comme lue(s)`,
            updatedCount
        });

    } catch (error) {
        console.error('Erreur markAllAsRead:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Supprimer une notification
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await NotificationModel.findById(id, req.user.id);
        if (!notification) {
            return res.status(404).json({ 
                success: false,
                error: 'Notification non trouvée' 
            });
        }

        const success = await NotificationModel.delete(id, req.user.id);
        
        if (success) {
            res.json({
                success: true,
                message: 'Notification supprimée'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Impossible de supprimer la notification'
            });
        }

    } catch (error) {
        console.error('Erreur deleteNotification:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Récupérer le nombre de notifications non lues
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await NotificationModel.getUnreadCount(req.user.id);
        
        res.json({
            success: true,
            count
        });

    } catch (error) {
        console.error('Erreur getUnreadCount:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur',
            count: 0
        });
    }
};

/**
 * Créer une notification (admin uniquement)
 */
exports.createNotification = async (req, res) => {
    try {
        // Vérifier les permissions admin
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ 
                success: false,
                error: 'Accès interdit' 
            });
        }

        const { utilisateur_id, titre, message, type, lien } = req.body;

        // Validation des champs requis
        if (!utilisateur_id || !titre || !message) {
            return res.status(400).json({ 
                success: false,
                error: 'Les champs utilisateur_id, titre et message sont requis' 
            });
        }

        const notification = await NotificationModel.create({
            utilisateur_id,
            titre,
            message,
            type: type || 'info',
            lien
        });
        
        res.status(201).json({
            success: true,
            message: 'Notification créée avec succès',
            notification
        });

    } catch (error) {
        console.error('Erreur createNotification:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
};