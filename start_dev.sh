#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement EcoDeli"
echo "======================================================="

# Tuer les anciens processus si ils existent
echo "🧹 Nettoyage des anciens processus..."
pkill -f "node app.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Démarrer l'API en arrière-plan
echo "🔧 Démarrage de l'API (port 3000)..."
cd /mnt/c/Users/robin/Desktop/cours/2A1/PA2025/api
npm start > api.log 2>&1 &
API_PID=$!
echo "   API démarrée avec PID: $API_PID"

# Attendre que l'API soit prête
sleep 3

# Démarrer le frontend en arrière-plan
echo "🎨 Démarrage du frontend (port 5173)..."
cd /mnt/c/Users/robin/Desktop/cours/2A1/PA2025/frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend démarré avec PID: $FRONTEND_PID"

# Attendre que le frontend soit prêt
sleep 5

echo ""
echo "✅ Environnement de développement démarré !"
echo ""
echo "🔗 URLs disponibles :"
echo "   📱 Frontend : http://localhost:5173"
echo "   🔧 API     : http://localhost:3000"
echo ""
echo "📋 Pour voir les logs :"
echo "   API      : tail -f api/api.log"
echo "   Frontend : tail -f frontend/frontend.log"
echo ""
echo "⚠️  Pour arrêter les services :"
echo "   pkill -f 'node app.js' && pkill -f 'vite'"
echo ""
echo "🎯 Prêt pour les tests !"

# Garder le script actif
echo "Appuyez sur Ctrl+C pour arrêter tous les services..."
trap "echo 'Arrêt des services...'; kill $API_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait