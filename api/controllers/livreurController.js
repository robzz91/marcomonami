const livreurModel = require('../models/Livreur');
const trajetModel = require('../models/Trajet');
const livraisonModel = require('../models/Livraison');
const { validationResult } = require('express-validator');

const livreurController = {
    // Profile et informations générales
    async getProfile(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }
            
            res.json({
                success: true,
                data: livreur
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du profil'
            });
        }
    },

    async updateProfile(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const updatedLivreur = await livreurModel.update(livreur.id, req.body);
            
            res.json({
                success: true,
                data: updatedLivreur,
                message: 'Profil mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du profil'
            });
        }
    },

    async getStats(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const periode = parseInt(req.query.periode) || 30;
            const stats = await livreurModel.getStats(livreur.id, periode);
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    },

    // Gestion des trajets
    async getTrajets(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut,
                dateDebut: req.query.dateDebut,
                dateFin: req.query.dateFin
            };

            const trajets = await trajetModel.findByLivreurId(livreur.id, options);
            
            res.json({
                success: true,
                data: trajets.data,
                pagination: trajets.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des trajets:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des trajets'
            });
        }
    },

    async createTrajet(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const trajetData = {
                ...req.body,
                livreur_id: livreur.id,
                statut: 'actif',
                date_creation: new Date()
            };

            const trajet = await trajetModel.create(trajetData);
            
            res.status(201).json({
                success: true,
                data: trajet,
                message: 'Trajet créé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création du trajet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du trajet'
            });
        }
    },

    async updateTrajet(req, res) {
        try {
            const { trajetId } = req.params;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            // Vérifier que le trajet appartient au livreur
            const belongsToLivreur = await trajetModel.belongsToLivreur(trajetId, livreur.id);
            
            if (!belongsToLivreur) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé à modifier ce trajet'
                });
            }

            const updatedTrajet = await trajetModel.update(trajetId, {
                ...req.body,
                date_modification: new Date()
            });
            
            res.json({
                success: true,
                data: updatedTrajet,
                message: 'Trajet mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du trajet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du trajet'
            });
        }
    },

    async deleteTrajet(req, res) {
        try {
            const { trajetId } = req.params;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            // Vérifier que le trajet appartient au livreur
            const belongsToLivreur = await trajetModel.belongsToLivreur(trajetId, livreur.id);
            
            if (!belongsToLivreur) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé à supprimer ce trajet'
                });
            }

            await trajetModel.delete(trajetId);
            
            res.json({
                success: true,
                message: 'Trajet supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du trajet:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du trajet'
            });
        }
    },

    async toggleTrajetStatus(req, res) {
        try {
            const { trajetId } = req.params;
            const { statut } = req.body;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const belongsToLivreur = await trajetModel.belongsToLivreur(trajetId, livreur.id);
            
            if (!belongsToLivreur) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé à modifier ce trajet'
                });
            }

            await trajetModel.toggleStatus(trajetId, statut);
            
            res.json({
                success: true,
                message: `Trajet ${statut === 'actif' ? 'activé' : 'désactivé'} avec succès`
            });
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du changement de statut'
            });
        }
    },

    // Gestion des livraisons
    async getLivraisons(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut,
                dateDebut: req.query.dateDebut,
                dateFin: req.query.dateFin
            };

            const livraisons = await livraisonModel.findByLivreurId(livreur.id, options);
            
            res.json({
                success: true,
                data: livraisons.data,
                pagination: livraisons.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des livraisons:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des livraisons'
            });
        }
    },

    async accepterLivraison(req, res) {
        try {
            const { livraisonId } = req.params;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const livraison = await livraisonModel.accepterLivraison(livraisonId, livreur.id);
            
            res.json({
                success: true,
                data: livraison,
                message: 'Livraison acceptée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'acceptation de la livraison:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de l\'acceptation de la livraison'
            });
        }
    },

    async demarrerLivraison(req, res) {
        try {
            const { livraisonId } = req.params;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const livraison = await livraisonModel.demarrerLivraison(livraisonId, livreur.id);
            
            // Ajouter un événement de suivi
            await livraisonModel.addTrackingEvent(
                livraisonId, 
                'en_cours', 
                'Livraison démarrée par le livreur'
            );
            
            res.json({
                success: true,
                data: livraison,
                message: 'Livraison démarrée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du démarrage de la livraison:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors du démarrage de la livraison'
            });
        }
    },

    async confirmerLivraison(req, res) {
        try {
            const { livraisonId } = req.params;
            const { code_confirmation, signature } = req.body;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const livraison = await livraisonModel.confirmerLivraison(
                livraisonId, 
                livreur.id, 
                code_confirmation, 
                signature
            );
            
            // Ajouter un événement de suivi
            await livraisonModel.addTrackingEvent(
                livraisonId, 
                'livree', 
                'Livraison confirmée et terminée'
            );
            
            res.json({
                success: true,
                data: livraison,
                message: 'Livraison confirmée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la confirmation de la livraison:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la confirmation de la livraison'
            });
        }
    },

    async annulerLivraison(req, res) {
        try {
            const { livraisonId } = req.params;
            const { motif } = req.body;
            
            const livraison = await livraisonModel.annulerLivraison(
                livraisonId, 
                req.user.id, 
                motif, 
                'livreur'
            );
            
            res.json({
                success: true,
                data: livraison,
                message: 'Livraison annulée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'annulation de la livraison:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de l\'annulation de la livraison'
            });
        }
    },

    // Gestion des documents
    async updateDocuments(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const updatedLivreur = await livreurModel.updateDocuments(livreur.id, req.body);
            
            res.json({
                success: true,
                data: updatedLivreur,
                message: 'Documents mis à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des documents:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour des documents'
            });
        }
    },

    // Gestion du portefeuille
    async getWallet(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const solde = await livreurModel.getWalletBalance(livreur.id);
            
            res.json({
                success: true,
                data: {
                    solde: solde,
                    livreur_id: livreur.id
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du portefeuille:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du portefeuille'
            });
        }
    },

    // Disponibilité
    async updateAvailability(req, res) {
        try {
            const { est_disponible } = req.body;
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            await livreurModel.updateAvailability(livreur.id, est_disponible);
            
            res.json({
                success: true,
                message: `Disponibilité ${est_disponible ? 'activée' : 'désactivée'} avec succès`
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la disponibilité:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la disponibilité'
            });
        }
    },

    // Planning
    async getUpcomingTrajets(req, res) {
        try {
            const livreur = await livreurModel.findByUserId(req.user.id);
            
            if (!livreur) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil livreur non trouvé'
                });
            }

            const limit = parseInt(req.query.limit) || 5;
            const trajets = await trajetModel.getUpcomingTrajets(livreur.id, limit);
            
            res.json({
                success: true,
                data: trajets
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des trajets à venir:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des trajets à venir'
            });
        }
    }
};

module.exports = livreurController;