const UtilisateurModel = require('../models/Utilisateur');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const response = require('../utils/response');

/**
 * Connexion d'un utilisateur
 */
exports.login = async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        // Validation des entrées
        if (!email || !mot_de_passe) {
            return res.status(400).json({ 
                success: false,
                message: 'Email et mot de passe requis' 
            });
        }

        // Chercher l'utilisateur avec ses rôles
        const user = await UtilisateurModel.findByEmailWithRoles(email);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier si le compte est actif
        if (!user.compte_actif) {
            return res.status(403).json({ 
                success: false,
                message: 'Votre compte a été désactivé. Contactez le support pour plus d\'informations.' 
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Mettre à jour la dernière connexion
        await UtilisateurModel.update(user.id, {
            derniere_connexion: new Date()
        });

        // Générer les tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            roles: user.roles
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Retourner les informations utilisateur et tokens
        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                utilisateur: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    telephone: user.telephone,
                    roles: user.roles,
                    email_verifie: user.email_verifie
                },
                token: accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Erreur login complète:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Une erreur est survenue lors de la connexion. Veuillez réessayer.',
            debug: error.message // Temporaire pour debug
        });
    }
};

/**
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_passe, telephone, adresse, role } = req.body;

        // Validation des entrées
        if (!nom || !prenom || !email || !mot_de_passe || !role) {
            return res.status(400).json({ 
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis' 
            });
        }

        // Vérifier que le rôle est valide
        const rolesValides = ['client', 'livreur', 'commercant', 'prestataire'];
        if (!rolesValides.includes(role)) {
            return res.status(400).json({ 
                success: false,
                message: 'Rôle non valide' 
            });
        }

        // Vérifier si l'email existe déjà
        const existingUserByEmail = await UtilisateurModel.findOne({ email });
        
        if (existingUserByEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Cette adresse email est déjà utilisée par un autre compte'
            });
        }

        // Vérifier si le téléphone existe déjà
        const existingUserByPhone = await UtilisateurModel.query(
            'SELECT id FROM utilisateurs WHERE telephone = ?',
            [telephone]
        );
        
        if (existingUserByPhone.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Ce numéro de téléphone est déjà utilisé par un autre compte'
            });
        }

        // Créer l'utilisateur
        console.log('Création de l\'utilisateur...');
        console.log('Données à créer:', {
            nom,
            prenom,
            email,
            mot_de_passe: mot_de_passe ? 'HIDDEN' : undefined,
            telephone,
            compte_actif: true,
            email_verifie: false
        });
        
        let newUser;
        try {
            newUser = await UtilisateurModel.create({
                nom,
                prenom,
                email,
                mot_de_passe,
                telephone,
                compte_actif: true,
                email_verifie: false
            });
            console.log('Utilisateur créé avec ID:', newUser.id);
        } catch (createError) {
            console.error('Erreur lors de la création utilisateur:', createError);
            throw createError;
        }

        // Assigner le rôle sélectionné et créer les entrées associées
        console.log('Recherche du rôle:', role);
        const roleResult = await UtilisateurModel.query(
            'SELECT id FROM roles WHERE nom_role = ?', 
            [role]
        );
        console.log('Rôle trouvé:', roleResult);
        
        if (roleResult.length > 0) {
            console.log('Assignation du rôle...');
            await UtilisateurModel.addRole(newUser.id, roleResult[0].id);
            console.log('Rôle assigné, création de l\'entrée spécifique...');
            
            // Créer l'entrée dans la table spécifique au rôle
            switch (role) {
                case 'client':
                    console.log('Création entrée client...');
                    await UtilisateurModel.query(
                        'INSERT INTO clients (utilisateur_id, type_abonnement) VALUES (?, ?)',
                        [newUser.id, 'gratuit']
                    );
                    console.log('Entrée client créée');
                    break;
                
                case 'livreur':
                    console.log('Création entrée livreur...');
                    await UtilisateurModel.query(
                        'INSERT INTO livreurs (id_utilisateur, statut_livreur, note_moyenne) VALUES (?, ?, ?)',
                        [newUser.id, 'en_attente_validation', 0.00]
                    );
                    console.log('Entrée livreur créée');
                    break;
                
                case 'commercant':
                    console.log('Création entrée commerçant...');
                    const commercantSiret = ('TEMP' + String(Date.now()).slice(-8) + String(newUser.id).padStart(2, '0')).slice(0, 14);
                    console.log('SIRET commerçant généré:', commercantSiret);
                    await UtilisateurModel.query(
                        'INSERT INTO commercants (utilisateur_id, raison_sociale, siret, statut_validation) VALUES (?, ?, ?, ?)',
                        [newUser.id, `${prenom} ${nom}`, commercantSiret, 'en_attente']
                    );
                    console.log('Entrée commerçant créée');
                    break;
                
                case 'prestataire':
                    console.log('Création entrée prestataire...');
                    const prestataireSiret = ('TEMP' + String(Date.now()).slice(-8) + String(newUser.id).padStart(2, '0')).slice(0, 14);
                    console.log('SIRET prestataire généré:', prestataireSiret);
                    await UtilisateurModel.query(
                        'INSERT INTO prestataires (utilisateur_id, siret, type_activite, statut_validation, note_moyenne) VALUES (?, ?, ?, ?, ?)',
                        [newUser.id, prestataireSiret, 'Service général', 'en_attente', 0.00]
                    );
                    console.log('Entrée prestataire créée');
                    break;
            }
        }

        // TODO: Envoyer email de vérification avec newUser.code_verification_email

        // Générer les tokens
        console.log('Génération des tokens...');
        const tokenPayload = {
            id: newUser.id,
            email: newUser.email,
            roles: [role]
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        console.log('Tokens générés');

        console.log('Envoi de la réponse...');
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                utilisateur: {
                    id: newUser.id,
                    nom: newUser.nom,
                    prenom: newUser.prenom,
                    email: newUser.email,
                    telephone: newUser.telephone,
                    roles: [role]
                },
                token: accessToken,
                refreshToken
            }
        });
        console.log('Réponse envoyée avec succès');

    } catch (error) {
        console.error('Erreur register complète:', error);
        console.error('Stack trace:', error.stack);
        
        // Diagnostiquer l'erreur plus précisément
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false,
                message: 'Conflit de données détecté. Veuillez réessayer.' 
            });
        }
        
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ 
                success: false,
                message: 'Erreur de référence dans les données.' 
            });
        }
        
        if (error.code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({ 
                success: false,
                message: 'Champ obligatoire manquant.' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.',
            debug: error.message // Temporaire pour debug
        });
    }
};

/**
 * Déconnexion
 */
exports.logout = async (req, res) => {
    // Avec JWT, la déconnexion se fait côté client en supprimant le token
    // Ici on peut blacklister le token si nécessaire
    res.json({ 
        success: true,
        message: 'Déconnexion réussie' 
    });
};

/**
 * Récupération du profil utilisateur connecté
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await UtilisateurModel.findByIdWithRoles(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        res.json({
            success: true,
            data: {
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
                date_inscription: user.date_inscription
            }
        });

    } catch (error) {
        console.error('Erreur getProfile:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Vérification de l'email
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const user = await UtilisateurModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        if (user.email_verifie) {
            return res.status(400).json({ error: 'Email déjà vérifié' });
        }

        if (user.code_verification_email !== code) {
            return res.status(400).json({ error: 'Code invalide' });
        }

        await UtilisateurModel.verifyEmail(userId);

        res.json({ message: 'Email vérifié avec succès' });

    } catch (error) {
        console.error('Erreur verifyEmail:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Demande de réinitialisation du mot de passe
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await UtilisateurModel.findOne({ email });
        
        if (!user) {
            // Ne pas révéler si l'email existe ou non
            return res.json({ 
                message: 'Si cet email existe, vous recevrez un lien de réinitialisation' 
            });
        }

        // Générer un token de réinitialisation
        const resetToken = Math.random().toString(36).substring(2, 15);
        const resetExpires = new Date(Date.now() + 3600000); // 1 heure

        await UtilisateurModel.update(user.id, {
            reset_token: resetToken,
            reset_token_expires_at: resetExpires
        });

        // TODO: Envoyer email avec le lien de réinitialisation

        res.json({ 
            message: 'Si cet email existe, vous recevrez un lien de réinitialisation' 
        });

    } catch (error) {
        console.error('Erreur forgotPassword:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Réinitialisation du mot de passe
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, nouveau_mot_de_passe } = req.body;

        const user = await UtilisateurModel.findOne({ 
            reset_token: token 
        });
        
        if (!user || new Date(user.reset_token_expires_at) < new Date()) {
            return res.status(400).json({ 
                error: 'Token invalide ou expiré' 
            });
        }

        // Mettre à jour le mot de passe
        await UtilisateurModel.update(user.id, {
            password: nouveau_mot_de_passe,
            reset_token: null,
            reset_token_expires_at: null
        });

        res.json({ message: 'Mot de passe réinitialisé avec succès' });

    } catch (error) {
        console.error('Erreur resetPassword:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

/**
 * Connexion administrative - seuls les utilisateurs avec le rôle "admin" peuvent se connecter
 */
exports.adminLogin = async (req, res) => {
    try {
        console.log('=== ADMIN LOGIN ===');
        console.log('Body reçu:', req.body);
        
        const { email, password } = req.body;

        // Validation des données
        if (!email || !password) {
            console.log('Validation échouée: email=', email, 'password=', password);
            return res.status(400).json({ 
                success: false,
                message: 'Email et mot de passe requis' 
            });
        }

        // Trouver l'utilisateur avec ses rôles
        const user = await UtilisateurModel.findByEmailWithRoles(email);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier que l'utilisateur a le rôle admin
        if (!user.roles.includes('admin')) {
            return res.status(403).json({ 
                success: false,
                message: 'Accès administrateur requis' 
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.mot_de_passe);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Email ou mot de passe incorrect' 
            });
        }

        // Vérifier que le compte est actif
        if (!user.compte_actif) {
            return res.status(401).json({ 
                success: false,
                message: 'Compte désactivé' 
            });
        }

        // Générer les tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            roles: user.roles
        };

        const accessToken = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Retourner les informations utilisateur et tokens
        res.json({
            success: true,
            message: 'Connexion administrative réussie',
            data: {
                utilisateur: {
                    id: user.id,
                    nom: user.nom,
                    prenom: user.prenom,
                    email: user.email,
                    telephone: user.telephone,
                    roles: user.roles,
                    role: 'admin', // Pour compatibilité avec le frontend admin
                    email_verifie: user.email_verifie
                },
                token: accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Erreur adminLogin:', error);
        res.status(500).json({ 
            success: false,
            message: 'Une erreur est survenue lors de la connexion administrateur.'
        });
    }
};