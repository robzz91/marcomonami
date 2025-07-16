# Configuration de la création d'annonces - EcoDeli

## ✅ Modifications effectuées

### 1. **Routes client ajoutées** (`/api/routes/clientRoutes.js`)
- `GET /api/clients/annonces` - Récupérer les annonces du client
- `POST /api/clients/annonces` - Créer une nouvelle annonce
- `PUT /api/clients/annonces/:id` - Modifier une annonce
- `DELETE /api/clients/annonces/:id` - Supprimer une annonce
- `PATCH /api/clients/annonces/:id/publish` - Publier une annonce
- `PATCH /api/clients/annonces/:id/archive` - Archiver une annonce

### 2. **Contrôleur client étendu** (`/api/controllers/clientController.js`)
Ajout des méthodes :
- `getMyAnnonces()` - Récupération avec stats
- `createAnnonce()` - Création avec validation
- `updateAnnonce()` - Modification sécurisée
- `deleteAnnonce()` - Suppression avec vérification
- `publishAnnonce()` - Publication (statut → 'ouverte', publique → true)
- `archiveAnnonce()` - Archivage (statut → 'archivee', publique → false)

### 3. **Validation des données**
- Titre, description, catégorie et localisation requis
- Création automatique des catégories si elles n'existent pas
- Valeurs par défaut pour les champs optionnels
- Vérification de propriété avant modification/suppression

### 4. **Structure de base de données utilisée**
- Table `annonces` avec le schéma existant (`createur_id`, pas `auteur_id`)
- Table `categories_annonces` pour les catégories
- Utilisation directe de MySQL via `db.execute()`

## 🗄️ Prérequis base de données

### Configuration MySQL requise :
1. **Base de données** : `ecodeli`
2. **Tables nécessaires** :
   - `utilisateurs` (avec système d'auth)
   - `role_utilisateur`
   - `clients`
   - `categories_annonces`
   - `annonces`

### Script de démarrage rapide :
```sql
-- Créer une catégorie de test
INSERT INTO categories_annonces (nom, description, type) VALUES 
('Livraison', 'Services de livraison', 'service');

-- Vérifier que votre utilisateur client existe et a le bon rôle
SELECT u.id, u.email, u.nom, r.nom as role 
FROM utilisateurs u
JOIN role_utilisateur ru ON u.id = ru.utilisateur_id  
JOIN roles r ON ru.role_id = r.id 
WHERE r.nom = 'client';
```

## 🚀 Comment tester

### 1. **Démarrer les services**
```bash
# API (doit être connectée à MySQL)
cd api && npm start

# Frontend  
cd frontend && npm run dev
```

### 2. **Créer une annonce**
1. Se connecter en tant que client
2. Aller dans "Mes annonces"
3. Cliquer sur "Nouvelle annonce"
4. Remplir le formulaire :
   - **Titre** : "Test de livraison"
   - **Description** : "Annonce de test"
   - **Catégorie** : "Livraison" 
   - **Budget** : 30
   - **Localisation** : "Paris"
5. Cliquer sur "Créer"
6. L'annonce devrait apparaître avec le statut "Brouillon"
7. Cliquer sur "Publier" pour la rendre visible

### 3. **Vérification en base**
```sql
SELECT * FROM annonces ORDER BY created_at DESC LIMIT 5;
SELECT * FROM categories_annonces;
```

## 📋 Format des données

### Requête de création d'annonce :
```json
{
  "titre": "Livraison de courses",
  "description": "Besoin d'aide pour livrer mes courses",
  "categorie": "Livraison",
  "budget": 25,
  "localisation": "Paris",
  "date_souhaitee": "2024-07-04",
  "urgence": "normale",
  "accepte_devis": true
}
```

### Réponse API :
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titre": "Livraison de courses",
    "description": "Besoin d'aide pour livrer mes courses",
    "categorie": "Livraison",
    "budget": 25,
    "localisation": "Paris",
    "date_souhaitee": "2024-07-04",
    "urgence": "normale",
    "statut": "brouillon"
  },
  "message": "Annonce créée avec succès"
}
```

## ⚠️ Notes importantes

1. **Base de données requise** : L'API doit être connectée à MySQL pour fonctionner
2. **Authentification** : L'utilisateur doit être connecté et avoir le rôle "client"
3. **Catégories dynamiques** : Les catégories sont créées automatiquement si elles n'existent pas
4. **Statuts d'annonce** :
   - `brouillon` : Créée mais pas publiée
   - `ouverte` : Publiée et visible par tous
   - `archivee` : Masquée et non visible

## 🔧 En cas d'erreur "Impossible de sauvegarder l'annonce"

Vérifiez :
1. La connexion à MySQL fonctionne
2. L'utilisateur est bien connecté
3. Les tables existent en base
4. Les logs de l'API : `console.log` dans le contrôleur

Le système est maintenant configuré pour créer des annonces directement en base de données MySQL ! 🎉