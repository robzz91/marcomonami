const UtilisateurModel = require('../models/Utilisateur');

/**
 * Liste tous les utilisateurs avec pagination et filtres
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page, limit, role, search, compte_actif } = req.query;
        
        const options = {
            page,
            limit,
            role,
            search,
            compte_actif: compte_actif !== undefined ? compte_actif === 'true' : undefined
        };

        const result = await UtilisateurModel.listWithRoles(options);
        res.json(result);

    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Récupère un utilisateur par ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UtilisateurModel.findByIdWithRoles(id);
        
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            adresse: user.adresse,
            ville: user.ville,
            code_postal: user.code_postal,
            pays: user.pays,
            roles: user.roles,
            email_verifie: user.email_verifie,
            compte_actif: user.compte_actif,
            date_inscription: user.date_inscription,
            derniere_connexion: user.derniere_connexion
        });

    } catch (error) {
        console.error('Erreur getUserById:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Met à jour un utilisateur
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Empêcher la modification de certains champs sensibles
        delete updateData.id;
        delete updateData.date_inscription;
        delete updateData.code_verification_email;
        delete updateData.reset_password_token;
        delete updateData.reset_password_expires;

        // Vérifier que l'utilisateur existe
        const existingUser = await UtilisateurModel.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await UtilisateurModel.findOne({ email: updateData.email });
            if (emailExists) {
                return res.status(409).json({ error: 'Cet email est déjà utilisé' });
            }
            // Réinitialiser la vérification email
            updateData.email_verifie = false;
            updateData.code_verification_email = Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        const updatedUser = await UtilisateurModel.update(id, updateData);
        
        res.json({
            message: 'Utilisateur mis à jour',
            user: updatedUser
        });

    } catch (error) {
        console.error('Erreur updateUser:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Supprime un utilisateur
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Empêcher la suppression de son propre compte
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
        }

        const deleted = await UtilisateurModel.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({ message: 'Utilisateur supprimé' });

    } catch (error) {
        console.error('Erreur deleteUser:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Active ou désactive un compte utilisateur
 */
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { compte_actif } = req.body;

        if (typeof compte_actif !== 'boolean') {
            return res.status(400).json({ error: 'compte_actif doit être un booléen' });
        }

        // Empêcher la désactivation de son propre compte
        if (req.user.id === parseInt(id) && !compte_actif) {
            return res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte' });
        }

        const updatedUser = await UtilisateurModel.update(id, { compte_actif });
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            message: `Compte ${compte_actif ? 'activé' : 'désactivé'}`,
            user: updatedUser
        });

    } catch (error) {
        console.error('Erreur toggleUserStatus:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Ajoute un rôle à un utilisateur
 */
exports.addUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;

        if (!role_id) {
            return res.status(400).json({ error: 'role_id requis' });
        }

        await UtilisateurModel.addRole(id, role_id);
        
        const updatedUser = await UtilisateurModel.findByIdWithRoles(id);
        
        res.json({
            message: 'Rôle ajouté',
            user: updatedUser
        });

    } catch (error) {
        console.error('Erreur addUserRole:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Retire un rôle à un utilisateur
 */
exports.removeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;

        if (!role_id) {
            return res.status(400).json({ error: 'role_id requis' });
        }

        const removed = await UtilisateurModel.removeRole(id, role_id);
        
        if (!removed) {
            return res.status(404).json({ error: 'Rôle non trouvé pour cet utilisateur' });
        }

        const updatedUser = await UtilisateurModel.findByIdWithRoles(id);
        
        res.json({
            message: 'Rôle retiré',
            user: updatedUser
        });

    } catch (error) {
        console.error('Erreur removeUserRole:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};