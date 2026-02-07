# 🚀 Déploiement sur Hostinger - Guide Étape par Étape

## 📋 Ce qui est déjà fait

✅ Base de données MySQL créée sur Hostinger
✅ Schema Prisma configuré pour MySQL
✅ Fichier .env local mis à jour

## 🎯 Prochaines Étapes

### Étape 1 : Accéder au Gestionnaire de Fichiers

1. Dans votre panneau Hostinger, cliquez sur **"Fichiers"** dans le menu de gauche
2. Ou cliquez sur **"Gestionnaire de fichiers"** dans le tableau de bord

### Étape 2 : Transférer vos Fichiers

#### Option A : Via le Gestionnaire de Fichiers Hostinger

1. Allez dans le dossier `public_html` (ou le dossier racine de votre site)
2. Cliquez sur **"Upload"** ou glissez-déposez
3. Uploadez le fichier `my-guidedigital-deploy.zip` que nous avons créé
4. **Extrayez le ZIP** : Clic droit → "Extract" ou "Extraire"

#### Option B : Via FTP (FileZilla)

1. Dans Hostinger, allez dans **"Fichiers"** → **"FTP Accounts"** ou **"Comptes FTP"**
2. Notez les identifiants FTP :
   - Serveur FTP
   - Nom d'utilisateur
   - Mot de passe
3. Utilisez FileZilla pour vous connecter
4. Transférez tous les fichiers dans `public_html`

### Étape 3 : Accéder au Terminal SSH (si disponible)

1. Dans Hostinger, cherchez **"Terminal"**, **"SSH"**, ou **"Avancé"** → **"Terminal"**
2. Connectez-vous au terminal
3. Naviguez vers votre projet :
   ```bash
   cd public_html
   # ou
   cd /home/u513978936/domains/myg guidedigital.com/public_html
   ```

### Étape 4 : Installer Node.js (si pas déjà installé)

```bash
# Vérifier si Node.js est installé
node --version

# Si pas installé, installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Étape 5 : Installer les Dépendances

```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install --production
```

### Étape 6 : Configurer le Fichier .env sur le Serveur

1. Créez `backend/.env` sur le serveur :
   ```bash
   cd backend
   nano .env
   ```

2. Collez cette configuration (adaptez avec vos vraies valeurs) :
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL="mysql://u513978936_myguideuser:VOTRE_MOT_DE_PASSE@localhost:3306/u513978936_myguidedigital"
   JWT_SECRET="34cba81166489ed474ec1c7eac77ba0ba022f2cbc8c2c779f20da76f7e5383e5"
   JWT_EXPIRES_IN="7d"
   HOST=0.0.0.0
   FRONTEND_URL=https://myguidedigital.com
   UPLOAD_DIR=./uploads
   CHAT_DOCS_DIR=./uploads/chat-documents
   ```

3. Sauvegardez : `Ctrl + X`, puis `Y`, puis `Enter`

### Étape 7 : Créer les Dossiers Nécessaires

```bash
cd backend
mkdir -p uploads
mkdir -p uploads/chat-documents
chmod -R 755 uploads
```

### Étape 8 : Générer Prisma et Créer les Tables

```bash
cd backend
npx prisma generate
npx prisma db push
```

### Étape 9 : Build du Frontend

```bash
cd frontend
npm run build
```

### Étape 10 : Installer PM2 (Gestionnaire de Processus)

```bash
sudo npm install -g pm2
```

### Étape 11 : Démarrer l'Application avec PM2

```bash
# Depuis la racine du projet
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Étape 12 : Configurer Nginx (Reverse Proxy)

Si vous avez accès à Nginx :

1. Créez la configuration :
   ```bash
   sudo nano /etc/nginx/sites-available/my-guidedigital
   ```

2. Collez cette configuration :
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.myg guidedigital.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   
   # Frontend
   server {
       listen 80;
       server_name myguidedigital.com www.myg guidedigital.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. Activer :
   ```bash
   sudo ln -s /etc/nginx/sites-available/my-guidedigital /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## ⚠️ Si vous n'avez pas accès SSH

Si Hostinger ne vous donne pas accès SSH, vous devrez :

1. **Utiliser le Gestionnaire de Fichiers** pour transférer les fichiers
2. **Créer le fichier .env** via le gestionnaire de fichiers
3. **Contacter le support Hostinger** pour :
   - Installer Node.js
   - Exécuter les commandes Prisma
   - Configurer PM2

## 🔍 Vérification

```bash
# Vérifier que les services tournent
pm2 list

# Voir les logs
pm2 logs

# Tester le backend
curl http://localhost:3001/health
```

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs : `pm2 logs`
2. Vérifiez que Node.js est installé : `node --version`
3. Vérifiez la connexion MySQL : `npx prisma db push`

---

**Commençons par l'Étape 1 : Accéder au Gestionnaire de Fichiers !**
