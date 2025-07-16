const AnnonceModel = require('../models/Annonce');

/**
 * Liste toutes les annonces avec filtres et pagination
 */
exports.getAllAnnonces = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Construction de la requête pour toutes les annonces publiques
        let query = `
            SELECT a.*, u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
            FROM annonces a 
            LEFT JOIN clients c ON a.client_id = c.id 
            LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id 
            WHERE a.statut = 'ouverte'
        `;
        let params = [];
        
        // Ajouter les filtres
        if (req.query.search) {
            query += ` AND (a.titre LIKE ? OR a.description LIKE ?)`;
            const searchTerm = `%${req.query.search}%`;
            params.push(searchTerm, searchTerm);
        }
        if (req.query.type) {
            query += ` AND a.type_annonce = ?`;
            params.push(req.query.type);
        }
        if (req.query.categorie) {
            query += ` AND a.type_prestation = ?`;
            params.push(req.query.categorie);
        }
        if (req.query.budget_max) {
            query += ` AND (a.budget_max IS NULL OR a.budget_max <= ?)`;
            params.push(req.query.budget_max);
        }
        if (req.query.urgence) {
            query += ` AND a.urgence = ?`;
            params.push(req.query.urgence);
        }
        
        // Tri et pagination
        const orderBy = req.query.orderBy || 'date_creation';
        const order = req.query.order || 'DESC';
        query += ` ORDER BY a.${orderBy} ${order} LIMIT ? OFFSET ?`;
        params.push(limit.toString(), offset.toString());
        
        // Exécuter la requête
        const [rows] = await AnnonceModel.db.execute(query, params);
        
        // Compter le total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM annonces a 
            LEFT JOIN clients c ON a.client_id = c.id 
            WHERE a.statut = 'ouverte'
        `;
        let countParams = [];
        
        if (req.query.search) {
            countQuery += ` AND (a.titre LIKE ? OR a.description LIKE ?)`;
            const searchTerm = `%${req.query.search}%`;
            countParams.push(searchTerm, searchTerm);
        }
        if (req.query.type) {
            countQuery += ` AND a.type_annonce = ?`;
            countParams.push(req.query.type);
        }
        if (req.query.categorie) {
            countQuery += ` AND a.type_prestation = ?`;
            countParams.push(req.query.categorie);
        }
        if (req.query.budget_max) {
            countQuery += ` AND (a.budget_max IS NULL OR a.budget_max <= ?)`;
            countParams.push(req.query.budget_max);
        }
        if (req.query.urgence) {
            countQuery += ` AND a.urgence = ?`;
            countParams.push(req.query.urgence);
        }
        
        const [countResult] = await AnnonceModel.db.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        // Transformer les données pour correspondre au format attendu par le frontend
        const transformedAnnonces = rows.map(annonce => ({
            id: annonce.id,
            titre: annonce.titre,
            description: annonce.description,
            type: annonce.type_annonce, // 'livraison' ou 'prestation'
            categorie: annonce.type_prestation || 'livraison',
            budget: annonce.budget_max,
            urgence: annonce.urgence,
            localisation: annonce.adresse_depart || 'Non spécifié',
            date_creation: annonce.date_creation,
            date_souhaitee: annonce.date_livraison_souhaitee || annonce.date_prestation_souhaitee,
            auteur_nom: `${annonce.client_prenom} ${annonce.client_nom}`,
            auteur_note: 4.5, // Note par défaut
            auteur_avis: 12 // Nombre d'avis par défaut
        }));
        
        res.json({
            success: true,
            annonces: transformedAnnonces,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Erreur getAllAnnonces:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère une annonce par ID
 */
exports.getAnnonceById = async (req, res) => {
    try {
        const { id } = req.params;
        const annonce = await AnnonceModel.findByIdWithDetails(id);
        
        if (!annonce) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        // Incrémenter le nombre de vues
        await AnnonceModel.incrementViews(id);

        // Transformer les données pour le frontend
        const transformedAnnonce = {
            id: annonce.id,
            titre: annonce.titre,
            description: annonce.description,
            type: annonce.type_annonce, // 'livraison' ou 'prestation'
            categorie: annonce.type_prestation || 'livraison',
            budget: annonce.budget_max,
            urgence: annonce.urgence,
            localisation: annonce.adresse_depart || 'Non spécifié',
            date_creation: annonce.date_creation,
            date_souhaitee: annonce.date_livraison_souhaitee || annonce.date_prestation_souhaitee,
            nombre_vues: annonce.nombre_vues,
            statut: annonce.statut,
            
            // Informations spécifiques livraison
            poids: annonce.poids_colis,
            dimensions: annonce.dimensions_colis,
            adresse_depart: annonce.adresse_depart,
            adresse_arrivee: annonce.adresse_arrivee,
            
            // Informations spécifiques prestation
            duree: annonce.duree_estimee_heures,
            
            // Informations auteur
            auteur_id: annonce.auteur_id,
            auteur_nom: `${annonce.client_prenom} ${annonce.client_nom}`,
            auteur_note: 4.5, // Note par défaut
            auteur_avis: 12 // Nombre d'avis par défaut
        };

        res.json(transformedAnnonce);

    } catch (error) {
        console.error('Erreur getAnnonceById:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Crée une nouvelle annonce
 */
exports.createAnnonce = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est un client
        if (!req.user.roles.includes('client')) {
            return res.status(403).json({ 
                error: 'Seuls les clients peuvent créer des annonces' 
            });
        }

        // Récupérer l'ID du client depuis la table clients, le créer si nécessaire
        let clientResult = await AnnonceModel.query(
            'SELECT id FROM clients WHERE utilisateur_id = ?',
            [req.user.id]
        );

        if (!clientResult || clientResult.length === 0) {
            // Créer automatiquement l'entrée client avec la méthode db directement
            const [insertResult] = await AnnonceModel.db.execute(
                'INSERT INTO clients (utilisateur_id, abonnement) VALUES (?, ?)',
                [req.user.id, 'free']
            );
            
            const clientId = insertResult.insertId;
            clientResult = [{ id: clientId }];
        }

        // Nettoyer les données - remplacer les chaînes vides par null pour les champs optionnels
        const cleanData = { ...req.body };
        
        // Champs de date qui peuvent être vides
        if (cleanData.date_livraison_souhaitee === '') {
            cleanData.date_livraison_souhaitee = null;
        }
        if (cleanData.date_prestation_souhaitee === '') {
            cleanData.date_prestation_souhaitee = null;
        }
        
        // Champs numériques qui peuvent être vides
        if (cleanData.poids_colis === '' || cleanData.poids_colis === undefined) {
            cleanData.poids_colis = null;
        }
        if (cleanData.duree_estimee_heures === '' || cleanData.duree_estimee_heures === undefined) {
            cleanData.duree_estimee_heures = null;
        }
        if (cleanData.budget_max === '' || cleanData.budget_max === undefined) {
            cleanData.budget_max = null;
        }
        
        // Champs texte qui peuvent être vides
        if (cleanData.dimensions_colis === '') {
            cleanData.dimensions_colis = null;
        }
        if (cleanData.type_prestation === '') {
            cleanData.type_prestation = null;
        }
        if (cleanData.adresse_depart === '') {
            cleanData.adresse_depart = null;
        }
        if (cleanData.adresse_arrivee === '') {
            cleanData.adresse_arrivee = null;
        }

        const annonceData = {
            ...cleanData,
            client_id: clientResult[0].id
        };

        // Validation des champs requis
        const requiredFields = ['titre', 'description', 'type_annonce'];
        for (const field of requiredFields) {
            if (!annonceData[field]) {
                return res.status(400).json({ 
                    error: `Le champ ${field} est requis` 
                });
            }
        }

        // Validation du titre
        if (annonceData.titre.length < 3 || annonceData.titre.length > 100) {
            return res.status(400).json({ 
                error: 'Le titre doit contenir entre 3 et 100 caractères' 
            });
        }

        // Validation de la description
        if (annonceData.description.length < 10 || annonceData.description.length > 1000) {
            return res.status(400).json({ 
                error: 'La description doit contenir entre 10 et 1000 caractères' 
            });
        }

        // Validation du type d'annonce
        if (!['livraison', 'prestation'].includes(annonceData.type_annonce)) {
            return res.status(400).json({ 
                error: 'Type d\'annonce invalide' 
            });
        }

        // Validation spécifique pour livraison
        if (annonceData.type_annonce === 'livraison') {
            if (!annonceData.adresse_depart || !annonceData.adresse_arrivee) {
                return res.status(400).json({ 
                    error: 'Les adresses de départ et d\'arrivée sont requises pour une livraison' 
                });
            }
        }

        // Validation spécifique pour prestation
        if (annonceData.type_annonce === 'prestation') {
            if (!annonceData.type_prestation) {
                return res.status(400).json({ 
                    error: 'Le type de prestation est requis' 
                });
            }
        }

        // Validation du budget
        if (annonceData.budget_max !== null && annonceData.budget_max !== undefined) {
            if (annonceData.budget_max < 0) {
                return res.status(400).json({ 
                    error: 'Le budget doit être positif' 
                });
            }
            if (annonceData.budget_max > 10000) {
                return res.status(400).json({ 
                    error: 'Le budget ne peut pas dépasser 10 000 €' 
                });
            }
        }

        // Validation du poids
        if (annonceData.poids_colis !== null && annonceData.poids_colis !== undefined) {
            if (annonceData.poids_colis < 0) {
                return res.status(400).json({ 
                    error: 'Le poids doit être positif' 
                });
            }
            if (annonceData.poids_colis > 200) {
                return res.status(400).json({ 
                    error: 'Le poids ne peut pas dépasser 200 kg' 
                });
            }
        }

        // Validation de la durée
        if (annonceData.duree_estimee_heures !== null && annonceData.duree_estimee_heures !== undefined) {
            if (annonceData.duree_estimee_heures < 0.1) {
                return res.status(400).json({ 
                    error: 'La durée minimale est de 0.1 heure' 
                });
            }
            if (annonceData.duree_estimee_heures > 24) {
                return res.status(400).json({ 
                    error: 'La durée ne peut pas dépasser 24 heures' 
                });
            }
        }

        // Validation des dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (annonceData.date_livraison_souhaitee) {
            const dateLivraison = new Date(annonceData.date_livraison_souhaitee);
            if (dateLivraison < today) {
                return res.status(400).json({ 
                    error: 'La date de livraison ne peut pas être dans le passé' 
                });
            }
        }

        if (annonceData.date_prestation_souhaitee) {
            const datePrestation = new Date(annonceData.date_prestation_souhaitee);
            if (datePrestation < today) {
                return res.status(400).json({ 
                    error: 'La date de prestation ne peut pas être dans le passé' 
                });
            }
        }

        const newAnnonce = await AnnonceModel.create(annonceData);
        
        res.status(201).json({
            success: true,
            message: 'Annonce créée avec succès',
            data: newAnnonce
        });

    } catch (error) {
        console.error('Erreur createAnnonce:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur lors de la création de l\'annonce',
            message: error.message 
        });
    }
};

/**
 * Met à jour une annonce
 */
exports.updateAnnonce = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Vérifier que l'annonce existe
        const annonce = await AnnonceModel.findById(id);
        if (!annonce) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        // Vérifier que l'utilisateur est l'auteur ou admin
        if (annonce.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json({ error: 'Accès interdit' });
        }

        // Empêcher la modification de certains champs
        delete updateData.id;
        delete updateData.auteur_id;
        delete updateData.date_creation;
        delete updateData.nombre_vues;

        // Validation du prix si modifié
        if (updateData.prix !== undefined && updateData.prix < 0) {
            return res.status(400).json({ 
                error: 'Le prix doit être positif' 
            });
        }

        const updatedAnnonce = await AnnonceModel.update(id, updateData);
        
        res.json({
            message: 'Annonce mise à jour',
            annonce: updatedAnnonce
        });

    } catch (error) {
        console.error('Erreur updateAnnonce:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Supprime une annonce
 */
exports.deleteAnnonce = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que l'annonce existe
        const annonce = await AnnonceModel.findById(id);
        if (!annonce) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        // Vérifier que l'utilisateur est l'auteur ou admin
        if (annonce.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json({ error: 'Accès interdit' });
        }

        // Ne pas supprimer physiquement, juste changer le statut
        await AnnonceModel.updateStatus(id, 'annulee');
        
        res.json({ message: 'Annonce annulée' });

    } catch (error) {
        console.error('Erreur deleteAnnonce:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Change le statut d'une annonce
 */
exports.updateAnnonceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        if (!statut) {
            return res.status(400).json({ error: 'Statut requis' });
        }

        // Vérifier que l'annonce existe
        const annonce = await AnnonceModel.findById(id);
        if (!annonce) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        // Vérifier les permissions
        if (annonce.auteur_id !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json({ error: 'Accès interdit' });
        }

        await AnnonceModel.updateStatus(id, statut);
        
        res.json({ 
            message: 'Statut mis à jour',
            statut 
        });

    } catch (error) {
        console.error('Erreur updateAnnonceStatus:', error);
        if (error.message === 'Statut invalide') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère les annonces de l'utilisateur connecté
 */
exports.getMyAnnonces = async (req, res) => {
    try {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            statut: req.query.statut,
            orderBy: req.query.orderBy,
            order: req.query.order
        };

        const result = await AnnonceModel.findByAuteur(req.user.id, options);
        res.json(result);

    } catch (error) {
        console.error('Erreur getMyAnnonces:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère les statistiques des annonces
 */
exports.getAnnonceStats = async (req, res) => {
    try {
        // Si admin, stats globales, sinon stats de l'utilisateur
        const auteurId = req.user.roles.includes('admin') ? null : req.user.id;
        const stats = await AnnonceModel.getStatistics(auteurId);
        
        res.json(stats);

    } catch (error) {
        console.error('Erreur getAnnonceStats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère les statistiques publiques des annonces
 */
exports.getPublicStats = async (req, res) => {
    try {
        // Statistiques publiques pour tous les utilisateurs
        const [totalResult] = await AnnonceModel.db.execute(
            'SELECT COUNT(*) as total FROM annonces WHERE statut = "ouverte"'
        );
        
        const [nouvellesResult] = await AnnonceModel.db.execute(
            'SELECT COUNT(*) as nouvelles FROM annonces WHERE statut = "ouverte" AND DATE(date_creation) = CURDATE()'
        );
        
        const [demandesResult] = await AnnonceModel.db.execute(
            'SELECT COUNT(*) as demandes FROM annonces WHERE statut = "ouverte" AND type_annonce = "prestation"'
        );
        
        const [offresResult] = await AnnonceModel.db.execute(
            'SELECT COUNT(*) as offres FROM annonces WHERE statut = "ouverte" AND type_annonce = "livraison"'
        );
        
        res.json({
            total: totalResult[0].total,
            nouvelles: nouvellesResult[0].nouvelles,
            demandes: demandesResult[0].demandes,
            offres: offresResult[0].offres
        });

    } catch (error) {
        console.error('Erreur getPublicStats:', error);
        res.status(500).json({ 
            total: 0,
            nouvelles: 0,
            demandes: 0,
            offres: 0
        });
    }
};

/**
 * Récupère toutes les catégories
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = await AnnonceModel.getCategories();
        res.json(categories);

    } catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère les annonces filtrées par type selon le rôle de l'utilisateur
 */
exports.getAnnoncesForRole = async (req, res) => {
    try {
        // Pour les clients, récupérer leurs propres annonces
        if (req.user.roles.includes('client')) {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            
            // Construction de la requête avec filtres
            let query = `
                SELECT a.*, u.nom as client_nom, u.prenom as client_prenom, u.email as client_email
                FROM annonces a 
                LEFT JOIN clients c ON a.client_id = c.id 
                LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id 
                WHERE c.utilisateur_id = ?
            `;
            let params = [req.user.id];
            
            // Ajouter les filtres
            if (req.query.statut) {
                query += ` AND a.statut = ?`;
                params.push(req.query.statut);
            }
            if (req.query.type_annonce) {
                query += ` AND a.type_annonce = ?`;
                params.push(req.query.type_annonce);
            }
            if (req.query.urgence) {
                query += ` AND a.urgence = ?`;
                params.push(req.query.urgence);
            }
            
            // Tri et pagination
            const orderBy = req.query.orderBy || 'date_creation';
            const order = req.query.order || 'DESC';
            query += ` ORDER BY a.${orderBy} ${order} LIMIT ? OFFSET ?`;
            params.push(limit.toString(), offset.toString());
            
            // Exécuter la requête
            const [rows] = await AnnonceModel.db.execute(query, params);
            
            // Compter le total
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM annonces a 
                LEFT JOIN clients c ON a.client_id = c.id 
                WHERE c.utilisateur_id = ?
            `;
            let countParams = [req.user.id];
            
            if (req.query.statut) {
                countQuery += ` AND a.statut = ?`;
                countParams.push(req.query.statut);
            }
            if (req.query.type_annonce) {
                countQuery += ` AND a.type_annonce = ?`;
                countParams.push(req.query.type_annonce);
            }
            if (req.query.urgence) {
                countQuery += ` AND a.urgence = ?`;
                countParams.push(req.query.urgence);
            }
            
            const [countResult] = await AnnonceModel.db.execute(countQuery, countParams);
            const total = countResult[0].total;
            
            res.json({
                success: true,
                data: rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } else {
            // Pour d'autres rôles, retourner toutes les annonces disponibles
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut || 'publiee', // Par défaut, voir les annonces publiées
                type_annonce: req.query.type_annonce,
                urgence: req.query.urgence,
                orderBy: req.query.orderBy,
                order: req.query.order
            };

            const result = await AnnonceModel.listWithDetails(options);
            res.json({
                success: true,
                ...result
            });
        }

    } catch (error) {
        console.error('Erreur getAnnoncesForRole:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur',
            message: error.message 
        });
    }
};

/**
 * Contacter l'auteur d'une annonce
 */
exports.contactAuthor = async (req, res) => {
    console.log('=== SOLUTION ULTRA-SIMPLE contactAuthor ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    console.log('req.params:', req.params);
    
    try {
        const annonceId = req.params.id;
        const message = req.body.message;
        const expediteurId = req.user.id;
        
        console.log('=== ULTRA-SIMPLE étape 1: validation basique');
        
        // Validation ultra-simple
        if (!expediteurId) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message requis' });
        }
        
        console.log('=== ULTRA-SIMPLE étape 2: chercher l\'annonce');
        
        // Requête SQL directe et simple pour récupérer l'annonce
        const [annonceRows] = await db.execute(
            'SELECT id, auteur_id, titre FROM annonces WHERE id = ?',
            [annonceId]
        );
        
        if (annonceRows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }
        
        const annonce = annonceRows[0];
        const destinataireId = annonce.auteur_id;
        
        console.log('=== ULTRA-SIMPLE étape 3: vérifier pas soi-même');
        
        // Vérifier qu'on ne s'envoie pas un message à soi-même
        if (destinataireId === expediteurId) {
            return res.status(400).json({ error: 'Vous ne pouvez pas contacter votre propre annonce' });
        }
        
        console.log('=== ULTRA-SIMPLE étape 4: insérer le message');
        
        // Insertion directe et simple dans la base
        const [insertResult] = await db.execute(
            `INSERT INTO messages (expediteur_id, destinataire_id, annonce_id, sujet, contenu, date_envoi) 
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [expediteurId, destinataireId, annonceId, `Contact - ${annonce.titre}`, message]
        );
        
        console.log('=== ULTRA-SIMPLE message inséré avec ID:', insertResult.insertId);
        
        // Créer une notification simple
        try {
            await db.execute(
                `INSERT INTO notifications (utilisateur_id, titre, message, type, lien, created_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [destinataireId, 'Nouveau message', `Message reçu concernant votre annonce`, 'message', '/app/messages']
            );
        } catch (notifError) {
            console.error('Erreur notification (non bloquante):', notifError);
        }
        
        console.log('=== ULTRA-SIMPLE succès complet');
        
        res.status(201).json({
            success: true,
            message: {
                id: insertResult.insertId,
                expediteur_id: expediteurId,
                destinataire_id: destinataireId,
                contenu: message
            }
        });

    } catch (error) {
        console.error('=== ULTRA-SIMPLE ERREUR:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur',
            details: error.message
        });
    }
};