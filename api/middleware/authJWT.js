const { verifyToken } = require('../utils/jwt');

/**
 * Middleware pour vérifier le token JWT
 * Le token peut être dans :
 * - Header Authorization: Bearer <token>
 * - Cookie: token=<token>
 */
const authenticateToken = (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        // Vérifier et décoder le token
        const decoded = verifyToken(token);
        
        // Ajouter les infos utilisateur à la requête
        req.user = {
            id: decoded.id,
            email: decoded.email,
            roles: decoded.roles || []
        };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalide' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expiré' });
        }
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique
 * @param {string|string[]} roles - Rôle(s) requis
 */
const requireRole = (roles) => {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const userRoles = req.user.roles.map(r => r.nom_role);
        const hasRole = rolesArray.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ error: 'Accès interdit' });
        }

        next();
    };
};

/**
 * Middleware optionnel : ajoute les infos user si token présent, sinon continue
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : req.cookies?.token;

        if (token) {
            const decoded = verifyToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                roles: decoded.roles || []
            };
        }
    } catch (error) {
        // Ignorer les erreurs, l'auth est optionnelle
    }
    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth
};