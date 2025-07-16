const clientModel = require('../models/Client');
const { validationResult } = require('express-validator');

const clientController = {
    // Profile
    async getProfile(req, res) {
        try {
            const client = await clientModel.findByUserId(req.user.id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil client non trouvé'
                });
            }
            
            res.json({
                success: true,
                data: client
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

            const client = await clientModel.findByUserId(req.user.id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil client non trouvé'
                });
            }

            const updatedClient = await clientModel.update(client.id, req.body);
            
            res.json({
                success: true,
                data: updatedClient,
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
            const client = await clientModel.findByUserId(req.user.id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil client non trouvé'
                });
            }

            const periode = parseInt(req.query.periode) || 30;
            const stats = await clientModel.getStats(client.id, periode);
            
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

    // Services et prestations
    async searchServices(req, res) {
        try {
            const options = {
                categorieId: req.query.categorieId,
                prixMin: req.query.prixMin,
                prixMax: req.query.prixMax,
                motCle: req.query.motCle
            };

            const services = await clientModel.searchServices(options);
            
            res.json({
                success: true,
                data: services
            });
        } catch (error) {
            console.error('Erreur lors de la recherche de services:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche de services'
            });
        }
    },

    async reserverService(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const client = await clientModel.findByUserId(req.user.id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil client non trouvé'
                });
            }

            const { serviceId, prestataireId } = req.params;
            const prestation = await clientModel.reserverService(
                client.id, 
                serviceId, 
                prestataireId, 
                req.body
            );
            
            res.status(201).json({
                success: true,
                data: prestation,
                message: 'Service réservé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la réservation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erreur lors de la réservation'
            });
        }
    },

    async getPrestations(req, res) {
        try {
            const client = await clientModel.findByUserId(req.user.id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil client non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut,
                dateDebut: req.query.dateDebut,
                dateFin: req.query.dateFin
            };

            const prestations = await clientModel.getPrestations(client.id, options);
            
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

    async checkPrestataireDisponibilite(req, res) {
        try {
            const { prestataireId } = req.params;
            const { date, heureDebut, heureFin } = req.query;

            if (!date || !heureDebut || !heureFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Date, heure de début et heure de fin requises'
                });
            }

            const disponibilite = await clientModel.checkPrestataireDisponibilite(
                prestataireId, 
                date, 
                heureDebut, 
                heureFin
            );
            
            res.json({
                success: true,
                data: disponibilite
            });
        } catch (error) {
            console.error('Erreur lors de la vérification de disponibilité:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification de disponibilité'
            });
        }
    },

    // Paiements
    async getPaiements(req, res) {
        try {
            const client = await clientModel.findByUserId(req.user.id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Profil client non trouvé'
                });
            }

            const options = {
                page: req.query.page,
                limit: req.query.limit,
                statut: req.query.statut
            };

            const paiements = await clientModel.getPaiements(client.id, options);
            
            res.json({
                success: true,
                data: paiements.data,
                pagination: paiements.pagination
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des paiements'
            });
        }
    },

    // Tutoriel
    async updateTutorialStatus(req, res) {
        try {
            const { completed } = req.body;
            
            await clientModel.updateTutorialStatus(req.user.id, completed);
            
            res.json({
                success: true,
                message: 'Statut du tutoriel mis à jour'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du tutoriel:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du tutoriel'
            });
        }
    },

    // Box de stockage (placeholder - à implémenter selon le schéma BDD complet)
    async getBoxesDisponibles(req, res) {
        try {
            // TODO: Implémenter quand la table box_stockage sera créée
            res.json({
                success: true,
                data: [],
                message: 'Fonctionnalité à implémenter'
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des boxes:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des boxes'
            });
        }
    },

    async reserverBox(req, res) {
        try {
            // TODO: Implémenter quand la table box_stockage sera créée
            res.json({
                success: true,
                message: 'Fonctionnalité à implémenter'
            });
        } catch (error) {
            console.error('Erreur lors de la réservation de box:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la réservation de box'
            });
        }
    },

    // Gestion des annonces
    async getMyAnnonces(req, res) {
        try {
            const db = require('../config/db');
            
            const [annonces] = await db.execute(`
                SELECT 
                    a.*,
                    ca.nom as categorie_nom
                FROM annonces a
                LEFT JOIN categories_annonces ca ON a.categorie_id = ca.id
                WHERE a.createur_id = ?
                ORDER BY a.date_creation DESC
            `, [req.user.id]);
            
            // Calculer les stats
            const total = annonces.length;
            const publiees = annonces.filter(a => a.statut === 'ouverte').length;
            const terminees = annonces.filter(a => a.statut === 'terminee').length;
            
            res.json({
                success: true,
                data: annonces,
                stats: {
                    total,
                    publiees,
                    reponses: 0, // TODO: compter les vraies réponses
                    terminees
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des annonces:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des annonces'
            });
        }
    },

    async createAnnonce(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Données invalides',
                    errors: errors.array()
                });
            }

            const db = require('../config/db');
            const { titre, description, categorie, budget, localisation, date_souhaitee, urgence, accepte_devis } = req.body;
            
            // Vérifier/créer la catégorie
            let [categories] = await db.execute('SELECT id FROM categories_annonces WHERE nom = ?', [categorie]);
            let categorieId;
            
            if (categories.length === 0) {
                // Créer la catégorie si elle n'existe pas
                const [result] = await db.execute(
                    'INSERT INTO categories_annonces (nom, description, type) VALUES (?, ?, ?)',
                    [categorie, `Catégorie ${categorie}`, 'service']
                );
                categorieId = result.insertId;
            } else {
                categorieId = categories[0].id;
            }

            // Créer l'annonce
            const [result] = await db.execute(`
                INSERT INTO annonces (
                    createur_id, 
                    type_createur, 
                    categorie_id, 
                    titre, 
                    description, 
                    adresse_depart, 
                    cp_depart, 
                    ville_depart, 
                    pays_depart, 
                    adresse_arrivee, 
                    cp_arrivee, 
                    ville_arrivee, 
                    pays_arrivee, 
                    date_livraison_souhaitee, 
                    prix_propose, 
                    urgence, 
                    statut, 
                    publique
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                req.user.id,
                'client',
                categorieId,
                titre,
                description,
                localisation,
                '00000',
                localisation,
                'France',
                localisation,
                '00000', 
                localisation,
                'France',
                date_souhaitee || null,
                budget || 0,
                urgence || 'normale',
                'brouillon',
                false
            ]);

            res.json({
                success: true,
                data: {
                    id: result.insertId,
                    titre,
                    description,
                    categorie,
                    budget,
                    localisation,
                    date_souhaitee,
                    urgence,
                    statut: 'brouillon'
                },
                message: 'Annonce créée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'annonce:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'annonce'
            });
        }
    },

    async updateAnnonce(req, res) {
        try {
            const { id } = req.params;
            const db = require('../config/db');
            
            // Vérifier que l'annonce appartient à l'utilisateur
            const [annonces] = await db.execute('SELECT * FROM annonces WHERE id = ? AND createur_id = ?', [id, req.user.id]);
            
            if (annonces.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Annonce non trouvée'
                });
            }

            const { titre, description, categorie, budget, localisation, date_souhaitee, urgence } = req.body;
            
            await db.execute(`
                UPDATE annonces SET 
                    titre = ?, 
                    description = ?, 
                    prix_propose = ?, 
                    ville_depart = ?, 
                    ville_arrivee = ?, 
                    date_livraison_souhaitee = ?, 
                    urgence = ?,
                    date_modification = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [titre, description, budget || 0, localisation, localisation, date_souhaitee || null, urgence || 'normale', id]);

            res.json({
                success: true,
                message: 'Annonce mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'annonce:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'annonce'
            });
        }
    },

    async deleteAnnonce(req, res) {
        try {
            const { id } = req.params;
            const db = require('../config/db');
            
            // Vérifier que l'annonce appartient à l'utilisateur
            const [annonces] = await db.execute('SELECT * FROM annonces WHERE id = ? AND createur_id = ?', [id, req.user.id]);
            
            if (annonces.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Annonce non trouvée'
                });
            }

            await db.execute('DELETE FROM annonces WHERE id = ?', [id]);

            res.json({
                success: true,
                message: 'Annonce supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'annonce:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'annonce'
            });
        }
    },

    async publishAnnonce(req, res) {
        try {
            const { id } = req.params;
            const db = require('../config/db');
            
            // Vérifier que l'annonce appartient à l'utilisateur
            const [annonces] = await db.execute('SELECT * FROM annonces WHERE id = ? AND createur_id = ?', [id, req.user.id]);
            
            if (annonces.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Annonce non trouvée'
                });
            }

            await db.execute('UPDATE annonces SET statut = ?, publique = ? WHERE id = ?', ['ouverte', true, id]);

            res.json({
                success: true,
                message: 'Annonce publiée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la publication de l\'annonce:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la publication de l\'annonce'
            });
        }
    },

    async archiveAnnonce(req, res) {
        try {
            const { id } = req.params;
            const db = require('../config/db');
            
            // Vérifier que l'annonce appartient à l'utilisateur
            const [annonces] = await db.execute('SELECT * FROM annonces WHERE id = ? AND createur_id = ?', [id, req.user.id]);
            
            if (annonces.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Annonce non trouvée'
                });
            }

            await db.execute('UPDATE annonces SET statut = ?, publique = ? WHERE id = ?', ['archivee', false, id]);

            res.json({
                success: true,
                message: 'Annonce archivée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de l\'archivage de l\'annonce:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'archivage de l\'annonce'
            });
        }
    }
};

module.exports = clientController;