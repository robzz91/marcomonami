const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const livreurController = require('../controllers/livreurController');
const auth = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Profile et informations générales
router.get('/profile', livreurController.getProfile);
router.put('/profile', [
    body('vehicule_type').optional().isLength({ min: 2, max: 50 }),
    body('zone_operation').optional().isLength({ min: 2, max: 100 }),
    body('est_disponible').optional().isBoolean()
], livreurController.updateProfile);

router.get('/stats', livreurController.getStats);

// Gestion des trajets
router.get('/trajets', livreurController.getTrajets);
router.post('/trajets', [
    body('point_depart').notEmpty().withMessage('Point de départ requis'),
    body('point_arrivee').notEmpty().withMessage('Point d\'arrivée requis'),
    body('ville_depart').notEmpty().withMessage('Ville de départ requise'),
    body('ville_arrivee').notEmpty().withMessage('Ville d\'arrivée requise'),
    body('date_depart').isISO8601().withMessage('Date de départ invalide'),
    body('capacite_disponible').isFloat({ min: 0 }).withMessage('Capacité invalide')
], livreurController.createTrajet);

router.put('/trajets/:trajetId', [
    body('point_depart').optional().notEmpty(),
    body('point_arrivee').optional().notEmpty(),
    body('date_depart').optional().isISO8601(),
    body('capacite_disponible').optional().isFloat({ min: 0 })
], livreurController.updateTrajet);

router.delete('/trajets/:trajetId', livreurController.deleteTrajet);
router.patch('/trajets/:trajetId/status', [
    body('statut').isIn(['actif', 'inactif']).withMessage('Statut invalide')
], livreurController.toggleTrajetStatus);

router.get('/trajets/upcoming', livreurController.getUpcomingTrajets);

// Gestion des livraisons
router.get('/livraisons', livreurController.getLivraisons);
router.patch('/livraisons/:livraisonId/accepter', livreurController.accepterLivraison);
router.patch('/livraisons/:livraisonId/demarrer', livreurController.demarrerLivraison);
router.patch('/livraisons/:livraisonId/confirmer', [
    body('code_confirmation').notEmpty().withMessage('Code de confirmation requis'),
    body('signature').optional()
], livreurController.confirmerLivraison);

router.patch('/livraisons/:livraisonId/annuler', [
    body('motif').notEmpty().withMessage('Motif d\'annulation requis')
], livreurController.annulerLivraison);

// Gestion des documents
router.put('/documents', [
    body('pieceIdentite').optional().isURL(),
    body('permisConduire').optional().isURL(),
    body('carteGrise').optional().isURL(),
    body('assurance').optional().isURL()
], livreurController.updateDocuments);

// Gestion du portefeuille
router.get('/wallet', livreurController.getWallet);

// Disponibilité
router.patch('/availability', [
    body('est_disponible').isBoolean().withMessage('Disponibilité requise')
], livreurController.updateAvailability);

module.exports = router;