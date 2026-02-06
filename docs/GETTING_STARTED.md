# Guide de Démarrage

## 🚀 Installation Rapide

### 1. Prérequis

Assurez-vous d'avoir installé:
- **Node.js** 18+ ([télécharger](https://nodejs.org/))
- **PostgreSQL** 14+ ([télécharger](https://www.postgresql.org/download/))
- **Git** ([télécharger](https://git-scm.com/))

### 2. Installation des Dépendances

```bash
# À la racine du projet
npm run install:all
```

Ou manuellement:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configuration de la Base de Données

#### Option A: Avec PostgreSQL local

```bash
# Créer la base de données
createdb livrets_accueil

# Ou avec psql
psql -U postgres
CREATE DATABASE livrets_accueil;
\q
```

#### Option B: Avec Docker (recommandé)

```bash
docker run --name postgres-livrets \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=livrets_accueil \
  -p 5432:5432 \
  -d postgres:14
```

### 4. Configuration des Variables d'Environnement

#### Backend

Créez `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/livrets_accueil"
JWT_SECRET="votre-secret-jwt-changez-moi"
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

#### Frontend

Créez `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Initialisation de la Base de Données

```bash
cd backend

# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npm run prisma:studio
```

### 6. Démarrer l'Application

#### Option A: Démarrer séparément

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option B: Démarrer ensemble (depuis la racine)

```bash
npm run dev
```

### 7. Accéder à l'Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: http://localhost:5555 (si lancé)

## 📝 Premiers Pas

### Créer un Compte

1. Accédez à http://localhost:3000
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire
4. Vous bénéficierez automatiquement de 31 jours d'essai gratuit

### Créer votre Premier Livret

1. Connectez-vous au dashboard
2. Cliquez sur "Créer un livret"
3. Remplissez les informations de base
4. Ajoutez des modules
5. Personnalisez l'apparence
6. Scannez le QR code généré

## 🛠️ Commandes Utiles

### Backend

```bash
cd backend

# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Prisma
npm run prisma:generate    # Générer le client
npm run prisma:migrate     # Créer une migration
npm run prisma:studio      # Interface graphique
```

### Frontend

```bash
cd frontend

# Développement
npm run dev

# Build
npm run build

# Production
npm start

# Linter
npm run lint
```

## 🐛 Dépannage

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est démarré
- Vérifiez la `DATABASE_URL` dans `.env`
- Testez la connexion: `psql -U postgres -d livrets_accueil`

### Erreur "Module not found"

- Exécutez `npm install` dans le dossier concerné
- Supprimez `node_modules` et `package-lock.json`, puis réinstallez

### Erreur Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate reset  # ⚠️ Supprime toutes les données
```

### Port déjà utilisé

- Changez le `PORT` dans `backend/.env`
- Ou changez le port Next.js: `npm run dev -- -p 3001`

## 📚 Prochaines Étapes

1. ✅ Configuration de base terminée
2. ⏳ Implémentation de l'interface d'authentification
3. ⏳ Création du dashboard hôte
4. ⏳ Implémentation des 17 modules
5. ⏳ Interface voyageur (front-end public)
6. ⏳ Système de statistiques
7. ⏳ Intégration Stripe
8. ⏳ Tests et déploiement

## 💡 Conseils

- Utilisez Prisma Studio pour visualiser et modifier les données
- Activez les logs détaillés en mode développement
- Testez les endpoints API avec Postman ou Insomnia
- Consultez la documentation Prisma: https://www.prisma.io/docs
