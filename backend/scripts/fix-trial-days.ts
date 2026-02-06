import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTrialDays() {
  try {
    console.log('🔍 Recherche des abonnements TRIAL avec 31 jours...');
    
    // Trouver tous les abonnements TRIAL actifs
    const subscriptions = await prisma.subscription.findMany({
      where: {
        plan: 'TRIAL',
        status: 'ACTIVE'
      }
    });

    console.log(`📊 Trouvé ${subscriptions.length} abonnement(s) TRIAL`);

    let updated = 0;
    for (const subscription of subscriptions) {
      if (subscription.startDate) {
        const startDate = new Date(subscription.startDate);
        const now = new Date();
        
        // Calculer la différence en jours
        const diffTime = now.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Les jours restants = 30 jours - jours écoulés
        const daysRemaining = Math.max(0, 30 - diffDays);
        
        // Mettre à jour si nécessaire
        if (subscription.trialDaysLeft !== daysRemaining) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { 
              trialDaysLeft: daysRemaining,
              // Si la période d'essai est expirée, mettre le statut à EXPIRED
              ...(daysRemaining === 0 && subscription.status === 'ACTIVE' ? { status: 'EXPIRED' } : {})
            }
          });
          
          console.log(`✅ Abonnement ${subscription.id}: ${subscription.trialDaysLeft} → ${daysRemaining} jours`);
          updated++;
        } else {
          console.log(`✓ Abonnement ${subscription.id}: déjà à ${daysRemaining} jours (correct)`);
        }
      } else {
        // Si pas de startDate, mettre à jour avec 30 jours et définir startDate
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { 
            trialDaysLeft: 30,
            startDate: new Date()
          }
        });
        console.log(`✅ Abonnement ${subscription.id}: startDate défini et 30 jours appliqués`);
        updated++;
      }
    }

    console.log(`\n✨ Migration terminée: ${updated} abonnement(s) mis à jour`);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTrialDays();
