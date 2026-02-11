# Déploiement - Icône poubelle au lieu du bouton "Supprimer"

## Problème
Les modifications ne sont pas visibles sur le serveur.

## Solution : Déploiement complet

### Étape 1 : Se connecter au serveur
```bash
ssh root@srv841916
```

### Étape 2 : Récupérer les modifications
```bash
cd /root/myguidedigital/myguidedigital
git pull origin main
```

### Étape 3 : Vérifier que les modifications sont présentes
```bash
# Vérifier que le fichier contient bien l'icône SVG
grep -A 10 "onClick={() => onDelete" frontend/app/dashboard/livrets/\[id\]/modules/page.tsx | head -15
```

Vous devriez voir le code avec `<svg>` et non pas le texte "Supprimer".

### Étape 4 : Rebuild complet du frontend
```bash
cd frontend

# Nettoyer le cache de build
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm run build
```

### Étape 5 : Redémarrer le service
```bash
cd ..
pm2 restart my-guidedigital-frontend

# Vérifier les logs
pm2 logs my-guidedigital-frontend --lines 50
```

### Étape 6 : Vider le cache du navigateur

**Important** : Sur votre navigateur (client), vous devez :

1. **Chrome/Edge** :
   - Appuyez sur `Ctrl + Shift + Delete`
   - Sélectionnez "Images et fichiers en cache"
   - Cliquez sur "Effacer les données"

   OU

   - Ouvrez les outils développeur (`F12`)
   - Clic droit sur le bouton de rechargement
   - Sélectionnez "Vider le cache et effectuer un rechargement forcé"

2. **Firefox** :
   - `Ctrl + Shift + Delete`
   - Sélectionnez "Cache"
   - Cliquez sur "Effacer maintenant"

   OU

   - `Ctrl + F5` pour forcer le rechargement

### Étape 7 : Vérification

1. Se connecter au dashboard
2. Aller dans un livret → "Modules d'information"
3. Vérifier que chaque module a :
   - Un toggle switch (Actif/Inactif)
   - Un bouton "Modifier"
   - **Une icône de poubelle rouge** (pas de texte "Supprimer")

## Si ça ne fonctionne toujours pas

### Vérifier que le build s'est bien passé
```bash
cd /root/myguidedigital/myguidedigital/frontend
npm run build 2>&1 | tail -20
```

### Vérifier les fichiers build
```bash
# Chercher l'icône SVG dans les fichiers build
grep -r "M19 7l-.867 12.142A2" .next/static/ 2>/dev/null | head -5
```

### Forcer un rebuild complet
```bash
cd /root/myguidedigital/myguidedigital/frontend
rm -rf .next
rm -rf node_modules
npm install
npm run build
cd ..
pm2 restart my-guidedigital-frontend
```

### Vérifier la version déployée
```bash
cd /root/myguidedigital/myguidedigital
git log --oneline -1
```

Vous devriez voir : `5e11e61 feat: Menu déroulant langues et icône poubelle pour modules`
