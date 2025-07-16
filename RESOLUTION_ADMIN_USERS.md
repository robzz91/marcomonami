# Résolution du problème de la route /api/admin/utilisateurs

## Problème identifié

La route `/api/admin/utilisateurs` retournait des données hardcodées au lieu de récupérer les vraies données depuis la base de données MySQL.

## Modifications apportées

### 1. Correction de la route (api/routes/adminRoutes.js)

**Avant :**
```javascript
router.get('/utilisateurs', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, nom: 'Admin', prenom: 'System', email: 'admin@ecodeli.com', status: 'actif' },
            { id: 2, nom: 'Test', prenom: 'User', email: 'test@test.com', status: 'actif' },
            { id: 3, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@test.com', status: 'inactif' }
        ],
        pagination: { page: 1, limit: 20, total: 3, totalPages: 1 }
    });
});
```

**Après :**
```javascript
router.get('/utilisateurs', adminController.getAllUsers);
```

### 2. Ajout du mapping du champ status (api/controllers/adminController.js)

La base de données utilise un champ booléen `compte_actif` mais l'interface attend un champ `status`. Un mapping a été ajouté :

```javascript
const mappedUsers = users.map(user => ({
    ...user,
    status: user.compte_actif ? 'actif' : 'inactif'
}));
```

## Test de la route

Un script de test a été créé : `api/test-admin-users.js`

### Pour tester :

1. Assurez-vous que l'API est en cours d'exécution :
   ```bash
   cd api
   npm run dev
   ```

2. Exécutez le script de test :
   ```bash
   cd api
   node test-admin-users.js
   ```

### Ce que teste le script :

1. **Connexion admin** : Se connecte avec les identifiants admin
2. **Liste des utilisateurs** : Récupère la liste complète des utilisateurs
3. **Recherche** : Teste la recherche par nom/prénom/email
4. **Pagination** : Teste la pagination avec différents paramètres

### Fonctionnalités de la route :

- **URL** : `/api/admin/utilisateurs`
- **Méthode** : GET
- **Authentification** : Requiert une session admin active
- **Paramètres de requête** :
  - `page` : Numéro de page (défaut: 1)
  - `limit` : Nombre d'éléments par page (défaut: 20)
  - `search` : Terme de recherche (nom, prénom ou email)
  - `status` : Filtrer par statut ('actif' ou 'inactif')

### Format de réponse :

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "nom": "Admin",
            "prenom": "System",
            "email": "admin@ecodeli.com",
            "telephone": null,
            "compte_actif": 1,
            "status": "actif",
            "date_inscription": "2024-01-01T00:00:00.000Z",
            "date_modification": null,
            "derniere_connexion": null
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 10,
        "totalPages": 1
    }
}
```

## Notes importantes

1. La route nécessite une authentification admin (middleware auth + vérification du rôle)
2. Les données sont récupérées depuis la table `utilisateurs` de la base MySQL
3. Le champ `status` est dérivé du champ `compte_actif` de la base de données
4. La pagination et la recherche sont supportées nativement