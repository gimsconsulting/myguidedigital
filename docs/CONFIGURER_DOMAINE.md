# Configuration du nom de domaine avec Nginx et HTTPS

## Étape 1 : Configurer le DNS dans Hostinger

1. **Connectez-vous à votre panneau Hostinger**
2. **Allez dans "Domaines"** ou "Gestion des domaines"
3. **Sélectionnez votre nom de domaine**
4. **Allez dans "DNS"** ou "Zone DNS"
5. **Ajoutez/modifiez les enregistrements suivants :**

   - **Type A** :
     - **Nom/Host** : `@` (ou laissez vide)
     - **Valeur/Points vers** : `VOTRE_IP_SERVEUR`
     - **TTL** : 3600 (ou par défaut)
   
   - **Type A** (pour www) :
     - **Nom/Host** : `www`
     - **Valeur/Points vers** : `VOTRE_IP_SERVEUR`
     - **TTL** : 3600

6. **Sauvegardez les modifications**

**Note** : La propagation DNS peut prendre de 5 minutes à 48 heures, mais généralement c'est entre 15 minutes et 2 heures.

## Étape 2 : Installer Nginx sur le serveur

Connectez-vous à votre serveur VPS via SSH et exécutez :

```bash
# Mettre à jour les paquets
apt update

# Installer Nginx
apt install nginx -y

# Vérifier que Nginx est démarré
systemctl status nginx

# Activer Nginx au démarrage
systemctl enable nginx
```

## Étape 3 : Configurer Nginx comme reverse proxy

Créer la configuration Nginx pour votre domaine :

```bash
# Créer le fichier de configuration
nano /etc/nginx/sites-available/myguidedigital
```

Collez cette configuration (remplacez `VOTRE_DOMAINE.com` par votre vrai domaine) :

```nginx
# Redirection HTTP vers HTTPS (optionnel, on l'ajoutera après SSL)
server {
    listen 80;
    server_name VOTRE_DOMAINE.com www.VOTRE_DOMAINE.com;
    
    # Redirection vers HTTPS (à activer après avoir configuré SSL)
    # return 301 https://$server_name$request_uri;
    
    # Pour l'instant, on laisse passer en HTTP
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
}

# Configuration HTTPS (à activer après avoir installé SSL)
# server {
#     listen 443 ssl http2;
#     server_name VOTRE_DOMAINE.com www.VOTRE_DOMAINE.com;
# 
#     ssl_certificate /etc/letsencrypt/live/VOTRE_DOMAINE.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/VOTRE_DOMAINE.com/privkey.pem;
# 
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# 
#     # Configuration pour l'API backend
#     location /api {
#         proxy_pass http://localhost:3001;
#         proxy_http_version 1.1;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
```

Sauvegardez avec `Ctrl+X`, puis `Y`, puis `Enter`.

## Étape 4 : Activer la configuration

```bash
# Créer un lien symbolique
ln -s /etc/nginx/sites-available/myguidedigital /etc/nginx/sites-enabled/

# Tester la configuration Nginx
nginx -t

# Si le test est OK, recharger Nginx
systemctl reload nginx
```

## Étape 5 : Vérifier que tout fonctionne

1. **Attendez quelques minutes** que le DNS se propage
2. **Testez votre domaine** : `http://VOTRE_DOMAINE.com`
3. Vous devriez voir votre application frontend

## Étape 6 : Configurer HTTPS avec Let's Encrypt (SSL gratuit)

Une fois que le domaine fonctionne en HTTP, installez SSL :

```bash
# Installer Certbot
apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL
certbot --nginx -d VOTRE_DOMAINE.com -d www.VOTRE_DOMAINE.com

# Suivez les instructions :
# - Entrez votre email
# - Acceptez les conditions
# - Choisissez de rediriger HTTP vers HTTPS (option 2)
```

Certbot configurera automatiquement Nginx avec HTTPS.

## Étape 7 : Configurer le renouvellement automatique du certificat

Let's Encrypt expire tous les 90 jours. Certbot configure automatiquement un renouvellement, mais vérifions :

```bash
# Tester le renouvellement
certbot renew --dry-run
```

## Configuration de l'API Backend

Si vous voulez aussi exposer l'API backend via le domaine (optionnel) :

Dans le fichier Nginx, ajoutez cette section dans le bloc `server` :

```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Vérification finale

- ✅ Frontend accessible : `https://VOTRE_DOMAINE.com`
- ✅ API Backend accessible : `https://VOTRE_DOMAINE.com/api`
- ✅ Redirection HTTP → HTTPS active
- ✅ Certificat SSL valide

## Commandes utiles

```bash
# Vérifier le statut de Nginx
systemctl status nginx

# Voir les logs Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Recharger Nginx après modification
systemctl reload nginx

# Vérifier la configuration
nginx -t
```
