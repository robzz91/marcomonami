# Script de correction pour Windows
Write-Host "🔧 Correction des dépendances frontend pour Windows..." -ForegroundColor Yellow

# Sauvegarder le répertoire actuel
$originalPath = Get-Location

# Aller dans le dossier frontend
Set-Location -Path "frontend"

# Supprimer les anciens fichiers
Write-Host "🗑️ Suppression des anciens fichiers..." -ForegroundColor Red
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
}

# Réinstaller
Write-Host "📦 Réinstallation des dépendances..." -ForegroundColor Green
npm install

# Vérifier l'installation
Write-Host "✅ Vérification de l'installation..." -ForegroundColor Cyan
npx vite --version

Write-Host "✨ Installation terminée !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser 'npm run dev' pour démarrer le frontend" -ForegroundColor White

# Retourner au répertoire original
Set-Location -Path $originalPath