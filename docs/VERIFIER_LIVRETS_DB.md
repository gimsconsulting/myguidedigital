# Vérifier les livrets dans la base de données

## Problème
Les 2 premiers livrets créés ne s'affichent plus dans le dashboard après la migration vers MySQL.

## Vérifications à faire

### 1. Vérifier que les livrets existent dans la base de données MySQL

Sur votre serveur VPS :

```bash
# Se connecter à MySQL
mysql -u root -p

# Entrer votre mot de passe MySQL

# Utiliser la base de données
USE votre_nom_de_base_de_donnees;

# Voir tous les livrets
SELECT id, name, userId, createdAt FROM livrets;

# Voir votre ID utilisateur actuel
SELECT id, email FROM users;

# Vérifier si les livrets appartiennent à votre utilisateur
SELECT l.id, l.name, l.userId, u.email 
FROM livrets l 
LEFT JOIN users u ON l.userId = u.id;
```

### 2. Si les livrets existent mais avec un autre userId

Si vous voyez que les livrets existent mais avec un `userId` différent de votre utilisateur actuel, vous pouvez :

**Option A : Mettre à jour les livrets pour les assigner à votre utilisateur actuel**

```sql
-- Remplacer YOUR_USER_ID par votre ID utilisateur actuel
UPDATE livrets SET userId = 'YOUR_USER_ID' WHERE id IN ('livret_id_1', 'livret_id_2');
```

**Option B : Vérifier si vous vous êtes connecté avec le bon compte**

Assurez-vous d'utiliser le même email que celui avec lequel vous avez créé les livrets.

### 3. Si les livrets n'existent pas dans MySQL

Cela signifie que les données n'ont pas été migrées depuis SQLite. Vous avez deux options :

**Option A : Migrer les données depuis SQLite (si le fichier existe encore)**

```bash
# Sur votre machine locale, exporter depuis SQLite
sqlite3 backend/dev.db ".dump" > dump.sql

# Puis importer dans MySQL (nécessite adaptation du format)
```

**Option B : Recréer les livrets**

Si les données sont perdues, vous devrez recréer les livrets dans le dashboard.

### 4. Vérifier les logs du backend

```bash
# Voir les logs du backend lors de la récupération des livrets
pm2 logs my-guidedigital-backend --lines 100 | grep -i livret
```

## Commandes utiles

### Voir tous les utilisateurs
```sql
SELECT id, email, createdAt FROM users;
```

### Voir tous les livrets avec leur propriétaire
```sql
SELECT 
  l.id, 
  l.name, 
  l.userId, 
  u.email as owner_email,
  l.createdAt 
FROM livrets l 
LEFT JOIN users u ON l.userId = u.id 
ORDER BY l.createdAt DESC;
```

### Compter les livrets par utilisateur
```sql
SELECT u.email, COUNT(l.id) as livret_count
FROM users u
LEFT JOIN livrets l ON u.id = l.userId
GROUP BY u.id, u.email;
```
