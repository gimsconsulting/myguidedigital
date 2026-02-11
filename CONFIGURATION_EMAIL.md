# 📧 Configuration de l'envoi d'emails

## Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` sur le serveur :

```env
# Configuration SMTP pour l'envoi d'emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
SMTP_FROM="MyGuideDigital" <noreply@myguidedigital.com>

# Email de support (optionnel)
SUPPORT_EMAIL=support@myguidedigital.com

# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=https://app.myguidedigital.com
```

## Options de configuration SMTP

### Option 1 : Gmail (Recommandé pour commencer)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app  # Mot de passe d'application, pas le mot de passe Gmail
```

**Important pour Gmail** : Vous devez créer un "Mot de passe d'application" :
1. Allez dans votre compte Google
2. Sécurité → Validation en 2 étapes → Mots de passe des applications
3. Créez un mot de passe d'application
4. Utilisez ce mot de passe dans `SMTP_PASSWORD`

### Option 2 : SendGrid (Recommandé pour la production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=votre-api-key-sendgrid
SMTP_FROM="MyGuideDigital" <noreply@myguidedigital.com>
```

### Option 3 : Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASSWORD=votre-mot-de-passe-mailgun
SMTP_FROM="MyGuideDigital" <noreply@myguidedigital.com>
```

### Option 4 : SMTP personnalisé (OVH, Hostinger, etc.)

```env
SMTP_HOST=ssl0.ovh.net  # Exemple pour OVH
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=votre-email@votre-domaine.com
SMTP_PASSWORD=votre-mot-de-passe
SMTP_FROM="MyGuideDigital" <noreply@votre-domaine.com>
```

## Installation

Sur votre serveur VPS :

```bash
cd /root/myguidedigital/myguidedigital/backend
npm install nodemailer@^6.9.8
npm install --save-dev @types/nodemailer@^6.4.14
npm run build
pm2 restart my-guidedigital-backend
```

## Test de l'envoi d'email

Après configuration, testez en créant un compte. L'email de bienvenue devrait être envoyé automatiquement.

Pour vérifier les logs :
```bash
pm2 logs my-guidedigital-backend | grep -i email
```

## Désactiver l'envoi d'emails (pour les tests)

Si vous ne configurez pas les variables SMTP, l'application fonctionnera normalement mais les emails ne seront pas envoyés. Un avertissement sera loggé.

## Personnalisation du template d'email

Le template d'email se trouve dans `backend/src/services/email.ts` dans la fonction `getWelcomeEmailTemplate()`. Vous pouvez le modifier pour personnaliser le design et le contenu.
