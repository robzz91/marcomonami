const MessageModel = require('../models/Message');
const NotificationModel = require('../models/Notification');

/**
 * Récupère les conversations de l'utilisateur
 */
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const options = {
            page: req.query.page,
            limit: req.query.limit
        };

        const conversations = await MessageModel.getConversations(userId, options);
        res.json(conversations);

    } catch (error) {
        console.error('Erreur getConversations:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère les messages d'une conversation
 */
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { interlocuteurId } = req.params;
        const options = {
            page: req.query.page,
            limit: req.query.limit
        };
        
        console.log('=== API getMessages params:', { userId, interlocuteurId, options });

        // Vérifier que l'interlocuteur existe
        const canSend = await MessageModel.canSendMessage(userId, interlocuteurId);
        if (!canSend) {
            return res.status(404).json({ error: 'Interlocuteur non trouvé' });
        }

        const messages = await MessageModel.getMessagesBetween(
            userId, 
            parseInt(interlocuteurId), 
            options
        );
        
        res.json(messages);

    } catch (error) {
        console.error('Erreur getMessages:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Envoie un message
 */
exports.sendMessage = async (req, res) => {
    try {
        const expediteurId = req.user.id;
        const { destinataire_id, contenu, annonce_id } = req.body;

        // Validation
        if (!destinataire_id || !contenu) {
            return res.status(400).json({ 
                error: 'Destinataire et contenu requis' 
            });
        }

        // Empêcher l'envoi à soi-même
        if (expediteurId === destinataire_id) {
            return res.status(400).json({ 
                error: 'Vous ne pouvez pas vous envoyer un message' 
            });
        }

        // Vérifier que le destinataire peut recevoir des messages
        const canSend = await MessageModel.canSendMessage(expediteurId, destinataire_id);
        if (!canSend) {
            return res.status(403).json({ 
                error: 'Impossible d\'envoyer un message à cet utilisateur' 
            });
        }

        // Limiter la longueur du message
        if (contenu.length > 1000) {
            return res.status(400).json({ 
                error: 'Le message ne peut pas dépasser 1000 caractères' 
            });
        }

        const message = await MessageModel.sendMessage(
            expediteurId,
            destinataire_id,
            contenu,
            annonce_id || null
        );

        // Créer une notification pour le destinataire
        try {
            // Récupérer les informations de l'expéditeur
            const db = require('../config/db');
            const [expediteurRows] = await db.execute(
                'SELECT nom, prenom FROM utilisateurs WHERE id = ?',
                [expediteurId]
            );
            
            let notificationData = {
                destinataire_id,
                expediteur_nom: expediteurRows[0]?.nom || '',
                expediteur_prenom: expediteurRows[0]?.prenom || ''
            };
            
            // Si le message concerne une annonce, récupérer le titre
            if (annonce_id) {
                const [annonceRows] = await db.execute(
                    'SELECT titre FROM annonces WHERE id = ?',
                    [annonce_id]
                );
                notificationData.annonce_titre = annonceRows[0]?.titre || '';
            }
            
            await NotificationModel.createMessageNotification(notificationData);
        } catch (notifError) {
            console.error('Erreur création notification:', notifError);
            // Ne pas faire échouer l'envoi du message si la notification échoue
        }

        res.status(201).json({
            success: true,
            message: message
        });

    } catch (error) {
        console.error('Erreur sendMessage:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Marque les messages comme lus
 */
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { expediteurId } = req.params;

        await MessageModel.markAsRead(userId, parseInt(expediteurId));
        
        res.json({ message: 'Messages marqués comme lus' });

    } catch (error) {
        console.error('Erreur markAsRead:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Compte les messages non lus
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await MessageModel.countUnread(userId);
        
        res.json({ count });

    } catch (error) {
        console.error('Erreur getUnreadCount:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Supprime un message
 */
exports.deleteMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.params;

        const deleted = await MessageModel.softDelete(messageId, userId);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Message non trouvé' });
        }

        res.json({ message: 'Message supprimé' });

    } catch (error) {
        console.error('Erreur deleteMessage:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};