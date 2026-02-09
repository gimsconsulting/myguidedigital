# Fix de l'erreur 413 Request Entity Too Large

## Problème
L'erreur 413 se produit quand vous essayez d'uploader un fichier PDF qui dépasse la limite de taille configurée dans Nginx (par défaut 1MB).

## Solution

### 1. Modifier la configuration Nginx

Sur le serveur, éditez le fichier de configuration Nginx :

```bash
sudo nano /etc/nginx/sites-available/myguidedigital
```

Ou si vous utilisez un autre nom de fichier :

```bash
sudo nano /etc/nginx/sites-available/default
```

### 2. Ajouter ou modifier `client_max_body_size`

Dans le bloc `server` ou `location /api/`, ajoutez :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.myguidedigital.com;

    # Augmenter la limite de taille pour les uploads (20MB)
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Augmenter la limite pour les uploads dans cette location aussi
        client_max_body_size 20M;
        
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Vérifier la configuration

```bash
sudo nginx -t
```

### 4. Recharger Nginx

```bash
sudo systemctl reload nginx
```

### 5. Vérifier que ça fonctionne

Essayez d'uploader un fichier PDF à nouveau. L'erreur 413 ne devrait plus apparaître pour les fichiers jusqu'à 20MB.

## Note

- La limite est maintenant de 20MB (vous pouvez l'augmenter si nécessaire)
- Assurez-vous que la limite dans `backend/src/routes/chat-documents.ts` (multer) correspond aussi à 20MB ou plus
- La limite dans Express a déjà été augmentée à 20MB dans `backend/src/index.ts`
