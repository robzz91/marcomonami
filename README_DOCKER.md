# 🐳 EcoDeli - Déploiement Docker

Guide complet pour déployer EcoDeli avec Docker et Docker Compose.

## 🚀 Démarrage Rapide

### Prérequis
- Docker Engine 20.10+
- Docker Compose 2.0+

### Lancer toute la plateforme
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Suivre les logs
docker-compose logs -f
```

## 🌐 Accès aux Applications

Une fois les conteneurs démarrés :

- **Frontend Utilisateur** : http://localhost:5173
- **Interface Admin** : http://localhost:5174
- **API Backend** : http://localhost:3000
- **Base de données MySQL** : localhost:3306

## 📋 Services Disponibles

### `mysql` - Base de données
- **Image** : mysql:8.0
- **Port** : 3306
- **Base** : ecodeli
- **Utilisateur** : ecodeli_user
- **Mot de passe** : ecodeli_password

### `api` - Backend API
- **Build** : ./api/Dockerfile
- **Port** : 3000
- **Healthcheck** : GET /api/test-db

### `frontend` - Interface Utilisateur
- **Build** : ./frontend/Dockerfile
- **Port** : 5173 (mappé vers 80 interne)
- **Serveur** : Nginx

### `admin` - Interface Administration
- **Build** : ./backend/Dockerfile
- **Port** : 5174 (mappé vers 80 interne)
- **Serveur** : Nginx

## 🔧 Commandes Utiles

### Gestion des services
```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart api

# Voir les logs d'un service
docker-compose logs -f frontend

# Exécuter une commande dans un conteneur
docker-compose exec api sh
```

### Reconstruction des images
```bash
# Reconstruire toutes les images
docker-compose build

# Reconstruire une image spécifique
docker-compose build api

# Reconstruire sans cache
docker-compose build --no-cache
```

### Gestion de la base de données
```bash
# Accéder à MySQL
docker-compose exec mysql mysql -u ecodeli_user -p ecodeli

# Sauvegarder la base
docker-compose exec mysql mysqldump -u ecodeli_user -p ecodeli > backup.sql

# Restaurer une sauvegarde
docker-compose exec -T mysql mysql -u ecodeli_user -p ecodeli < backup.sql
```

## 🔐 Configuration de Sécurité

### Variables d'environnement à modifier en production :
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `SESSION_SECRET`

### Fichier `.env` pour la production :
```bash
# Créer un fichier .env à la racine
MYSQL_ROOT_PASSWORD=votre_mot_de_passe_root_securise
MYSQL_PASSWORD=votre_mot_de_passe_user_securise
JWT_SECRET=votre_cle_jwt_tres_longue_et_securisee
SESSION_SECRET=votre_cle_session_tres_longue_et_securisee
```

## 🏗️ Architecture Docker

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Admin       │    │      API        │
│  (Nginx:80)     │    │   (Nginx:80)    │    │   (Node:3000)   │
│  Port: 5173     │    │   Port: 5174    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │      MySQL      │
                    │   (Port: 3306)  │
                    └─────────────────┘
```

## 🐛 Dépannage

### Vérifier la santé des services
```bash
docker-compose ps
docker-compose logs mysql
docker-compose logs api
```

### Problèmes courants

**La base de données ne démarre pas :**
```bash
docker-compose down -v
docker-compose up -d mysql
```

**L'API ne se connecte pas à la base :**
```bash
docker-compose logs api
docker-compose restart api
```

**Les frontends ne chargent pas :**
```bash
docker-compose build frontend admin
docker-compose up -d frontend admin
```

## 📊 Monitoring

### Surveiller les ressources
```bash
# Utilisation des ressources
docker stats

# Espace disque des volumes
docker system df

# Nettoyer les ressources inutilisées
docker system prune -a
```