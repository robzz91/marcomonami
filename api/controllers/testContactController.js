const db = require('../config/db');

exports.testContactAuthor = async (req, res) => {
    console.log('\n\n========== TEST CONTACT AUTHOR ==========');
    console.log('URL appelée:', req.originalUrl);
    console.log('Méthode:', req.method);
    console.log('Body reçu:', JSON.stringify(req.body));
    console.log('Params:', JSON.stringify(req.params));
    console.log('User:', JSON.stringify(req.user));
    console.log('==========================================\n\n');
    
    try {
        // 1. Récupération ultra basique des données
        const annonceId = req.params.id;
        const message = req.body.message;
        const userId = req.user?.id;
        
        console.log('ETAPE 1 - Données extraites:');
        console.log('- annonceId:', annonceId);
        console.log('- message:', message);
        console.log('- userId:', userId);
        
        // 2. Validation minimale
        if (!userId || !message || !annonceId) {
            console.log('ERREUR: Données manquantes');
            return res.status(400).json({ 
                success: false, 
                error: 'Données manquantes' 
            });
        }
        
        console.log('ETAPE 2 - Validation OK');
        
        // 3. Récupérer l'auteur de l'annonce
        console.log('ETAPE 3 - Recherche de l\'auteur de l\'annonce');
        const [annonceRows] = await db.execute(
            'SELECT client_id, titre FROM annonces WHERE id = ?',
            [annonceId]
        );
        
        if (annonceRows.length === 0) {
            console.log('ERREUR: Annonce non trouvée');
            return res.status(404).json({ 
                success: false, 
                error: 'Annonce non trouvée' 
            });
        }
        
        const auteurId = annonceRows[0].client_id;
        const titrAnnonce = annonceRows[0].titre;
        console.log('ETAPE 3 - Auteur trouvé (client_id):', auteurId);
        
        // 4. Vérifier qu'on ne s'envoie pas un message à soi-même
        if (auteurId === userId) {
            console.log('ERREUR: Tentative d\'envoi à soi-même');
            return res.status(400).json({ 
                success: false, 
                error: 'Vous ne pouvez pas contacter votre propre annonce' 
            });
        }
        
        // 5. Insertion avec le bon destinataire
        const query = `
            INSERT INTO messages (expediteur_id, destinataire_id, contenu, annonce_id, sujet, date_envoi) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        const sujet = `Contact - ${titrAnnonce}`;
        
        console.log('ETAPE 4 - Query:', query);
        console.log('ETAPE 4 - Valeurs:', [userId, auteurId, message, annonceId, sujet]);
        
        const [result] = await db.execute(query, [userId, auteurId, message, annonceId, sujet]);
        
        console.log('ETAPE 5 - Insertion réussie, ID:', result.insertId);
        
        // 6. Créer une notification pour l'auteur
        try {
            await db.execute(
                `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [auteurId, 'Nouveau message', `Message reçu pour votre annonce "${titrAnnonce}"`, 'message', '/app/messages']
            );
            console.log('ETAPE 6 - Notification créée');
        } catch (notifError) {
            console.error('Erreur notification (non bloquante):', notifError);
        }
        
        // 7. Réponse simple
        res.json({
            success: true,
            messageId: result.insertId,
            message: 'Message envoyé avec succès (TEST)'
        });
        
    } catch (error) {
        console.error('ERREUR COMPLETE:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
};