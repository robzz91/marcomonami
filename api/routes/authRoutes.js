const router = require('express').Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authJWT');
const validation = require('../middleware/validation');
const { body } = require('express-validator');

// Routes publiques
router.post('/login', (req, res, next) => {
    console.log('Route /login appelée');
    next();
}, validation.validateLogin, authController.login);

router.post('/register', (req, res, next) => {
    console.log('Route /register appelée avec:', req.body);
    next();
}, validation.validateRegister, authController.register);

const validateAdminLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
    (req, res, next) => {
        const errors = require('express-validator').validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }
        next();
    }
];

router.post('/admin-login', validateAdminLogin, authController.adminLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Routes protégées
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/verify-email', authenticateToken, authController.verifyEmail);

module.exports = router;