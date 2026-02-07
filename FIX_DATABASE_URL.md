# 🔧 Correction de l'Erreur DATABASE_URL

## ❌ Erreur Actuelle

```
Error: the URL must start with the protocol `mysql://`.
```

Cela signifie que votre fichier `backend/.env` contient encore l'ancienne URL SQLite au lieu de l'URL MySQL.

## ✅ Solution

### Étape 1 : Ouvrir le fichier .env

Ouvrez `backend/.env` dans votre éditeur de texte.

### Étape 2 : Trouver la ligne DATABASE_URL

Cherchez la ligne qui commence par `DATABASE_URL=`

### Étape 3 : Remplacer par l'URL MySQL

**Ancienne URL (SQLite) :**
```env
DATABASE_URL="file:./prisma/dev.db"
```

**Nouvelle URL (MySQL) - À METTRE :**
```env
DATABASE_URL="mysql://u513978936_myguideuser:VOTRE_MOT_DE_PASSE@localhost:3306/u513978936_myguidedigital"
```

**Remplacez :**
- `VOTRE_MOT_DE_PASSE` par le mot de passe MySQL que vous avez créé sur Hostinger
- `u513978936_myguideuser` par votre nom d'utilisateur réel
- `u513978936_myguidedigital` par votre nom de base de données réel

### Exemple Complet

Si votre mot de passe est `MonPass123`, votre fichier `.env` devrait contenir :

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="mysql://u513978936_myguideuser:MonPass123@localhost:3306/u513978936_myguidedigital"
JWT_SECRET=votre-secret-jwt
FRONTEND_URL=http://localhost:3000
```

## ⚠️ Important

1. **L'URL DOIT commencer par `mysql://`** (pas `file://`)
2. **Pas d'espaces** autour du `=`
3. **Guillemets** autour de l'URL complète
4. **Le mot de passe** ne doit pas contenir de caractères spéciaux qui nécessitent un encodage URL

## 🔄 Après la Correction

Une fois le `.env` corrigé :

```bash
cd backend
npx prisma generate
npx prisma db push
```

## 🆘 Si le Mot de Passe Contient des Caractères Spéciaux

Si votre mot de passe contient `@`, `#`, `%`, etc., vous devez les encoder en URL :

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`

Ou changez le mot de passe sur Hostinger pour un mot de passe sans caractères spéciaux.

---

**Corrigez votre fichier `.env` et réessayez !**
