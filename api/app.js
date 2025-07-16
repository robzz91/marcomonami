const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bienvenue sur l\'API EcoDeli - Plateforme de livraison écologique',
        version: '2.0.0',
        status: 'API complète et opérationnelle',
        endpoints: {
            auth: '/api/auth',
            utilisateurs: '/api/utilisateurs',
            annonces: '/api/annonces',
            messages: '/api/messages',
            livreurs: '/api/livreurs',
            commercants: '/api/commercants',
            clients: '/api/clients',
            prestataires: '/api/prestataires',
            livraisons: '/api/livraisons',
            services: '/api/services',
            admin: '/api/admin'
        }
    });
});

// Route de test DB temporaire
app.get('/api/test-db', async (req, res) => {
    try {
        const db = require('./config/db');
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM roles');
        res.json({ 
            success: true,
            message: 'Base de données accessible',
            rolesCount: rows[0].count
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Erreur DB',
            error: error.message
        });
    }
});

// Routes principales existantes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/utilisateurs', require('./routes/utilisateurRoutes'));
app.use('/api/annonces', require('./routes/annonceRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Nouvelles routes des espaces utilisateurs
app.use('/api/livreurs', require('./routes/livreurRoutes'));
app.use('/api/commercants', require('./routes/commercantRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/prestataires', require('./routes/prestataireRoutes'));

// Routes générales
app.use('/api/livraisons', require('./routes/livraisonRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

// Back office administration
app.use('/api/admin', require('./routes/adminRoutes'));

// Middleware de gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Erreur serveur', 
        message: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API EcoDeli démarrée sur http://localhost:${PORT}`);
    console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
});