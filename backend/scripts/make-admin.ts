import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`✅ Utilisateur ${email} est maintenant ADMIN`);
    return user;
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.error('❌ Usage: tsx scripts/make-admin.ts <email>');
  process.exit(1);
}

makeAdmin(email)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
