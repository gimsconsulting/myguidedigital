/**
 * Script pour créer un utilisateur admin ou promouvoir un utilisateur existant
 * 
 * Usage:
 *   node scripts/create-admin.js <email> [password]
 * 
 * Exemples:
 *   node scripts/create-admin.js admin@example.com Admin123!
 *   node scripts/create-admin.js existing@example.com  (promouvoir un utilisateur existant)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createOrPromoteAdmin(email, password = null) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Si l'utilisateur existe déjà, le promouvoir en admin
      if (existingUser.role === 'ADMIN') {
        console.log(`✅ L'utilisateur ${email} est déjà administrateur.`);
        return;
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'ADMIN' }
      });

      console.log(`✅ Utilisateur ${email} promu en administrateur avec succès !`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Vous pouvez vous connecter avec votre mot de passe existant.`);
    } else {
      // Si l'utilisateur n'existe pas, le créer
      if (!password) {
        console.error('❌ Erreur: Un mot de passe est requis pour créer un nouvel utilisateur.');
        console.log('Usage: node scripts/create-admin.js <email> <password>');
        process.exit(1);
      }

      // Vérifier la complexité du mot de passe
      if (password.length < 8) {
        console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
        process.exit(1);
      }
      if (!/[A-Z]/.test(password)) {
        console.error('❌ Le mot de passe doit contenir au moins une majuscule');
        process.exit(1);
      }
      if (!/[a-z]/.test(password)) {
        console.error('❌ Le mot de passe doit contenir au moins une minuscule');
        process.exit(1);
      }
      if (!/[0-9]/.test(password)) {
        console.error('❌ Le mot de passe doit contenir au moins un chiffre');
        process.exit(1);
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur admin
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User'
        }
      });

      console.log(`✅ Utilisateur administrateur créé avec succès !`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Mot de passe: ${password}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`\n⚠️  IMPORTANT: Notez ces informations dans un endroit sûr !`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 'P2002') {
      console.error('   Un utilisateur avec cet email existe déjà.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer les arguments de la ligne de commande
const email = process.argv[2];
const password = process.argv[3];

if (!email) {
  console.error('❌ Erreur: Email requis');
  console.log('\nUsage:');
  console.log('  node scripts/create-admin.js <email> [password]');
  console.log('\nExemples:');
  console.log('  node scripts/create-admin.js admin@example.com Admin123!');
  console.log('  node scripts/create-admin.js existing@example.com  (promouvoir un utilisateur existant)');
  process.exit(1);
}

createOrPromoteAdmin(email, password);
