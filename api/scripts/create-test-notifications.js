const db = require('../config/db');

async function createTestNotifications() {
    try {
        console.log('Création de notifications de test...');
        
        // Récupérer quelques utilisateurs pour créer des notifications
        const [users] = await db.execute('SELECT id, nom, prenom FROM utilisateurs LIMIT 5');
        
        if (users.length === 0) {
            console.log('Aucun utilisateur trouvé. Veuillez d\'abord créer des utilisateurs.');
            return;
        }
        
        const testNotifications = [
            {
                titre: 'Nouveau message reçu',
                message: 'Vous avez reçu un nouveau message concernant votre annonce',
                type: 'message',
                lien: '/app/messages'
            },
            {
                titre: 'Annonce approuvée',
                message: 'Votre annonce "Livraison express" a été approuvée',
                type: 'annonce',
                lien: '/app/annonces'
            },
            {
                titre: 'Nouveau commentaire',
                message: 'Quelqu\'un a commenté votre prestation',
                type: 'commentaire',
                lien: '/app/prestations'
            },
            {
                titre: 'Paiement reçu',
                message: 'Vous avez reçu un paiement de 25€',
                type: 'paiement',
                lien: '/app/transactions'
            },
            {
                titre: 'Rappel',
                message: 'N\'oubliez pas de confirmer votre livraison prévue demain',
                type: 'rappel',
                lien: '/app/livraisons'
            }
        ];
        
        // Créer des notifications pour chaque utilisateur
        for (const user of users) {
            for (const notifData of testNotifications) {
                await db.execute(
                    `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, lue, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                    [user.id, notifData.titre, notifData.message, notifData.type, notifData.lien, false]
                );
            }
            console.log(`Notifications créées pour ${user.prenom} ${user.nom} (ID: ${user.id})`);
        }
        
        console.log('Notifications de test créées avec succès !');
        
    } catch (error) {
        console.error('Erreur lors de la création des notifications:', error);
    } finally {
        process.exit(0);
    }
}

createTestNotifications();