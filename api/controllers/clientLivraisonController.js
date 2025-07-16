const db = require('../config/db');

/**
 * Récupérer les livraisons du client (ses annonces avec propositions)
 */
exports.getMyLivraisons = async (req, res) => {
    console.log('=== GET MY LIVRAISONS CLIENT called ===');
    
    try {
        const clientId = req.user.id;
        
        // Récupérer toutes les annonces de livraison du client avec les propositions
        const [livraisons] = await db.execute(
            `SELECT 
                a.id as annonce_id,
                a.titre as annonce_titre,
                a.description as annonce_description,
                a.adresse_depart,
                a.adresse_arrivee,
                a.date_livraison_souhaitee,
                a.poids_colis,
                a.dimensions_colis,
                a.budget_max,
                a.statut as annonce_statut,
                a.date_creation as annonce_date_creation,
                COUNT(l.id) as nb_propositions,
                GROUP_CONCAT(
                    CONCAT(
                        l.id, '|',
                        l.livreur_id, '|',
                        u.prenom, ' ', u.nom, '|',
                        l.statut, '|',
                        l.date_proposition, '|',
                        COALESCE(u.telephone, ''), '|',
                        '0'
                    ) SEPARATOR ';;'
                ) as propositions_data
            FROM annonces a
            LEFT JOIN livraisons l ON a.id = l.annonce_id
            LEFT JOIN utilisateurs u ON l.livreur_id = u.id
            WHERE a.client_id = ? 
            AND a.type_annonce = 'livraison'
            GROUP BY a.id
            ORDER BY a.date_creation DESC`,
            [clientId]
        );
        
        // Transformer les données pour le frontend
        const livraisonsFormatted = livraisons.map(row => {
            const propositions = [];
            
            if (row.propositions_data && row.nb_propositions > 0) {
                const propsArray = row.propositions_data.split(';;');
                propsArray.forEach(propStr => {
                    const [id, livreur_id, nom, statut, date_proposition, telephone, note] = propStr.split('|');
                    propositions.push({
                        id: parseInt(id),
                        livreur_id: parseInt(livreur_id),
                        livreur_nom: nom,
                        statut: statut,
                        date_proposition: date_proposition,
                        livreur_telephone: telephone || '',
                        livreur_note: parseFloat(note) || 0
                    });
                });
            }
            
            return {
                annonce_id: row.annonce_id,
                titre: row.annonce_titre,
                description: row.annonce_description,
                adresse_depart: row.adresse_depart,
                adresse_arrivee: row.adresse_arrivee,
                date_livraison_souhaitee: row.date_livraison_souhaitee,
                poids_colis: row.poids_colis,
                dimensions_colis: row.dimensions_colis,
                budget_max: row.budget_max,
                statut: row.annonce_statut,
                date_creation: row.annonce_date_creation,
                nb_propositions: row.nb_propositions,
                propositions: propositions
            };
        });
        
        console.log('Livraisons client trouvées:', livraisonsFormatted.length);
        
        res.json({
            success: true,
            livraisons: livraisonsFormatted
        });
        
    } catch (error) {
        console.error('Erreur get my livraisons client:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Accepter une proposition de livraison
 */
exports.acceptProposition = async (req, res) => {
    console.log('=== ACCEPT PROPOSITION called ===');
    console.log('Params:', req.params);
    console.log('User:', req.user);
    
    try {
        const { livraisonId } = req.params;
        const clientId = req.user.id;
        
        // Vérifier que la livraison existe et appartient au client
        const [livraisonRows] = await db.execute(
            `SELECT l.*, a.titre as annonce_titre 
             FROM livraisons l
             JOIN annonces a ON l.annonce_id = a.id
             WHERE l.id = ? AND a.client_id = ? AND l.statut = 'proposee'`,
            [livraisonId, clientId]
        );
        
        if (livraisonRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Proposition de livraison non trouvée ou déjà traitée' 
            });
        }
        
        const livraison = livraisonRows[0];
        
        // Commencer une transaction
        await db.query('START TRANSACTION');
        
        try {
            // 1. Accepter cette proposition
            await db.execute(
                'UPDATE livraisons SET statut = ?, date_acceptation = NOW() WHERE id = ?',
                ['acceptee', livraisonId]
            );
            
            // 2. Refuser toutes les autres propositions pour cette annonce
            await db.execute(
                `UPDATE livraisons 
                 SET statut = 'refusee', date_refus = NOW() 
                 WHERE annonce_id = ? AND id != ? AND statut = 'proposee'`,
                [livraison.annonce_id, livraisonId]
            );
            
            // 3. Mettre à jour l'annonce comme "en cours"
            await db.execute(
                'UPDATE annonces SET statut = ? WHERE id = ?',
                ['en_cours', livraison.annonce_id]
            );
            
            // Valider la transaction
            await db.query('COMMIT');
            
            // Créer notification pour le livreur accepté
            try {
                await db.execute(
                    `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [livraison.livreur_id, 'Livraison acceptée', `Votre proposition pour "${livraison.annonce_titre}" a été acceptée`, 'livraison', '/app/livreur/livraisons']
                );
            } catch (notifError) {
                console.error('Erreur notification (non bloquante):', notifError);
            }
            
            // Créer notification pour les livreurs refusés
            try {
                const [autresLivreursRows] = await db.execute(
                    'SELECT livreur_id FROM livraisons WHERE annonce_id = ? AND id != ? AND statut = "refusee"',
                    [livraison.annonce_id, livraisonId]
                );
                
                for (const row of autresLivreursRows) {
                    await db.execute(
                        `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                         VALUES (?, ?, ?, ?, ?, NOW())`,
                        [row.livreur_id, 'Proposition non retenue', `Votre proposition pour "${livraison.annonce_titre}" n'a pas été retenue`, 'livraison', '/app/livreur/livraisons']
                    );
                }
            } catch (notifError) {
                console.error('Erreur notifications refus (non bloquante):', notifError);
            }
            
            res.json({
                success: true,
                message: 'Proposition acceptée avec succès'
            });
            
        } catch (transactionError) {
            // Annuler la transaction
            await db.query('ROLLBACK');
            throw transactionError;
        }
        
    } catch (error) {
        console.error('Erreur accept proposition:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
};

/**
 * Refuser une proposition de livraison
 */
exports.refuseProposition = async (req, res) => {
    console.log('=== REFUSE PROPOSITION called ===');
    
    try {
        const { livraisonId } = req.params;
        const { motif } = req.body;
        const clientId = req.user.id;
        
        // Vérifier que la livraison existe et appartient au client
        const [livraisonRows] = await db.execute(
            `SELECT l.*, a.titre as annonce_titre 
             FROM livraisons l
             JOIN annonces a ON l.annonce_id = a.id
             WHERE l.id = ? AND a.client_id = ? AND l.statut = 'proposee'`,
            [livraisonId, clientId]
        );
        
        if (livraisonRows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Proposition de livraison non trouvée ou déjà traitée' 
            });
        }
        
        const livraison = livraisonRows[0];
        
        // Refuser la proposition
        await db.execute(
            'UPDATE livraisons SET statut = ?, date_refus = NOW(), motif_refus = ? WHERE id = ?',
            ['refusee', motif || '', livraisonId]
        );
        
        // Créer notification pour le livreur
        try {
            await db.execute(
                `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [livraison.livreur_id, 'Proposition refusée', `Votre proposition pour "${livraison.annonce_titre}" a été refusée`, 'livraison', '/app/livreur/livraisons']
            );
        } catch (notifError) {
            console.error('Erreur notification (non bloquante):', notifError);
        }
        
        res.json({
            success: true,
            message: 'Proposition refusée'
        });
        
    } catch (error) {
        console.error('Erreur refuse proposition:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur serveur' 
        });
    }
};