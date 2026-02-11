# Corriger l'erreur "Network Error" à la connexion (dashboard)

## Cause

En production (app.myguidedigital.com), le frontend appelait l’API sur le **port 3001** (`https://app.myguidedigital.com:3001`). Ce port n’est en général pas exposé (seul le 443 l’est), ce qui provoquait une **Network Error** au login.

## Correction appliquée dans le code

Le fichier `frontend/lib/api.ts` a été modifié pour que, en production (nom de domaine) :

- L’API soit appelée en **même origine**, sans port : `https://app.myguidedigital.com/api/...`
- Les requêtes passent par le **reverse proxy** (Nginx), qui redirige `/api` vers le backend (port 3001).

Résumé de la logique :

- **localhost** → `http://localhost:3001`
- **Nom de domaine** (ex. app.myguidedigital.com) → `https://app.myguidedigital.com` (pas de port, donc `/api` sur le même domaine)
- **IP locale** (ex. 192.168.x.x) → `http://IP:3001`
- **NEXT_PUBLIC_API_URL** défini (sur le VPS) → cette URL est utilisée en priorité

## À faire sur le VPS (Nginx)

Pour que le login fonctionne, Nginx doit rediriger `/api` vers le backend. Vérifier la config (ex. `/etc/nginx/sites-available/myguidedigital` ou équivalent) et qu’un bloc comme celui-ci existe :

```nginx
location /api {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Puis :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Si tu n’utilises pas Nginx (ou pas encore de proxy /api)

Tu peux forcer l’URL de l’API côté frontend en définissant sur le serveur (avant le build) :

- **Fichier** : `frontend/.env.production` (ou variables d’environnement du processus qui lance le frontend)
- **Contenu** :  
  `NEXT_PUBLIC_API_URL=https://app.myguidedigital.com`  
  (sans `/api` à la fin ; le code ajoute `/api` pour les requêtes.)

Ensuite, rebuilder le frontend et redémarrer.  
Si le backend est sur une autre URL (ex. sous-domaine dédié), mets cette URL complète dans `NEXT_PUBLIC_API_URL` (toujours sans `/api` à la fin).

## Vérification rapide

Après déploiement, depuis un navigateur ou le VPS :

- Ouvrir : `https://app.myguidedigital.com/api/health`  
  → doit retourner du JSON du type `{"status":"ok",...}`.
- Si cette URL répond correctement, le login depuis l’interface devrait fonctionner (plus de Network Error à la connexion au dashboard).
