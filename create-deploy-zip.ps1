# Script pour creer l'archive de deploiement pour Hostinger
$projectPath = Get-Location
$tempDir = "$projectPath\deploy-temp"
$zipFile = "$projectPath\my-guidedigital-deploy.zip"

# Nettoyer si existe deja
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }

# Creer le dossier temporaire
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Creation de l'archive de deploiement..."

# Copier frontend (exclure node_modules et .next)
Write-Host "  - Copie du frontend..."
$frontendDest = "$tempDir\frontend"
New-Item -ItemType Directory -Path $frontendDest -Force | Out-Null
Get-ChildItem "$projectPath\frontend" | Where-Object { $_.Name -notin @("node_modules", ".next") } | Copy-Item -Destination $frontendDest -Recurse

# Copier backend (exclure node_modules, uploads, *.db)
Write-Host "  - Copie du backend..."
$backendDest = "$tempDir\backend"
New-Item -ItemType Directory -Path $backendDest -Force | Out-Null
Get-ChildItem "$projectPath\backend" | Where-Object { $_.Name -notin @("node_modules", "uploads") -and $_.Extension -ne ".db" } | Copy-Item -Destination $backendDest -Recurse

# Copier docs
Write-Host "  - Copie de la documentation..."
if (Test-Path "$projectPath\docs") {
    Copy-Item "$projectPath\docs" -Destination "$tempDir\docs" -Recurse
}

# Copier les fichiers racine importants
Write-Host "  - Copie des fichiers racine..."
$rootFiles = @("ecosystem.config.js", "deploy.sh", "package.json", ".gitignore", "README.md", "QUICK_DEPLOY.md", "PREPARER_DEPLOIEMENT.md")
foreach ($file in $rootFiles) {
    if (Test-Path "$projectPath\$file") {
        Copy-Item "$projectPath\$file" -Destination "$tempDir\$file"
    }
}

# Creer le ZIP
Write-Host "Creation du ZIP..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Nettoyer
Remove-Item $tempDir -Recurse -Force

# Afficher le resultat
$size = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
Write-Host ""
Write-Host "Archive creee avec succes !"
Write-Host "Fichier : $zipFile"
Write-Host "Taille : $size MB"
Write-Host ""
Write-Host "Vous pouvez maintenant uploader ce fichier sur Hostinger !"
