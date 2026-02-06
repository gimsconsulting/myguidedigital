# 🚀 Instructions de Démarrage - Cursor

## ✅ Ce qui a été créé

J'ai analysé votre analyse du site My Guide Digital et créé une structure de projet complète pour reproduire la plateforme. Voici ce qui est en place:

### Structure du Projet

```
projet my guide digital/
├── backend/              ✅ API Node.js/Express avec TypeScript
│   ├── src/
│   │   ├── routes/      ✅ Toutes les routes API (auth, livrets, modules, etc.)
│   │   └── index.ts     ✅ Serveur Express configuré
│   └── prisma/
│       └── schema.prisma ✅ Schéma de base de données complet
│
├── frontend/             ✅ Application Next.js 14
│   └── app/              ✅ Structure de base
│
├── database/             ✅ Scripts SQL
├── docs/                 ✅ Documentation complète
└── README.md             ✅ Documentation principale
```

### Fonctionnalités Implémentées (Backend)

✅ **Authentification complète**
- Inscription / Connexion
- JWT tokens
- Gestion de profil
- Mise à jour mot de passe

✅ **Gestion des Livrets**
- CRUD complet
- Génération de QR codes
- Duplication de livrets
- Accès public pour voyageurs

✅ **Système de Modules**
- 17 types de modules définis
- Réorganisation par drag & drop
- Contenu JSON flexible
- Traductions multi-langues

✅ **Statistiques**
- Suivi des consultations
- Compteurs par module
- Visiteurs uniques
- Historique détaillé

✅ **Abonnements**
- 3 plans (Mensuel/Annuel/À vie)
- Intégration Stripe prête
- Période d'essai (31 jours)

✅ **Base de Données**
- Schéma Prisma complet
- Relations bien définies
- Support multi-langue

## 📋 Étapes pour Démarrer dans Cursor

### Étape 1: Installer les Dépendances

Ouvrez un terminal dans Cursor et exécutez:

```bash
# Installer toutes les dépendances (backend + frontend)
npm run install:all
```

Ou manuellement:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Étape 2: Configurer PostgreSQL

**Option A: PostgreSQL local**
- Installez PostgreSQL si ce n'est pas fait
- Créez la base de données: `createdb livrets_accueil`

**Option B: Docker (recommandé)**
```bash
docker run --name postgres-livrets -e POSTGRES_PASSWORD=password -e POSTGRES_DB=livrets_accueil -p 5432:5432 -d postgres:14
```

### Étape 3: Configurer les Variables d'Environnement

**Backend** - Créez `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/livrets_accueil"
JWT_SECRET="changez-moi-en-production-avec-une-valeur-secrete"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
QR_CODE_BASE_URL="http://localhost:3000/guide"
```

**Frontend** - Créez `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Étape 4: Initialiser la Base de Données

```bash
cd backend

# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma migrate dev --name init
```

### Étape 5: Démarrer les Serveurs

**Dans Cursor, ouvrez 2 terminaux:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Le serveur API sera sur http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
L'application sera sur http://localhost:3000

### Étape 6: Vérifier que Tout Fonctionne

1. **Backend**: Visitez http://localhost:3001/health
   - Devrait retourner: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Visitez http://localhost:3000
   - Devrait afficher la page d'accueil

3. **Prisma Studio** (optionnel):
   ```bash
   cd backend
   npx prisma studio
   ```
   - Interface graphique pour voir/gérer les données

## 🎯 Prochaines Étapes de Développement

Maintenant que la base est en place, vous devez développer:

### 1. Interface d'Authentification (Frontend)
- Page de connexion
- Page d'inscription
- Gestion des tokens JWT
- Redirection après connexion

### 2. Dashboard Hôte
- Liste des livrets
- Création/édition de livret
- Gestion des modules
- Personnalisation visuelle
- Statistiques

### 3. Interface Voyageur (Public)
- Page d'accueil du livret (via QR code)
- Affichage des modules
- Sélecteur de langue
- Design responsive

### 4. Système de Modules
- Éditeurs pour chaque type de module
- Drag & drop pour réorganiser
- Traductions automatiques

### 5. Intégrations
- Upload d'images (profil, fond)
- Génération de QR codes visuels
- Intégration Stripe complète
- Système de factures

## 📚 Documentation Disponible

- `README.md` - Vue d'ensemble du projet
- `docs/GETTING_STARTED.md` - Guide détaillé d'installation
- `docs/ARCHITECTURE.md` - Architecture technique

## 🔧 Commandes Utiles

```bash
# Démarrer tout en même temps (depuis la racine)
npm run dev

# Backend uniquement
cd backend && npm run dev

# Frontend uniquement
cd frontend && npm run dev

# Prisma
cd backend
npx prisma studio          # Interface graphique
npx prisma migrate dev     # Créer une migration
npx prisma generate        # Régénérer le client
```

## ⚠️ Notes Importantes

1. **Nom du projet**: Le projet est actuellement nommé "livrets-accueil-platform" dans les fichiers. Vous pourrez le renommer plus tard comme souhaité.

2. **Stripe**: Pour tester les paiements, vous devrez créer un compte Stripe et obtenir des clés API de test.

3. **Upload de fichiers**: Le dossier `backend/uploads` sera créé automatiquement. Assurez-vous d'avoir les permissions d'écriture.

4. **Base de données**: Le schéma Prisma est complet mais vous pourrez l'ajuster selon vos besoins spécifiques.

## 🆘 Besoin d'Aide?

Si vous rencontrez des problèmes:
1. Vérifiez que PostgreSQL est bien démarré
2. Vérifiez les variables d'environnement
3. Consultez les logs dans les terminaux
4. Utilisez Prisma Studio pour inspecter la base de données

## ✨ Bon Développement!

La structure de base est prête. Vous pouvez maintenant commencer à développer les interfaces utilisateur et personnaliser selon vos besoins.
