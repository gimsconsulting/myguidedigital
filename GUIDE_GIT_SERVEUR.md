# 📚 Guide Git - Mettre à Jour le Code sur le Serveur

## 🔄 Workflow Git Simple

### Sur Votre Machine Locale (Windows)

1. **Vérifier que vos modifications sont sauvegardées** :
   ```bash
   git status
   ```
   Vous devriez voir les fichiers modifiés.

2. **Ajouter les fichiers modifiés** :
   ```bash
   git add .
   ```
   Cela ajoute tous les fichiers modifiés.

3. **Créer un commit** :
   ```bash
   git commit -m "Corrections sécurité: rate limiting, helmet, gestion erreurs"
   ```

4. **Envoyer sur le dépôt distant** :
   ```bash
   git push origin main
   ```
   (ou `git push origin master` si votre branche principale s'appelle `master`)

### Sur le Serveur VPS

1. **Aller dans le répertoire du projet** :
   ```bash
   cd /root/myguidedigital/myguidedigital
   ```

2. **Vérifier l'état actuel** :
   ```bash
   git status
   ```

3. **Récupérer les dernières modifications** :
   ```bash
   git pull origin main
   ```
   (ou `git pull origin master` si votre branche principale s'appelle `master`)

4. **Si Git demande des informations** :
   - Si vous voyez "Please tell me who you are", configurez Git :
     ```bash
     git config --global user.email "votre@email.com"
     git config --global user.name "Votre Nom"
     ```

5. **Aller dans le backend et compiler** :
   ```bash
   cd backend
   npm run build
   ```

6. **Redémarrer le backend** :
   ```bash
   pm2 restart my-guidedigital-backend
   ```

## 🔍 Commandes Git Utiles

### Voir l'historique des commits
```bash
git log --oneline -10
```

### Voir les différences avant de pull
```bash
git fetch
git diff HEAD origin/main
```

### Annuler des modifications locales (si nécessaire)
```bash
git reset --hard origin/main
```
⚠️ **Attention** : Cela supprime toutes vos modifications locales !

### Voir quelle branche vous utilisez
```bash
git branch
```

## ⚠️ Résolution de Conflits

Si `git pull` affiche des conflits :

1. **Voir les fichiers en conflit** :
   ```bash
   git status
   ```

2. **Options** :
   - **Garder les versions distantes** (du serveur) :
     ```bash
     git checkout --theirs .
     git add .
     git commit -m "Résolution conflits"
     ```
   
   - **Garder les versions locales** :
     ```bash
     git checkout --ours .
     git add .
     git commit -m "Résolution conflits"
     ```

## 📋 Checklist Complète

### Sur votre Machine Locale
- [ ] `git status` - Voir les fichiers modifiés
- [ ] `git add .` - Ajouter les modifications
- [ ] `git commit -m "Message"` - Créer un commit
- [ ] `git push origin main` - Envoyer sur le dépôt

### Sur le Serveur VPS
- [ ] `cd /root/myguidedigital/myguidedigital`
- [ ] `git pull origin main` - Récupérer les modifications
- [ ] `cd backend`
- [ ] `npm run build` - Compiler
- [ ] `pm2 restart my-guidedigital-backend` - Redémarrer
- [ ] `pm2 logs my-guidedigital-backend --lines 20` - Vérifier les logs

## 🎯 Exemple Complet

### Sur votre Machine Locale
```bash
# Dans le répertoire du projet
git add .
git commit -m "Corrections sécurité: rate limiting, helmet, gestion erreurs"
git push origin main
```

### Sur le Serveur VPS
```bash
cd /root/myguidedigital/myguidedigital
git pull origin main
cd backend
npm run build
pm2 restart my-guidedigital-backend
pm2 logs my-guidedigital-backend --lines 20
```

---

**C'est tout !** Une fois que vous avez fait `git push` depuis votre machine locale, vous pouvez faire `git pull` sur le serveur pour récupérer toutes les corrections. 🚀
