# Script PowerShell pour démarrer le frontend EcoDeli
Write-Host "🚀 Démarrage du frontend EcoDeli..." -ForegroundColor Green

# Aller dans le dossier frontend
Set-Location -Path "frontend"

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Démarrer le serveur de développement
Write-Host "🌐 Démarrage sur http://localhost:5173" -ForegroundColor Cyan
npm run dev