# Plateforme SaaS de Livrets d'Accueil Digitaux

Une plateforme B2B complète pour créer et gérer des livrets d'accueil digitaux personnalisés pour hébergements touristiques.

## 🏗️ Architecture du Projet

```
projet-my-guide-digital/
├── frontend/              # Application React/Next.js (Interface Hôte + Voyageur)
├── backend/               # API Node.js/Express avec TypeScript
├── database/              # Scripts de migration et schéma SQL
├── shared/                # Types et utilitaires partagés
└── docs/                  # Documentation
```

## 🚀 Technologies Recommandées

### Frontend
- **Next.js 14** (App Router) - Framework React avec SSR
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **React Hook Form** - Gestion des formulaires
- **Zustand/Redux** - Gestion d'état
- **i18next** - Internationalisation (9 langues)

### Backend
- **Node.js + Express** - API REST
- **TypeScript** - Typage statique
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données principale
- **JWT** - Authentification
- **Stripe** - Paiements (abonnements)
- **QRCode** - Génération de QR codes
- **Multer** - Upload de fichiers

### Infrastructure
- **Docker** - Containerisation
- **Redis** - Cache et sessions
- **AWS S3 / Cloudinary** - Stockage d'images

## 📋 Fonctionnalités Principales

### Interface Hôte (Back-office)
- ✅ Authentification et gestion de profil
- ✅ Création et gestion de livrets
- ✅ 17 modules d'information configurables
- ✅ Personnalisation visuelle (couleurs, polices, images)
- ✅ Gestion multi-langue (9 langues)
- ✅ Génération de QR codes
- ✅ Statistiques d'utilisation
- ✅ Système d'abonnement (Mensuel/Annuel/A vie)
- ✅ Gestion des factures

### Interface Voyageur (Front-end)
- ✅ Consultation du livret via QR code
- ✅ Navigation par modules
- ✅ Sélection de langue
- ✅ Design responsive et moderne

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+ et npm/yarn
- PostgreSQL 14+
- Git

### Étapes d'installation

1. **Cloner et installer les dépendances**
```bash
# Installer les dépendances du backend
cd backend
npm install

# Installer les dépendances du frontend
cd ../frontend
npm install
```

2. **Configurer la base de données**
```bash
# Créer la base de données PostgreSQL
createdb livrets_accueil

# Exécuter les migrations
cd backend
npx prisma migrate dev
```

3. **Configurer les variables d'environnement**
```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/livrets_accueil"
JWT_SECRET="votre-secret-jwt"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
UPLOAD_DIR="./uploads"
```

4. **Démarrer les serveurs**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Structure des Modules

Les 17 modules disponibles:
1. Wi-fi
2. Infos arrivée
3. Mot d'accueil
4. Codes d'entrée
5. Numéros utiles
6. Infos départ
7. Parking
8. Restaurants
9. Règlement
10. Equipements
11. Bars
12. Sécurité et secours
13. Inventaire
14. Activités
15. Poubelles
16. Avis
17. Extras & Services

## 🌍 Langues Supportées

- 🇫🇷 Français
- 🇬🇧 English
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇪🇸 Español
- 🇵🇹 Português
- 🇨🇳 中文
- 🇷🇺 Русский
- 🇳🇱 Nederlands

## 📝 Prochaines Étapes

1. Créer la structure de base du projet
2. Configurer l'authentification
3. Implémenter la gestion des livrets
4. Ajouter les modules d'information
5. Intégrer le système de paiement
6. Déployer l'application

## 📄 Licence

Propriétaire - Tous droits réservés
