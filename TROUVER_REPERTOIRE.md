# 🔍 Trouver le Répertoire du Projet

## Étape 1 : Trouver où se trouve votre projet

Exécutez ces commandes sur votre VPS pour trouver le répertoire :

```bash
# Chercher le répertoire backend
find /root -type d -name "backend" 2>/dev/null

# Ou chercher le fichier schema.prisma
find /root -name "schema.prisma" 2>/dev/null

# Ou chercher le répertoire myguidedigital
find /root -type d -name "myguidedigital" 2>/dev/null
```

## Étape 2 : Une fois le chemin trouvé, naviguer vers le backend

Par exemple, si vous trouvez `/root/myguidedigital/myguidedigital/backend` :

```bash
cd /root/myguidedigital/myguidedigital/backend
```

## Étape 3 : Vérifier que vous êtes au bon endroit

```bash
# Vérifier que le fichier schema.prisma existe
ls -la prisma/schema.prisma

# Vérifier que vous êtes dans le bon répertoire
pwd
```

## Étape 4 : Exécuter les commandes Prisma

```bash
npx prisma generate
npx prisma db push
```
