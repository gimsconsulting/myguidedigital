import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';
import Stripe from 'stripe';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Générer le prochain numéro de facture séquentiel au format YYYY-NNNNN
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${year}-`;

  // Trouver la dernière facture de l'année en cours
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      }
    },
    orderBy: { invoiceNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastInvoice?.invoiceNumber) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
}

// Get current subscription
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(subscription || null);
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'abonnement' });
  }
});

// Get available plans
router.get('/plans', (req, res) => {
  res.json([
    {
      id: 'monthly',
      name: 'Mensuel',
      price: 15.00,
      currency: 'EUR',
      interval: 'month',
      pricePerLivret: 15.00,
      savings: '21%'
    },
    {
      id: 'yearly',
      name: 'Annuel',
      price: 99.00,
      currency: 'EUR',
      interval: 'year',
      pricePerLivret: 99.00,
      monthlyPrice: 8.25,
      savings: '31%'
    },
    {
      id: 'lifetime',
      name: 'À vie',
      price: 199.00,
      currency: 'EUR',
      interval: 'lifetime',
      pricePerLivret: 199.00,
      savings: '33%'
    }
  ]);
});

// Create checkout session
router.post('/checkout', authenticateToken, async (req: any, res) => {
  try {
    const { planId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe n\'est pas configuré' });
    }

    const plans: Record<string, { price: number; name: string; planType: string }> = {
      monthly: { price: 15.00, name: 'Mensuel', planType: 'MONTHLY' },
      yearly: { price: 99.00, name: 'Annuel', planType: 'YEARLY' },
      lifetime: { price: 199.00, name: 'À vie', planType: 'LIFETIME' }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Abonnement ${plan.name} - Livrets d'Accueil`,
              description: `Accès illimité à la plateforme pour créer des livrets d'accueil digitaux`,
            },
            unit_amount: Math.round(plan.price * 100),
            ...(planId !== 'lifetime' && {
              recurring: {
                interval: planId === 'yearly' ? 'year' : 'month'
              }
            })
          },
          quantity: 1,
        },
      ],
      mode: planId === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription`,
      metadata: {
        userId: req.userId,
        planId: planId,
        planType: plan.planType,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la session de paiement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upgrade subscription
router.post('/upgrade', authenticateToken, async (req: any, res) => {
  try {
    const { targetPlanId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe n\'est pas configuré' });
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.userId,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!currentSubscription) {
      return res.status(404).json({ message: 'Aucun abonnement actif trouvé' });
    }

    // Vérifier que l'upgrade est valide
    const currentPlan = currentSubscription.plan;
    const validUpgrades: Record<string, string[]> = {
      'MONTHLY': ['YEARLY', 'LIFETIME'],
      'YEARLY': ['LIFETIME'],
      'TRIAL': ['MONTHLY', 'YEARLY', 'LIFETIME']
    };

    const targetPlanType = targetPlanId === 'yearly' ? 'YEARLY' : targetPlanId === 'lifetime' ? 'LIFETIME' : 'MONTHLY';
    
    if (!validUpgrades[currentPlan]?.includes(targetPlanType)) {
      return res.status(400).json({ message: 'Upgrade non autorisé depuis ce plan' });
    }

    const plans: Record<string, { price: number; name: string; planType: string }> = {
      monthly: { price: 15.00, name: 'Mensuel', planType: 'MONTHLY' },
      yearly: { price: 99.00, name: 'Annuel', planType: 'YEARLY' },
      lifetime: { price: 199.00, name: 'À vie', planType: 'LIFETIME' }
    };

    const targetPlan = plans[targetPlanId];
    if (!targetPlan) {
      return res.status(400).json({ message: 'Plan invalide' });
    }

    // Calculer le crédit du temps restant
    let credit = 0;
    if (currentSubscription.endDate && currentPlan !== 'TRIAL') {
      const now = new Date();
      const endDate = new Date(currentSubscription.endDate);
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (currentPlan === 'MONTHLY') {
        // Crédit proportionnel : (jours restants / 30) * 12€
        credit = (daysRemaining / 30) * 12;
      } else if (currentPlan === 'YEARLY') {
        // Crédit proportionnel : (jours restants / 365) * 99€
        credit = (daysRemaining / 365) * 99;
      }
    }

    // Calculer le prix à payer
    const finalPrice = Math.max(0, targetPlan.price - credit);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Create Stripe checkout session for upgrade
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Upgrade vers ${targetPlan.name} - Livrets d'Accueil`,
              description: `Upgrade de votre abonnement ${currentPlan} vers ${targetPlan.name}${credit > 0 ? ` (Crédit appliqué: ${credit.toFixed(2)}€)` : ''}`,
            },
            unit_amount: Math.round(finalPrice * 100),
            ...(targetPlanId !== 'lifetime' && {
              recurring: {
                interval: targetPlanId === 'yearly' ? 'year' : 'month'
              }
            })
          },
          quantity: 1,
        },
      ],
      mode: targetPlanId === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      metadata: {
        userId: req.userId,
        planId: targetPlanId,
        planType: targetPlan.planType,
        isUpgrade: 'true',
        previousPlan: currentPlan,
        credit: credit.toString(),
      },
    });

    res.json({ 
      sessionId: session.id, 
      url: session.url,
      credit: credit,
      finalPrice: finalPrice
    });
  } catch (error: any) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upgrade de l\'abonnement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Apply promo code
router.post('/promo', authenticateToken, async (req: any, res) => {
  try {
    const { code } = req.body;

    // TODO: Implement promo code validation
    // For now, return a placeholder
    res.json({ 
      valid: false, 
      message: 'Fonctionnalité en cours de développement' 
    });
  } catch (error: any) {
    console.error('Apply promo error:', error);
    res.status(500).json({ message: 'Erreur lors de la validation du code promo' });
  }
});

// Webhook Stripe (DOIT être avant les autres routes pour éviter les conflits)
// Note: Le body raw est déjà parsé par le middleware dans index.ts
router.post('/webhook', async (req: any, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET non configuré');
    return res.status(400).send('Webhook secret manquant');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Erreur webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const planType = session.metadata?.planType;

        if (!userId || !planType) {
          console.error('Metadata manquante dans la session Stripe');
          break;
        }

        // Désactiver l'ancien abonnement
        await prisma.subscription.updateMany({
          where: {
            userId: userId,
            status: 'ACTIVE'
          },
          data: {
            status: 'CANCELLED'
          }
        });

        // Créer le nouvel abonnement
        const subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            plan: planType,
            status: 'ACTIVE',
            stripeSessionId: session.id,
            stripeSubscriptionId: session.subscription as string || null,
            startDate: new Date(),
            endDate: planType === 'LIFETIME' 
              ? null 
              : new Date(Date.now() + (planType === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000),
          }
        });

            // Créer la facture avec numéro séquentiel
            const invoiceNumber1 = await generateInvoiceNumber();
            await prisma.invoice.create({
              data: {
                invoiceNumber: invoiceNumber1,
                userId: userId,
                subscriptionId: subscription.id,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency?.toUpperCase() || 'EUR',
                status: 'PAID',
                stripePaymentIntentId: session.payment_intent as string || null,
                stripeInvoiceId: session.invoice as string || null,
                paidAt: new Date(),
              }
            });

        console.log(`Abonnement créé pour l'utilisateur ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.updateMany({
          where: {
            stripeSubscriptionId: subscription.id
          },
          data: {
            status: 'CANCELLED'
          }
        });

        console.log(`Abonnement annulé: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await prisma.subscription.findFirst({
            where: {
              stripeSubscriptionId: invoice.subscription as string
            }
          });

          if (subscription) {
            // Créer la facture avec numéro séquentiel
            const invoiceNumber2 = await generateInvoiceNumber();
            await prisma.invoice.create({
              data: {
                invoiceNumber: invoiceNumber2,
                userId: subscription.userId,
                subscriptionId: subscription.id,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'PAID',
                stripePaymentIntentId: invoice.payment_intent as string || null,
                stripeInvoiceId: invoice.id,
                paidAt: new Date(),
              }
            });

            // Mettre à jour la date de fin de l'abonnement
            const planType = subscription.plan;
            const daysToAdd = planType === 'YEARLY' ? 365 : 30;
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                endDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
              }
            });

            console.log(`Facture créée pour l'abonnement ${subscription.id}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await prisma.subscription.findFirst({
            where: {
              stripeSubscriptionId: invoice.subscription as string
            }
          });

          if (subscription) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'PAST_DUE'
              }
            });

            console.log(`Paiement échoué pour l'abonnement ${subscription.id}`);
          }
        }
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

export default router;
