const commercantModel = require('../models/Commercant');
const { validationResult } = require('express-validator');

const commercantController = {
    // Profile
    async getProfile(req, res) {
        try {
            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }
            
            res.json({
                success: true,
                data: commercant
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

            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const updatedCommercant = await commercantModel.update(commercant.id, req.body);
            
            res.json({
                success: true,
                data: updatedCommercant,
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
            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const periode = parseInt(req.query.periode) || 30;
            const stats = await commercantModel.getStats(commercant.id, periode);
            
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

    // Contrats
    async getContrats(req, res) {
        try {
            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut
            };

            const contrats = await commercantModel.getContrats(commercant.id, options);
            
            res.json({
                success: true,
                data: contrats.data,
                pagination: contrats.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des contrats:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des contrats'
            });
        }
    },

    async getContratActif(req, res) {
        try {
            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const contrat = await commercantModel.getContratActif(commercant.id);
            
            res.json({
                success: true,
                data: contrat
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du contrat actif:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du contrat actif'
            });
        }
    },

    // Facturation
    async getFactures(req, res) {
        try {
            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut,
                dateDebut: req.query.dateDebut,
                dateFin: req.query.dateFin
            };

            const factures = await commercantModel.getFactures(commercant.id, options);
            
            res.json({
                success: true,
                data: factures.data,
                pagination: factures.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des factures:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des factures'
            });
        }
    },

    async createFacture(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const facture = await commercantModel.createFacture(commercant.id, req.body);
            
            res.status(201).json({
                success: true,
                data: facture,
                message: 'Facture créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de la facture:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de la facture'
            });
        }
    },

    // Vérifications
    async checkCanCreateAnnonce(req, res) {
        try {
            const commercant = await commercantModel.findByUserId(req.user.id);
            
            if (!commercant) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil commerçant non trouvé'
                });
            }

            const canCreate = await commercantModel.canCreateAnnonce(commercant.id);
            
            res.json({
                success: true,
                data: canCreate
            });
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification'
            });
        }
    }
};

module.exports = commercantController;