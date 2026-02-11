# Migration - Système de Réinitialisation de Mot de Passe Sécurisé

## ✅ Corrections Apportées

### 1. **Schéma Prisma** (`backend/prisma/schema.prisma`)
- ✅ Ajout du modèle `PasswordResetToken` avec :
  - Token unique et sécurisé
  - Expiration (30 minutes)
  - Statut "used" pour éviter la réutilisation
  - Index pour performance

### 2. **Backend** (`backend/src/routes/auth.ts`)
- ✅ Nouvelle route `/api/auth/forgot-password` :
  - Génère un token sécurisé (32 bytes aléatoires)
  - Limite à 3 tentatives par heure par email
  - Invalide les tokens précédents
  - Message générique (protection contre l'énumération d'emails)
  
- ✅ Route `/api/auth/reset-password` modifiée :
  - Exige maintenant un token valide
  - Vérifie l'expiration (30 minutes)
  - Vérifie que le token n'a pas été utilisé
  - Invalide tous les autres tokens après utilisation

- ✅ Nettoyage automatique des tokens expirés (toutes les heures)

### 3. **Frontend**
- ✅ Page `/forgot-password` refaite avec deux étapes :
  - Étape 1 : Demander la réinitialisation (email)
  - Étape 2 : Réinitialiser avec le token (depuis l'URL)
- ✅ API frontend mise à jour avec `forgotPassword` et `resetPassword` modifié

## 📋 Instructions de Déploiement

### Étape 1 : Mettre à jour le schéma Prisma

```bash
cd backend
npx prisma generate
npx prisma db push
```

OU avec une migration :

```bash
cd backend
npx prisma migrate dev --name add_password_reset_tokens
```

### Étape 2 : Vérifier les Variables d'Environnement

Assurez-vous que `FRONTEND_URL` est défini dans `backend/.env` :

```env
FRONTEND_URL="https://app.myguidedigital.com"
# ou en développement:
FRONTEND_URL="http://localhost:3000"
```

### Étape 3 : Redémarrer le Backend

```bash
cd backend
npm run build
pm2 restart my-guidedigital-backend
```

### Étape 4 : Tester

1. **Tester la demande de réinitialisation :**
   - Aller sur `/forgot-password`
   - Entrer un email
   - En développement, le token sera affiché dans la console du backend
   - En production, il faudra configurer l'envoi d'email

2. **Tester la réinitialisation :**
   - Copier le token depuis la console (dev) ou l'email (prod)
   - Aller sur `/forgot-password?token=LE_TOKEN`
   - Entrer un nouveau mot de passe
   - Se connecter avec le nouveau mot de passe

## 🔒 Sécurité Améliorée

- ✅ **Protection contre l'énumération d'emails** : Message générique même si l'email n'existe pas
- ✅ **Tokens avec expiration** : 30 minutes maximum
- ✅ **Limite de tentatives** : 3 par heure par email
- ✅ **Tokens à usage unique** : Marqués comme "used" après utilisation
- ✅ **Invalidation automatique** : Tous les tokens précédents sont invalidés
- ✅ **Nettoyage automatique** : Tokens expirés supprimés toutes les heures

## 📝 TODO (Optionnel - Améliorations Futures)

- [ ] Configurer l'envoi d'email en production (SendGrid, Nodemailer, etc.)
- [ ] Ajouter un rate limiting IP-based pour `/forgot-password`
- [ ] Logger les tentatives de réinitialisation pour audit
- [ ] Ajouter une vérification CAPTCHA pour `/forgot-password`

## ⚠️ Notes Importantes

1. **En développement**, le token est affiché dans la console du backend et retourné dans la réponse API. **En production**, il doit être envoyé uniquement par email.

2. **L'envoi d'email n'est pas encore implémenté**. Pour l'instant, en développement, le token est loggé. Il faudra ajouter un service d'email (SendGrid, AWS SES, etc.) pour la production.

3. **Le nettoyage automatique** fonctionne via `setInterval`. Pour une meilleure scalabilité, on pourrait utiliser un cron job ou une tâche planifiée.
