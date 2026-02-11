# Vérifier si l'utilisateur existe dans la base de données

## Problème
Le message "Aucun compte trouvé avec cet email" lors de la réinitialisation du mot de passe indique que l'utilisateur n'existe pas dans la base de données MySQL.

## Vérification

### 1. Vérifier si l'utilisateur existe dans MySQL

Sur votre serveur VPS :

```bash
# Se connecter à MySQL
mysql -u root -p

# Entrer votre mot de passe MySQL

# Utiliser votre base de données
USE votre_nom_de_base_de_donnees;

# Voir tous les utilisateurs
SELECT id, email, createdAt FROM users;

# Chercher un utilisateur spécifique par email
SELECT id, email, createdAt FROM users WHERE email = 'contact@gims-consulting.be';
```

### 2. Si l'utilisateur n'existe pas

Cela signifie que les données n'ont pas été migrées depuis SQLite vers MySQL. Vous avez deux options :

**Option A : Recréer le compte**

1. Allez sur `https://app.myguidedigital.com/register`
2. Créez un nouveau compte avec l'email `contact@gims-consulting.be`
3. Utilisez le nouveau mot de passe que vous définissez

**Option B : Migrer les données depuis SQLite (si le fichier existe encore)**

Si vous avez encore accès à l'ancienne base SQLite (`backend/dev.db`), vous pouvez exporter les utilisateurs :

```bash
# Sur votre machine locale (si vous avez encore le fichier SQLite)
sqlite3 backend/dev.db "SELECT * FROM users;" > users_export.txt

# Puis créer les utilisateurs dans MySQL manuellement ou avec un script
```

### 3. Si l'utilisateur existe mais avec un email différent

Vérifiez l'email exact dans la base de données :

```sql
SELECT id, email FROM users;
```

Il est possible que l'email soit légèrement différent (majuscules/minuscules, espaces, etc.).

### 4. Vérifier les logs du backend

```bash
# Voir les logs lors d'une tentative de réinitialisation
pm2 logs my-guidedigital-backend --lines 50 | grep -i reset
```

## Solution rapide : Recréer le compte

La solution la plus simple est de recréer le compte :

1. Allez sur `https://app.myguidedigital.com/register`
2. Inscrivez-vous avec l'email `contact@gims-consulting.be`
3. Définissez un nouveau mot de passe
4. Connectez-vous avec ce nouveau compte

**Note :** Si vous aviez des livrets associés à l'ancien compte, vous devrez les réassigner au nouveau compte (voir `docs/VERIFIER_LIVRETS_DB.md`).
