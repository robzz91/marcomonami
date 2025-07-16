const express = require('express');
const router = express.Router();
const Model = require('../models/Model');
const auth = require('../middleware/auth');

const serviceModel = new Model('services');
const categorieModel = new Model('categories_services');

// Routes publiques (pas besoin d'authentification pour consulter les services)

// Obtenir toutes les catégories de services
router.get('/categories', async (req, res) => {
    try {
        const categories = await categorieModel.query(`
            SELECT 
                c.*,
                COUNT(s.id) as nombre_services
            FROM categories_services c
            LEFT JOIN services s ON c.id = s.categorie_id AND s.est_actif = 1
            GROUP BY c.id
            ORDER BY c.nom ASC
        `);
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des catégories'
        });
    }
});

// Obtenir tous les services actifs
router.get('/', async (req, res) => {
    try {
        const { categorieId, prixMin, prixMax, motCle, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT 
                s.*,
                c.nom as categorie_nom,
                COUNT(DISTINCT ps.id) as nombre_prestations,
                AVG(ps.note_client) as note_moyenne
            FROM services s
            LEFT JOIN categories_services c ON s.categorie_id = c.id
            LEFT JOIN prestations_services ps ON s.id = ps.service_id
            WHERE s.est_actif = 1
        `;
        
        const params = [];
        
        if (categorieId) {
            query += ' AND s.categorie_id = ?';
            params.push(categorieId);
        }
        
        if (prixMin) {
            query += ' AND s.prix >= ?';
            params.push(prixMin);
        }
        
        if (prixMax) {
            query += ' AND s.prix <= ?';
            params.push(prixMax);
        }
        
        if (motCle) {
            query += ' AND (s.nom LIKE ? OR s.description LIKE ?)';
            params.push(`%${motCle}%`, `%${motCle}%`);
        }
        
        query += ' GROUP BY s.id ORDER BY s.nom ASC';
        
        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const services = await serviceModel.query(query, params);
        
        // Compter le total
        let countQuery = `
            SELECT COUNT(DISTINCT s.id) as total 
            FROM services s 
            WHERE s.est_actif = 1
        `;
        const countParams = [];
        
        if (categorieId) {
            countQuery += ' AND s.categorie_id = ?';
            countParams.push(categorieId);
        }
        
        if (prixMin) {
            countQuery += ' AND s.prix >= ?';
            countParams.push(prixMin);
        }
        
        if (prixMax) {
            countQuery += ' AND s.prix <= ?';
            countParams.push(prixMax);
        }
        
        if (motCle) {
            countQuery += ' AND (s.nom LIKE ? OR s.description LIKE ?)';
            countParams.push(`%${motCle}%`, `%${motCle}%`);
        }
        
        const [countResult] = await serviceModel.query(countQuery, countParams);
        const total = countResult.total;
        
        res.json({
            success: true,
            data: services,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des services:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des services'
        });
    }
});

// Obtenir un service par ID avec les prestataires disponibles
router.get('/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        
        // Récupérer le service
        const service = await serviceModel.findById(serviceId);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé'
            });
        }
        
        // Récupérer les prestataires qui offrent ce service
        const prestataires = await serviceModel.query(`
            SELECT 
                p.*,
                u.nom,
                u.prenom,
                u.adresse,
                u.telephone,
                AVG(ps.note_client) as note_moyenne,
                COUNT(ps.id) as nombre_prestations
            FROM prestataires p
            JOIN utilisateurs u ON p.utilisateur_id = u.id
            JOIN prestations_services ps ON p.id = ps.prestataire_id
            WHERE ps.service_id = ?
            AND p.statut_validation = 'valide'
            GROUP BY p.id
            ORDER BY note_moyenne DESC, nombre_prestations DESC
        `, [serviceId]);
        
        res.json({
            success: true,
            data: {
                service,
                prestataires
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du service:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du service'
        });
    }
});

// Routes authentifiées
router.use(auth);

// Obtenir les prestataires disponibles pour un service à une date donnée
router.get('/:serviceId/prestataires/disponibles', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { date, heure_debut, heure_fin, zone } = req.query;
        
        if (!date || !heure_debut || !heure_fin) {
            return res.status(400).json({
                success: false,
                message: 'Date, heure de début et heure de fin requises'
            });
        }
        
        const jourSemaine = new Date(date).getDay();
        
        let query = `
            SELECT DISTINCT 
                p.*,
                u.nom,
                u.prenom,
                u.adresse,
                u.telephone,
                p.note_moyenne,
                p.nombre_evaluations
            FROM prestataires p
            JOIN utilisateurs u ON p.utilisateur_id = u.id
            JOIN disponibilites_prestataires dp ON p.id = dp.prestataire_id
            WHERE p.statut_validation = 'valide'
            AND dp.jour_semaine = ?
            AND dp.heure_debut <= ?
            AND dp.heure_fin >= ?
            AND NOT EXISTS (
                SELECT 1 FROM indisponibilites_prestataires ip
                WHERE ip.prestataire_id = p.id
                AND DATE(ip.date_debut) <= ?
                AND DATE(ip.date_fin) >= ?
                AND TIME(ip.date_debut) < ?
                AND TIME(ip.date_fin) > ?
            )
            AND EXISTS (
                SELECT 1 FROM prestations_services ps
                WHERE ps.prestataire_id = p.id
                AND ps.service_id = ?
            )
        `;
        
        const params = [
            jourSemaine,
            heure_debut,
            heure_fin,
            date,
            date,
            heure_fin,
            heure_debut,
            serviceId
        ];
        
        if (zone) {
            query += ' AND p.zone_intervention LIKE ?';
            params.push(`%${zone}%`);
        }
        
        query += ' ORDER BY p.note_moyenne DESC, p.nombre_evaluations DESC';
        
        const prestataires = await serviceModel.query(query, params);
        
        res.json({
            success: true,
            data: prestataires
        });
    } catch (error) {
        console.error('Erreur lors de la recherche de prestataires disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche de prestataires disponibles'
        });
    }
});

module.exports = router;