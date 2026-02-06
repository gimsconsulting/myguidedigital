# Configuration Stripe

## Étapes pour configurer Stripe

### 1. Créer un compte Stripe

1. Allez sur : https://dashboard.stripe.com/register
2. Créez un compte (gratuit)
3. Accédez au dashboard

### 2. Récupérer les clés API

1. Dans le dashboard Stripe, allez dans **Développeurs** → **Clés API**
2. Copiez la **Clé secrète** (commence par `sk_test_` en mode test, `sk_live_` en production)
3. Ajoutez-la dans `backend/.env` :
   ```
   STRIPE_SECRET_KEY="sk_test_votre_cle_secrete"
   ```

### 3. Configurer le webhook

1. Dans le dashboard Stripe, allez dans **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL de l'endpoint : `http://votre-domaine.com/api/subscriptions/webhook`
   - Pour le développement local, utilisez ngrok : `https://votre-url-ngrok.ngrok.io/api/subscriptions/webhook`
4. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Secret de signature** (commence par `whsec_`)
6. Ajoutez-le dans `backend/.env` :
   ```
   STRIPE_WEBHOOK_SECRET="whsec_votre_secret"
   ```

### 4. Variables d'environnement complètes

Dans `backend/.env`, ajoutez :

```env
STRIPE_SECRET_KEY="sk_test_votre_cle_secrete"
STRIPE_WEBHOOK_SECRET="whsec_votre_secret"
FRONTEND_URL="http://localhost:3000"
```

### 5. Tester avec les cartes de test

Stripe fournit des cartes de test :
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel 3 chiffres

### 6. Mode production

Quand vous êtes prêt pour la production :
1. Basculez en mode **Live** dans le dashboard Stripe
2. Utilisez les clés `sk_live_...` au lieu de `sk_test_...`
3. Configurez un nouveau webhook avec l'URL de production
4. Mettez à jour les variables d'environnement

## Fonctionnalités implémentées

✅ Création de sessions de checkout Stripe
✅ Gestion des webhooks (paiement réussi, échec, annulation)
✅ Création automatique d'abonnements dans la base de données
✅ Création automatique de factures
✅ Gestion des abonnements récurrents (mensuel, annuel)
✅ Gestion des paiements uniques (à vie)

## Notes importantes

- Le webhook doit être accessible publiquement (utilisez ngrok pour le développement local)
- Les webhooks sont vérifiés avec la signature Stripe pour la sécurité
- Les abonnements sont automatiquement mis à jour lors des événements Stripe
