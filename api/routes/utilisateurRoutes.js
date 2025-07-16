const router = require('express').Router();
const utilisateurController = require('../controllers/utilisateurController');
const { authenticateToken, requireRole } = require('../middleware/authJWT');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes accessibles à tous les utilisateurs connectés
router.get('/profile', utilisateurController.getUserById);

// Routes admin uniquement
router.get('/', requireRole('admin'), utilisateurController.getAllUsers);
router.get('/:id', requireRole('admin'), utilisateurController.getUserById);
router.put('/:id', requireRole('admin'), utilisateurController.updateUser);
router.delete('/:id', requireRole('admin'), utilisateurController.deleteUser);
router.patch('/:id/status', requireRole('admin'), utilisateurController.toggleUserStatus);
router.post('/:id/roles', requireRole('admin'), utilisateurController.addUserRole);
router.delete('/:id/roles', requireRole('admin'), utilisateurController.removeUserRole);

module.exports = router;