# Correction de l'erreur CORS et 500

## Problème identifié

1. **Erreur CORS** : "Not allowed by CORS" - Le domaine `https://app.myguidedigital.com` n'était pas dans la liste des origines autorisées
2. **Erreur 500** : Internal Server Error - Il faut vérifier les logs du backend pour comprendre la cause

## Solution appliquée

✅ Ajout de `https://app.myguidedigital.com` à la liste des origines CORS autorisées dans `backend/src/index.ts`

## Étapes de déploiement

### 1. Commiter et pousser les modifications

Sur votre machine locale (PowerShell) :

```bash
cd "C:\Users\conta\projet egeed"
git add backend/src/index.ts docs/FIX_CORS_500_ERROR.md
git commit -m "Fix: Add app.myguidedigital.com to CORS allowed origins"
git push origin main
```

### 2. Rebuild et redéployer le backend

Sur votre serveur VPS :

```bash
# Se connecter au serveur
ssh root@votre-ip

# Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# Récupérer les modifications
git pull origin main

# Rebuild le backend
cd backend
npm install
npm run build

# Redémarrer le backend
cd ..
pm2 restart my-guidedigital-backend

# Vérifier les logs pour voir si l'erreur 500 persiste
pm2 logs my-guidedigital-backend --lines 50
```

### 3. Vérifier les logs du backend pour l'erreur 500

Si l'erreur 500 persiste après avoir corrigé CORS, vérifiez les logs :

```bash
# Voir les dernières erreurs
pm2 logs my-guidedigital-backend --err --lines 100

# Ou voir tous les logs
pm2 logs my-guidedigital-backend --lines 100
```

Les erreurs communes peuvent être :
- Problème de connexion à la base de données
- Variable d'environnement manquante (JWT_SECRET, DATABASE_URL, etc.)
- Erreur dans le code de la route `/api/auth/login`

### 4. Tester la connexion

1. Ouvrez `https://app.myguidedigital.com` dans votre navigateur
2. Ouvrez la console (F12 > Console)
3. Essayez de vous connecter
4. Vérifiez que l'erreur CORS a disparu
5. Si l'erreur 500 persiste, regardez les logs du backend pour identifier la cause

## Vérification de la configuration CORS

Pour vérifier que CORS fonctionne correctement, vous pouvez tester avec curl :

```bash
# Tester une requête OPTIONS (preflight)
curl -X OPTIONS https://app.myguidedigital.com/api/auth/login \
  -H "Origin: https://app.myguidedigital.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Vous devriez voir dans les headers de réponse :
# Access-Control-Allow-Origin: https://app.myguidedigital.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```
