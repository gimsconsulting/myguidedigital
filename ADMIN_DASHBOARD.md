# Dashboard Administrateur

## 🎯 Vue d'ensemble

Le dashboard administrateur permet de gérer et surveiller l'ensemble de l'application My Guide Digital.

## 🔐 Accès

Seuls les utilisateurs avec le rôle `ADMIN` peuvent accéder au dashboard administrateur.

## 📋 Fonctionnalités

### 1. Vue d'ensemble (Dashboard)
- **KPIs Utilisateurs** : Total, actifs, en essai, payants
- **KPIs Revenus** : Totaux, mensuels, par plan (Mensuel, Annuel, À vie)
- **KPIs Livrets** : Total, actifs, inactifs
- **Taux de conversion** : Essai → Payant
- **Alertes** : Abonnements expirant bientôt

### 2. Gestion des Utilisateurs
- Liste complète des utilisateurs
- Recherche par nom/email
- Filtres par plan et statut
- Informations détaillées : abonnement, nombre de livrets, date d'inscription

### 3. Statistiques Financières
- Revenus totaux, MRR, ARR
- Revenus par plan (Mensuel, Annuel, À vie)
- Revenus mensuels (12 derniers mois)
- Nombre d'abonnements actifs par plan

### 4. Gestion des Abonnements
- Liste de tous les abonnements
- Filtres par plan et statut
- Informations : utilisateur, dates, statut Stripe

### 5. Statistiques des Livrets
- Total, actifs, inactifs
- Top 10 des livrets les plus consultés
- Répartition par type de module

### 6. Gestion des Factures
- Liste de toutes les factures
- Filtres par statut
- Informations : utilisateur, montant, plan, date de paiement

## 🚀 Comment promouvoir un utilisateur en ADMIN

### Méthode 1 : Script Node.js (Recommandé)

```bash
cd backend
npx tsx scripts/make-admin.ts <email>
```

Exemple :
```bash
npx tsx scripts/make-admin.ts admin@example.com
```

### Méthode 2 : Via Prisma Studio

1. Ouvrir Prisma Studio :
```bash
cd backend
npx prisma studio
```

2. Aller dans la table `users`
3. Trouver l'utilisateur à promouvoir
4. Modifier le champ `role` de `USER` à `ADMIN`
5. Sauvegarder

### Méthode 3 : Via SQL direct

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## 📍 URLs du Dashboard

- **Dashboard principal** : `/admin/dashboard`
- **Utilisateurs** : `/admin/users`
- **Revenus** : `/admin/revenue`
- **Abonnements** : `/admin/subscriptions`
- **Livrets** : `/admin/livrets`
- **Factures** : `/admin/invoices`

## 🔒 Sécurité

- Toutes les routes admin sont protégées par un middleware qui vérifie :
  1. L'authentification (token JWT valide)
  2. Le rôle ADMIN de l'utilisateur
- Les utilisateurs non-admin sont automatiquement redirigés vers `/dashboard`

## 📊 API Endpoints

Tous les endpoints admin sont préfixés par `/api/admin` :

- `GET /api/admin/overview` - Vue d'ensemble (KPIs)
- `GET /api/admin/users` - Liste des utilisateurs
- `GET /api/admin/revenue` - Statistiques financières
- `GET /api/admin/subscriptions` - Liste des abonnements
- `GET /api/admin/livrets` - Statistiques des livrets
- `GET /api/admin/invoices` - Liste des factures

## 🎨 Navigation

Le lien "Admin" apparaît automatiquement dans le menu de navigation pour les utilisateurs avec le rôle ADMIN (en rouge pour le distinguer).

## ⚠️ Notes importantes

- Le premier utilisateur admin doit être créé manuellement (via script ou Prisma Studio)
- Les données sont en temps réel (pas de cache)
- Les paginations sont limitées à 20 éléments par page
- Les recherches et filtres fonctionnent en combinaison
