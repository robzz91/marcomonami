/**
 * Utilitaires pour formater les réponses API de manière uniforme
 */

/**
 * Réponse de succès
 */
exports.success = (res, data = null, message = 'Opération réussie', statusCode = 200) => {
    const response = {
        success: true,
        message
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

/**
 * Réponse d'erreur
 */
exports.error = (res, message = 'Une erreur est survenue', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

/**
 * Réponse de validation échouée
 */
exports.validationError = (res, errors) => {
    return res.status(422).json({
        success: false,
        message: 'Erreur de validation',
        errors
    });
};

/**
 * Réponse non autorisé
 */
exports.unauthorized = (res, message = 'Non autorisé') => {
    return res.status(401).json({
        success: false,
        message
    });
};

/**
 * Réponse accès refusé
 */
exports.forbidden = (res, message = 'Accès refusé') => {
    return res.status(403).json({
        success: false,
        message
    });
};

/**
 * Réponse ressource non trouvée
 */
exports.notFound = (res, message = 'Ressource non trouvée') => {
    return res.status(404).json({
        success: false,
        message
    });
};

/**
 * Réponse conflit (ex: email déjà utilisé)
 */
exports.conflict = (res, message = 'Conflit de données') => {
    return res.status(409).json({
        success: false,
        message
    });
};