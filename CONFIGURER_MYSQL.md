# 🔧 Configuration MySQL - Étapes Immédiates

## ✅ Ce qui a été fait

1. ✅ Schema Prisma mis à jour pour MySQL
2. ✅ Base de données créée sur Hostinger

## 📋 Informations Nécessaires

Vous devez avoir noté :
- **Nom de la base de données** : `u513978936_myguidedigital` (ou le vôtre)
- **Nom d'utilisateur** : `u513978936_myguideuser` (ou le vôtre)
- **Mot de passe** : (celui que vous avez créé)
- **Serveur** : Généralement `localhost` ou l'adresse MySQL de Hostinger

## 🔄 Étape 1 : Mettre à Jour le Fichier .env

### Sur votre ordinateur local :

1. **Ouvrez** `backend/.env`
2. **Remplacez** la ligne `DATABASE_URL` par :

```env
DATABASE_URL="mysql://u513978936_myguideuser:VOTRE_MOT_DE_PASSE@localhost:3306/u513978936_myguidedigital"
```

**Remplacez :**
- `VOTRE_MOT_DE_PASSE` par le mot de passe que vous avez créé
- `u513978936_myguideuser` par votre nom d'utilisateur réel
- `u513978936_myguidedigital` par votre nom de base de données réel

### Format de la DATABASE_URL :

```
mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Exemple complet :**
```
DATABASE_URL="mysql://u513978936_myguideuser:MonMotDePasse123@localhost:3306/u513978936_myguidedigital"
```

## 🔄 Étape 2 : Générer Prisma Client

```bash
cd backend
npx prisma generate
```

## 🔄 Étape 3 : Créer les Tables

```bash
cd backend
npx prisma db push
```

Cela créera toutes les tables dans votre base de données MySQL.

## ⚠️ Important : Hostinger peut utiliser un serveur MySQL différent

Si `localhost` ne fonctionne pas, Hostinger peut fournir :
- Une adresse comme `mysql.hostinger.com`
- Un port différent
- Vérifiez dans les détails de votre base de données sur Hostinger

## 📤 Pour le Déploiement sur Hostinger

Quand vous déploierez sur Hostinger, vous devrez :
1. Créer un fichier `backend/.env` sur le serveur
2. Y mettre la même `DATABASE_URL` (mais avec l'adresse MySQL de Hostinger si différente)

## ✅ Vérification

Testez localement :

```bash
cd backend
npm run dev
```

Si le serveur démarre sans erreur, c'est bon !

---

## 🚀 Prochaines Étapes

1. ⏳ Mettre à jour `backend/.env` avec votre DATABASE_URL MySQL
2. ⏳ Exécuter `npx prisma generate`
3. ⏳ Exécuter `npx prisma db push`
4. ⏳ Tester que tout fonctionne
5. ⏳ Continuer le déploiement sur Hostinger

---

**Dites-moi quand vous avez mis à jour le .env et je vous guiderai pour la suite !**
