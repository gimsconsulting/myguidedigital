import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword(email: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log(`✅ Mot de passe réinitialisé pour ${email}`);
    return user;
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`❌ Utilisateur ${email} non trouvé`);
    } else {
      console.error('❌ Erreur:', error.message);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Récupérer l'email et le nouveau mot de passe depuis les arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Usage: tsx scripts/reset-password.ts <email> <nouveau_mot_de_passe>');
  console.error('');
  console.error('Exemple:');
  console.error('  tsx scripts/reset-password.ts admin@example.com MonNouveauMotDePasse123');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
  process.exit(1);
}

resetPassword(email, newPassword)
  .then(() => {
    console.log('');
    console.log('✅ Vous pouvez maintenant vous connecter avec :');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${newPassword}`);
    process.exit(0);
  })
  .catch(() => process.exit(1));
