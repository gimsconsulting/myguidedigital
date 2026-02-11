# Vérifier et créer un utilisateur admin

## Problème
Vous avez le rôle ADMIN dans la base de données, mais vous ne pouvez pas vous connecter avec "Email ou mot de passe incorrect".

## Diagnostic

Cela signifie probablement que :
1. L'utilisateur n'existe pas dans MySQL (créé dans SQLite mais pas migré)
2. Le mot de passe n'est pas correct
3. Le mot de passe n'a pas été correctement hashé

## Solution : Vérifier et créer/réinitialiser l'utilisateur

### Étape 1 : Vérifier si l'utilisateur existe

```bash
# Se connecter à MySQL
mysql -u root -p

# Utiliser votre base de données
USE nom_de_votre_base;

# Vérifier si l'utilisateur existe
SELECT id, email, role, password FROM users WHERE email = 'info@gims-consulting.be';
```

### Étape 2 : Si l'utilisateur n'existe pas ou n'a pas de mot de passe valide

Vous devez créer l'utilisateur avec un mot de passe hashé. Voici comment faire :

**Option A : Utiliser un script Node.js (recommandé)**

Créez un fichier `create-admin-user.js` sur votre serveur :

```bash
cd /root/myguidedigital/myguidedigital/backend
nano create-admin-user.js
```

Collez ce code :

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'info@gims-consulting.be';
  const password = 'VotreNouveauMotDePasse123!'; // CHANGEZ CE MOT DE PASSE !
  
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Mettre à jour le mot de passe et le rôle
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Utilisateur mis à jour avec le rôle ADMIN et nouveau mot de passe');
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
    }
    
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('⚠️  IMPORTANT : Changez ce mot de passe après la première connexion !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
```

Sauvegardez (Ctrl+O, Entrée, Ctrl+X) puis exécutez :

```bash
node create-admin-user.js
```

**Option B : Créer directement dans MySQL (plus complexe)**

Si vous préférez créer directement dans MySQL, vous devez générer un hash bcrypt du mot de passe. C'est plus compliqué, donc je recommande l'Option A.

### Étape 3 : Se connecter

1. Allez sur `https://app.myguidedigital.com/login`
2. Email : `info@gims-consulting.be`
3. Mot de passe : Le mot de passe que vous avez défini dans le script
4. Cliquez sur "Se connecter"

### Étape 4 : Accéder au dashboard admin

Une fois connecté, allez sur :
- `https://app.myguidedigital.com/admin/dashboard`

## Important

⚠️ **Changez le mot de passe après la première connexion** via le profil utilisateur dans l'application !
