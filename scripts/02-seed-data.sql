-- Insert initial data

INSERT INTO `roles` (`nom`, `description`) VALUES
('client', 'Utilisateur qui peut créer des demandes de livraison'),
('livreur', 'Utilisateur qui peut effectuer des livraisons'),
('admin', 'Administrateur de la plateforme');

INSERT INTO `categories_annonces` (`nom`, `description`, `type`, `icone`) VALUES
('Colis Standard', 'Livraison de colis classiques', 'colis', 'package'),
('Colis Fragile', 'Livraison de colis fragiles nécessitant des précautions', 'colis', 'package-x'),
('Documents', 'Livraison de documents importants', 'colis', 'file-text'),
('Courses', 'Faire des courses pour quelqu\'un', 'achat', 'shopping-cart'),
('Transport', 'Transport de personnes', 'transport', 'car'),
('Autre', 'Autres types de services', 'autre', 'help-circle');
