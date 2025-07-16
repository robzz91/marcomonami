const db = require('../config/db');

/**
 * Proposer une livraison pour une annonce
 */
exports.proposeDelivery = async (req, res) => {
    console.log('=== PROPOSE DELIVERY called ===');
    console.log('User:', req.user);
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    try {
        const { annonceId } = req.body;
        const livreurId = req.user.id;
        
        if (!annonceId) {
            return res.status(400).json({ 
                success: false, 
                error: 'ID de l\'annonce requis' 
            });
        }
        
        // Vérifier que l'annonce existe et est de type livraison
        const [annonceRows] = await db.execute(
            'SELECT id, client_id, titre, statut, type_annonce FROM annonces WHERE id = ? AND type_annonce = "livraison"',
            [annonceId]
        );
        
        if (annonceRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Annonce de livraison non trouvée' 
            });
        }
        
        const annonce = annonceRows[0];
        
        // Vérifier que l'annonce est ouverte
        if (annonce.statut !== 'ouverte') {
            return res.status(400).json({ 
                success: false, 
                error: 'Cette annonce n\'est plus ouverte' 
            });
        }
        
        // Vérifier que le livreur ne propose pas sa propre annonce
        if (annonce.client_id === livreurId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vous ne pouvez pas proposer vos propres annonces' 
            });
        }
        
        // Vérifier si le livreur a déjà proposé cette annonce
        const [existingRows] = await db.execute(
            'SELECT id FROM livraisons WHERE annonce_id = ? AND livreur_id = ?',
            [annonceId, livreurId]
        );
        
        if (existingRows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vous avez déjà proposé cette livraison' 
            });
        }
        
        // Créer la proposition de livraison
        const [insertResult] = await db.execute(
            `INSERT INTO livraisons (
                annonce_id, 
                livreur_id, 
                client_id,
                statut, 
                date_proposition, 
                created_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [annonceId, livreurId, annonce.client_id, 'proposee']
        );
        
        console.log('Livraison proposée avec ID:', insertResult.insertId);
        
        // Créer une notification pour le client
        try {
            await db.execute(
                `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [annonce.client_id, 'Nouvelle proposition de livraison', `Un livreur a proposé de livrer votre annonce "${annonce.titre}"`, 'livraison', `/app/annonces/${annonceId}`]
            );
        } catch (notifError) {
            console.error('Erreur notification (non bloquante):', notifError);
        }
        
        res.status(201).json({
            success: true,
            message: 'Proposition de livraison envoyée avec succès',
            livraisonId: insertResult.insertId
        });
        
    } catch (error) {
        console.error('Erreur propose delivery:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur',
            details: error.message
        });
    }
};

/**
 * Récupérer les livraisons d'un livreur
 */
exports.getLivraisonsByLivreur = async (req, res) => {
    console.log('=== GET LIVRAISONS BY LIVREUR called ===');
    
    try {
        const livreurId = req.user.id;
        
        const [livraisons] = await db.execute(
            `SELECT 
                l.id, 
                l.annonce_id,
                l.statut as livraison_statut,
                l.date_proposition,
                l.date_acceptation,
                l.date_livraison,
                l.commentaires,
                a.titre as annonce_titre,
                a.description as annonce_description,
                a.adresse_depart,
                a.adresse_arrivee,
                a.date_livraison_souhaitee,
                a.poids_colis,
                a.dimensions_colis,
                a.budget_max,
                u.nom as client_nom,
                u.prenom as client_prenom,
                u.email as client_email,
                u.telephone as client_telephone
            FROM livraisons l
            JOIN annonces a ON l.annonce_id = a.id
            JOIN utilisateurs u ON l.client_id = u.id
            WHERE l.livreur_id = ?
            ORDER BY l.created_at DESC`,
            [livreurId]
        );
        
        console.log('Livraisons trouvées:', livraisons.length);
        
        res.json({
            success: true,
            livraisons: livraisons
        });
        
    } catch (error) {
        console.error('Erreur get livraisons:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Accepter une livraison (côté client)
 */
exports.acceptLivraison = async (req, res) => {
    console.log('=== ACCEPT LIVRAISON called ===');
    
    try {
        const livraisonId = req.params.id;
        const clientId = req.user.id;
        
        // Vérifier que la livraison existe et appartient au client
        const [livraisonRows] = await db.execute(
            'SELECT id, statut, livreur_id FROM livraisons WHERE id = ? AND client_id = ?',
            [livraisonId, clientId]
        );
        
        if (livraisonRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Livraison non trouvée' 
            });
        }
        
        const livraison = livraisonRows[0];
        
        if (livraison.statut !== 'proposee') {
            return res.status(400).json({ 
                success: false, 
                error: 'Cette livraison ne peut plus être acceptée' 
            });
        }
        
        // Accepter la livraison
        await db.execute(
            'UPDATE livraisons SET statut = ?, date_acceptation = NOW() WHERE id = ?',
            ['acceptee', livraisonId]
        );
        
        // Mettre à jour l'annonce comme "en cours"
        await db.execute(
            'UPDATE annonces SET statut = ? WHERE id = (SELECT annonce_id FROM livraisons WHERE id = ?)',
            ['en_cours', livraisonId]
        );
        
        // Créer notification pour le livreur
        try {
            await db.execute(
                `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [livraison.livreur_id, 'Livraison acceptée', 'Votre proposition de livraison a été acceptée', 'livraison', '/app/livreur/livraisons']
            );
        } catch (notifError) {
            console.error('Erreur notification (non bloquante):', notifError);
        }
        
        res.json({
            success: true,
            message: 'Livraison acceptée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur accept livraison:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Marquer une livraison comme terminée (côté livreur)
 */
exports.completeLivraison = async (req, res) => {
    console.log('=== COMPLETE LIVRAISON called ===');
    
    try {
        const livraisonId = req.params.id;
        const livreurId = req.user.id;
        const { commentaires } = req.body;
        
        // Vérifier que la livraison existe et appartient au livreur
        const [livraisonRows] = await db.execute(
            'SELECT id, statut, client_id FROM livraisons WHERE id = ? AND livreur_id = ?',
            [livraisonId, livreurId]
        );
        
        if (livraisonRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Livraison non trouvée' 
            });
        }
        
        const livraison = livraisonRows[0];
        
        if (livraison.statut !== 'acceptee') {
            return res.status(400).json({ 
                success: false, 
                error: 'Cette livraison ne peut pas être terminée' 
            });
        }
        
        // Marquer comme terminée
        await db.execute(
            'UPDATE livraisons SET statut = ?, date_livraison = NOW(), commentaires = ? WHERE id = ?',
            ['terminee', commentaires || '', livraisonId]
        );
        
        // Mettre à jour l'annonce comme "terminée"
        await db.execute(
            'UPDATE annonces SET statut = ? WHERE id = (SELECT annonce_id FROM livraisons WHERE id = ?)',
            ['terminee', livraisonId]
        );
        
        // Créer notification pour le client
        try {
            await db.execute(
                `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [livraison.client_id, 'Livraison terminée', 'Votre livraison a été effectuée', 'livraison', '/app/client/livraisons']
            );
        } catch (notifError) {
            console.error('Erreur notification (non bloquante):', notifError);
        }
        
        res.json({
            success: true,
            message: 'Livraison terminée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur complete livraison:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
};