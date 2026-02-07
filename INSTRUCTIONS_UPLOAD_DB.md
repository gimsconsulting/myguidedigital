# 📤 Instructions pour Uploader la Base de Données sur Hostinger

## ✅ Fichier Prêt

Votre fichier de base de données a été copié à la racine de votre projet :
- **Fichier** : `C:\Users\conta\projet egeed\dev.db`
- **Taille** : 112 KB
- **Type** : SQLite Database

---

## 🚀 Méthode 1 : Upload Séparé (Recommandé)

### Sur l'interface Hostinger :

1. **Trouvez la section** "Importer votre base de données" ou "Upload Database"
2. **Cliquez sur "Parcourir"** ou glissez-déposez
3. **Sélectionnez le fichier** : `C:\Users\conta\projet egeed\dev.db`
4. **Cliquez sur "Upload"** ou "Importer"

---

## 🚀 Méthode 2 : Inclure dans le ZIP

Si Hostinger accepte plusieurs fichiers :

1. **Créez un nouveau ZIP** incluant dev.db :
   ```powershell
   cd "C:\Users\conta\projet egeed"
   # Le fichier dev.db est déjà à la racine
   # Recréez le ZIP avec create-deploy-zip.ps1
   ```

2. **Ou créez un ZIP juste pour la base de données** :
   ```powershell
   Compress-Archive -Path "dev.db" -DestinationPath "database.zip" -Force
   ```

---

## ⚠️ Important : Données de Développement

Votre `dev.db` contient probablement :
- Des comptes de test
- Des données de développement
- Des mots de passe de test

### Pour la Production :

**Option A : Utiliser la base de données de dev** (rapide mais pas idéal)
- ✅ Fonctionne immédiatement
- ⚠️ Contient des données de test

**Option B : Créer une base de données vide** (recommandé)
- ✅ Base de données propre
- ✅ Pas de données de test
- ⚠️ Il faudra recréer les comptes admin

---

## 🔄 Si vous choisissez une Base Vide

Sur Hostinger, après le déploiement :

1. **Connectez-vous en SSH**
2. **Allez dans votre projet** :
   ```bash
   cd /var/www/votre-projet/backend
   ```
3. **Créez la structure** :
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. **Créez un compte admin** (si vous avez un script) :
   ```bash
   npm run make-admin
   ```

---

## ✅ Action Immédiate

**Pour continuer maintenant :**

1. **Sur Hostinger**, cherchez la section pour uploader la base de données
2. **Uploadez le fichier** : `C:\Users\conta\projet egeed\dev.db`
3. **Ou** créez un ZIP avec dev.db et uploadez-le

---

## 📋 Vérification

Après l'upload, Hostinger devrait :
- ✅ Confirmer l'import de la base de données
- ✅ Vous demander de configurer la connexion
- ✅ Vous permettre de continuer le déploiement

---

**Le fichier `dev.db` est prêt à être uploadé !** 🎉

Dites-moi ce qui s'affiche sur Hostinger après l'upload de la base de données.
