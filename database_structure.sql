
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `annonces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annonces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_annonce` enum('livraison','prestation') COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` enum('ouverte','en_cours','terminee','annulee') COLLATE utf8mb4_unicode_ci DEFAULT 'ouverte',
  `nombre_vues` int DEFAULT '0',
  `adresse_depart` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse_arrivee` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_livraison_souhaitee` datetime DEFAULT NULL,
  `poids_colis` decimal(10,2) DEFAULT NULL,
  `dimensions_colis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_prestation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_prestation_souhaitee` date DEFAULT NULL,
  `duree_estimee_heures` decimal(5,2) DEFAULT NULL,
  `budget_max` decimal(10,2) DEFAULT NULL,
  `urgence` enum('faible','normale','haute') COLLATE utf8mb4_unicode_ci DEFAULT 'normale',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `idx_type_annonce` (`type_annonce`),
  KEY `idx_statut` (`statut`),
  KEY `idx_date_creation` (`date_creation`),
  CONSTRAINT `annonces_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `type_abonnement` enum('gratuit','premium') COLLATE utf8mb4_unicode_ci DEFAULT 'gratuit',
  `date_debut_abonnement` date DEFAULT NULL,
  `date_fin_abonnement` date DEFAULT NULL,
  `customer_stripe_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tutoriel_complete` tinyint(1) DEFAULT '0',
  `preferences_notifications` json DEFAULT NULL,
  `adresse_livraison_defaut` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructions_livraison` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateur_id` (`utilisateur_id`),
  KEY `idx_abonnement` (`type_abonnement`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `commercants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `commercants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `raison_sociale` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `siret` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_tva` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `domaine_activite` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `adresse_siege` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cp_siege` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville_siege` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays_siege` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'France',
  `statut_validation` enum('en_attente','valide','rejete') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `date_validation` datetime DEFAULT NULL,
  `validateur_id` int DEFAULT NULL,
  `commentaire_validation` text COLLATE utf8mb4_unicode_ci,
  `note_moyenne` decimal(3,2) DEFAULT '0.00',
  `nb_evaluations` int DEFAULT '0',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateur_id` (`utilisateur_id`),
  UNIQUE KEY `siret` (`siret`),
  KEY `validateur_id` (`validateur_id`),
  KEY `idx_siret` (`siret`),
  KEY `idx_statut` (`statut_validation`),
  CONSTRAINT `commercants_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commercants_ibfk_2` FOREIGN KEY (`validateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `livreurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livreurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utilisateur` int NOT NULL,
  `numero_siret` varchar(14) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `piece_identite` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `justificatif_domicile` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permis_conduire` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `carte_grise` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assurance` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut_livreur` enum('en_attente_validation','actif','suspendu','rejete') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente_validation',
  `note_moyenne` decimal(3,2) DEFAULT '0.00',
  `nb_evaluations` int DEFAULT '0',
  `vehicule_type` enum('velo','velo_electrique','trottinette','moto','voiture') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rayon_action_km` int DEFAULT '10',
  `disponible` tinyint(1) DEFAULT '0',
  `solde_portefeuille` decimal(10,2) DEFAULT '0.00',
  `commentaire_validation` text COLLATE utf8mb4_unicode_ci,
  `date_validation` datetime DEFAULT NULL,
  `validateur_id` int DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_utilisateur` (`id_utilisateur`),
  KEY `validateur_id` (`validateur_id`),
  KEY `idx_statut` (`statut_livreur`),
  KEY `idx_disponible` (`disponible`),
  KEY `idx_note` (`note_moyenne`),
  CONSTRAINT `livreurs_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `livreurs_ibfk_2` FOREIGN KEY (`validateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expediteur_id` int NOT NULL,
  `destinataire_id` int NOT NULL,
  `annonce_id` int DEFAULT NULL,
  `sujet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lu` tinyint(1) DEFAULT '0',
  `date_lecture` datetime DEFAULT NULL,
  `date_envoi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `supprime_expediteur` tinyint(1) DEFAULT '0',
  `supprime_destinataire` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expediteur_id` (`expediteur_id`),
  KEY `destinataire_id` (`destinataire_id`),
  KEY `annonce_id` (`annonce_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`expediteur_id`) REFERENCES `utilisateurs` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`destinataire_id`) REFERENCES `utilisateurs` (`id`),
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `lien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lue` tinyint(1) DEFAULT '0',
  `date_lecture` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `utilisateur_id` (`utilisateur_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `prestataires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestataires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int NOT NULL,
  `siret` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_activite` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `zone_intervention` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarif_horaire` decimal(8,2) DEFAULT NULL,
  `statut_validation` enum('en_attente','valide','rejete') COLLATE utf8mb4_unicode_ci DEFAULT 'en_attente',
  `date_validation` datetime DEFAULT NULL,
  `validateur_id` int DEFAULT NULL,
  `commentaire_validation` text COLLATE utf8mb4_unicode_ci,
  `note_moyenne` decimal(3,2) DEFAULT '0.00',
  `nb_evaluations` int DEFAULT '0',
  `taux_commission` decimal(5,4) DEFAULT '0.1500',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateur_id` (`utilisateur_id`),
  UNIQUE KEY `siret` (`siret`),
  KEY `validateur_id` (`validateur_id`),
  KEY `idx_siret` (`siret`),
  KEY `idx_statut` (`statut_validation`),
  KEY `idx_activite` (`type_activite`),
  CONSTRAINT `prestataires_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestataires_ibfk_2` FOREIGN KEY (`validateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `role_utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_utilisateur` (
  `utilisateur_id` int NOT NULL,
  `role_id` int NOT NULL,
  `date_assignation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`utilisateur_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `role_utilisateur_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_utilisateur_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom_role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom_role` (`nom_role`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `utilisateurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prenom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telephone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_postal` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pays` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'France',
  `date_naissance` date DEFAULT NULL,
  `photo_profil` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verifie` tinyint(1) DEFAULT '0',
  `compte_actif` tinyint(1) DEFAULT '1',
  `code_verification_email` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_reset_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_reset_expires_at` datetime DEFAULT NULL,
  `derniere_connexion` datetime DEFAULT NULL,
  `langue` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT 'fr',
  `date_inscription` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_verification` (`code_verification_email`),
  KEY `idx_active` (`compte_actif`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `vue_utilisateurs_roles`;
/*!50001 DROP VIEW IF EXISTS `vue_utilisateurs_roles`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vue_utilisateurs_roles` AS SELECT 
 1 AS `id`,
 1 AS `email`,
 1 AS `nom`,
 1 AS `prenom`,
 1 AS `telephone`,
 1 AS `compte_actif`,
 1 AS `email_verifie`,
 1 AS `date_inscription`,
 1 AS `roles`*/;
SET character_set_client = @saved_cs_client;
/*!50001 DROP VIEW IF EXISTS `vue_utilisateurs_roles`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`ecodeli_user`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vue_utilisateurs_roles` AS select `u`.`id` AS `id`,`u`.`email` AS `email`,`u`.`nom` AS `nom`,`u`.`prenom` AS `prenom`,`u`.`telephone` AS `telephone`,`u`.`compte_actif` AS `compte_actif`,`u`.`email_verifie` AS `email_verifie`,`u`.`date_inscription` AS `date_inscription`,group_concat(`r`.`nom_role` separator ',') AS `roles` from ((`utilisateurs` `u` left join `role_utilisateur` `ru` on((`u`.`id` = `ru`.`utilisateur_id`))) left join `roles` `r` on((`ru`.`role_id` = `r`.`id`))) group by `u`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

