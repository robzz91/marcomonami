-- Create the main tables for the delivery platform

CREATE TABLE `roles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `utilisateurs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `telephone` VARCHAR(20) NULL,
  `adresse` VARCHAR(255) NULL,
  `code_postal` VARCHAR(10) NULL,
  `ville` VARCHAR(100) NULL,
  `pays` VARCHAR(100) NULL,
  `date_naissance` DATE NULL,
  `photo_profil` VARCHAR(255) NULL,
  `verified` BOOLEAN DEFAULT FALSE,
  `active` BOOLEAN DEFAULT TRUE,
  `remember_token` VARCHAR(255) NULL,
  `verification_token` VARCHAR(255) NULL,
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expires_at` DATETIME NULL,
  `langue` VARCHAR(5) DEFAULT 'fr',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `role_utilisateur` (
  `utilisateur_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`utilisateur_id`, `role_id`),
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `clients` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `utilisateur_id` INT NOT NULL,
  `abonnement` ENUM('free', 'starter', 'premium') DEFAULT 'free',
  `date_debut_abonnement` DATE NULL,
  `date_fin_abonnement` DATE NULL,
  `moyen_paiement_defaut` VARCHAR(50) NULL,
  `customer_stripe_id` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
);

CREATE TABLE `livreurs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `utilisateur_id` INT NOT NULL,
  `numero_carte_nfc` VARCHAR(100) NULL,
  `siret` VARCHAR(14) NULL,
  `justificatif_identite` VARCHAR(255) NULL,
  `justificatif_domicile` VARCHAR(255) NULL,
  `rib` VARCHAR(255) NULL,
  `carte_grise` VARCHAR(255) NULL,
  `permis_conduire` VARCHAR(255) NULL,
  `statut_validation` ENUM('en_attente', 'validé', 'refusé') DEFAULT 'en_attente',
  `solde_portefeuille` DECIMAL(10,2) DEFAULT 0.00,
  `note_moyenne` DECIMAL(3,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
);

CREATE TABLE `categories_annonces` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `type` ENUM('colis', 'service', 'transport', 'achat', 'autre') NOT NULL,
  `icone` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `annonces` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `createur_id` INT NOT NULL,
  `type_createur` ENUM('client', 'commercant') NOT NULL,
  `categorie_id` INT NOT NULL,
  `titre` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `adresse_depart` VARCHAR(255) NOT NULL,
  `cp_depart` VARCHAR(10) NOT NULL,
  `ville_depart` VARCHAR(100) NOT NULL,
  `pays_depart` VARCHAR(100) NOT NULL,
  `adresse_arrivee` VARCHAR(255) NOT NULL,
  `cp_arrivee` VARCHAR(10) NOT NULL,
  `ville_arrivee` VARCHAR(100) NOT NULL,
  `pays_arrivee` VARCHAR(100) NOT NULL,
  `latitude_depart` DECIMAL(10,8) NULL,
  `longitude_depart` DECIMAL(11,8) NULL,
  `latitude_arrivee` DECIMAL(10,8) NULL,
  `longitude_arrivee` DECIMAL(11,8) NULL,
  `date_livraison_souhaitee` DATE NULL,
  `heure_debut` TIME NULL,
  `heure_fin` TIME NULL,
  `poids` DECIMAL(10,2) NULL COMMENT 'en kg',
  `dimensions` VARCHAR(50) NULL COMMENT 'format LxlxH en cm',
  `volume` DECIMAL(10,2) NULL COMMENT 'en m³',
  `fragile` BOOLEAN DEFAULT FALSE,
  `assurance_necessaire` BOOLEAN DEFAULT FALSE,
  `valeur_declaree` DECIMAL(10,2) NULL,
  `prix_propose` DECIMAL(10,2) NOT NULL,
  `frais_service` DECIMAL(10,2) NULL,
  `prix_total` DECIMAL(10,2) NULL,
  `statut` ENUM('draft', 'publiee', 'en_cours', 'terminee', 'annulee') DEFAULT 'draft',
  `prioritaire` BOOLEAN DEFAULT FALSE,
  `date_publication` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categorie_id`) REFERENCES `categories_annonces` (`id`)
);
