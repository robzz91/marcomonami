# 🌱 EcoDeli - Plateforme de Livraison Écologique

EcoDeli est une plateforme complète de livraison écologique qui connecte livreurs, commerçants, clients et prestataires dans un écosystème durable.

## 🎯 Fonctionnalités

### 👥 5 Espaces Utilisateur
- **Client** : Recherche et réservation de services
- **Livreur** : Gestion des trajets et livraisons écologiques
- **Commerçant** : Gestion des contrats et annonces
- **Prestataire** : Gestion des services et disponibilités
- **Administrateur** : Modération et gestion de la plateforme

### 🛡️ Interface d'Administration Dédiée
- Gestion complète des utilisateurs
- Tableaux de bord avec statistiques temps réel
- Modération et validation de contenu
- Rapports et analyses détaillées

## 🏗️ Technologies Utilisées

### Frontend Utilisateur (Port 5173)
- **Vue.js 3** avec Composition API
- **Vite** comme bundler
- **Tailwind CSS** pour le design
- **Pinia** pour la gestion d'état
- **Vue Router** avec guards d'authentification
- **Axios** pour les appels API

### Interface Admin (Port 5174)
- **Vue.js 3** avec interface dédiée
- **Chart.js** pour les graphiques
- **Design system admin** professionnel
- **Authentification sécurisée** pour admins uniquement

### Backend API (Port 3000)
- **Node.js** avec **Express.js**
- **MySQL** avec modèles de données complets
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **Architecture MVC** avec middleware

## 🚀 Installation Rapide

### 1. Installer les dépendances
```bash
npm run install-all
```

### 2. Configurer la base de données
```bash
# Créer la base de données
CREATE DATABASE ecodeli;

# Importer le schéma
mysql -u root -p ecodeli < bdd.sql
```

### 3. Configuration
```bash
# Copier et configurer le fichier .env
cp api/.env.example api/.env
# Modifier api/.env avec vos paramètres MySQL
```

### 4. Démarrer l'application
```bash
# Démarre tout : API + Frontend + Admin
npm run dev
```

## 🌐 Accès aux Applications

| Application | Port | URL | Description |
|------------|------|-----|-------------|
| **Frontend Utilisateur** | 5173 | http://localhost:5173 | Interface pour tous les utilisateurs |
| **Interface Admin** | 5174 | http://localhost:5174 | Panneau d'administration |
| **API Backend** | 3000 | http://localhost:3000 | API REST |

## 📁 Structure du Projet

```
EcoDeli/
├── 📁 api/                 # Backend Express.js
│   ├── controllers/        # Logique métier par rôle
│   ├── models/            # Modèles de données
│   ├── routes/            # Routes API organisées
│   ├── middleware/        # Auth, validation, CORS
│   └── .env              # Configuration
├── 📁 frontend/           # Interface Utilisateur Vue.js
│   ├── src/views/         # Pages par rôle utilisateur
│   ├── src/components/    # Composants réutilisables
│   ├── src/stores/       # Stores Pinia
│   └── src/layouts/      # Layouts avec navigation
├── 📁 backend/            # Interface Admin Vue.js
│   ├── src/views/         # Pages d'administration
│   ├── src/components/    # Composants admin spécialisés
│   └── src/stores/       # Stores admin sécurisés
├── 📄 bdd.sql            # Schéma complet (30+ tables)
├── 📄 GUIDE_DEMARRAGE.md # Guide détaillé
└── 📄 CLAUDE.md          # Documentation technique
```

## 🎮 Scripts Disponibles

```bash
# Démarrage
npm run dev              # Tout démarrer
npm run dev-frontend     # API + Frontend utilisateur
npm run dev-server       # API seulement
npm run dev-client       # Frontend seulement
npm run dev-admin        # Interface admin seulement

# Installation
npm run install-all      # Installer toutes les dépendances
npm run install-server   # API seulement
npm run install-client   # Frontend seulement
npm run install-admin    # Interface admin seulement
```

## 🔑 Comptes de Test

### Utilisateurs (Frontend)
- **Client** : client@ecodeli.com / password123
- **Livreur** : livreur@ecodeli.com / password123
- **Commerçant** : commercant@ecodeli.com / password123
- **Prestataire** : prestataire@ecodeli.com / password123

### Administrateur (Interface Admin)
- **Admin** : admin@ecodeli.com / admin123

## 🎨 Design

- **Thème Écologique** : Palette verte pour le frontend utilisateur
- **Interface Admin** : Design professionnel avec palette grise/bleue
- **Responsive** : Compatible mobile et desktop
- **UX Optimisée** : Navigation intuitive et feedback utilisateur

## 🔒 Sécurité

- **Authentification JWT** avec refresh tokens
- **Validation** des données côté client et serveur
- **Protection CORS** configurée
- **Hashage bcrypt** pour les mots de passe
- **Guards de navigation** basés sur les rôles
- **Interface admin sécurisée** avec authentification dédiée

## 📊 Base de Données

Le schéma inclut **30+ tables** couvrant :
- Gestion complète des utilisateurs et rôles
- Système de livraisons et trajets
- Gestion des services et prestations
- Système de messaging et notifications
- Facturation et paiements
- Évaluations et commentaires

## 🆘 Support

Consultez le **GUIDE_DEMARRAGE.md** pour des instructions détaillées.

En cas de problème :
1. Vérifiez que MySQL est démarré
2. Assurez-vous que les ports 3000, 5173 et 5174 sont libres
3. Relancez `npm run install-all` si nécessaire

---

**EcoDeli - Pour un avenir plus vert ! 🌱🚚**