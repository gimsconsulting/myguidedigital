# 📊 Exporter la Base de Données pour Hostinger

## Option 1 : Exporter SQLite (Base de Données Actuelle)

### Étape 1 : Localiser le Fichier de Base de Données

Votre base de données SQLite se trouve dans :
```
backend/prisma/dev.db
```

### Étape 2 : Copier le Fichier

**Méthode Simple :**
1. Ouvrez l'Explorateur de fichiers
2. Allez dans `C:\Users\conta\projet egeed\backend\prisma\`
3. Copiez le fichier `dev.db`
4. Collez-le dans le dossier racine de votre projet (pour l'inclure dans le ZIP)

**Via PowerShell :**
```powershell
cd "C:\Users\conta\projet egeed"
Copy-Item "backend\prisma\dev.db" -Destination "dev.db"
```

### Étape 3 : Créer un Nouveau ZIP avec la Base de Données

```powershell
cd "C:\Users\conta\projet egeed"
.\create-deploy-zip.ps1
# Puis ajoutez manuellement dev.db au ZIP ou recréez-le
```

---

## Option 2 : Exporter en SQL (Recommandé pour la Migration)

### Étape 1 : Exporter la Structure et les Données

Créez un fichier `export-database.ps1` :

```powershell
# Exporter la base de données SQLite en SQL
$dbPath = "backend\prisma\dev.db"
$sqlFile = "database-export.sql"

# Utiliser sqlite3 pour exporter
# Si sqlite3 n'est pas installé, utilisez cette méthode alternative
Write-Host "Export de la base de donnees..."

# Méthode alternative : Utiliser Prisma pour générer le schéma
cd backend
npx prisma db pull
npx prisma format
cd ..
```

### Étape 2 : Exporter avec Prisma Studio (Interface Graphique)

```powershell
cd backend
npx prisma studio
```

Puis exportez manuellement les données depuis l'interface.

---

## Option 3 : Créer une Base de Données Vide (Pour Production)

### Si vous voulez partir de zéro en production :

1. **Ne pas inclure dev.db** (base de données de développement)
2. Hostinger créera une nouvelle base de données vide
3. Les migrations Prisma créeront la structure automatiquement

**Avantages :**
- Base de données propre pour la production
- Pas de données de test
- Structure créée automatiquement par Prisma

---

## ⚠️ Important : Données de Développement vs Production

### ⚠️ Attention aux Données de Développement

Si votre `dev.db` contient :
- Des comptes de test
- Des données de développement
- Des mots de passe de test

**Ne l'utilisez PAS en production !**

### ✅ Recommandation

Pour la production, mieux vaut :
1. **Créer une nouvelle base de données vide** sur Hostinger
2. **Utiliser Prisma pour créer la structure** :
   ```bash
   npx prisma generate
   npx prisma db push
   ```
3. **Créer un compte admin** manuellement ou via script

---

## 📋 Ce que Hostinger Attend

Hostinger peut accepter :
- **Fichier SQLite** : `.db` ou `.sqlite`
- **Fichier SQL** : `.sql` (dump SQL)
- **Fichier SQL compressé** : `.sql.gz`

---

## 🚀 Solution Rapide pour Votre Cas

### Si vous voulez juste déployer rapidement :

1. **Copiez dev.db** dans le ZIP
2. **Ou créez un dump SQL** :

```powershell
# Si vous avez sqlite3 installé
cd "C:\Users\conta\projet egeed\backend\prisma"
sqlite3 dev.db .dump > ..\..\database-export.sql
```

3. **Ajoutez le fichier au ZIP** ou uploadez-le séparément sur Hostinger

---

## 🔄 Alternative : Utiliser PostgreSQL sur Hostinger

Si Hostinger propose PostgreSQL (recommandé pour la production) :

1. **Ne pas uploader dev.db**
2. **Configurer PostgreSQL** sur Hostinger
3. **Mettre à jour DATABASE_URL** dans `.env` :
   ```
   DATABASE_URL="postgresql://user:password@host:5432/myguidedigital"
   ```
4. **Exécuter les migrations** :
   ```bash
   npx prisma migrate deploy
   ```

---

## ✅ Action Immédiate

**Pour continuer maintenant :**

1. **Copiez le fichier dev.db** :
   ```powershell
   cd "C:\Users\conta\projet egeed"
   Copy-Item "backend\prisma\dev.db" -Destination "dev.db"
   ```

2. **Uploadez dev.db séparément** sur Hostinger, ou

3. **Créez un nouveau ZIP** incluant dev.db

**Quelle option préférez-vous ?**
