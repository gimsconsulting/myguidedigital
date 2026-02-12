/**
 * Script pour vérifier les livrets dans la base de données
 * 
 * Usage:
 *   node scripts/check-livrets.js [email]
 * 
 * Exemples:
 *   node scripts/check-livrets.js
 *   node scripts/check-livrets.js user@example.com
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLivrets(email = null) {
  try {
    if (email) {
      // Vérifier les livrets pour un utilisateur spécifique
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          livrets: {
            include: {
              modules: true,
              _count: {
                select: { modules: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user) {
        console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
        return;
      }

      console.log(`\n📧 Utilisateur: ${user.email}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`📅 Créé le: ${user.createdAt}`);
      console.log(`\n📚 Nombre de livrets: ${user.livrets.length}\n`);

      if (user.livrets.length === 0) {
        console.log('⚠️  Aucun livret trouvé pour cet utilisateur.\n');
      } else {
        user.livrets.forEach((livret, index) => {
          console.log(`\n${index + 1}. Livret: "${livret.name}"`);
          console.log(`   ID: ${livret.id}`);
          console.log(`   Adresse: ${livret.address || 'Non définie'}`);
          console.log(`   Actif: ${livret.isActive ? '✅ Oui' : '❌ Non'}`);
          console.log(`   Créé le: ${livret.createdAt}`);
          console.log(`   Modifié le: ${livret.updatedAt}`);
          console.log(`   Modules: ${livret._count.modules}`);
          console.log(`   QR Code: ${livret.qrCode || 'Non généré'}`);
        });
      }
    } else {
      // Lister tous les livrets de tous les utilisateurs
      const allLivrets = await prisma.livret.findMany({
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true
            }
          },
          modules: true,
          _count: {
            select: { modules: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`\n📚 Total de livrets dans la base de données: ${allLivrets.length}\n`);

      if (allLivrets.length === 0) {
        console.log('⚠️  Aucun livret trouvé dans la base de données.\n');
      } else {
        // Grouper par utilisateur
        const livretsByUser = {};
        allLivrets.forEach(livret => {
          const userEmail = livret.user.email;
          if (!livretsByUser[userEmail]) {
            livretsByUser[userEmail] = {
              user: livret.user,
              livrets: []
            };
          }
          livretsByUser[userEmail].livrets.push(livret);
        });

        Object.keys(livretsByUser).forEach(userEmail => {
          const { user, livrets } = livretsByUser[userEmail];
          console.log(`\n📧 ${user.firstName || ''} ${user.lastName || ''} (${userEmail})`);
          console.log(`   Nombre de livrets: ${livrets.length}`);
          livrets.forEach((livret, index) => {
            console.log(`   ${index + 1}. "${livret.name}" (ID: ${livret.id}) - Créé le: ${livret.createdAt.toISOString().split('T')[0]}`);
          });
        });
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de la ligne de commande
const email = process.argv[2];

checkLivrets(email);
