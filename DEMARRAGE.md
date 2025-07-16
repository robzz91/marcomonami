# Guide de démarrage - EcoDeli

## 🚀 Environnement maintenant fonctionnel !

### ✅ **Services en cours d'exécution :**
- **API** : http://localhost:3000 ✅
- **Frontend** : http://localhost:5173 ✅

## 📋 **Démarrage recommandé**

### Option 1 : Script automatique
```bash
cd /mnt/c/Users/robin/Desktop/cours/2A1/PA2025
./start_dev.sh
```

### Option 2 : Démarrage manuel (recommandé pour debug)

1. **Démarrer l'API** (Terminal 1) :
```bash
cd /mnt/c/Users/robin/Desktop/cours/2A1/PA2025/api
npm start
```

2. **Démarrer le frontend** (Terminal 2) :
```bash
cd /mnt/c/Users/robin/Desktop/cours/2A1/PA2025/frontend  
npm run dev
```

## ⚠️ **Problème identifié avec `npm run dev` à la racine**

Le script `npm run dev` dans le package.json racine essaie de démarrer :
- L'API (port 3000)
- Le frontend (port 5173) 
- Le backend admin (port non défini)

Cela crée des conflits et empêche le frontend de démarrer correctement.

## 🎯 **Tester maintenant**

1. **Ouvrir le frontend** : http://localhost:5173
2. **Se connecter** avec un compte existant ou créer un nouveau compte
3. **Tester la création d'annonces** :
   - Aller dans "Mes annonces"
   - Créer une nouvelle annonce
   - Vérifier qu'elle apparaît en base de données

## 🔍 **Vérification des services**

### API (port 3000) :
```bash
curl http://localhost:3000
# Doit retourner un JSON avec les endpoints disponibles
```

### Frontend (port 5173) :
```bash
curl -I http://localhost:5173  
# Doit retourner HTTP/1.1 200 OK
```

## 📊 **Statut actuel**

| Service | Port | Statut | PID |
|---------|------|--------|-----|
| API | 3000 | ✅ Running | 24034 |
| Frontend | 5173 | ✅ Running | 24354 |

## 🛑 **Arrêter les services**

```bash
# Arrêter l'API
pkill -f "node app.js"

# Arrêter le frontend  
pkill -f "vite"

# Ou arrêter tout
pkill -f "node app.js" && pkill -f "vite"
```

## 💡 **Conseils**

1. **Évitez `npm run dev` à la racine** - utilisez les scripts individuels
2. **Vérifiez les ports** avec `ss -tlnp | grep -E ":300[0-9]|:517[0-9]"`
3. **Consultez les logs** si quelque chose ne fonctionne pas
4. **Redémarrez l'API** après modifications du code backend

L'environnement est maintenant prêt pour les tests ! 🎉