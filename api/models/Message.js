const Model = require('./Model');

class Message extends Model {
    constructor() {
        super('messages');
    }

    /**
     * Récupère les conversations d'un utilisateur (version simplifiée v3)
     */
    async getConversations(userId, options = {}) {
        console.log('=== NOUVELLE VERSION getConversations called with userId:', userId);
        
        try {
            // Version ultra-simplifiée - récupérer tous les messages de l'utilisateur
            const query = `
                SELECT 
                    m.id,
                    m.expediteur_id,
                    m.destinataire_id,
                    m.contenu,
                    m.date_envoi,
                    m.lu,
                    u_exp.nom as expediteur_nom,
                    u_exp.prenom as expediteur_prenom,
                    u_dest.nom as destinataire_nom,
                    u_dest.prenom as destinataire_prenom
                FROM messages m
                JOIN utilisateurs u_exp ON m.expediteur_id = u_exp.id
                JOIN utilisateurs u_dest ON m.destinataire_id = u_dest.id
                WHERE m.expediteur_id = ? OR m.destinataire_id = ?
                ORDER BY m.date_envoi DESC
                LIMIT 50
            `;

            const [messages] = await this.db.execute(query, [userId, userId]);
            console.log('=== NOUVELLE VERSION Messages trouvés:', messages.length);

            // Grouper les messages par interlocuteur
            const conversationsMap = new Map();
            
            for (const message of messages) {
                const interlocuteurId = message.expediteur_id === userId ? message.destinataire_id : message.expediteur_id;
                
                if (!conversationsMap.has(interlocuteurId)) {
                    const participant_nom = message.expediteur_id === userId 
                        ? `${message.destinataire_prenom} ${message.destinataire_nom}`
                        : `${message.expediteur_prenom} ${message.expediteur_nom}`;
                    
                    conversationsMap.set(interlocuteurId, {
                        interlocuteur_id: interlocuteurId,
                        participant_nom: participant_nom,
                        dernier_message: message.contenu,
                        dernier_message_date: message.date_envoi,
                        non_lus: 0
                    });
                }
                
                // Compter les messages non lus
                if (message.destinataire_id === userId && !message.lu) {
                    conversationsMap.get(interlocuteurId).non_lus += 1;
                }
            }

            const conversations = Array.from(conversationsMap.values());
            console.log('=== NOUVELLE VERSION Conversations trouvées:', conversations.length);

            return {
                conversations,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: conversations.length,
                    totalPages: 1
                }
            };

        } catch (error) {
            console.error('=== NOUVELLE VERSION Erreur dans getConversations:', error);
            throw error;
        }
    }

    /**
     * Récupère les messages entre deux utilisateurs
     */
    async getMessagesBetween(userId1, userId2, options = {}) {
        console.log('=== SOLUTION ULTRA-SIMPLE getMessagesBetween called with:', { userId1, userId2, options });
        
        try {
            // Approche ultra-simple : récupérer tous les messages et filtrer en JavaScript
            const query = `SELECT * FROM messages ORDER BY date_envoi DESC`;
            const [allMessages] = await this.db.execute(query);
            
            console.log('=== SOLUTION ULTRA-SIMPLE tous les messages récupérés:', allMessages.length);
            
            // Filtrer les messages entre les deux utilisateurs
            const user1Id = parseInt(userId1);
            const user2Id = parseInt(userId2);
            
            const filteredMessages = allMessages.filter(message => {
                return (message.expediteur_id === user1Id && message.destinataire_id === user2Id) ||
                       (message.expediteur_id === user2Id && message.destinataire_id === user1Id);
            });
            
            console.log('=== SOLUTION ULTRA-SIMPLE messages filtrés:', filteredMessages.length);
            
            // Limiter à 50 messages récents
            const limitedMessages = filteredMessages.slice(0, 50);
            
            // Marquer les messages comme lus (version simple)
            for (const message of limitedMessages) {
                if (message.destinataire_id === user1Id && !message.lu) {
                    await this.db.execute('UPDATE messages SET lu = true WHERE id = ?', [message.id]);
                }
            }
            
            return {
                messages: limitedMessages.reverse(), // Inverser pour avoir l'ordre chronologique
                pagination: {
                    page: 1,
                    limit: 50,
                    total: filteredMessages.length,
                    totalPages: 1
                }
            };
            
        } catch (error) {
            console.error('=== SOLUTION ULTRA-SIMPLE erreur:', error);
            throw error;
        }
    }

    /**
     * Envoie un message
     */
    async sendMessage(expediteurId, destinataireId, contenu, annonceId = null, sujet = null) {
        // Debug
        console.log('=== NOUVELLE VERSION sendMessage params:', {
            expediteurId,
            destinataireId,
            contenu,
            annonceId,
            sujet
        });

        const messageData = {
            expediteur_id: expediteurId,
            destinataire_id: destinataireId,
            contenu,
            lu: false
        };

        // Ajouter seulement les champs non null/undefined
        if (sujet !== null && sujet !== undefined) {
            messageData.sujet = sujet;
        }
        
        if (annonceId !== null && annonceId !== undefined) {
            messageData.annonce_id = annonceId;
        }

        console.log('messageData to create:', messageData);
        
        const result = await this.create(messageData);
        
        // Retourner le message créé avec les informations complètes
        if (result.insertId) {
            const query = `
                SELECT 
                    m.*,
                    u1.nom as expediteur_nom,
                    u1.prenom as expediteur_prenom,
                    u2.nom as destinataire_nom,
                    u2.prenom as destinataire_prenom
                FROM messages m
                INNER JOIN utilisateurs u1 ON m.expediteur_id = u1.id
                INNER JOIN utilisateurs u2 ON m.destinataire_id = u2.id
                WHERE m.id = ?
            `;
            
            const [rows] = await this.db.execute(query, [result.insertId]);
            return rows[0];
        }
        
        return result;
    }

    /**
     * Marque les messages comme lus
     */
    async markAsRead(userId, expediteurId) {
        const query = `
            UPDATE messages 
            SET lu = true, date_lecture = NOW()
            WHERE destinataire_id = ? 
            AND expediteur_id = ? 
            AND lu = false
        `;

        await this.db.execute(query, [userId, expediteurId]);
    }

    /**
     * Compte les messages non lus
     */
    async countUnread(userId) {
        const query = `
            SELECT COUNT(*) as count
            FROM messages
            WHERE destinataire_id = ? AND lu = false
        `;

        const [rows] = await this.db.execute(query, [userId]);
        return rows[0].count;
    }

    /**
     * Supprime un message (soft delete)
     */
    async softDelete(messageId, userId) {
        const query = `
            UPDATE messages 
            SET 
                supprime_expediteur = CASE WHEN expediteur_id = ? THEN true ELSE supprime_expediteur END,
                supprime_destinataire = CASE WHEN destinataire_id = ? THEN true ELSE supprime_destinataire END
            WHERE id = ? AND (expediteur_id = ? OR destinataire_id = ?)
        `;

        const [result] = await this.db.execute(query, [userId, userId, messageId, userId, userId]);
        return result.affectedRows > 0;
    }

    /**
     * Vérifie si un utilisateur peut envoyer un message à un autre
     */
    async canSendMessage(expediteurId, destinataireId) {
        // Vérifier que le destinataire existe et est actif
        const query = `
            SELECT compte_actif 
            FROM utilisateurs 
            WHERE id = ? AND compte_actif = true
        `;

        const [rows] = await this.db.execute(query, [destinataireId]);
        return rows.length > 0;
    }
}

module.exports = new Message();