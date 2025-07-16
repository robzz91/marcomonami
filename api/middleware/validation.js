const { body, validationResult } = require('express-validator');

/**
 * Middleware pour vérifier les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Erreurs de validation:', errors.array());
        return res.status(400).json({ 
            success: false,
            message: errors.array()[0].msg, // Premier message d'erreur
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Validation pour login
 */
exports.validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('mot_de_passe')
        .notEmpty()
        .withMessage('Mot de passe requis'),
    handleValidationErrors
];

/**
 * Validation pour register
 */
exports.validateRegister = [
    body('nom')
        .trim()
        .notEmpty()
        .withMessage('Nom requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    body('prenom')
        .trim()
        .notEmpty()
        .withMessage('Prénom requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('mot_de_passe')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    body('telephone')
        .optional()
        .matches(/^[0-9\+\-\s\(\)]+$/)
        .withMessage('Numéro de téléphone invalide'),
    body('adresse')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Adresse trop longue'),
    body('role')
        .notEmpty()
        .withMessage('Rôle requis')
        .isIn(['client', 'livreur', 'commercant', 'prestataire'])
        .withMessage('Rôle invalide'),
    handleValidationErrors
];

/**
 * Validation pour création d'annonce
 */
exports.validateAnnonce = [
    body('titre')
        .trim()
        .notEmpty()
        .withMessage('Titre requis')
        .isLength({ min: 5, max: 100 })
        .withMessage('Le titre doit contenir entre 5 et 100 caractères'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description requise')
        .isLength({ min: 20, max: 2000 })
        .withMessage('La description doit contenir entre 20 et 2000 caractères'),
    body('categorie_id')
        .isInt({ min: 1 })
        .withMessage('Catégorie invalide'),
    body('prix')
        .isFloat({ min: 0 })
        .withMessage('Prix invalide'),
    body('date_limite')
        .optional()
        .isISO8601()
        .withMessage('Date invalide'),
    body('adresse_depart')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Adresse de départ requise pour les livraisons'),
    body('ville_depart')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Ville de départ requise pour les livraisons'),
    body('code_postal_depart')
        .optional()
        .matches(/^\d{5}$/)
        .withMessage('Code postal invalide'),
    body('adresse_arrivee')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Adresse d\'arrivée requise pour les livraisons'),
    body('ville_arrivee')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Ville d\'arrivée requise pour les livraisons'),
    body('code_postal_arrivee')
        .optional()
        .matches(/^\d{5}$/)
        .withMessage('Code postal invalide'),
    handleValidationErrors
];

/**
 * Validation pour envoi de message
 */
exports.validateMessage = [
    body('destinataire_id')
        .isInt({ min: 1 })
        .withMessage('Destinataire invalide'),
    body('contenu')
        .trim()
        .notEmpty()
        .withMessage('Message vide')
        .isLength({ max: 1000 })
        .withMessage('Le message ne peut pas dépasser 1000 caractères'),
    body('annonce_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Annonce invalide'),
    handleValidationErrors
];

/**
 * Validation pour mise à jour utilisateur
 */
exports.validateUpdateUser = [
    body('nom')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    body('prenom')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('telephone')
        .optional()
        .matches(/^(\+33|0)[1-9](\d{2}){4}$/)
        .withMessage('Numéro de téléphone invalide'),
    body('adresse')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Adresse trop longue'),
    body('ville')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Ville trop longue'),
    body('code_postal')
        .optional()
        .matches(/^\d{5}$/)
        .withMessage('Code postal invalide'),
    handleValidationErrors
];

/**
 * Validation pour changement de mot de passe
 */
exports.validatePasswordChange = [
    body('ancien_mot_de_passe')
        .notEmpty()
        .withMessage('Ancien mot de passe requis'),
    body('nouveau_mot_de_passe')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
        .custom((value, { req }) => value !== req.body.ancien_mot_de_passe)
        .withMessage('Le nouveau mot de passe doit être différent de l\'ancien'),
    handleValidationErrors
];