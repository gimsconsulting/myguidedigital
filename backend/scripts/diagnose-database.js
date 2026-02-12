/**
 * Script de diagnostic approfondi pour vérifier l'état de la base de données
 * 
 * Usage:
 *   node scripts/diagnose-database.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseDatabase() {
  try {
    console.log('🔍 Diagnostic de la base de données...\n');

    // 1. Vérifier la connexion
    console.log('1️⃣ Test de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion réussie\n');

    // 2. Vérifier les utilisateurs
    console.log('2️⃣ Vérification des utilisateurs...');
    const userCount = await prisma.user.count();
    console.log(`   Nombre d'utilisateurs: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          _count: {
            select: { livrets: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('\n   Détails des utilisateurs:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
        console.log(`      Créé le: ${user.createdAt.toISOString().split('T')[0]}`);
        console.log(`      Nombre de livrets: ${user._count.livrets}`);
      });
    }
    console.log('');

    // 3. Vérifier les livrets directement
    console.log('3️⃣ Vérification directe de la table livrets...');
    const livretCount = await prisma.livret.count();
    console.log(`   Nombre total de livrets: ${livretCount}`);

    if (livretCount > 0) {
      const livrets = await prisma.livret.findMany({
        select: {
          id: true,
          name: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          _count: {
            select: { modules: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      console.log('\n   Détails des livrets (10 premiers):');
      livrets.forEach((livret, index) => {
        console.log(`   ${index + 1}. "${livret.name}" (ID: ${livret.id})`);
        console.log(`      User ID: ${livret.userId}`);
        console.log(`      Créé le: ${livret.createdAt.toISOString().split('T')[0]}`);
        console.log(`      Modifié le: ${livret.updatedAt.toISOString().split('T')[0]}`);
        console.log(`      Actif: ${livret.isActive}`);
        console.log(`      Modules: ${livret._count.modules}`);
      });
    } else {
      console.log('   ⚠️  Aucun livret trouvé dans la table');
    }
    console.log('');

    // 4. Vérifier les modules
    console.log('4️⃣ Vérification des modules...');
    const moduleCount = await prisma.module.count();
    console.log(`   Nombre total de modules: ${moduleCount}`);
    
    if (moduleCount > 0) {
      const modules = await prisma.module.findMany({
        select: {
          id: true,
          type: true,
          name: true,
          livretId: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      console.log('\n   Détails des modules (5 premiers):');
      modules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.type} - "${module.name || 'Sans nom'}"`);
        console.log(`      Livret ID: ${module.livretId}`);
        console.log(`      Actif: ${module.isActive}`);
        console.log(`      Créé le: ${module.createdAt.toISOString().split('T')[0]}`);
      });
    }
    console.log('');

    // 5. Vérifier les relations
    console.log('5️⃣ Vérification des relations utilisateur-livret...');
    const usersWithLivrets = await prisma.user.findMany({
      where: {
        livrets: {
          some: {}
        }
      },
      include: {
        livrets: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (usersWithLivrets.length > 0) {
      console.log(`   ${usersWithLivrets.length} utilisateur(s) avec des livrets:`);
      usersWithLivrets.forEach(user => {
        console.log(`   - ${user.email}: ${user.livrets.length} livret(s)`);
      });
    } else {
      console.log('   ⚠️  Aucune relation utilisateur-livret trouvée');
    }
    console.log('');

    // 6. Vérifier les modules orphelins (sans livret valide)
    console.log('6️⃣ Vérification des modules orphelins...');
    const allModules = await prisma.module.findMany({
      select: { livretId: true }
    });
    const livretIds = new Set(await prisma.livret.findMany({ select: { id: true } }).then(l => l.map(li => li.id)));
    const orphanCount = allModules.filter(m => !livretIds.has(m.livretId)).length;
    console.log(`   Modules orphelins: ${orphanCount}`);
    console.log('');

    // 7. Vérifier la configuration de la base de données
    console.log('7️⃣ Configuration de la base de données...');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Masquer le mot de passe dans l'URL
      const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
      console.log(`   DATABASE_URL: ${maskedUrl}`);
    } else {
      console.log('   ⚠️  DATABASE_URL non défini');
    }
    console.log('');

    // Résumé
    console.log('📊 RÉSUMÉ:');
    console.log(`   - Utilisateurs: ${userCount}`);
    console.log(`   - Livrets: ${livretCount}`);
    console.log(`   - Modules: ${moduleCount}`);
    console.log(`   - Modules orphelins: ${orphanCount}`);
    
    if (livretCount === 0 && moduleCount === 0) {
      console.log('\n⚠️  ATTENTION: Aucun livret ni module trouvé.');
      console.log('   Cela peut indiquer:');
      console.log('   1. Les données ont été supprimées');
      console.log('   2. Une migration a réinitialisé les tables');
      console.log('   3. Connexion à une mauvaise base de données');
      console.log('   4. Les tables n\'ont jamais été créées');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors du diagnostic:', error.message);
    if (error.code) {
      console.error(`   Code d'erreur: ${error.code}`);
    }
    if (error.meta) {
      console.error(`   Détails:`, error.meta);
    }
    console.error('\nStack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDatabase();
