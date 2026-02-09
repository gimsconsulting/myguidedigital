# Étapes pour corriger l'erreur Network Error

## ✅ Étape 1 : Configuration Nginx - FAIT
La configuration Nginx est correcte, elle proxifie bien `/api/` vers `localhost:3001`.

## Étape 2 : Vérifier que le backend fonctionne

Sur votre serveur VPS, exécutez :

```bash
# Vérifier que PM2 gère bien le backend
pm2 list

# Vérifier les logs du backend
pm2 logs my-guidedigital-backend --lines 20

# Tester que le backend répond
curl http://localhost:3001/health
```

Si le backend ne répond pas, redémarrez-le :
```bash
pm2 restart my-guidedigital-backend
```

## Étape 3 : Commiter et pousser les modifications

Sur votre machine locale (Windows), dans le terminal PowerShell :

```bash
# Aller dans le répertoire du projet
cd "C:\Users\conta\projet egeed"

# Vérifier les fichiers modifiés
git status

# Ajouter les fichiers modifiés
git add frontend/lib/api.ts docs/FIX_NETWORK_ERROR.md docs/ETAPES_DEPLOIEMENT_FIX.md

# Commiter
git commit -m "Fix: Remove port 3001 from API URL in production to use Nginx proxy"

# Pousser vers GitHub
git push origin main
```

## Étape 4 : Redéployer sur le serveur VPS

Sur votre serveur VPS :

```bash
# Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# Récupérer les modifications
git pull origin main

# Rebuild le frontend
cd frontend
npm install
npm run build
cd ..

# Redémarrer les applications PM2
pm2 restart all

# Vérifier le statut
pm2 list
pm2 logs --lines 10
```

## Étape 5 : Tester la connexion

1. Ouvrez votre navigateur sur `https://app.myguidedigital.com`
2. Ouvrez la console développeur (F12)
3. Allez dans l'onglet **Network**
4. Essayez de vous connecter
5. Vérifiez que les requêtes API vont vers `https://app.myguidedigital.com/api/auth/login` (sans `:3001`)

## Si ça ne fonctionne toujours pas

Vérifiez dans la console du navigateur (F12 > Console) :
- Les requêtes doivent aller vers `https://app.myguidedigital.com/api/...`
- Pas vers `https://app.myguidedigital.com:3001/api/...`

Si vous voyez encore `:3001`, cela signifie que le frontend n'a pas été rebuild correctement ou qu'il y a un cache.

Solution :
```bash
# Sur le serveur VPS
cd /root/myguidedigital/myguidedigital/frontend
rm -rf .next
npm run build
pm2 restart my-guidedigital-frontend
```
