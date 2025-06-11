
CREATE DATABASE ecodeli DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE `roles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

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
)

CREATE TABLE `role_utilisateur` (
  `utilisateur_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`utilisateur_id`, `role_id`),
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
)

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
)

CREATE TABLE `commercants` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `utilisateur_id` INT NOT NULL,
  `raison_sociale` VARCHAR(255) NOT NULL,
  `siret` VARCHAR(14) NOT NULL,
  `numero_tva` VARCHAR(50) NULL,
  `domaine_activite` VARCHAR(100) NULL,
  `adresse_facturation` VARCHAR(255) NULL,
  `cp_facturation` VARCHAR(10) NULL,
  `ville_facturation` VARCHAR(100) NULL,
  `pays_facturation` VARCHAR(100) NULL,
  `statut_validation` ENUM('en_attente', 'validé', 'refusé') DEFAULT 'en_attente',
  `date_validation` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
)

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
)

CREATE TABLE `prestataires` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `utilisateur_id` INT NOT NULL,
  `siret` VARCHAR(14) NOT NULL,
  `type_activite` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `rayon_action` INT NULL COMMENT 'rayon d''action en km',
  `tarif_horaire` DECIMAL(10,2) NULL,
  `frais_deplacement` DECIMAL(10,2) NULL,
  `note_moyenne` DECIMAL(3,2) DEFAULT 0.00,
  `justificatif_identite` VARCHAR(255) NULL,
  `justificatif_competence` VARCHAR(255) NULL,
  `rib` VARCHAR(255) NULL,
  `statut_validation` ENUM('en_attente', 'validé', 'refusé') DEFAULT 'en_attente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
)

CREATE TABLE `competences_prestataires` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `requiert_certification` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE `prestataire_competence` (
  `prestataire_id` INT NOT NULL,
  `competence_id` INT NOT NULL,
  `certification_validee` BOOLEAN DEFAULT FALSE,
  `date_validation` DATETIME NULL,
  `justificatif` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`prestataire_id`, `competence_id`),
  FOREIGN KEY (`prestataire_id`) REFERENCES `prestataires` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`competence_id`) REFERENCES `competences_prestataires` (`id`) ON DELETE CASCADE
)

CREATE TABLE `disponibilites_prestataires` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `prestataire_id` INT NOT NULL,
  `jour_semaine` INT NOT NULL COMMENT '1-7 pour lundi-dimanche',
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NOT NULL,
  `disponible` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`prestataire_id`) REFERENCES `prestataires` (`id`) ON DELETE CASCADE
)

CREATE TABLE `indisponibilites_prestataires` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `prestataire_id` INT NOT NULL,
  `date_debut` DATETIME NOT NULL,
  `date_fin` DATETIME NOT NULL,
  `motif` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`prestataire_id`) REFERENCES `prestataires` (`id`) ON DELETE CASCADE
)

CREATE TABLE `entrepots` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `adresse` VARCHAR(255) NOT NULL,
  `code_postal` VARCHAR(10) NOT NULL,
  `ville` VARCHAR(100) NOT NULL,
  `pays` VARCHAR(100) NOT NULL,
  `telephone` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `capacite_max` INT NULL COMMENT 'capacité maximale en m³',
  `est_bureau` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE `categories_annonces` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `type` ENUM('colis', 'service', 'transport', 'achat', 'autre') NOT NULL,
  `icone` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

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
)

CREATE TABLE `livraisons` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `annonce_id` INT NOT NULL,
  `livreur_id` INT NOT NULL,
  `code_suivi` VARCHAR(50) NOT NULL,
  `code_confirmation` VARCHAR(10) NOT NULL,
  `date_prise_en_charge` DATETIME NULL,
  `date_livraison_prevue` DATETIME NULL,
  `date_livraison_reelle` DATETIME NULL,
  `statut` ENUM('acceptee', 'en_preparation', 'en_transit', 'en_entrepot', 'en_livraison', 'livree', 'annulee') DEFAULT 'acceptee',
  `entrepot_passage_id` INT NULL,
  `commentaire_livreur` TEXT NULL,
  `note_client` INT NULL,
  `commentaire_client` TEXT NULL,
  `prix_final` DECIMAL(10,2) NOT NULL,
  `commission_ecodeli` DECIMAL(10,2) NOT NULL,
  `montant_livreur` DECIMAL(10,2) NOT NULL,
  `paiement_effectue` BOOLEAN DEFAULT FALSE,
  `date_paiement` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`),
  FOREIGN KEY (`livreur_id`) REFERENCES `livreurs` (`id`),
  FOREIGN KEY (`entrepot_passage_id`) REFERENCES `entrepots` (`id`)
)

CREATE TABLE `suivi_livraisons` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `livraison_id` INT NOT NULL,
  `statut` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`livraison_id`) REFERENCES `livraisons` (`id`) ON DELETE CASCADE
)

CREATE TABLE `types_services` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `categorie` ENUM('transport', 'courses', 'achat', 'animalerie', 'menage', 'jardinage', 'autre') NOT NULL,
  `tarif_base` DECIMAL(10,2) NULL,
  `commission_percentage` DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  `duree_estimee` INT NULL COMMENT 'durée en minutes',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE `prestations_services` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `client_id` INT NOT NULL,
  `prestataire_id` INT NULL,
  `type_service_id` INT NOT NULL,
  `adresse` VARCHAR(255) NOT NULL,
  `code_postal` VARCHAR(10) NOT NULL,
  `ville` VARCHAR(100) NOT NULL,
  `pays` VARCHAR(100) NOT NULL,
  `date_prestation` DATE NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NULL,
  `description` TEXT NOT NULL,
  `instructions` TEXT NULL,
  `prix_base` DECIMAL(10,2) NOT NULL,
  `frais_deplacement` DECIMAL(10,2) NULL DEFAULT 0,
  `frais_service` DECIMAL(10,2) NULL DEFAULT 0,
  `prix_total` DECIMAL(10,2) NOT NULL,
  `statut` ENUM('demandée', 'acceptée', 'en_cours', 'terminée', 'annulée') DEFAULT 'demandée',
  `motif_annulation` TEXT NULL,
  `note_client` INT NULL,
  `commentaire_client` TEXT NULL,
  `note_prestataire` INT NULL,
  `commentaire_prestataire` TEXT NULL,
  `paiement_effectue` BOOLEAN DEFAULT FALSE,
  `date_paiement` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  FOREIGN KEY (`prestataire_id`) REFERENCES `prestataires` (`id`),
  FOREIGN KEY (`type_service_id`) REFERENCES `types_services` (`id`)
)


CREATE TABLE `trajets_livreurs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `livreur_id` INT NOT NULL,
  `ville_depart` VARCHAR(100) NOT NULL,
  `code_postal_depart` VARCHAR(10) NOT NULL,
  `pays_depart` VARCHAR(100) NOT NULL,
  `latitude_depart` DECIMAL(10,8) NULL,
  `longitude_depart` DECIMAL(11,8) NULL,
  `ville_arrivee` VARCHAR(100) NOT NULL,
  `code_postal_arrivee` VARCHAR(10) NOT NULL,
  `pays_arrivee` VARCHAR(100) NOT NULL,
  `latitude_arrivee` DECIMAL(10,8) NULL,
  `longitude_arrivee` DECIMAL(11,8) NULL,
  `date_depart` DATE NOT NULL,
  `heure_depart` TIME NOT NULL,
  `date_arrivee` DATE NOT NULL,
  `heure_arrivee` TIME NOT NULL,
  `places_disponibles` INT NULL DEFAULT 0,
  `volume_disponible` DECIMAL(10,2) NULL COMMENT 'en m³',
  `poids_max` DECIMAL(10,2) NULL COMMENT 'en kg',
  `commentaire` TEXT NULL,
  `statut` ENUM('planifié', 'en_cours', 'terminé', 'annulé') DEFAULT 'planifié',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`livreur_id`) REFERENCES `livreurs` (`id`) ON DELETE CASCADE
)

CREATE TABLE `contrats_commercants` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `commercant_id` INT NOT NULL,
  `type_contrat` ENUM('standard', 'premium', 'personnalisé') NOT NULL,
  `date_debut` DATE NOT NULL,
  `date_fin` DATE NULL,
  `montant_mensuel` DECIMAL(10,2) NOT NULL,
  `commission_percentage` DECIMAL(5,2) NOT NULL,
  `condition_particuliere` TEXT NULL,
  `statut` ENUM('en_attente', 'actif', 'terminé', 'résilié') DEFAULT 'en_attente',
  `document_contrat` VARCHAR(255) NULL,
  `date_signature` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`commercant_id`) REFERENCES `commercants` (`id`) ON DELETE CASCADE
)

CREATE TABLE `factures` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `numero` VARCHAR(50) NOT NULL UNIQUE,
  `type_entite` ENUM('client', 'commercant', 'livreur', 'prestataire') NOT NULL,
  `entite_id` INT NOT NULL,
  `montant_ht` DECIMAL(10,2) NOT NULL,
  `taux_tva` DECIMAL(5,2) NOT NULL,
  `montant_tva` DECIMAL(10,2) NOT NULL,
  `montant_ttc` DECIMAL(10,2) NOT NULL,
  `date_emission` DATE NOT NULL,
  `date_echeance` DATE NOT NULL,
  `date_paiement` DATE NULL,
  `statut` ENUM('émise', 'payée', 'annulée', 'en_retard') DEFAULT 'émise',
  `commentaire` TEXT NULL,
  `url_pdf` VARCHAR(255) NULL,
  `reference_paiement` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE `lignes_factures` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `facture_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantite` INT NOT NULL DEFAULT 1,
  `prix_unitaire_ht` DECIMAL(10,2) NOT NULL,
  `taux_tva` DECIMAL(5,2) NOT NULL,
  `montant_ht` DECIMAL(10,2) NOT NULL,
  `montant_tva` DECIMAL(10,2) NOT NULL,
  `montant_ttc` DECIMAL(10,2) NOT NULL,
  `reference_objet` VARCHAR(100) NULL COMMENT 'Référence à l''annonce, livraison ou prestation concernée',
  `type_objet` VARCHAR(50) NULL COMMENT 'Type d''objet référencé (annonce, livraison, prestation)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE
)

CREATE TABLE `paiements` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `entite_type` ENUM('client', 'commercant', 'livreur', 'prestataire') NOT NULL,
  `entite_id` INT NOT NULL,
  `facture_id` INT NULL,
  `reference` VARCHAR(100) NOT NULL,
  `type` ENUM('carte', 'virement', 'portefeuille', 'autre') NOT NULL,
  `montant` DECIMAL(10,2) NOT NULL,
  `devise` VARCHAR(3) DEFAULT 'EUR',
  `statut` ENUM('en_attente', 'validé', 'refusé', 'remboursé') DEFAULT 'en_attente',
  `date_paiement` DATETIME NULL,
  `stripe_payment_id` VARCHAR(100) NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`)
)

CREATE TABLE `notifications` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `utilisateur_id` INT NOT NULL,
  `titre` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `lien` VARCHAR(255) NULL,
  `lue` BOOLEAN DEFAULT FALSE,
  `date_lecture` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
)

CREATE TABLE `messages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `expediteur_id` INT NOT NULL,
  `destinataire_id` INT NOT NULL,
  `sujet` VARCHAR(255) NULL,
  `contenu` TEXT NOT NULL,
  `lu` BOOLEAN DEFAULT FALSE,
  `date_lecture` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`expediteur_id`) REFERENCES `utilisateurs` (`id`),
  FOREIGN KEY (`destinataire_id`) REFERENCES `utilisateurs` (`id`)
)


CREATE TABLE `documents` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `utilisateur_id` INT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `chemin` VARCHAR(255) NOT NULL,
  `taille` INT NOT NULL COMMENT 'Taille en octets',
  `mime_type` VARCHAR(100) NOT NULL,
  `valide` BOOLEAN DEFAULT FALSE,
  `date_validation` DATETIME NULL,
  `commentaire_validation` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
)

