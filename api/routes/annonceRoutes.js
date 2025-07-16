const router = require('express').Router();
const annonceController = require('../controllers/annonceController');
const testController = require('../controllers/testContactController');
const { authenticateToken, optionalAuth } = require('../middleware/authJWT');

// Routes publiques (avec auth optionnelle pour les stats)
router.get('/categories', annonceController.getCategories);
router.get('/stats', annonceController.getPublicStats);
router.get('/', optionalAuth, annonceController.getAllAnnonces);

// Routes protégées
router.get('/for-role', authenticateToken, annonceController.getAnnoncesForRole);
router.get('/:id', optionalAuth, annonceController.getAnnonceById);
router.post('/', authenticateToken, annonceController.createAnnonce);
router.put('/:id', authenticateToken, annonceController.updateAnnonce);
router.delete('/:id', authenticateToken, annonceController.deleteAnnonce);
router.patch('/:id/status', authenticateToken, annonceController.updateAnnonceStatus);
router.get('/user/me', authenticateToken, annonceController.getMyAnnonces);
router.get('/stats/me', authenticateToken, annonceController.getAnnonceStats);
// TEST - Route ultra simple
router.post('/:id/contact', authenticateToken, testController.testContactAuthor);

module.exports = router;