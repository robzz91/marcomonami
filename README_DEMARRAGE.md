# 🚀 Guide de démarrage EcoDeli - Solution finale

## ✅ Problèmes résolus

### 1. **Erreur de connexion API**
- Correction des noms de champs dans le modèle Utilisateur (`nom_role` → `nom`)
- Correction du contrôleur d'authentification (`mot_de_passe` → `password`, `compte_actif` → `active`)

### 2. **Commande unique pour tous les services**
- Modification du `package.json` racine pour éviter les conflits
- Suppression du backend admin non configuré
- Ajout du flag `--kill-others-on-fail` pour une gestion propre des erreurs

## 🎯 Commande unique pour tout démarrer

```bash
cd /mnt/c/Users/robin/Desktop/cours/2A1/PA2025
npm run dev
```

Cette commande démarre automatiquement :
- **API** sur le port 3000 (avec nodemon pour rechargement auto)
- **Frontend** sur le port 5173 (avec Vite HMR)

## 📋 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre API + Frontend en mode développement |
| `npm run start` | Démarre API + Frontend en mode production |
| `npm run server` | Démarre uniquement l'API |
| `npm run client` | Démarre uniquement le frontend |
| `npm run dev-server` | Démarre l'API avec nodemon |
| `npm run dev-client` | Démarre le frontend avec Vite |

## 🧪 Vérification des services

```bash
# Test automatique
node test_services.js

# Test manuel
curl http://localhost:3000    # API
curl http://localhost:5173    # Frontend
```

## 🗄️ Prérequis base de données

Assurez-vous que votre base MySQL est configurée avec :

1. **Base de données** : `ecodeli`
2. **Tables créées** : Exécuter `bdd.sql`
3. **Configuration** dans `api/.env` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=ecodeli
DB_PORT=3306
```

## 🎮 Test complet

1. **Démarrer les services** :
```bash
npm run dev
```

2. **Attendre le démarrage** (environ 10 secondes)

3. **Ouvrir le frontend** : http://localhost:5173

4. **Créer un compte** ou se connecter

5. **Tester la création d'annonces** :
   - Aller dans "Mes annonces"
   - Créer une nouvelle annonce
   - Vérifier qu'elle s'enregistre en base

## 🔧 En cas de problème

### API ne démarre pas
- Vérifier la connexion MySQL
- Vérifier les logs : `cd api && npm run dev`

### Frontend ne démarre pas
- Vérifier les dépendances : `cd frontend && npm install`
- Vérifier les logs : `cd frontend && npm run dev`

### Erreur de connexion utilisateur
- Vérifier que l'utilisateur existe en base
- Vérifier que le mot de passe est hashé avec bcryptjs
- Vérifier les rôles dans la table `role_utilisateur`

## 📊 Statut des corrections

- ✅ Modèle Utilisateur corrigé
- ✅ Contrôleur d'authentification corrigé  
- ✅ Script de démarrage unifié
- ✅ Gestion des erreurs améliorée
- ✅ Documentation complète

## 🎉 Vous êtes prêt !

La commande `npm run dev` devrait maintenant démarrer tous les services sans conflits et la connexion devrait fonctionner correctement !

---

💡 **Astuce** : Gardez un terminal ouvert avec `npm run dev` pour voir les logs en temps réel.