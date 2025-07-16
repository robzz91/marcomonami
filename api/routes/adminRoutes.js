const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware d'authentification et vérification du rôle admin
router.use(auth);
router.use((req, res, next) => {
    if (!req.user.roles.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé - Droits administrateur requis'
        });
    }
    next();
});

// Dashboard et statistiques globales
router.get('/dashboard', adminController.getDashboard);
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalUsers: 0,
            totalDeliveries: 0,
            totalRevenue: 0
        }
    });
});

// Gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId/status', [
    body('statut').isIn(['actif', 'inactif', 'suspendu', 'banni']).withMessage('Statut invalide')
], adminController.updateUserStatus);

// Alias français pour les utilisateurs
router.get('/utilisateurs', adminController.getAllUsers);
router.get('/utilisateurs/:userId', adminController.getUserDetails);
router.put('/utilisateurs/:userId', [
    body('nom').isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('prenom').isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
    body('email').isEmail().withMessage('Email invalide'),
    body('statut').optional().isIn(['actif', 'banni']).withMessage('Statut invalide')
], adminController.updateUser);
router.delete('/utilisateurs/:userId', adminController.deleteUser);
router.patch('/utilisateurs/:userId/status', [
    body('statut').isIn(['actif', 'inactif', 'suspendu', 'banni']).withMessage('Statut invalide')
], adminController.updateUserStatus);

// Validation des documents et profils
router.get('/validation/documents', adminController.getDocumentsToValidate);
router.patch('/validation/livreurs/:livreurId', [
    body('statut').isIn(['valide', 'rejete']).withMessage('Statut invalide'),
    body('commentaire').optional().isLength({ max: 500 })
], adminController.validateLivreurDocuments);

router.patch('/validation/prestataires/:prestataireId', [
    body('statut').isIn(['valide', 'rejete']).withMessage('Statut invalide'),
    body('commentaire').optional().isLength({ max: 500 })
], adminController.validatePrestataireProfile);

// Rapports financiers
router.get('/reports/financial', adminController.getFinancialReport);

// Modération des annonces
router.get('/moderation/annonces', adminController.getAnnoncesToModerate);
router.patch('/moderation/annonces/:annonceId', [
    body('action').isIn(['approuver', 'rejeter']).withMessage('Action invalide'),
    body('motif').optional().isLength({ max: 500 })
], adminController.moderateAnnonce);

// Gestion des rôles
router.post('/users/assign-role', [
    body('userId').isInt().withMessage('ID utilisateur invalide'),
    body('roleId').isInt().withMessage('ID rôle invalide')
], adminController.assignRole);

router.post('/users/remove-role', [
    body('userId').isInt().withMessage('ID utilisateur invalide'),
    body('roleId').isInt().withMessage('ID rôle invalide')
], adminController.removeRole);

module.exports = router;