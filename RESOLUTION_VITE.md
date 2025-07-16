# ✅ Résolution du problème Vite

## Problème
Lors du lancement de `npm run dev` à la racine :
```
'vite' n'est pas reconnu en tant que commande interne
```

## Cause
Les dépendances du frontend n'étaient pas installées, notamment Vite.

## Solution
```bash
cd frontend && npm install
```

## Résultat
- ✅ Frontend accessible sur http://localhost:5173
- ✅ API accessible sur http://localhost:3000
- ⚠️ Base de données MySQL doit être démarrée séparément

## Commande unique fonctionnelle
```bash
npm run dev
```

Cette commande démarre maintenant correctement l'API et le frontend depuis la racine du projet.

## Note importante
L'API démarre même sans MySQL mais affiche une erreur de connexion. Pour un fonctionnement complet, assurez-vous que MySQL est démarré et accessible sur le port 3306.