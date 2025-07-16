const prestataireModel = require('../models/Prestataire');
const { validationResult } = require('express-validator');

const prestataireController = {
    // Profile
    async getProfile(req, res) {
        try {
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }
            
            res.json({
                success: true,
                data: prestataire
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

            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const updatedPrestataire = await prestataireModel.update(prestataire.id, req.body);
            
            res.json({
                success: true,
                data: updatedPrestataire,
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
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const periode = parseInt(req.query.periode) || 30;
            const stats = await prestataireModel.getStats(prestataire.id, periode);
            
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

    // Prestations
    async getPrestations(req, res) {
        try {
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut,
                dateDebut: req.query.dateDebut,
                dateFin: req.query.dateFin
            };

            const prestations = await prestataireModel.getPrestations(prestataire.id, options);
            
            res.json({
                success: true,
                data: prestations.data,
                pagination: prestations.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des prestations:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des prestations'
            });
        }
    },

    async accepterPrestation(req, res) {
        try {
            const { prestationId } = req.params;
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const prestation = await prestataireModel.accepterPrestation(prestationId, prestataire.id);
            
            res.json({
                success: true,
                data: prestation,
                message: 'Prestation acceptée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'acceptation de la prestation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de l\'acceptation de la prestation'
            });
        }
    },

    async demarrerPrestation(req, res) {
        try {
            const { prestationId } = req.params;
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const prestation = await prestataireModel.demarrerPrestation(prestationId, prestataire.id);
            
            res.json({
                success: true,
                data: prestation,
                message: 'Prestation démarrée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du démarrage de la prestation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors du démarrage de la prestation'
            });
        }
    },

    async terminerPrestation(req, res) {
        try {
            const { prestationId } = req.params;
            const { compte_rendu } = req.body;
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const prestation = await prestataireModel.terminerPrestation(
                prestationId, 
                prestataire.id, 
                compte_rendu
            );
            
            res.json({
                success: true,
                data: prestation,
                message: 'Prestation terminée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la finalisation de la prestation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la finalisation de la prestation'
            });
        }
    },

    // Disponibilités
    async getDisponibilites(req, res) {
        try {
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const disponibilites = await prestataireModel.getDisponibilites(prestataire.id);
            
            res.json({
                success: true,
                data: disponibilites
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des disponibilités:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des disponibilités'
            });
        }
    },

    async updateDisponibilites(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const { disponibilites } = req.body;
            const updatedDisponibilites = await prestataireModel.updateDisponibilites(
                prestataire.id, 
                disponibilites
            );
            
            res.json({
                success: true,
                data: updatedDisponibilites,
                message: 'Disponibilités mises à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des disponibilités:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour des disponibilités'
            });
        }
    },

    async getIndisponibilites(req, res) {
        try {
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const { dateDebut, dateFin } = req.query;
            const indisponibilites = await prestataireModel.getIndisponibilites(
                prestataire.id,
                dateDebut,
                dateFin
            );
            
            res.json({
                success: true,
                data: indisponibilites
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des indisponibilités:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des indisponibilités'
            });
        }
    },

    async addIndisponibilite(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const indisponibilite = await prestataireModel.addIndisponibilite(
                prestataire.id, 
                req.body
            );
            
            res.status(201).json({
                success: true,
                data: indisponibilite,
                message: 'Indisponibilité ajoutée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'indisponibilité:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout d\'indisponibilité'
            });
        }
    },

    // Compétences
    async getCompetences(req, res) {
        try {
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const competences = await prestataireModel.getCompetences(prestataire.id);
            
            res.json({
                success: true,
                data: competences
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des compétences:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des compétences'
            });
        }
    },

    async updateCompetence(req, res) {
        try {
            const { competenceId } = req.params;
            const { niveau, certifiee } = req.body;
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const competences = await prestataireModel.updateCompetence(
                prestataire.id,
                competenceId,
                niveau,
                certifiee
            );
            
            res.json({
                success: true,
                data: competences,
                message: 'Compétence mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la compétence:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la compétence'
            });
        }
    },

    // Évaluations
    async getEvaluations(req, res) {
        try {
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                noteMin: req.query.noteMin
            };

            const evaluations = await prestataireModel.getEvaluations(prestataire.id, options);
            
            res.json({
                success: true,
                data: evaluations.data,
                pagination: evaluations.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des évaluations:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des évaluations'
            });
        }
    },

    // Facturation
    async genererFactureMensuelle(req, res) {
        try {
            const { mois, annee } = req.body;
            const prestataire = await prestataireModel.findByUserId(req.user.id);
            
            if (!prestataire) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil prestataire non trouvé'
                });
            }

            if (!mois || !annee) {
                return res.status(400).json({
                    success: false,
                    message: 'Mois et année requis'
                });
            }

            const facture = await prestataireModel.genererFactureMensuelle(
                prestataire.id,
                mois,
                annee
            );
            
            if (!facture) {
                return res.json({
                    success: true,
                    data: null,
                    message: 'Aucune prestation trouvée pour cette période'
                });
            }
            
            res.json({
                success: true,
                data: facture,
                message: 'Facture générée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la génération de facture:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la génération de facture'
            });
        }
    }
};

module.exports = prestataireController;