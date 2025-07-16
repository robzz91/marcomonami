const utilisateurModel = require('../models/Utilisateur');
const livreurModel = require('../models/Livreur');
const commercantModel = require('../models/Commercant');
const clientModel = require('../models/Client');
const prestataireModel = require('../models/Prestataire');
const { validationResult } = require('express-validator');

const adminController = {
    // Dashboard et statistiques globales
    async getDashboard(req, res) {
        try {
            const periode = parseInt(req.query.periode) || 30;
            
            // Statistiques générales
            const [
                totalUtilisateurs,
                totalLivreurs,
                totalCommercants,
                totalClients,
                totalPrestataires,
                totalLivraisons,
                totalPrestations,
                chiffreAffaires
            ] = await Promise.all([
                utilisateurModel.query('SELECT COUNT(*) as total FROM utilisateurs'),
                livreurModel.query('SELECT COUNT(*) as total FROM livreurs'),
                commercantModel.query('SELECT COUNT(*) as total FROM commercants'),
                clientModel.query('SELECT COUNT(*) as total FROM clients'),
                prestataireModel.query('SELECT COUNT(*) as total FROM prestataires'),
                livreurModel.query(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN statut = 'livree' THEN 1 ELSE 0 END) as completees,
                        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
                        SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees
                    FROM livraisons 
                    WHERE date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)
                `, [periode]),
                prestataireModel.query(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN statut = 'terminee' THEN 1 ELSE 0 END) as completees,
                        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
                        SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees
                    FROM prestations_services 
                    WHERE date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)
                `, [periode]),
                livreurModel.query(`
                    SELECT 
                        SUM(montant) as total,
                        COUNT(*) as nombre_transactions
                    FROM paiements 
                    WHERE statut = 'reussi' 
                    AND date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)
                `, [periode])
            ]);

            // Évolution des inscriptions par jour (7 derniers jours)
            const inscriptionsParJour = await utilisateurModel.query(`
                SELECT 
                    DATE(date_creation) as date,
                    COUNT(*) as inscriptions
                FROM utilisateurs 
                WHERE date_creation >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(date_creation)
                ORDER BY date ASC
            `);

            // Top 5 des livreurs par nombre de livraisons
            const topLivreurs = await livreurModel.query(`
                SELECT 
                    l.id,
                    u.nom,
                    u.prenom,
                    COUNT(DISTINCT liv.id) as nombre_livraisons,
                    AVG(liv.note_client) as note_moyenne
                FROM livreurs l
                JOIN utilisateurs u ON l.utilisateur_id = u.id
                LEFT JOIN livraisons liv ON l.id = liv.livreur_id
                WHERE liv.date_creation >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY l.id, u.nom, u.prenom
                ORDER BY nombre_livraisons DESC
                LIMIT 5
            `, [periode]);

            res.json({
                success: true,
                data: {
                    statistiques: {
                        utilisateurs: totalUtilisateurs[0],
                        livreurs: totalLivreurs[0],
                        commercants: totalCommercants[0],
                        clients: totalClients[0],
                        prestataires: totalPrestataires[0],
                        livraisons: totalLivraisons[0],
                        prestations: totalPrestations[0],
                        finances: chiffreAffaires[0]
                    },
                    graphiques: {
                        inscriptionsParJour,
                        topLivreurs
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du dashboard'
            });
        }
    },

    // Gestion des utilisateurs
    async getAllUsers(req, res) {
        try {
            console.log('=== GET ALL USERS ===');
            console.log('Query:', req.query);
            
            const { page = 1, limit = 20, search = '', status = '' } = req.query;
            const offset = (page - 1) * limit;
            
            // Construire la requête SQL avec filtres
            let whereClause = 'WHERE 1=1';
            let params = [];
            
            if (search) {
                whereClause += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            if (status) {
                whereClause += ' AND u.compte_actif = ?';
                params.push(status === 'actif' ? 1 : 0);
            }
            
            // Filtrage par rôle
            if (req.query.role) {
                whereClause += ' AND r.nom_role = ?';
                params.push(req.query.role);
            }
            
            // Requête pour récupérer les utilisateurs avec leurs rôles
            const query = `
                SELECT 
                    u.id,
                    u.nom,
                    u.prenom,
                    u.email,
                    u.telephone,
                    u.compte_actif,
                    u.date_inscription,
                    u.date_modification,
                    u.derniere_connexion,
                    GROUP_CONCAT(r.nom_role) as roles
                FROM utilisateurs u
                LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
                LEFT JOIN roles r ON ru.role_id = r.id
                ${whereClause}
                GROUP BY u.id
                ORDER BY u.date_inscription DESC
                LIMIT ? OFFSET ?
            `;
            
            // Requête pour compter le total
            const countQuery = `
                SELECT COUNT(DISTINCT u.id) as total
                FROM utilisateurs u
                LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
                LEFT JOIN roles r ON ru.role_id = r.id
                ${whereClause}
            `;
            
            // Exécuter les requêtes en ajoutant les paramètres de pagination
            params.push(parseInt(limit), parseInt(offset));
            
            // Utiliser db.query directement pour éviter les problèmes de prepared statements
            const db = require('../config/db');
            const [users] = await db.query(query, params);
            
            // Pour la requête count, on n'a pas besoin de limit/offset
            const countParams = params.slice(0, -2); // Retirer limit et offset
            const [countResult] = await db.query(countQuery, countParams);
            
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);
            
            console.log('Users trouvés:', users.length);
            
            // Mapper les utilisateurs pour ajouter le champ 'status' et le rôle principal
            const mappedUsers = users.map(user => ({
                ...user,
                status: user.compte_actif === 1 ? 'actif' : 'banni',
                role: user.roles ? user.roles.split(',')[0] : null
            }));
            
            res.json({
                success: true,
                data: mappedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    totalPages: totalPages
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des utilisateurs'
            });
        }
    },

    async getUserDetails(req, res) {
        try {
            const { userId } = req.params;
            
            const user = await utilisateurModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            // Récupérer les profils associés selon les rôles
            const roles = await utilisateurModel.getUserRoles(userId);
            const profiles = {};

            for (const role of roles) {
                switch (role.nom) {
                    case 'livreur':
                        profiles.livreur = await livreurModel.findByUserId(userId);
                        break;
                    case 'commercant':
                        profiles.commercant = await commercantModel.findByUserId(userId);
                        break;
                    case 'client':
                        profiles.client = await clientModel.findByUserId(userId);
                        break;
                    case 'prestataire':
                        profiles.prestataire = await prestataireModel.findByUserId(userId);
                        break;
                }
            }

            res.json({
                success: true,
                data: {
                    user,
                    roles,
                    profiles
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des détails utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des détails utilisateur'
            });
        }
    },

    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const { nom, prenom, email, telephone, statut, role } = req.body;
            
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            // Construire les données à mettre à jour
            const updateData = {
                nom,
                prenom,
                email,
                telephone: telephone || null,
                date_modification: new Date()
            };

            // Ajouter le statut si fourni (convertir en compte_actif)
            if (statut) {
                updateData.compte_actif = statut === 'actif' ? 1 : 0;
            }

            // Utiliser la base de données directement
            const db = require('../config/db');
            
            // Démarrer une transaction
            await db.query('START TRANSACTION');

            try {
                // Mettre à jour les informations utilisateur
                const fields = Object.keys(updateData);
                const setClause = fields.map(field => `${field} = ?`).join(', ');
                const values = Object.values(updateData);
                values.push(userId);

                const [result] = await db.query(
                    `UPDATE utilisateurs SET ${setClause} WHERE id = ?`,
                    values
                );

                if (result.affectedRows === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: 'Utilisateur non trouvé'
                    });
                }

                // Gérer le changement de rôle si fourni
                if (role) {
                    console.log('Changement de rôle pour utilisateur', userId, 'vers', role);
                    
                    // Récupérer l'ID du rôle
                    const [roleResult] = await db.query(
                        'SELECT id FROM roles WHERE nom_role = ?',
                        [role]
                    );

                    if (roleResult.length === 0) {
                        await db.query('ROLLBACK');
                        return res.status(400).json({
                            success: false,
                            message: 'Rôle invalide'
                        });
                    }

                    const roleId = roleResult[0].id;

                    // Supprimer tous les rôles actuels de l'utilisateur
                    await db.query(
                        'DELETE FROM role_utilisateur WHERE utilisateur_id = ?',
                        [userId]
                    );

                    // Ajouter le nouveau rôle
                    await db.query(
                        'INSERT INTO role_utilisateur (utilisateur_id, role_id) VALUES (?, ?)',
                        [userId, roleId]
                    );

                    // Si le rôle est admin, ajouter automatiquement le rôle client
                    if (role === 'admin') {
                        const [clientRole] = await db.query(
                            'SELECT id FROM roles WHERE nom_role = "client"'
                        );
                        if (clientRole.length > 0) {
                            await db.query(
                                'INSERT INTO role_utilisateur (utilisateur_id, role_id) VALUES (?, ?)',
                                [userId, clientRole[0].id]
                            );
                        }
                    }
                }

                // Valider la transaction
                await db.query('COMMIT');

                // Récupérer l'utilisateur mis à jour avec ses rôles
                const [updatedUser] = await db.query(`
                    SELECT 
                        u.*,
                        GROUP_CONCAT(r.nom_role) as roles
                    FROM utilisateurs u
                    LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
                    LEFT JOIN roles r ON ru.role_id = r.id
                    WHERE u.id = ?
                    GROUP BY u.id
                `, [userId]);

                // Mapper le statut et les rôles
                const userWithStatus = {
                    ...updatedUser[0],
                    status: updatedUser[0].compte_actif === 1 ? 'actif' : 'banni',
                    role: updatedUser[0].roles ? updatedUser[0].roles.split(',')[0] : null
                };

                res.json({
                    success: true,
                    data: userWithStatus,
                    message: 'Utilisateur mis à jour avec succès'
                });

            } catch (transactionError) {
                await db.query('ROLLBACK');
                throw transactionError;
            }

        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'utilisateur'
            });
        }
    },

    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            
            // Utiliser la base de données directement
            const db = require('../config/db');
            
            // Démarrer une transaction
            await db.query('START TRANSACTION');

            try {
                // Supprimer les rôles de l'utilisateur
                await db.query(
                    'DELETE FROM role_utilisateur WHERE utilisateur_id = ?',
                    [userId]
                );

                // Supprimer l'utilisateur
                const [result] = await db.query(
                    'DELETE FROM utilisateurs WHERE id = ?',
                    [userId]
                );

                if (result.affectedRows === 0) {
                    await db.query('ROLLBACK');
                    return res.status(404).json({
                        success: false,
                        message: 'Utilisateur non trouvé'
                    });
                }

                // Valider la transaction
                await db.query('COMMIT');

                res.json({
                    success: true,
                    message: 'Utilisateur supprimé avec succès'
                });

            } catch (transactionError) {
                await db.query('ROLLBACK');
                throw transactionError;
            }

        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'utilisateur'
            });
        }
    },

    async updateUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { statut } = req.body;

            const updatedUser = await utilisateurModel.update(userId, { 
                statut,
                date_modification: new Date()
            });

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            res.json({
                success: true,
                data: updatedUser,
                message: `Statut utilisateur mis à jour: ${statut}`
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du statut'
            });
        }
    },

    // Validation des documents (livreurs et prestataires)
    async getDocumentsToValidate(req, res) {
        try {
            // Documents des livreurs en attente
            const livreursDocs = await livreurModel.query(`
                SELECT 
                    l.id as livreur_id,
                    l.piece_identite,
                    l.permis_conduire,
                    l.carte_grise,
                    l.assurance,
                    l.statut_livreur,
                    u.nom,
                    u.prenom,
                    u.email,
                    l.date_creation
                FROM livreurs l
                JOIN utilisateurs u ON l.utilisateur_id = u.id
                WHERE l.statut_livreur = 'en_attente_validation'
                ORDER BY l.date_creation ASC
            `);

            // Documents des prestataires en attente
            const prestatairesDoc = await prestataireModel.query(`
                SELECT 
                    p.id as prestataire_id,
                    p.statut_validation,
                    u.nom,
                    u.prenom,
                    u.email,
                    p.date_creation
                FROM prestataires p
                JOIN utilisateurs u ON p.utilisateur_id = u.id
                WHERE p.statut_validation = 'en_attente'
                ORDER BY p.date_creation ASC
            `);

            res.json({
                success: true,
                data: {
                    livreurs: livreursDocs,
                    prestataires: prestatairesDoc
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des documents:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des documents'
            });
        }
    },

    async validateLivreurDocuments(req, res) {
        try {
            const { livreurId } = req.params;
            const { statut, commentaire } = req.body;

            if (!['valide', 'rejete'].includes(statut)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            await livreurModel.update(livreurId, {
                statut_livreur: statut === 'valide' ? 'actif' : 'rejete',
                commentaire_validation: commentaire,
                date_validation: new Date(),
                validateur_id: req.user.id,
                date_modification: new Date()
            });

            res.json({
                success: true,
                message: `Documents du livreur ${statut === 'valide' ? 'validés' : 'rejetés'}`
            });
        } catch (error) {
            console.error('Erreur lors de la validation des documents:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la validation des documents'
            });
        }
    },

    async validatePrestataireProfile(req, res) {
        try {
            const { prestataireId } = req.params;
            const { statut, commentaire } = req.body;

            if (!['valide', 'rejete'].includes(statut)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }

            await prestataireModel.update(prestataireId, {
                statut_validation: statut === 'valide' ? 'valide' : 'rejete',
                commentaire_validation: commentaire,
                date_validation: new Date(),
                validateur_id: req.user.id,
                date_modification: new Date()
            });

            res.json({
                success: true,
                message: `Profil du prestataire ${statut === 'valide' ? 'validé' : 'rejeté'}`
            });
        } catch (error) {
            console.error('Erreur lors de la validation du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la validation du profil'
            });
        }
    },

    // Rapports financiers
    async getFinancialReport(req, res) {
        try {
            const { dateDebut, dateFin, type } = req.query;
            
            if (!dateDebut || !dateFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Dates de début et fin requises'
                });
            }

            let query = '';
            let params = [dateDebut, dateFin];

            switch (type) {
                case 'livraisons':
                    query = `
                        SELECT 
                            DATE(p.date_creation) as date,
                            COUNT(DISTINCT p.id) as nombre_transactions,
                            SUM(p.montant) as montant_total,
                            AVG(p.montant) as montant_moyen
                        FROM paiements p
                        JOIN livraisons l ON p.entite_id = l.id
                        WHERE p.type_entite = 'livraison'
                        AND p.statut = 'reussi'
                        AND DATE(p.date_creation) BETWEEN ? AND ?
                        GROUP BY DATE(p.date_creation)
                        ORDER BY date ASC
                    `;
                    break;
                
                case 'prestations':
                    query = `
                        SELECT 
                            DATE(p.date_creation) as date,
                            COUNT(DISTINCT p.id) as nombre_transactions,
                            SUM(p.montant) as montant_total,
                            AVG(p.montant) as montant_moyen
                        FROM paiements p
                        JOIN prestations_services ps ON p.entite_id = ps.id
                        WHERE p.type_entite = 'prestation'
                        AND p.statut = 'reussi'
                        AND DATE(p.date_creation) BETWEEN ? AND ?
                        GROUP BY DATE(p.date_creation)
                        ORDER BY date ASC
                    `;
                    break;
                
                default:
                    query = `
                        SELECT 
                            DATE(date_creation) as date,
                            type_entite,
                            COUNT(*) as nombre_transactions,
                            SUM(montant) as montant_total
                        FROM paiements
                        WHERE statut = 'reussi'
                        AND DATE(date_creation) BETWEEN ? AND ?
                        GROUP BY DATE(date_creation), type_entite
                        ORDER BY date ASC, type_entite
                    `;
            }

            const rapport = await utilisateurModel.query(query, params);

            // Calculer les totaux
            const [totaux] = await utilisateurModel.query(`
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(montant) as montant_total,
                    AVG(montant) as montant_moyen
                FROM paiements
                WHERE statut = 'reussi'
                AND DATE(date_creation) BETWEEN ? AND ?
                ${type ? `AND type_entite = '${type === 'livraisons' ? 'livraison' : 'prestation'}'` : ''}
            `, params);

            res.json({
                success: true,
                data: {
                    rapport,
                    totaux: totaux[0] || {},
                    periode: { dateDebut, dateFin, type }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la génération du rapport financier:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la génération du rapport financier'
            });
        }
    },

    // Modération des annonces
    async getAnnoncesToModerate(req, res) {
        try {
            const annonces = await utilisateurModel.query(`
                SELECT 
                    a.*,
                    u.nom as auteur_nom,
                    u.prenom as auteur_prenom,
                    u.email as auteur_email
                FROM annonces a
                JOIN utilisateurs u ON a.utilisateur_id = u.id
                WHERE a.statut = 'en_attente_moderation'
                ORDER BY a.date_creation ASC
            `);

            res.json({
                success: true,
                data: annonces
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des annonces à modérer:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des annonces à modérer'
            });
        }
    },

    async moderateAnnonce(req, res) {
        try {
            const { annonceId } = req.params;
            const { action, motif } = req.body;

            if (!['approuver', 'rejeter'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'Action invalide'
                });
            }

            const nouveauStatut = action === 'approuver' ? 'publiee' : 'rejetee';
            
            await utilisateurModel.query(`
                UPDATE annonces 
                SET statut = ?, 
                    motif_rejet = ?,
                    moderateur_id = ?,
                    date_moderation = NOW(),
                    date_modification = NOW()
                WHERE id = ?
            `, [nouveauStatut, motif, req.user.id, annonceId]);

            res.json({
                success: true,
                message: `Annonce ${action === 'approuver' ? 'approuvée' : 'rejetée'}`
            });
        } catch (error) {
            console.error('Erreur lors de la modération:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la modération'
            });
        }
    },

    // Gestion des rôles
    async assignRole(req, res) {
        try {
            const { userId, roleId } = req.body;

            await utilisateurModel.assignRole(userId, roleId);

            res.json({
                success: true,
                message: 'Rôle assigné avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'assignation du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'assignation du rôle'
            });
        }
    },

    async removeRole(req, res) {
        try {
            const { userId, roleId } = req.body;

            await utilisateurModel.removeRole(userId, roleId);

            res.json({
                success: true,
                message: 'Rôle retiré avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du retrait du rôle:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du retrait du rôle'
            });
        }
    }
};

module.exports = adminController;