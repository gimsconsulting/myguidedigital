# 📦 Préparer votre Projet pour le Déploiement Hostinger

## Étape 1 : Créer une Archive ZIP de votre Projet

### ⚠️ Important : Exclure ces fichiers/dossiers

Ne pas inclure dans le ZIP :
- `node_modules/` (trop volumineux, sera réinstallé sur le serveur)
- `.env` (contient des secrets, à créer sur le serveur)
- `.next/` (sera reconstruit sur le serveur)
- `*.db` (base de données, sera créée sur le serveur)
- `uploads/` (fichiers uploadés, vide au début)
- `.git/` (optionnel, mais peut être exclu)
- `logs/` (sera créé automatiquement)

### ✅ Inclure ces fichiers/dossiers

- `frontend/` (sans node_modules et .next)
- `backend/` (sans node_modules)
- `docs/`
- `ecosystem.config.js`
- `deploy.sh`
- `package.json` (racine)
- Tous les fichiers de configuration (.gitignore, etc.)

---

## Méthode 1 : Créer le ZIP Manuellement (Windows)

### Option A : Via l'Explorateur Windows

1. **Ouvrez l'Explorateur de fichiers**
2. **Allez dans** `C:\Users\conta\projet egeed`
3. **Sélectionnez** les dossiers et fichiers suivants :
   - `frontend` (mais PAS le dossier `node_modules` et `.next` à l'intérieur)
   - `backend` (mais PAS le dossier `node_modules` à l'intérieur)
   - `docs`
   - `ecosystem.config.js`
   - `deploy.sh`
   - `package.json`
   - `.gitignore`
   - `README.md`
   - Tous les fichiers `.md` à la racine

4. **Clic droit** → **Envoyer vers** → **Dossier compressé (ZIP)**

### Option B : Via PowerShell (Recommandé)

```powershell
# Aller dans le dossier du projet
cd "C:\Users\conta\projet egeed"

# Créer un dossier temporaire pour le déploiement
New-Item -ItemType Directory -Path "deploy-temp" -Force

# Copier les fichiers nécessaires
Copy-Item -Path "frontend" -Destination "deploy-temp\frontend" -Recurse -Exclude "node_modules",".next"
Copy-Item -Path "backend" -Destination "deploy-temp\backend" -Recurse -Exclude "node_modules"
Copy-Item -Path "docs" -Destination "deploy-temp\docs" -Recurse
Copy-Item -Path "ecosystem.config.js","deploy.sh","package.json",".gitignore","README.md" -Destination "deploy-temp\"

# Créer le ZIP
Compress-Archive -Path "deploy-temp\*" -DestinationPath "my-guidedigital-deploy.zip" -Force

# Nettoyer
Remove-Item -Path "deploy-temp" -Recurse -Force

Write-Host "✅ Archive créée : my-guidedigital-deploy.zip"
```

---

## Méthode 2 : Script Automatique

Créez un fichier `create-deploy-zip.ps1` :

```powershell
# Script pour créer l'archive de déploiement
$projectPath = "C:\Users\conta\projet egeed"
$tempDir = "$projectPath\deploy-temp"
$zipFile = "$projectPath\my-guidedigital-deploy.zip"

# Nettoyer si existe déjà
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }

# Créer le dossier temporaire
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "📦 Copie des fichiers..."

# Copier frontend (exclure node_modules et .next)
Write-Host "  - Frontend..."
$frontendDest = "$tempDir\frontend"
New-Item -ItemType Directory -Path $frontendDest -Force | Out-Null
Get-ChildItem "$projectPath\frontend" -Exclude "node_modules",".next" | Copy-Item -Destination $frontendDest -Recurse

# Copier backend (exclure node_modules)
Write-Host "  - Backend..."
$backendDest = "$tempDir\backend"
New-Item -ItemType Directory -Path $backendDest -Force | Out-Null
Get-ChildItem "$projectPath\backend" -Exclude "node_modules" | Copy-Item -Destination $backendDest -Recurse

# Copier docs
Write-Host "  - Documentation..."
Copy-Item "$projectPath\docs" -Destination "$tempDir\docs" -Recurse

# Copier les fichiers racine
Write-Host "  - Fichiers racine..."
$rootFiles = @("ecosystem.config.js", "deploy.sh", "package.json", ".gitignore", "README.md")
foreach ($file in $rootFiles) {
    if (Test-Path "$projectPath\$file") {
        Copy-Item "$projectPath\$file" -Destination "$tempDir\$file"
    }
}

# Créer le ZIP
Write-Host "📦 Création de l'archive..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Nettoyer
Remove-Item $tempDir -Recurse -Force

Write-Host "✅ Archive créée : $zipFile"
Write-Host "📊 Taille : $([math]::Round((Get-Item $zipFile).Length / 1MB, 2)) MB"
```

Exécutez-le :
```powershell
cd "C:\Users\conta\projet egeed"
.\create-deploy-zip.ps1
```

---

## Vérification de l'Archive

Avant d'uploader, vérifiez que votre ZIP contient :

```
my-guidedigital-deploy.zip
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── i18n/
│   ├── package.json
│   ├── next.config.js
│   └── ... (SANS node_modules et .next)
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ... (SANS node_modules)
├── docs/
├── ecosystem.config.js
├── deploy.sh
├── package.json
└── README.md
```

---

## Taille Attendue

Votre ZIP devrait faire environ **5-15 MB** (sans node_modules).

Si c'est beaucoup plus gros, vérifiez que vous avez bien exclu `node_modules` et `.next`.

---

## Prochaine Étape

Une fois le ZIP créé :
1. Allez sur l'interface Hostinger
2. Glissez-déposez le fichier ZIP
3. Suivez les instructions pour extraire et configurer
