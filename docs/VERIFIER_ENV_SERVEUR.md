# Vérifier le fichier .env sur le serveur

## Commande à exécuter sur le serveur VPS

```bash
# Se connecter au serveur
ssh root@votre-ip

# Aller dans le dossier frontend
cd /root/myguidedigital/myguidedigital/frontend

# Vérifier le contenu du fichier .env (s'il existe)
cat .env 2>/dev/null || echo "Le fichier .env n'existe pas dans frontend/"

# Vérifier aussi à la racine du projet
cd ..
cat .env 2>/dev/null || echo "Le fichier .env n'existe pas à la racine"

# Chercher toutes les occurrences de NEXT_PUBLIC_API_URL avec :3001
echo "=== Recherche de NEXT_PUBLIC_API_URL avec :3001 ==="
grep -r "NEXT_PUBLIC_API_URL.*3001" . --include="*.env*" 2>/dev/null || echo "Aucune occurrence trouvée"
```

## Si vous trouvez NEXT_PUBLIC_API_URL avec :3001

### Dans frontend/.env ou frontend/.env.production

```bash
cd /root/myguidedigital/myguidedigital/frontend

# Ouvrir le fichier
nano .env
# ou
nano .env.production

# Supprimer ou commenter la ligne avec NEXT_PUBLIC_API_URL
# Exemple : mettre un # devant la ligne
# NEXT_PUBLIC_API_URL=https://app.myguidedigital.com:3001

# Sauvegarder (Ctrl+O, Entrée, Ctrl+X)
```

### À la racine du projet

```bash
cd /root/myguidedigital/myguidedigital

# Ouvrir le fichier
nano .env

# Supprimer ou commenter la ligne avec NEXT_PUBLIC_API_URL
# Sauvegarder (Ctrl+O, Entrée, Ctrl+X)
```

## Après modification

```bash
# Rebuild le frontend
cd frontend
rm -rf .next
npm run build

# Redémarrer PM2
cd ..
pm2 restart my-guidedigital-frontend

# Vérifier les logs pour voir les messages de débogage
pm2 logs my-guidedigital-frontend --lines 30
```

## Vérifier dans le navigateur

1. Ouvrez `https://app.myguidedigital.com`
2. Ouvrez la console (F12 > Console)
3. Essayez de vous connecter
4. Regardez les messages qui commencent par `🔍` - ils vous diront quelle URL est utilisée
