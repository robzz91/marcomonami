#!/bin/bash
# Script pour synchroniser automatiquement les fichiers API avec Docker

echo "🔄 Synchronisation des fichiers API..."

# Copier tous les fichiers du dossier controllers
docker cp /mnt/c/Users/robin/Desktop/Cours/2A1/PA2025/api/controllers/. ecodeli-api:/app/controllers/

# Copier tous les fichiers du dossier models
docker cp /mnt/c/Users/robin/Desktop/Cours/2A1/PA2025/api/models/. ecodeli-api:/app/models/

# Copier tous les fichiers du dossier routes
docker cp /mnt/c/Users/robin/Desktop/Cours/2A1/PA2025/api/routes/. ecodeli-api:/app/routes/

# Copier tous les fichiers du dossier middleware
docker cp /mnt/c/Users/robin/Desktop/Cours/2A1/PA2025/api/middleware/. ecodeli-api:/app/middleware/

echo "✅ Fichiers synchronisés !"
echo "🔄 Redémarrage de l'API..."

# Redémarrer le container API pour appliquer les changements
docker-compose restart api

echo "✅ API redémarrée avec les nouveaux fichiers !"