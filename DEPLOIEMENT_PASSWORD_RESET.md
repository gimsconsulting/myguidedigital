# 🚀 Déploiement - Réinitialisation de Mot de Passe Sécurisée

## 📍 Où exécuter les commandes ?

**Sur votre serveur VPS** (où se trouve votre base de données MySQL)

---

## 📋 Étapes de Déploiement

### Étape 1 : Se connecter au VPS

```bash
ssh root@votre-ip-vps
# ou
ssh votre-utilisateur@votre-ip-vps
```

### Étape 2 : Aller dans le répertoire du projet

```bash
cd /root/myguidedigital/myguidedigital
# ou le chemin où se trouve votre projet
```

### Étape 3 : Récupérer les dernières modifications

```bash
cd backend
git pull origin main
# ou la branche que vous utilisez
```

### Étape 4 : Installer les dépendances (si nécessaire)

```bash
npm install
```

### Étape 5 : Mettre à jour le schéma de la base de données

⚠️ **IMPORTANT : Faire un backup de la base de données avant !**

```bash
# Option 1 : Backup de la base de données (recommandé)
mysqldump -u root -p myguidedigital > backup_$(date +%Y%m%d_%H%M%S).sql

# Option 2 : Si vous utilisez Hostinger, utilisez leur interface de backup
```

Puis :

```bash
# Générer le client Prisma avec le nouveau schéma
npx prisma generate

# Appliquer les changements à la base de données
npx prisma db push
```

### Étape 6 : Vérifier que la table a été créée

```bash
# Se connecter à MySQL
mysql -u root -p

# Utiliser votre base de données
USE myguidedigital;

# Vérifier que la table existe
SHOW TABLES LIKE 'password_reset_tokens';

# Voir la structure de la table
DESCRIBE password_reset_tokens;

# Quitter MySQL
EXIT;
```

### Étape 7 : Redémarrer le backend

```bash
# Si vous utilisez PM2
pm2 restart my-guidedigital-backend

# Vérifier les logs
pm2 logs my-guidedigital-backend
```

### Étape 8 : Vérifier que tout fonctionne

1. Tester la route `/api/auth/forgot-password` :
   ```bash
   curl -X POST https://app.myguidedigital.com/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

2. Vérifier les logs du backend pour voir si le token est généré (en dev, il sera loggé)

---

## 🔍 Vérifications

### Vérifier que Prisma a bien créé la table

```sql
-- Dans MySQL
SELECT * FROM password_reset_tokens LIMIT 1;
```

### Vérifier les logs du backend

```bash
pm2 logs my-guidedigital-backend --lines 50
```

Vous devriez voir :
- ✅ "Prisma Client generated successfully"
- ✅ Pas d'erreurs de connexion à la base de données

---

## ⚠️ En cas d'erreur

### Erreur : "Table already exists"
```bash
# Si la table existe déjà, Prisma devrait la mettre à jour automatiquement
# Sinon, vous pouvez la supprimer manuellement (ATTENTION : perte de données)
mysql -u root -p
USE myguidedigital;
DROP TABLE IF EXISTS password_reset_tokens;
EXIT;
# Puis relancer : npx prisma db push
```

### Erreur : "Connection refused" ou "Access denied"
- Vérifier que MySQL est démarré : `systemctl status mysql`
- Vérifier les credentials dans `backend/.env` : `DATABASE_URL`

### Erreur : "Prisma Client not generated"
```bash
cd backend
rm -rf node_modules/.prisma
npx prisma generate
```

---

## 📝 Résumé des commandes (copier-coller)

```bash
# 1. Se connecter au VPS
ssh root@votre-ip

# 2. Aller dans le projet
cd /root/myguidedigital/myguidedigital/backend

# 3. Récupérer les modifications
git pull

# 4. Installer les dépendances (si nécessaire)
npm install

# 5. Backup (optionnel mais recommandé)
mysqldump -u root -p myguidedigital > backup_$(date +%Y%m%d_%H%M%S).sql

# 6. Mettre à jour Prisma
npx prisma generate
npx prisma db push

# 7. Redémarrer le backend
pm2 restart my-guidedigital-backend

# 8. Vérifier les logs
pm2 logs my-guidedigital-backend
```

---

## ✅ Checklist de déploiement

- [ ] Connecté au VPS
- [ ] Backup de la base de données effectué
- [ ] Code mis à jour (`git pull`)
- [ ] `npx prisma generate` exécuté avec succès
- [ ] `npx prisma db push` exécuté avec succès
- [ ] Table `password_reset_tokens` créée (vérifiée dans MySQL)
- [ ] Backend redémarré
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Test de la route `/api/auth/forgot-password` réussi

---

## 🎯 Prochaine étape

Une fois le déploiement terminé et vérifié, on pourra passer au **Point 2 : Rate Limiting sur login/register**.
