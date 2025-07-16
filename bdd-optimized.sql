-- =================================================================
-- SCHEMA ECODELI OPTIMISÉ - Compatible avec le code existant
-- =================================================================

DROP DATABASE IF EXISTS ecodeli;
CREATE DATABASE ecodeli DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecodeli;

-- =================================================================
-- TABLE DES RÔLES
-- =================================================================
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_role VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =================================================================
-- TABLE DES UTILISATEURS
-- =================================================================
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NULL,
    adresse VARCHAR(255) NULL,
    code_postal VARCHAR(10) NULL,
    ville VARCHAR(100) NULL,
    pays VARCHAR(100) DEFAULT 'France',
    date_naissance DATE NULL,
    photo_profil VARCHAR(255) NULL,
    email_verifie BOOLEAN DEFAULT FALSE,
    compte_actif BOOLEAN DEFAULT TRUE,
    code_verification_email VARCHAR(10) NULL,
    token_reset_password VARCHAR(255) NULL,
    token_reset_expires_at DATETIME NULL,
    derniere_connexion DATETIME NULL,
    langue VARCHAR(5) DEFAULT 'fr',
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification (code_verification_email),
    INDEX idx_active (compte_actif)
);

-- =================================================================
-- TABLE DE LIAISON UTILISATEURS-RÔLES
-- =================================================================
CREATE TABLE role_utilisateur (
    utilisateur_id INT NOT NULL,
    role_id INT NOT NULL,
    date_assignation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (utilisateur_id, role_id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =================================================================
-- TABLE DES LIVREURS
-- =================================================================
CREATE TABLE livreurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_utilisateur INT NOT NULL UNIQUE,
    numero_siret VARCHAR(14) NULL,
    piece_identite VARCHAR(255) NULL,
    justificatif_domicile VARCHAR(255) NULL,
    permis_conduire VARCHAR(255) NULL,
    carte_grise VARCHAR(255) NULL,
    assurance VARCHAR(255) NULL,
    statut_livreur ENUM('en_attente_validation', 'actif', 'suspendu', 'rejete') DEFAULT 'en_attente_validation',
    note_moyenne DECIMAL(3,2) DEFAULT 0.00,
    nb_evaluations INT DEFAULT 0,
    vehicule_type ENUM('velo', 'velo_electrique', 'trottinette', 'moto', 'voiture') NULL,
    rayon_action_km INT DEFAULT 10,
    disponible BOOLEAN DEFAULT FALSE,
    solde_portefeuille DECIMAL(10,2) DEFAULT 0.00,
    commentaire_validation TEXT NULL,
    date_validation DATETIME NULL,
    validateur_id INT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (validateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_statut (statut_livreur),
    INDEX idx_disponible (disponible),
    INDEX idx_note (note_moyenne)
);

-- =================================================================
-- TABLE DES COMMERÇANTS
-- =================================================================
CREATE TABLE commercants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL UNIQUE,
    raison_sociale VARCHAR(255) NOT NULL,
    siret VARCHAR(14) NOT NULL UNIQUE,
    numero_tva VARCHAR(50) NULL,
    domaine_activite VARCHAR(100) NULL,
    description TEXT NULL,
    adresse_siege VARCHAR(255) NULL,
    cp_siege VARCHAR(10) NULL,
    ville_siege VARCHAR(100) NULL,
    pays_siege VARCHAR(100) DEFAULT 'France',
    statut_validation ENUM('en_attente', 'valide', 'rejete') DEFAULT 'en_attente',
    date_validation DATETIME NULL,
    validateur_id INT NULL,
    commentaire_validation TEXT NULL,
    note_moyenne DECIMAL(3,2) DEFAULT 0.00,
    nb_evaluations INT DEFAULT 0,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (validateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_siret (siret),
    INDEX idx_statut (statut_validation)
);

-- =================================================================
-- TABLE DES CLIENTS
-- =================================================================
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL UNIQUE,
    type_abonnement ENUM('gratuit', 'premium') DEFAULT 'gratuit',
    date_debut_abonnement DATE NULL,
    date_fin_abonnement DATE NULL,
    customer_stripe_id VARCHAR(100) NULL,
    tutoriel_complete BOOLEAN DEFAULT FALSE,
    preferences_notifications JSON NULL,
    adresse_livraison_defaut VARCHAR(255) NULL,
    instructions_livraison TEXT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    INDEX idx_abonnement (type_abonnement)
);

-- =================================================================
-- TABLE DES PRESTATAIRES
-- =================================================================
CREATE TABLE prestataires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL UNIQUE,
    siret VARCHAR(14) NOT NULL UNIQUE,
    type_activite VARCHAR(100) NOT NULL,
    description TEXT NULL,
    zone_intervention VARCHAR(255) NULL,
    tarif_horaire DECIMAL(8,2) NULL,
    statut_validation ENUM('en_attente', 'valide', 'rejete') DEFAULT 'en_attente',
    date_validation DATETIME NULL,
    validateur_id INT NULL,
    commentaire_validation TEXT NULL,
    note_moyenne DECIMAL(3,2) DEFAULT 0.00,
    nb_evaluations INT DEFAULT 0,
    taux_commission DECIMAL(5,4) DEFAULT 0.15,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (validateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_siret (siret),
    INDEX idx_statut (statut_validation),
    INDEX idx_activite (type_activite)
);

-- =================================================================
-- INSERTION DES DONNÉES DE BASE
-- =================================================================

-- Rôles de base
INSERT INTO roles (nom_role, description) VALUES 
('admin', 'Administrateur de la plateforme'),
('client', 'Client utilisateur de services'),
('livreur', 'Livreur effectuant des livraisons'),
('commercant', 'Commerçant proposant des services'),
('prestataire', 'Prestataire de services');

-- Utilisateur admin par défaut
-- Mot de passe : admin123
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, telephone, compte_actif, email_verifie) VALUES
('Admin', 'System', 'admin@ecodeli.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0123456789', 1, 1);

-- Assigner le rôle admin
INSERT INTO role_utilisateur (utilisateur_id, role_id) VALUES
(1, (SELECT id FROM roles WHERE nom_role = 'admin'));

-- =================================================================
-- VUES UTILES
-- =================================================================

-- Vue des utilisateurs avec leurs rôles
CREATE VIEW vue_utilisateurs_roles AS
SELECT 
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.telephone,
    u.compte_actif,
    u.email_verifie,
    u.date_inscription,
    GROUP_CONCAT(r.nom_role SEPARATOR ',') as roles
FROM utilisateurs u
LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id
LEFT JOIN roles r ON ru.role_id = r.id
GROUP BY u.id;

-- =================================================================
-- MESSAGE DE CONFIRMATION
-- =================================================================
SELECT 'Base de données EcoDeli optimisée créée avec succès!' as message;
SELECT 'Utilisateur admin créé : admin@ecodeli.com / admin123' as admin_info;
SELECT CONCAT('Nombre de rôles : ', COUNT(*)) as roles_count FROM roles;