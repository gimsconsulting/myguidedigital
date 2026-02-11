# 🚀 Déploiement des Corrections de Sécurité

## ✅ Modifications à déployer

Toutes les corrections de sécurité suivantes doivent être déployées sur le serveur :

1. ✅ Réinitialisation sécurisée du mot de passe avec tokens expirables
2. ✅ Rate limiting sur login/register avec verrouillage de compte
3. ✅ Headers HTTP avec Helmet (CSP, HSTS, X-Frame-Options, etc.)
4. ✅ Complexité des mots de passe améliorée (8+ caractères, majuscule, minuscule, chiffre)
5. ✅ Logging des actions sensibles dans les routes admin
6. ✅ Validation des entrées dans les routes admin (express-validator)
7. ✅ Protection CSRF pour les formulaires critiques

## 📋 Étapes de déploiement

### Étape 1 : Commit et Push des changements (sur votre machine locale)

```bash
# Aller dans le dossier du projet
cd "C:\Users\conta\projet egeed"

# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit
git commit -m "feat: Ajout de corrections de sécurité (CSRF, rate limiting, validation, logging)"

# Push vers le dépôt distant
git push origin main
```

### Étape 2 : Sur le serveur VPS

```bash
# Se connecter au serveur (via SSH)
ssh root@votre-serveur

# Aller dans le dossier du projet
cd /root/myguidedigital/myguidedigital

# Récupérer les dernières modifications
git pull origin main

# Aller dans le dossier backend
cd backend

# Installer les nouvelles dépendances (si nécessaire)
npm install

# Vérifier que les dépendances sont installées
npm list express-rate-limit helmet

# Régénérer le client Prisma (si le schéma a changé)
npx prisma generate

# Compiler le TypeScript
npm run build

# Vérifier qu'il n'y a pas d'erreurs de compilation
# Si des erreurs apparaissent, les corriger avant de continuer

# Redémarrer le serveur avec PM2
pm2 restart my-guidedigital-backend

# Vérifier les logs pour s'assurer que tout fonctionne
pm2 logs my-guidedigital-backend --lines 50
```

### Étape 3 : Vérifier le déploiement

1. **Tester la récupération du token CSRF** :
   ```bash
   curl https://app.myguidedigital.com/api/csrf-token
   ```
   Devrait retourner : `{"csrfToken":"..."}`

2. **Vérifier les logs de sécurité** :
   ```bash
   pm2 logs my-guidedigital-backend | grep -i "security\|csrf"
   ```

3. **Tester l'inscription** (devrait maintenant exiger un mot de passe fort)

4. **Tester le rate limiting** (essayer de se connecter 6 fois avec un mauvais mot de passe)

## ⚠️ Points d'attention

### Nouvelles dépendances
Les dépendances suivantes ont été ajoutées :
- `express-rate-limit` (déjà installé selon l'historique)
- `helmet` (déjà installé selon l'historique)

### Modifications du schéma Prisma
Si le schéma Prisma a été modifié (ajout du modèle `PasswordResetToken`), vous devez :
```bash
cd backend
npx prisma db push
```

### Variables d'environnement
Aucune nouvelle variable d'environnement n'est requise. Les fonctionnalités utilisent les variables existantes.

## 🔍 Vérification post-déploiement

Après le déploiement, vérifiez que :

1. ✅ Le serveur démarre sans erreur
2. ✅ Les routes `/api/csrf-token` fonctionnent
3. ✅ L'inscription exige un mot de passe fort
4. ✅ Le rate limiting fonctionne (tentatives de connexion limitées)
5. ✅ Les logs de sécurité apparaissent dans `pm2 logs`

## 🐛 En cas d'erreur

Si vous rencontrez des erreurs :

1. **Erreurs de compilation TypeScript** :
   ```bash
   cd backend
   npm run build
   ```
   Vérifiez les erreurs et corrigez-les.

2. **Erreurs de dépendances manquantes** :
   ```bash
   cd backend
   npm install
   ```

3. **Erreurs Prisma** :
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. **Le serveur ne démarre pas** :
   ```bash
   pm2 logs my-guidedigital-backend --lines 100
   ```
   Vérifiez les logs pour identifier le problème.

## 📝 Notes importantes

- **CSRF Token** : Le token CSRF est généré dynamiquement et stocké en mémoire. En production, vous pourriez vouloir utiliser Redis pour un stockage distribué.
- **Rate Limiting** : Les tentatives de connexion sont stockées en mémoire. En production avec plusieurs instances, utilisez Redis.
- **Logs** : Les logs de sécurité sont écrits dans la console. En production, configurez un système de logging centralisé (Winston, Logstash, etc.).

---

**Une fois le déploiement terminé, votre application sera beaucoup plus sécurisée ! 🔒**
