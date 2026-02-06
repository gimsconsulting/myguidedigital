# 🚀 Guide de Déploiement Simplifié sur Hostinger

Version simplifiée pour un déploiement rapide.

## 📋 Prérequis

- Compte Hostinger avec VPS ou Cloud Hosting
- Accès SSH
- Node.js 18+ installé

---

## ⚡ Déploiement Rapide (5 Étapes)

### 1️⃣ Préparer le Code Localement

```bash
# Dans votre projet local
cd frontend
npm run build

# Vérifier que tout fonctionne
npm start
```

### 2️⃣ Transférer les Fichiers

**Option A : Via Git (Recommandé)**
```bash
# Sur le serveur
cd /var/www
git clone https://github.com/votre-username/my-guidedigital.git my-guidedigital
```

**Option B : Via FTP**
- Utilisez FileZilla
- Connectez-vous à votre serveur Hostinger
- Transférez tous les fichiers

### 3️⃣ Installer les Dépendances

```bash
cd /var/www/my-guidedigital

# Backend
cd backend
npm install --production
cp .env.example .env
nano .env  # Configurez vos variables

# Frontend
cd ../frontend
npm install --production
cp .env.example .env.production
nano .env.production  # Configurez NEXT_PUBLIC_API_URL
npm run build
```

### 4️⃣ Démarrer avec PM2

```bash
# Installer PM2
sudo npm install -g pm2

# Démarrer le backend
cd /var/www/my-guidedigital/backend
pm2 start src/index.ts --name backend --interpreter ts-node

# Démarrer le frontend
cd /var/www/my-guidedigital/frontend
pm2 start npm --name frontend -- start

# Sauvegarder la configuration
pm2 save
pm2 startup
```

### 5️⃣ Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/my-guidedigital
```

Collez cette configuration :

```nginx
# Backend
server {
    listen 80;
    server_name api.votre-domaine.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Frontend
server {
    listen 80;
    server_name votre-domaine.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Activer :
```bash
sudo ln -s /etc/nginx/sites-available/my-guidedigital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Configuration Minimale

### Backend `.env`
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=votre-secret-jwt
FRONTEND_URL=https://votre-domaine.com
```

### Frontend `.env.production`
```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api
NODE_ENV=production
```

---

## ✅ Vérification

```bash
# Vérifier que les services tournent
pm2 list

# Vérifier les logs
pm2 logs

# Tester le backend
curl http://localhost:3001/health
```

---

## 🔄 Mise à Jour

```bash
cd /var/www/my-guidedigital
git pull
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build
pm2 restart all
```

---

**C'est tout ! Votre site est en ligne ! 🎉**
