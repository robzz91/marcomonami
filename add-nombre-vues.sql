-- Ajouter la colonne nombre_vues à la table annonces
ALTER TABLE `annonces` 
ADD COLUMN `nombre_vues` INT DEFAULT 0 AFTER `statut`;