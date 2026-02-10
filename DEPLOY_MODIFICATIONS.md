# Instructions de déploiement - Menu déroulant langues et icône poubelle

## Modifications incluses

1. **Menu déroulant pour les langues** (pages guide)
   - `frontend/app/guide/[qrCode]/page.tsx`
   - `frontend/app/guide/[qrCode]/[moduleId]/page.tsx`

2. **Icône poubelle au lieu du texte "Supprimer"** (page modules)
   - `frontend/app/dashboard/livrets/[id]/modules/page.tsx`

## Étape 1 : Commit et Push des modifications

```bash
cd "C:\Users\conta\projet egeed"

# Vérifier les fichiers modifiés
git status

# Ajouter les fichiers modifiés pour cette session
git add frontend/app/dashboard/livrets/[id]/modules/page.tsx
git add frontend/app/guide/[qrCode]/page.tsx
git add frontend/app/guide/[qrCode]/[moduleId]/page.tsx

# Créer le commit
git commit -m "feat: Menu déroulant langues et icône poubelle pour modules

- Remplacement des boutons horizontaux par menu déroulant dans les pages guide
- Remplacement du bouton 'Supprimer' par icône poubelle dans la page modules
- Amélioration responsive pour mobile"

# Pousser vers le dépôt distant
git push origin main
```

## Étape 2 : Déploiement sur le serveur

```bash
# Se connecter au serveur
ssh root@srv841916

# Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# Récupérer les dernières modifications
git pull origin main

# Rebuild du frontend
cd frontend
npm install  # Si nécessaire (nouvelles dépendances)
npm run build

# Redémarrer le service frontend
cd ..
pm2 restart my-guidedigital-frontend

# Vérifier le statut
pm2 status
pm2 logs my-guidedigital-frontend --lines 50
```

## Étape 3 : Vérification

1. **Menu déroulant langues** :
   - Aller sur une page guide publique (ex: `https://app.myguidedigital.com/guide/[qrCode]`)
   - Vérifier que le sélecteur de langue est un menu déroulant avec drapeaux
   - Tester l'ouverture/fermeture du menu
   - Vérifier que la langue change correctement

2. **Icône poubelle** :
   - Se connecter au dashboard
   - Aller dans "Modules d'information" d'un livret
   - Vérifier que le bouton "Supprimer" est remplacé par une icône de poubelle
   - Tester sur mobile pour vérifier qu'il n'y a plus de débordement

## En cas de problème

### Le frontend ne se build pas
```bash
cd frontend
rm -rf .next
npm run build
```

### Le service ne redémarre pas
```bash
pm2 delete my-guidedigital-frontend
cd /root/myguidedigital/myguidedigital/frontend
pm2 start npm --name "my-guidedigital-frontend" -- start
pm2 save
```

### Vérifier les logs
```bash
pm2 logs my-guidedigital-frontend --lines 100
```
