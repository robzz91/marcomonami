# Script PowerShell pour démarrer EcoDeli sur Windows
Write-Host "🚀 Démarrage d'EcoDeli..." -ForegroundColor Green

# Fonction pour ouvrir un nouveau terminal
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "▶️  Démarrage $Name..." -ForegroundColor $Color
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; Write-Host '🌟 $Name' -ForegroundColor $Color; $Command"
}

# Chemin de base
$basePath = Get-Location

# Démarrer l'API
Start-Service -Name "API Backend (Port 3000)" -Path "$basePath\api" -Command "npm run dev" -Color "Yellow"

# Attendre 2 secondes
Start-Sleep -Seconds 2

# Démarrer le Frontend
Start-Service -Name "Frontend (Port 5173)" -Path "$basePath\frontend" -Command "npm run dev" -Color "Cyan"

# Démarrer l'Admin
Start-Service -Name "Admin (Port 5174)" -Path "$basePath\backend" -Command "npm run dev" -Color "Magenta"

# Afficher les URLs
Write-Host "`n✅ Services démarrés !" -ForegroundColor Green
Write-Host "📍 URLs d'accès :" -ForegroundColor White
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Admin    : http://localhost:5174" -ForegroundColor Magenta
Write-Host "   API      : http://localhost:3000" -ForegroundColor Yellow

Write-Host "`n💡 Astuce : Gardez tous les terminaux ouverts" -ForegroundColor Gray