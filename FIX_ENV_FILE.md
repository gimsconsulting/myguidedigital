# Correction du fichier .env manquant

## Problème
Le backend cherche le fichier `.env` à la racine du projet (`/root/myguidedigital/myguidedigital/.env`), mais il n'existe pas à cet endroit.

## Solution

Connectez-vous à votre serveur VPS via SSH et exécutez :

```bash
# 1. Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# 2. Copier le fichier .env de backend vers la racine
cp backend/.env .env

# 3. Vérifier que le fichier existe bien
ls -la .env

# 4. Redémarrer PM2 pour prendre en compte le nouveau fichier
pm2 restart all

# 5. Vérifier les logs pour confirmer que l'erreur est résolue
pm2 logs --lines 20
```

## Vérification

Après avoir redémarré PM2, vous devriez voir dans les logs :
- ✅ `Fichier .env chargé` au lieu de l'erreur `ENOENT`
- Les applications devraient démarrer correctement

## Note sur GOOGLE_TRANSLATE_API_KEY

L'avertissement concernant `GOOGLE_TRANSLATE_API_KEY` est normal si vous n'utilisez pas cette fonctionnalité. Ce n'est pas bloquant pour le fonctionnement de l'application.
