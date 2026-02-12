# Architecture du Projet

## Vue d'ensemble

Cette plateforme est une application SaaS B2B permettant aux hôtes de créer des livrets d'accueil digitaux personnalisés pour leurs voyageurs.

## Structure des Dossiers

```
projet-my-guide-digital/
├── backend/                 # API Backend
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   │   ├── auth.ts     # Authentification
│   │   │   ├── livrets.ts  # Gestion des livrets
│   │   │   ├── modules.ts  # Gestion des modules
│   │   │   ├── statistics.ts # Statistiques
│   │   │   ├── subscriptions.ts # Abonnements
│   │   │   └── invoices.ts # Factures
│   │   └── index.ts        # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   └── package.json
│
├── frontend/                # Application Next.js
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── (auth)/         # Routes d'authentification
│   │   ├── (dashboard)/    # Interface hôte
│   │   ├── guide/          # Interface voyageur (public)
│   │   └── layout.tsx
│   ├── components/         # Composants React
│   ├── lib/                # Utilitaires
│   └── package.json
│
└── database/                # Scripts SQL
```

## Flux de Données

### Authentification
1. Utilisateur s'inscrit/se connecte
2. Backend génère un JWT
3. Frontend stocke le token
4. Token inclus dans les requêtes API

### Création d'un Livret
1. Hôte crée un livret via le dashboard
2. Backend génère un QR code unique
3. QR code associé au livret
4. Livret accessible via URL publique

### Consultation par Voyageur
1. Scan du QR code
2. Redirection vers page publique
3. Affichage du livret avec modules actifs
4. Enregistrement des statistiques

## Modules Disponibles

Les 17 modules sont définis dans le schéma Prisma comme `ModuleType`:
- WIFI, ARRIVEE, ACCUEIL, CODES_ENTREE, NUMEROS_UTILES
- DEPART, PARKING, RESTAURANTS, REGLEMENT, EQUIPEMENTS
- BARS, SECURITE, INVENTAIRE, ACTIVITES, POUBELLES
- AVIS, EXTRAS, CUSTOM

Chaque module peut avoir:
- Un contenu JSON flexible
- Des traductions multi-langues
- Un ordre d'affichage personnalisable

## Système Multi-langue

9 langues supportées:
- fr, en, de, it, es, pt, zh, ru, nl

Les traductions sont stockées dans:
- `Livret.languages` - Langues actives
- `Module.translations` - Contenu traduit par module

## Statistiques

Chaque consultation génère une entrée `Statistic` avec:
- `livretId` - Livret consulté
- `moduleType` - Module consulté (null pour ouverture globale)
- `ipAddress` - Adresse IP du visiteur
- `userAgent` - Navigateur utilisé
- `viewedAt` - Date/heure

## Abonnements

3 plans disponibles:
- **TRIAL** - 31 jours gratuits
- **MONTHLY** - 15€/mois
- **YEARLY** - 99€/an (8.25€/mois)
- **LIFETIME** - 199€ une fois

Intégration Stripe pour les paiements.
