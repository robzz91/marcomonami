const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const commercantController = require('../controllers/commercantController');
const auth = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Profile et informations générales
router.get('/profile', commercantController.getProfile);
router.put('/profile', [
    body('nom_entreprise').optional().isLength({ min: 2, max: 100 }),
    body('secteur_activite').optional().isLength({ min: 2, max: 50 }),
    body('adresse_entreprise').optional().isLength({ min: 5, max: 200 }),
    body('siret').optional().isLength({ min: 14, max: 14 })
], commercantController.updateProfile);

router.get('/stats', commercantController.getStats);

// Contrats
router.get('/contrats', commercantController.getContrats);
router.get('/contrats/actif', commercantController.getContratActif);

// Facturation
router.get('/factures', commercantController.getFactures);
router.post('/factures', [
    body('montant_total').isFloat({ min: 0 }).withMessage('Montant total requis'),
    body('date_echeance').optional().isISO8601(),
    body('lignes').isArray({ min: 1 }).withMessage('Au moins une ligne de facture requise'),
    body('lignes.*.description').notEmpty().withMessage('Description requise'),
    body('lignes.*.quantite').isFloat({ min: 0 }).withMessage('Quantité invalide'),
    body('lignes.*.prix_unitaire').isFloat({ min: 0 }).withMessage('Prix unitaire invalide')
], commercantController.createFacture);

// Vérifications
router.get('/can-create-annonce', commercantController.checkCanCreateAnnonce);

module.exports = router;