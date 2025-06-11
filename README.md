# GreenDelivery - Plateforme de Livraison Écologique

Une plateforme collaborative de livraison de colis avec un thème vert, construite avec Vue.js et Node.js.

## Fonctionnalités

- 🌱 **Thème vert écologique** - Interface moderne avec des couleurs vertes
- 👥 **Système d'utilisateurs** - Inscription et connexion pour clients et livreurs
- 📦 **Création d'annonces** - Les clients peuvent créer des demandes de livraison
- 🚚 **Gestion des livraisons** - Suivi des annonces et des livraisons
- 💰 **Système de prix** - Prix proposés pour chaque livraison
- 📱 **Design responsive** - Compatible mobile et desktop

## Technologies utilisées

### Frontend
- Vue.js 3 (Composition API)
- Tailwind CSS
- Lucide Vue (icônes)
- Vite (build tool)

### Backend
- Node.js
- Express.js
- MySQL
- JWT (authentification)
- bcryptjs (hashage des mots de passe)

## Installation

### Prérequis
- Node.js (v16 ou plus récent)
- MySQL
- npm ou yarn

### 1. Cloner le projet
\`\`\`bash
git clone <repository-url>
cd green-delivery-platform
\`\`\`

### 2. Installer les dépendances
\`\`\`bash
npm run install-all
\`\`\`

### 3. Configuration de la base de données
1. Créer une base de données MySQL nommée `green_delivery`
2. Exécuter les scripts SQL dans l'ordre :
   - `scripts/01-create-database.sql`
   - `scripts/02-seed-data.sql`

### 4. Configuration de l'environnement
1. Copier le fichier `.env.example` vers `.env` dans le dossier `server/`
2. Modifier les variables d'environnement selon votre configuration :
\`\`\`env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=green_delivery
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
\`\`\`

### 5. Lancer l'application
\`\`\`bash
# Lancer le serveur et le client simultanément
npm run dev

# Ou lancer séparément :
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
\`\`\`

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000

## Structure du projet

\`\`\`
green-delivery-platform/
├── server/                 # Backend Node.js/Express
│   ├── app.js             # Point d'entrée du serveur
│   ├── package.json       # Dépendances backend
│   └── .env               # Variables d'environnement
├── client/                # Frontend Vue.js
│   ├── src/
│   │   ├── App.vue        # Composant principal
│   │   ├── main.js        # Point d'entrée Vue
│   │   └── style.css      # Styles Tailwind
│   ├── index.html         # Template HTML
│   ├── package.json       # Dépendances frontend
│   ├── vite.config.js     # Configuration Vite
│   └── tailwind.config.js # Configuration Tailwind
├── scripts/               # Scripts SQL
│   ├── 01-create-database.sql
│   └── 02-seed-data.sql
└── README.md
\`\`\`

## API Endpoints

### Authentification
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion

### Annonces
- `GET /api/annonces` - Liste des annonces publiques
- `POST /api/annonces` - Créer une annonce (authentifié)
- `GET /api/mes-annonces` - Mes annonces (authentifié)

### Catégories
- `GET /api/categories` - Liste des catégories

## Utilisation

### Pour les clients
1. S'inscrire en tant que "Client"
2. Se connecter
3. Créer une annonce de livraison
4. Suivre ses annonces dans le tableau de bord

### Pour les livreurs
1. S'inscrire en tant que "Livreur"
2. Se connecter
3. Consulter les annonces disponibles
4. Postuler pour des livraisons

## Développement

### Ajouter de nouvelles fonctionnalités
1. Backend : Ajouter des routes dans `server/app.js`
2. Frontend : Modifier `client/src/App.vue` ou créer de nouveaux composants
3. Base de données : Ajouter des scripts SQL dans le dossier `scripts/`

### Personnalisation du thème
Modifier les couleurs dans `client/tailwind.config.js` pour changer le thème vert.

## Licence

MIT License
