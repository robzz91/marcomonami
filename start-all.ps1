# Script PowerShell pour démarrer toute l'application EcoDeli
Write-Host "🚀 Démarrage de l'application EcoDeli complète..." -ForegroundColor Green

# Fonction pour vérifier et installer les dépendances
function Install-Dependencies {
    param([string]$folder, [string]$name)
    
    Write-Host "📦 Vérification des dépendances $name..." -ForegroundColor Yellow
    Set-Location -Path $folder
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installation des dépendances $name..." -ForegroundColor Yellow
        npm install
    }
    
    Set-Location -Path ".."
}

# Installer les dépendances
Install-Dependencies "api" "API"
Install-Dependencies "frontend" "Frontend"
Install-Dependencies "backend" "Admin"

# Démarrer tous les services
Write-Host "🌐 Démarrage de tous les services..." -ForegroundColor Cyan
Write-Host "API: http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White  
Write-Host "Admin: http://localhost:5174" -ForegroundColor White

npm run dev