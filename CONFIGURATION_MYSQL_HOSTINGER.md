# 🔧 Configuration MySQL pour Hostinger

## ✅ Base de Données Créée

Vous avez créé votre base de données MySQL sur Hostinger. Maintenant, il faut adapter votre projet.

## 📋 Informations à Noter

Assurez-vous d'avoir noté :
- **Nom de la base de données** : `u513978936_myguidedigital` (ou celui que vous avez créé)
- **Nom d'utilisateur** : `u513978936_myguideuser` (ou celui que vous avez créé)
- **Mot de passe** : (celui que vous avez défini)
- **Serveur** : Généralement `localhost` ou l'adresse fournie par Hostinger

## 🔄 Étape 1 : Mettre à Jour le Schema Prisma

Le fichier `backend/prisma/schema.prisma` a été mis à jour pour utiliser MySQL au lieu de SQLite.

## 🔄 Étape 2 : Mettre à Jour la Configuration

### Fichier `.env` du Backend

Créez ou mettez à jour `backend/.env` avec :

```env
# Base de données MySQL Hostinger
DATABASE_URL="mysql://u513978936_myguideuser:Patrice-charly-lena-0904*@localhost:3306/u513978936_myguidedigital"

# Ou si Hostinger fournit une adresse différente :
# DATABASE_URL="mysql://u513978936_myguideuser:Patrice-charly-lena-0904*@mysql.hostinger.com:3306/u513978936_myguidedigital"
```

**Format de la DATABASE_URL MySQL :**
```
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

### Remplacez :
- `USERNAME` : votre nom d'utilisateur MySQL
- `PASSWORD` : votre mot de passe MySQL
- `HOST` : généralement `localhost` ou l'adresse fournie par Hostinger
- `PORT` : généralement `3306` (port MySQL par défaut)
- `DATABASE_NAME` : le nom complet de votre base de données

## 🔄 Étape 3 : Générer le Client Prisma

```bash
cd backend
npx prisma generate
```

## 🔄 Étape 4 : Créer les Tables (Migrations)

### Option A : Push Direct (Développement)

```bash
cd backend
npx prisma db push
```

### Option B : Migrations (Production - Recommandé)

```bash
cd backend
npx prisma migrate dev --name init_mysql
```

## 🔄 Étape 5 : Vérifier la Connexion

```bash
cd backend
npx prisma studio
```

Cela ouvrira une interface pour voir vos tables. Si ça fonctionne, la connexion est OK !

## 📤 Étape 6 : Préparer pour le Déploiement

### Mettre à Jour le Fichier .env sur Hostinger

Quand vous déploierez sur Hostinger, vous devrez créer un fichier `.env` dans `backend/` avec la même `DATABASE_URL`.

## ⚠️ Différences SQLite vs MySQL

### Types de Données
- SQLite : `String` → MySQL : `VARCHAR` ou `TEXT`
- SQLite : `Int` → MySQL : `INT`
- SQLite : `Boolean` → MySQL : `TINYINT(1)`

Prisma gère automatiquement ces conversions, mais certaines requêtes peuvent nécessiter des ajustements.

### Limitations
- MySQL a des limites de taille de colonne
- Les noms de tables/colonnes sont sensibles à la casse selon la configuration
- Les transactions peuvent se comporter différemment

## 🔍 Vérification

Après avoir configuré, testez localement :

```bash
cd backend
npm run dev
```

Vérifiez que le serveur démarre sans erreur de connexion à la base de données.

## 📝 Prochaines Étapes

1. ✅ Mettre à jour `schema.prisma` (fait)
2. ⏳ Mettre à jour `backend/.env` avec votre DATABASE_URL
3. ⏳ Générer Prisma Client
4. ⏳ Créer les tables
5. ⏳ Tester la connexion
6. ⏳ Déployer sur Hostinger

---

**Besoin d'aide ?** Dites-moi si vous avez des erreurs lors de la configuration !
