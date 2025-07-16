/**
 * Script pour mettre à jour tous les contrôleurs avec le format de réponse uniforme
 * Ce fichier peut être supprimé après utilisation
 */

// Guide de conversion pour les développeurs :

// AVANT :
// res.status(200).json({ data: result });
// res.status(400).json({ error: 'Message d\'erreur' });
// res.status(500).json({ error: 'Erreur serveur' });

// APRÈS :
// const response = require('../utils/response');
// 
// response.success(res, result);
// response.error(res, 'Message d\'erreur', 400);
// response.error(res, 'Erreur serveur', 500);

// Patterns de conversion :
const patterns = {
    // Success responses
    'res.json({': 'response.success(res, {',
    'res.status(200).json({': 'response.success(res, {',
    'res.status(201).json({': 'response.success(res, {',
    
    // Error responses
    'res.status(400).json({ error:': 'response.error(res,',
    'res.status(401).json({ error:': 'response.unauthorized(res,',
    'res.status(403).json({ error:': 'response.forbidden(res,',
    'res.status(404).json({ error:': 'response.notFound(res,',
    'res.status(409).json({ error:': 'response.conflict(res,',
    'res.status(500).json({ error:': 'response.error(res,',
    
    // Success with custom message
    'res.json({ success: true,': 'response.success(res, null,',
    'res.status(201).json({ success: true,': 'response.success(res, null,'
};

// Liste des contrôleurs à mettre à jour
const controllers = [
    'livreurController',
    'clientController', 
    'commercantController',
    'prestataireController',
    'adminController'
];

console.log(`
📋 Guide de mise à jour des contrôleurs :

1. Ajouter l'import en haut de chaque contrôleur :
   const response = require('../utils/response');

2. Remplacer les patterns suivants :

   ❌ res.json({ ... })
   ✅ response.success(res, { ... })

   ❌ res.status(400).json({ error: 'message' })
   ✅ response.error(res, 'message', 400)

   ❌ res.status(401).json({ error: 'message' })
   ✅ response.unauthorized(res, 'message')

   ❌ res.status(404).json({ error: 'message' })
   ✅ response.notFound(res, 'message')

3. Format uniforme des réponses :
   Success: { success: true, data: {...}, message: '...' }
   Error: { success: false, message: '...', errors: [...] }
`);