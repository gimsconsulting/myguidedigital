# Accès au Dashboard Admin

## Comment se connecter au dashboard admin

Le dashboard admin nécessite qu'un utilisateur ait le rôle `ADMIN` dans la base de données.

## Méthode 1 : Créer un utilisateur admin directement dans la base de données

### Étape 1 : Se connecter à MySQL

Sur votre serveur VPS :

```bash
# Se connecter à MySQL
mysql -u root -p

# Utiliser votre base de données
USE votre_nom_de_base_de_donnees;
```

### Étape 2 : Créer un utilisateur admin

Vous avez deux options :

**Option A : Créer un nouvel utilisateur admin**

```sql
-- Générer un hash de mot de passe (remplacez 'VotreMotDePasse123!' par votre mot de passe)
-- Vous pouvez utiliser un outil en ligne ou Node.js pour générer le hash bcrypt

-- Exemple avec Node.js (sur votre machine locale ou serveur) :
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('VotreMotDePasse123!', 10).then(hash => console.log(hash));"

-- Une fois que vous avez le hash, insérez l'utilisateur :
INSERT INTO users (id, email, password, role, createdAt, updatedAt)
VALUES (
  UUID(),
  'admin@myguidedigital.com',
  '$2a$10$VotreHashBcryptIci', -- Remplacez par le hash généré
  'ADMIN',
  NOW(),
  NOW()
);
```

**Option B : Mettre à jour un utilisateur existant pour le rendre admin**

```sql
-- Voir tous les utilisateurs
SELECT id, email, role FROM users;

-- Mettre à jour un utilisateur existant pour le rendre admin
UPDATE users SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
```

### Étape 3 : Créer un abonnement pour l'utilisateur admin (optionnel)

```sql
-- Récupérer l'ID de l'utilisateur admin
SELECT id FROM users WHERE email = 'admin@myguidedigital.com';

-- Créer un abonnement (remplacez USER_ID par l'ID de l'utilisateur)
INSERT INTO subscriptions (id, userId, plan, status, startDate, trialDaysLeft, createdAt, updatedAt)
VALUES (
  UUID(),
  'USER_ID', -- Remplacez par l'ID de l'utilisateur admin
  'TRIAL',
  'ACTIVE',
  NOW(),
  999, -- Nombre de jours illimité pour l'admin
  NOW(),
  NOW()
);
```

## Méthode 2 : Utiliser un script Node.js pour créer l'admin

Créez un fichier `create-admin.js` sur votre serveur :

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@myguidedigital.com';
  const password = 'VotreMotDePasse123!'; // Changez ce mot de passe !
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUser) {
    // Mettre à jour le rôle
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: 'ADMIN' }
    });
    console.log('✅ Utilisateur mis à jour avec le rôle ADMIN');
  } else {
    // Créer un nouvel utilisateur admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User'
      }
    });
    
    // Créer un abonnement
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'TRIAL',
        status: 'ACTIVE',
        startDate: new Date(),
        trialDaysLeft: 999
      }
    });
    
    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
  }
  
  await prisma.$disconnect();
}

createAdmin().catch(console.error);
```

Exécutez le script :

```bash
cd /root/myguidedigital/myguidedigital/backend
node create-admin.js
```

## Accéder au dashboard admin

Une fois que vous avez créé l'utilisateur admin :

1. **Connectez-vous** sur `https://app.myguidedigital.com/login` avec :
   - Email : `admin@myguidedigital.com` (ou l'email que vous avez utilisé)
   - Mot de passe : Le mot de passe que vous avez défini

2. **Accédez au dashboard admin** :
   - URL directe : `https://app.myguidedigital.com/admin/dashboard`
   - Ou via le menu de navigation si un lien admin est disponible

## Vérifier que vous êtes admin

Pour vérifier que votre utilisateur a bien le rôle ADMIN :

```sql
SELECT id, email, role FROM users WHERE email = 'admin@myguidedigital.com';
```

Vous devriez voir `role = 'ADMIN'`.

## Pages disponibles dans le dashboard admin

- `/admin/dashboard` - Vue d'ensemble avec KPIs
- `/admin/users` - Gestion des utilisateurs
- `/admin/subscriptions` - Gestion des abonnements
- `/admin/livrets` - Gestion des livrets
- `/admin/invoices` - Gestion des factures
- `/admin/revenue` - Statistiques de revenus

## Sécurité

⚠️ **Important** : Changez le mot de passe par défaut après la première connexion !

Pour changer le mot de passe d'un utilisateur admin via SQL :

```sql
-- Générer un nouveau hash (utilisez Node.js comme expliqué ci-dessus)
UPDATE users 
SET password = '$2a$10$NouveauHashBcrypt' 
WHERE email = 'admin@myguidedigital.com';
```
