# 🚀 Guide de Démarrage EcoDeli

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure)
- **npm** (inclus avec Node.js)
- **MySQL** (version 8.0 ou supérieure)
- **Git** (pour le clonage du projet)

## 🛠️ Installation Complète

### 1️⃣ Installation des Dépendances

```bash
# Installer toutes les dépendances (API + Frontend + Admin)
npm run install-all
```

Cette commande installe automatiquement les dépendances pour :
- 📁 `api/` - Backend Express.js
- 📁 `frontend/` - Interface utilisateur Vue.js
- 📁 `backend/` - Interface d'administration Vue.js

### 2️⃣ Configuration de la Base de Données

1. **Créer la base de données MySQL :**
   ```sql
   CREATE DATABASE ecodeli;
   ```

2. **Importer le schéma :**
   ```bash
   mysql -u root -p ecodeli < bdd.sql
   ```

3. **Configurer la connexion :**
   - Copier le fichier : `cp api/.env.example api/.env`
   - Modifier `api/.env` avec vos paramètres MySQL :
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=ecodeli
   DB_PORT=3306
   ```

## 🚀 Démarrage de l'Application

### 🎯 Démarrage Complet (Recommandé)

```bash
# Démarre toutes les applications en parallèle
npm run dev
```

Cette commande lance simultanément :
- 🔌 **API Backend** sur http://localhost:3000
- 👥 **Frontend Utilisateur** sur http://localhost:5173
- 🛡️ **Interface Admin** sur http://localhost:5174

### 🔧 Démarrage Sélectif

Si vous souhaitez démarrer les applications séparément :

```bash
# API Backend seulement
cd api && npm run dev

# Frontend utilisateur seulement
cd frontend && npm run dev

# Interface admin seulement
cd backend && npm run dev

# Frontend + API (sans admin)
npm run dev-frontend
```

## 🌐 URLs d'Accès

Une fois démarré, vous pouvez accéder aux différentes interfaces :

| Application | URL | Description |
|------------|-----|-------------|
| **API Backend** | http://localhost:3000 | API REST pour les données |
| **Frontend Utilisateur** | http://localhost:5173 | Interface pour clients, livreurs, commerçants, prestataires |
| **Interface Admin** | http://localhost:5174 | Panneau d'administration |

## 👥 Comptes de Test

### Utilisateurs Frontend (5 espaces)
- **Client** : client@ecodeli.com / password123
- **Livreur** : livreur@ecodeli.com / password123
- **Commerçant** : commercant@ecodeli.com / password123
- **Prestataire** : prestataire@ecodeli.com / password123

### Administrateur
- **Admin** : admin@ecodeli.com / admin123
- Accès via : http://localhost:5174/login

## 🏗️ Architecture du Projet

```
EcoDeli/
├── 📁 api/                 # Backend Express.js (Port 3000)
│   ├── controllers/        # Logique métier
│   ├── models/            # Modèles de données
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares
│   └── .env              # Configuration
├── 📁 frontend/           # Interface Utilisateur Vue.js (Port 5173)
│   ├── src/views/         # Pages par rôle
│   ├── src/components/    # Composants réutilisables
│   └── src/stores/       # Gestion d'état Pinia
├── 📁 backend/            # Interface Admin Vue.js (Port 5174)
│   ├── src/views/         # Pages d'administration
│   ├── src/components/    # Composants admin
│   └── src/stores/       # Stores admin
└── 📄 bdd.sql            # Schéma de base de données
```

## 🚦 États de l'Application

### ✅ Démarrage Réussi
Vous devriez voir ces messages dans la console :

```bash
[0] API EcoDeli démarrée sur http://localhost:3000
[1] ➜ Local: http://localhost:5173/
[2] ➜ Local: http://localhost:5174/
```

### ❌ Problèmes Courants

#### Base de données non connectée
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution :** Vérifiez que MySQL est démarré et que les paramètres dans `.env` sont corrects.

#### Port déjà utilisé
```
Error: listen EADDRINUSE :::3000
```
**Solution :** Fermez les autres applications utilisant ces ports ou modifiez les ports dans la configuration.

#### Dépendances manquantes
```
Module not found
```
**Solution :** Relancez `npm run install-all`

## 🔧 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre tout (API + Frontend + Admin) |
| `npm run dev-frontend` | Démarre API + Frontend utilisateur |
| `npm run dev-server` | Démarre uniquement l'API |
| `npm run dev-client` | Démarre uniquement le frontend |
| `npm run dev-admin` | Démarre uniquement l'interface admin |
| `npm run install-all` | Installe toutes les dépendances |

## 🎯 Prochaines Étapes

1. **Créer vos comptes** sur http://localhost:5173/register
2. **Explorer les 5 espaces utilisateur** selon votre rôle
3. **Tester l'interface admin** sur http://localhost:5174
4. **Consulter l'API** sur http://localhost:3000 pour voir les endpoints disponibles

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez que tous les prérequis sont installés
2. Assurez-vous que MySQL est démarré
3. Vérifiez que les ports 3000, 5173 et 5174 sont libres
4. Consultez les logs dans la console pour plus de détails

---

**Bon développement avec EcoDeli ! 🌱🚚**