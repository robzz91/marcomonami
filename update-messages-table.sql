-- Mise à jour de la table messages pour supporter la messagerie depuis les annonces
-- Ajouter les nouvelles colonnes nécessaires

ALTER TABLE `messages` 
ADD COLUMN `annonce_id` INT NULL AFTER `destinataire_id`,
ADD COLUMN `date_envoi` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `date_lecture`,
ADD COLUMN `supprime_expediteur` BOOLEAN DEFAULT FALSE AFTER `date_envoi`,
ADD COLUMN `supprime_destinataire` BOOLEAN DEFAULT FALSE AFTER `supprime_expediteur`;

-- Ajouter la contrainte de clé étrangère pour annonce_id
ALTER TABLE `messages` 
ADD CONSTRAINT `fk_messages_annonce` 
FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`);

-- Mettre à jour les messages existants pour avoir une date_envoi basée sur created_at
UPDATE `messages` SET `date_envoi` = `created_at` WHERE `date_envoi` IS NULL;