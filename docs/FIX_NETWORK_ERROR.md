# Correction de l'erreur Network Error

## Problème identifié

Le frontend essaie d'accéder directement au backend via `https://app.myguidedigital.com:3001` en HTTPS, ce qui échoue avec une erreur SSL car le backend écoute en HTTP sur le port 3001.

## Solution

En production, le frontend doit utiliser `https://app.myguidedigital.com/api/...` (sans port) et Nginx doit proxifier ces requêtes vers le backend HTTP sur `localhost:3001`.

## Étapes de correction

### 1. Vérifier la configuration Nginx

Sur votre serveur VPS, vérifiez que Nginx proxifie bien `/api/` vers le backend :

```bash
# Se connecter au serveur
ssh root@votre-ip

# Vérifier la configuration Nginx
cat /etc/nginx/sites-available/myguidedigital
```

La configuration doit contenir quelque chose comme :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.myguidedigital.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.myguidedigital.com;

    ssl_certificate /etc/letsencrypt/live/app.myguidedigital.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.myguidedigital.com/privkey.pem;

    # Frontend Next.js (port 3000)
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

    # Backend API (port 3001)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Si la configuration Nginx n'est pas correcte

Si la section `/api/` n'existe pas ou n'est pas correcte, modifiez le fichier :

```bash
nano /etc/nginx/sites-available/myguidedigital
```

Ajoutez ou modifiez la section `location /api/` comme indiqué ci-dessus.

Puis rechargez Nginx :

```bash
nginx -t  # Vérifier la syntaxe
systemctl reload nginx
```

### 3. Vérifier que le backend écoute bien sur le port 3001

```bash
# Vérifier que le backend est démarré
pm2 list

# Vérifier les logs du backend
pm2 logs my-guidedigital-backend --lines 50

# Tester que le backend répond en HTTP (pas HTTPS)
curl http://localhost:3001/health
```

### 4. Rebuild et redéployer le frontend

Après avoir modifié `frontend/lib/api.ts`, vous devez rebuild le frontend :

```bash
# Sur votre machine locale
cd frontend
npm run build

# Puis sur le serveur VPS
ssh root@votre-ip
cd /root/myguidedigital/myguidedigital
git pull origin main
cd frontend
npm install
npm run build
pm2 restart my-guidedigital-frontend
```

### 5. Vérifier que ça fonctionne

1. Ouvrez votre navigateur sur `https://app.myguidedigital.com`
2. Ouvrez la console développeur (F12)
3. Essayez de vous connecter
4. Vérifiez dans l'onglet Network que les requêtes vont vers `https://app.myguidedigital.com/api/auth/login` (sans `:3001`)

## Résumé des changements

- ✅ Code modifié dans `frontend/lib/api.ts` pour ignorer le port en production
- ⚠️ Vérifier la configuration Nginx pour le proxy `/api/`
- ⚠️ Rebuild et redéployer le frontend
