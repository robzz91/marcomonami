const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const prestataireController = require('../controllers/prestataireController');
const auth = require('../middleware/auth');

// Middleware d'authentification pour toutes les routes
router.use(auth);

// Profile et informations générales
router.get('/profile', prestataireController.getProfile);
router.put('/profile', [
    body('specialite').optional().isLength({ min: 2, max: 100 }),
    body('description').optional().isLength({ min: 10, max: 1000 }),
    body('zone_intervention').optional().isLength({ min: 2, max: 100 }),
    body('taux_commission').optional().isFloat({ min: 0, max: 1 })
], prestataireController.updateProfile);

router.get('/stats', prestataireController.getStats);

// Prestations
router.get('/prestations', prestataireController.getPrestations);
router.patch('/prestations/:prestationId/accepter', prestataireController.accepterPrestation);
router.patch('/prestations/:prestationId/demarrer', prestataireController.demarrerPrestation);
router.patch('/prestations/:prestationId/terminer', [
    body('compte_rendu').optional().isLength({ max: 1000 })
], prestataireController.terminerPrestation);

// Disponibilités
router.get('/disponibilites', prestataireController.getDisponibilites);
router.put('/disponibilites', [
    body('disponibilites').isArray().withMessage('Tableau de disponibilités requis'),
    body('disponibilites.*.jour_semaine').isInt({ min: 0, max: 6 }).withMessage('Jour de semaine invalide'),
    body('disponibilites.*.heure_debut').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide'),
    body('disponibilites.*.heure_fin').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide')
], prestataireController.updateDisponibilites);

router.get('/indisponibilites', prestataireController.getIndisponibilites);
router.post('/indisponibilites', [
    body('date_debut').isISO8601().withMessage('Date de début invalide'),
    body('date_fin').isISO8601().withMessage('Date de fin invalide'),
    body('motif').notEmpty().withMessage('Motif requis'),
    body('type_indisponibilite').isIn(['conges', 'maladie', 'personnelle', 'formation']).withMessage('Type invalide')
], prestataireController.addIndisponibilite);

// Compétences
router.get('/competences', prestataireController.getCompetences);
router.put('/competences/:competenceId', [
    body('niveau').isIn(['debutant', 'intermediaire', 'avance', 'expert']).withMessage('Niveau invalide'),
    body('certifiee').optional().isBoolean()
], prestataireController.updateCompetence);

// Évaluations
router.get('/evaluations', prestataireController.getEvaluations);

// Facturation
router.post('/factures/generer-mensuelle', [
    body('mois').isInt({ min: 1, max: 12 }).withMessage('Mois invalide'),
    body('annee').isInt({ min: 2020, max: 2030 }).withMessage('Année invalide')
], prestataireController.genererFactureMensuelle);

module.exports = router;