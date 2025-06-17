EcoDeli

Technologies utilisées

Frontend :
- Vue.js 


Backend :
Vue.js

Installation

Prérequis :
- Node.js
- MySQL
- npm ou yarn

1. Cloner le projet

git clone https://github.com/robzz91/PA_2A

### 2. Installer les dépendances

npm run install-all


### 3. Configuration de la base de données
1. Créer une base de données MySQL nommée `ecodeli`
2. Exécuter les scripts SQL dans l'ordre :
   - `scripts/01-create-database.sql`
   - `scripts/02-seed-data.sql`

### 4. Configuration de l'environnement
1. Copier le fichier `.env.example` vers `.env` dans le dossier `server/`
2. Modifier les variables d'environnement selon votre configuration :
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=ecodeli
PORT=3306

### 5. Lancer l'application
Lancer le serveur et le client simultanément
npm run dev

Ou lancer séparément :
Terminal 1 - Backend
npm run server

Terminal 2 - Frontend
npm run client

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000
Structure du projet

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
