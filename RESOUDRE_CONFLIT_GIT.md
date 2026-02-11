# 🔧 Résoudre le Conflit Git

## ❌ Problème

Git refuse de faire le `pull` car il y a des modifications locales sur le serveur qui entrent en conflit avec les modifications distantes.

## ✅ Solution : Sauvegarder les Modifications Locales puis Pull

### Option 1 : Stash (Mettre de côté temporairement)

```bash
cd /root/myguidedigital/myguidedigital

# 1. Mettre de côté les modifications locales
git stash

# 2. Faire le pull
git pull origin main

# 3. Appliquer les modifications locales (si nécessaire)
git stash pop
```

### Option 2 : Commit les Modifications Locales puis Pull

```bash
cd /root/myguidedigital/myguidedigital

# 1. Voir ce qui a été modifié
git status

# 2. Ajouter les modifications
git add backend/package.json backend/src/index.ts

# 3. Créer un commit
git commit -m "Modifications locales serveur"

# 4. Faire le pull (Git va créer un merge commit)
git pull origin main

# 5. Si conflit, résoudre puis :
git add .
git commit -m "Résolution conflits"
```

### Option 3 : Écraser les Modifications Locales (ATTENTION)

⚠️ **Cette option supprime toutes vos modifications locales !**

```bash
cd /root/myguidedigital/myguidedigital

# 1. Écraser les modifications locales avec la version distante
git reset --hard origin/main

# 2. Faire le pull
git pull origin main
```

## 🎯 Recommandation

Je recommande l'**Option 1 (stash)** car elle est la plus sûre :

```bash
cd /root/myguidedigital/myguidedigital
git stash
git pull origin main
cd backend
npm run build
pm2 restart my-guidedigital-backend
```

---

**Exécutez l'Option 1 et dites-moi ce qui se passe !** 🔧
