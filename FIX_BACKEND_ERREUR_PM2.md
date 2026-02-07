# Backend en erreur sur le VPS (PM2 « errored »)

Si `my-guidedigital-backend` est en **errored** après le déploiement, fais les étapes ci‑dessous dans le **terminal Hostinger VPS**.

---

## 1. Voir l’erreur exacte du backend

Dans le terminal du VPS :

```bash
pm2 logs my-guidedigital-backend --lines 80
```

Regarde la fin des lignes : tu devrais voir un message d’erreur (base de données, fichier `.env` manquant, etc.). Note ce message.

---

## 2. Vérifier où est le fichier .env

Le backend a besoin d’un fichier `.env` avec au moins `DATABASE_URL` (et les autres variables). Vérifie où il est :

```bash
cd ~/myguidedigital/myguidedigital
ls -la .env
ls -la backend/.env
```

- Si **aucun** des deux n’existe → il faut créer/copier le `.env` (voir plus bas).
- Si seul `backend/.env` existe → c’est bon, le code a été mis à jour pour le trouver là.
- Si seul `.env` à la racine existe → c’est bon aussi.

---

## 3. Copier le .env au bon endroit (si besoin)

Si ton `.env` est seulement dans `backend/` et que le backend ne le charge pas, ou si tu n’as qu’un seul `.env` à un endroit, tu peux en avoir une copie à la **racine du projet** (pour PM2 qui lance depuis la racine) :

```bash
cd ~/myguidedigital/myguidedigital
cp backend/.env .env
```

(ou l’inverse si ton vrai fichier est à la racine : `cp .env backend/.env`)

---

## 4. Vérifier DATABASE_URL

Le crash vient souvent d’une **DATABASE_URL** manquante ou incorrecte. Vérifie (sans afficher le mot de passe en clair) :

```bash
grep DATABASE_URL .env backend/.env 2>/dev/null | head -1
```

Tu dois voir une ligne du type :  
`DATABASE_URL="mysql://user:password@host:3306/database"`  
Si la ligne est vide ou absente, corrige le fichier `.env` avec la bonne URL MySQL (Hostinger te la donne dans le panneau).

---

## 5. Récupérer le nouveau code et redéployer

Le code a été modifié pour que le backend cherche le `.env` à la racine **ou** dans `backend/`. Récupère les changements et redémarre :

```bash
cd ~/myguidedigital/myguidedigital
git pull origin main
cd backend
npm run build
cd ..
pm2 restart my-guidedigital-backend
pm2 list
```

Le backend doit passer en **online**. Si tu vois encore **errored**, relance :

```bash
pm2 logs my-guidedigital-backend --lines 50
```

et envoie le message d’erreur pour qu’on puisse cibler la cause (base de données, port, etc.).
