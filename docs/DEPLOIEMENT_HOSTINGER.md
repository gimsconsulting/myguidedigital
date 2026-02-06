# 🚀 Guide de Déploiement sur Hostinger

Ce guide vous explique comment déployer votre application **My Guide Digital** sur Hostinger.

## 📋 Prérequis

- Compte Hostinger avec accès VPS ou Cloud Hosting (nécessaire pour Node.js)
- Accès SSH à votre serveur
- Node.js 18+ installé sur le serveur
- Base de données PostgreSQL ou SQLite (selon votre choix)

## 🏗️ Architecture de Déploiement Recommandée

### Option 1 : Tout sur Hostinger VPS/Cloud
- **Backend** : Serveur Node.js sur Hostinger
- **Frontend** : Next.js en mode standalone sur Hostinger
- **Base de données** : PostgreSQL ou SQLite sur Hostinger

### Option 2 : Hybride (Recommandé)
- **Backend** : Hostinger VPS/Cloud
- **Frontend** : Vercel ou Netlify (gratuit pour Next.js)
- **Base de données** : PostgreSQL sur Hostinger ou service externe

---

## 📦 Étape 1 : Préparer le Code pour la Production

### 1.1 Optimiser le Frontend

```bash
cd frontend
npm run build
```

Cela génère un dossier `.next` optimisé pour la production.

### 1.2 Vérifier les Variables d'Environnement

Créez un fichier `.env.production` dans `frontend/` :

```env
NEXT_PUBLIC_API_URL=https://votre-domaine-backend.com/api
NODE_ENV=production
```

Créez un fichier `.env` dans `backend/` :

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
# ou pour PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/myguidedigital"

JWT_SECRET=votre-secret-jwt-tres-long-et-securise
FRONTEND_URL=https://votre-domaine-frontend.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Google Translate (optionnel)
GOOGLE_TRANSLATE_API_KEY=votre-cle-api

# Uploads
UPLOAD_DIR=./uploads
CHAT_DOCS_DIR=./uploads/chat-documents
```

---

## 🖥️ Étape 2 : Configuration du Serveur Hostinger

### 2.1 Se Connecter en SSH

```bash
ssh root@votre-ip-serveur
# ou
ssh votre-utilisateur@votre-domaine.com
```

### 2.2 Installer Node.js et npm

```bash
# Sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 2.3 Installer PostgreSQL (si vous l'utilisez)

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE myguidedigital;
CREATE USER myguideuser WITH PASSWORD 'votre-mot-de-passe-securise';
GRANT ALL PRIVILEGES ON DATABASE myguidedigital TO myguideuser;
\q
```

### 2.4 Installer PM2 (Gestionnaire de processus Node.js)

```bash
sudo npm install -g pm2
```

### 2.5 Créer la Structure de Dossiers

```bash
mkdir -p /var/www/my-guidedigital
cd /var/www/my-guidedigital
```

---

## 📤 Étape 3 : Transférer les Fichiers

### 3.1 Option A : Via Git (Recommandé)

```bash
# Sur le serveur
cd /var/www/my-guidedigital
git clone https://github.com/votre-username/my-guidedigital.git .

# Installer les dépendances
cd backend
npm install --production
cd ../frontend
npm install --production
```

### 3.2 Option B : Via FTP/SFTP

1. Utilisez FileZilla ou WinSCP
2. Connectez-vous à votre serveur Hostinger
3. Transférez tous les fichiers dans `/var/www/my-guidedigital/`

### 3.3 Option C : Via SCP (depuis votre machine locale)

```bash
# Depuis votre machine Windows (PowerShell)
scp -r "C:\Users\conta\projet egeed\*" root@votre-ip:/var/www/my-guidedigital/
```

---

## ⚙️ Étape 4 : Configuration Backend

### 4.1 Créer les Variables d'Environnement

```bash
cd /var/www/my-guidedigital/backend
nano .env
```

Collez votre configuration `.env` (voir étape 1.2)

### 4.2 Initialiser la Base de Données

```bash
cd /var/www/my-guidedigital/backend
npx prisma generate
npx prisma db push
# ou pour PostgreSQL:
# npx prisma migrate deploy
```

### 4.3 Créer les Dossiers d'Upload

```bash
mkdir -p /var/www/my-guidedigital/backend/uploads
mkdir -p /var/www/my-guidedigital/backend/uploads/chat-documents
chmod -R 755 /var/www/my-guidedigital/backend/uploads
```

### 4.4 Tester le Backend

```bash
cd /var/www/my-guidedigital/backend
npm start
```

Vérifiez que le serveur démarre sur le port 3001.

---

## 🎨 Étape 5 : Configuration Frontend

### 5.1 Créer les Variables d'Environnement

```bash
cd /var/www/my-guidedigital/frontend
nano .env.production
```

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api
NODE_ENV=production
```

### 5.2 Build du Frontend

```bash
cd /var/www/my-guidedigital/frontend
npm run build
```

### 5.3 Tester le Frontend en Mode Standalone

```bash
cd /var/www/my-guidedigital/frontend
npm start
```

---

## 🔧 Étape 6 : Configuration PM2

### 6.1 Créer le Fichier de Configuration PM2

Créez `/var/www/my-guidedigital/ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    {
      name: 'my-guidedigital-backend',
      script: './backend/src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm',
      cwd: '/var/www/my-guidedigital',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'my-guidedigital-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/my-guidedigital/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

### 6.2 Alternative : Scripts Simples

Si vous préférez, créez deux fichiers séparés :

**Backend** : `/var/www/my-guidedigital/start-backend.sh`
```bash
#!/bin/bash
cd /var/www/my-guidedigital/backend
node dist/index.js
```

**Frontend** : `/var/www/my-guidedigital/start-frontend.sh`
```bash
#!/bin/bash
cd /var/www/my-guidedigital/frontend
npm start
```

Rendez-les exécutables :
```bash
chmod +x start-backend.sh start-frontend.sh
```

### 6.3 Démarrer avec PM2

```bash
cd /var/www/my-guidedigital
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6.4 Commandes PM2 Utiles

```bash
# Voir les processus
pm2 list

# Voir les logs
pm2 logs

# Redémarrer
pm2 restart all

# Arrêter
pm2 stop all

# Supprimer
pm2 delete all
```

---

## 🌐 Étape 7 : Configuration Nginx (Reverse Proxy)

### 7.1 Installer Nginx

```bash
sudo apt-get install nginx
```

### 7.2 Configuration Nginx

Créez `/etc/nginx/sites-available/my-guidedigital` :

```nginx
# Backend API
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir les fichiers statiques Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
    }
}
```

### 7.3 Activer le Site

```bash
sudo ln -s /etc/nginx/sites-available/my-guidedigital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7.4 Configuration SSL avec Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
sudo certbot --nginx -d api.votre-domaine.com
```

---

## 🔒 Étape 8 : Configuration du Pare-feu

```bash
# Autoriser les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 📝 Étape 9 : Configuration des Domaines sur Hostinger

1. Connectez-vous à votre panneau Hostinger
2. Allez dans **Domaines** → **Gérer**
3. Ajoutez un sous-domaine `api.votre-domaine.com` pointant vers votre IP serveur
4. Configurez les DNS :
   - **A Record** : `@` → IP du serveur
   - **A Record** : `api` → IP du serveur
   - **CNAME** : `www` → `votre-domaine.com`

---

## ✅ Étape 10 : Vérification et Tests

### 10.1 Tester le Backend

```bash
curl http://localhost:3001/health
curl https://api.votre-domaine.com/health
```

### 10.2 Tester le Frontend

Ouvrez dans votre navigateur :
- `http://votre-domaine.com`
- `https://votre-domaine.com`

### 10.3 Vérifier les Logs

```bash
# Logs PM2
pm2 logs

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 Étape 11 : Mise à Jour du Code

### 11.1 Via Git

```bash
cd /var/www/my-guidedigital
git pull origin master
cd backend
npm install --production
cd ../frontend
npm install --production
npm run build
pm2 restart all
```

### 11.2 Script de Déploiement Automatique

Créez `/var/www/my-guidedigital/deploy.sh` :

```bash
#!/bin/bash
cd /var/www/my-guidedigital
git pull origin master
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
cd ../frontend
npm install --production
npm run build
pm2 restart all
echo "Déploiement terminé !"
```

Rendez-le exécutable :
```bash
chmod +x deploy.sh
```

Utilisez-le avec :
```bash
./deploy.sh
```

---

## 🚨 Dépannage

### Problème : Le backend ne démarre pas

```bash
# Vérifier les logs
pm2 logs my-guidedigital-backend

# Vérifier les ports
netstat -tulpn | grep 3001

# Vérifier les variables d'environnement
cd /var/www/my-guidedigital/backend
cat .env
```

### Problème : Le frontend ne se connecte pas au backend

1. Vérifiez `NEXT_PUBLIC_API_URL` dans `.env.production`
2. Vérifiez que CORS est configuré correctement dans le backend
3. Vérifiez les logs Nginx

### Problème : Erreur 502 Bad Gateway

```bash
# Vérifier que les services tournent
pm2 list

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier la configuration Nginx
sudo nginx -t
```

---

## 📊 Monitoring

### Utiliser PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Surveiller les Ressources

```bash
pm2 monit
```

---

## 🔐 Sécurité

1. **Ne jamais commiter les `.env`** dans Git
2. **Utiliser des mots de passe forts** pour la base de données
3. **Activer le firewall** (UFW)
4. **Mettre à jour régulièrement** le système :
   ```bash
   sudo apt-get update && sudo apt-get upgrade
   ```
5. **Configurer les backups** réguliers de la base de données

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs PM2 : `pm2 logs`
2. Vérifiez les logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Contactez le support Hostinger si nécessaire

---

**🎉 Félicitations ! Votre application My Guide Digital est maintenant déployée sur Hostinger !**
