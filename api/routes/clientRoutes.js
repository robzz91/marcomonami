const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const clientController = require('../controllers/clientController');
const clientLivraisonController = require('../controllers/clientLivraisonController');
const auth = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Profile et informations générales
router.get('/profile', clientController.getProfile);
router.put('/profile', [
    body('preferences_livraison').optional().isJSON(),
    body('adresse_principale').optional().isLength({ min: 5, max: 200 })
], clientController.updateProfile);

router.get('/stats', clientController.getStats);

// Services et prestations
router.get('/services/search', clientController.searchServices);
router.post('/services/:serviceId/prestataires/:prestataireId/reserver', [
    body('date_prestation').isISO8601().withMessage('Date de prestation invalide'),
    body('heure_debut').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide'),
    body('heure_fin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide'),
    body('adresse_prestation').notEmpty().withMessage('Adresse de prestation requise'),
    body('instructions_specifiques').optional()
], clientController.reserverService);

router.get('/prestations', clientController.getPrestations);
router.get('/prestataires/:prestataireId/disponibilite', clientController.checkPrestataireDisponibilite);

// Routes pour les livraisons
router.get('/livraisons', clientLivraisonController.getMyLivraisons);
router.put('/livraisons/:livraisonId/accept', clientLivraisonController.acceptProposition);
router.put('/livraisons/:livraisonId/refuse', clientLivraisonController.refuseProposition);

// Paiements
router.get('/paiements', clientController.getPaiements);

// Tutoriel
router.patch('/tutorial-status', [
    body('completed').isBoolean().withMessage('Statut de completion requis')
], clientController.updateTutorialStatus);

// Annonces client
router.get('/annonces', clientController.getMyAnnonces);
router.post('/annonces', [
    body('titre').notEmpty().withMessage('Le titre est requis'),
    body('description').notEmpty().withMessage('La description est requise'),
    body('categorie').notEmpty().withMessage('La catégorie est requise'),
    body('localisation').notEmpty().withMessage('La localisation est requise')
], clientController.createAnnonce);
router.put('/annonces/:id', clientController.updateAnnonce);
router.delete('/annonces/:id', clientController.deleteAnnonce);
router.patch('/annonces/:id/publish', clientController.publishAnnonce);
router.patch('/annonces/:id/archive', clientController.archiveAnnonce);

// Box de stockage (placeholders)
router.get('/boxes/disponibles', clientController.getBoxesDisponibles);
router.post('/boxes/:boxId/reserver', clientController.reserverBox);

module.exports = router;