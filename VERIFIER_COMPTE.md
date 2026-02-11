# 🔍 Vérifier et réinitialiser un compte utilisateur

## Vérifier si le compte existe

Sur votre serveur VPS, exécutez :

```bash
# Se connecter à MySQL
mysql -u root -p

# Vérifier si le compte existe
USE myguidedigital;
SELECT id, email, firstName, lastName, createdAt FROM users WHERE email = 'gimsadp@gmail.com';

# Quitter MySQL
exit;
```

## Si le compte existe mais le mot de passe ne fonctionne pas

### Option 1 : Réinitialiser le mot de passe via l'interface

1. Allez sur : https://app.myguidedigital.com/forgot-password
2. Entrez votre email : `gimsadp@gmail.com`
3. Suivez les instructions pour réinitialiser le mot de passe

### Option 2 : Réinitialiser directement dans la base de données

```bash
# Se connecter à MySQL
mysql -u root -p

USE myguidedigital;

# Générer un nouveau hash pour le mot de passe "Gims-1234"
# (Vous devrez utiliser Node.js pour générer le hash bcrypt)
```

Ou utilisez ce script Node.js :

```bash
cd /root/myguidedigital/myguidedigital/backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Gims-1234', 10).then(hash => console.log(hash));"
```

Puis mettez à jour dans MySQL :

```sql
UPDATE users SET password = 'LE_HASH_GENERE' WHERE email = 'gimsadp@gmail.com';
```

## Si le compte n'existe pas

Créez un nouveau compte via l'interface d'inscription.
