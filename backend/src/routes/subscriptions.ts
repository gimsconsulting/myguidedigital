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

// --- Fonctions de calcul de prix (identiques au frontend) ---
function getPricePerRoom(roomCount: number): number {
  if (roomCount >= 400) return 5;
  if (roomCount >= 300) return 6;
  if (roomCount >= 200) return 7;
  if (roomCount >= 150) return 8;
  if (roomCount >= 100) return 9;
  if (roomCount >= 75) return 10;
  if (roomCount >= 50) return 11;
  if (roomCount >= 30) return 13;
  if (roomCount >= 20) return 15;
  if (roomCount >= 10) return 17;
  return 19;
}

function getPricePerPitch(pitchCount: number): number {
  if (pitchCount >= 150) return 10;
  if (pitchCount >= 100) return 14;
  if (pitchCount >= 75) return 18;
  if (pitchCount >= 50) return 22;
  if (pitchCount >= 30) return 27;
  if (pitchCount >= 10) return 33;
  return 39;
}

const SETUP_FEE_CAMPING = 160; // frais de mise en place 1ère année

// Tarifs fixes Hôtes & Locations / Conciergerie
const HOST_PLANS: Record<string, { price: number; name: string; planType: string; interval: 'year' | 'month'; durationDays: number }> = {
  'hotes-annuel':     { price: 59.00,  name: 'Hôtes & Locations — Annuel',     planType: 'HOTES_ANNUEL',     interval: 'year',  durationDays: 365 },
  'hotes-saison-1':   { price: 9.90,   name: 'Hôtes & Locations — 1 Mois',     planType: 'HOTES_SAISON_1',   interval: 'month', durationDays: 30 },
  'hotes-saison-2':   { price: 14.90,  name: 'Hôtes & Locations — 2 Mois',     planType: 'HOTES_SAISON_2',   interval: 'month', durationDays: 60 },
  'hotes-saison-3':   { price: 19.90,  name: 'Hôtes & Locations — 3 Mois',     planType: 'HOTES_SAISON_3',   interval: 'month', durationDays: 90 },
};

/**
 * Calculer le prix d'un plan dynamique (hôtels ou campings)
 */
function calculateDynamicPrice(category: 'hotel' | 'camping', unitCount: number): { priceHT: number; unitPrice: number; description: string; planType: string; setupFee: number } {
  if (category === 'hotel') {
    const clamped = Math.max(5, Math.min(500, unitCount));
    const unitPrice = getPricePerRoom(clamped);
    const priceHT = unitPrice * clamped;
    return {
      priceHT,
      unitPrice,
      description: `Hôtel — ${clamped} chambres × ${unitPrice}€ HT/chambre/an`,
      planType: 'HOTEL_ANNUEL',
      setupFee: 0,
    };
  } else {
    const clamped = Math.max(5, Math.min(300, unitCount));
    const unitPrice = getPricePerPitch(clamped);
    const priceHT = unitPrice * clamped;
    return {
      priceHT,
      unitPrice,
      description: `Camping — ${clamped} emplacements × ${unitPrice}€ HT/empl./an + Frais de mise en place ${SETUP_FEE_CAMPING}€ HT`,
      planType: 'CAMPING_ANNUEL',
      setupFee: SETUP_FEE_CAMPING,
    };
  }
}

// Get available plans (informational)
router.get('/plans', (req, res) => {
  res.json({
    hotes: [
      { id: 'hotes-annuel',   name: 'Annuel',  price: 59.00,  interval: 'year' },
      { id: 'hotes-saison-1', name: '1 Mois',  price: 9.90,   interval: 'month' },
      { id: 'hotes-saison-2', name: '2 Mois',  price: 14.90,  interval: 'month' },
      { id: 'hotes-saison-3', name: '3 Mois',  price: 19.90,  interval: 'month' },
    ],
    hotels: {
      type: 'dynamic',
      basePrice: 19,
      currency: 'EUR',
      interval: 'year',
      description: 'Prix dégressif par chambre / an',
    },
    campings: {
      type: 'dynamic',
      basePrice: 39,
      setupFee: SETUP_FEE_CAMPING,
      currency: 'EUR',
      interval: 'year',
      description: 'Prix dégressif par emplacement / an + frais de mise en place',
    },
  });
});

// Create checkout session — accepte 3 catégories : hotes, hotel, camping
router.post('/checkout', authenticateToken, async (req: any, res) => {
  try {
    const { planId, category, unitCount, quantity: rawQuantity } = req.body;
    // planId   : 'hotes-annuel' | 'hotes-saison-1' | 'hotes-saison-2' | 'hotes-saison-3' | 'hotel' | 'camping'
    // category : 'hotes' | 'hotel' | 'camping'
    // unitCount: nombre de chambres (hotel) ou emplacements (camping)
    // quantity : nombre de locations/hôtels/campings (défaut: 1)
    const quantity = Math.max(1, Math.min(50, parseInt(rawQuantity) || 1));

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe n\'est pas configuré' });
    }

    // Get user
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    let priceHT: number;
    let productName: string;
    let productDescription: string;
    let planType: string;
    let mode: 'payment' | 'subscription' = 'payment';
    let recurring: { interval: 'year' | 'month' } | undefined;
    let durationDays: number = 365;
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // ─── HÔTES & LOCATIONS / CONCIERGERIE ───
    if (category === 'hotes') {
      const hostPlan = HOST_PLANS[planId];
      if (!hostPlan) {
        return res.status(400).json({ message: 'Plan hôte invalide' });
      }

      priceHT = hostPlan.price * quantity; // prix unitaire × nombre de locations
      productName = `My Guide Digital — ${hostPlan.name}${quantity > 1 ? ` (${quantity} locations)` : ''}`;
      productDescription = `Livret d'accueil digital — ${hostPlan.name} — ${quantity} location${quantity > 1 ? 's' : ''}`;
      planType = hostPlan.planType;
      durationDays = hostPlan.durationDays;

      // Les plans saisonniers (1, 2, 3 mois) sont des paiements uniques sans reconduction
      // Le plan annuel est un abonnement récurrent
      if (planId === 'hotes-annuel') {
        mode = 'subscription';
        recurring = { interval: 'year' };
      } else {
        mode = 'payment'; // saisonnier = paiement unique
      }

      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: Math.round(hostPlan.price * 100), // prix unitaire en centimes
          ...(recurring && { recurring }),
        },
        quantity: quantity, // Stripe multiplie automatiquement
      }];

    // ─── HÔTELS ───
    } else if (category === 'hotel') {
      const count = Math.max(5, Math.min(500, unitCount || 20));
      const calc = calculateDynamicPrice('hotel', count);
      const hotelUnitPrice = calc.priceHT; // prix pour 1 hôtel
      priceHT = hotelUnitPrice * quantity; // prix total pour N hôtels
      productName = `My Guide Digital — Hôtel (${count} chambres)${quantity > 1 ? ` × ${quantity} hôtels` : ''}`;
      productDescription = `${calc.description}${quantity > 1 ? ` — ${quantity} hôtels` : ''}`;
      planType = calc.planType;
      mode = 'subscription';
      recurring = { interval: 'year' };

      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            description: productDescription,
          },
          unit_amount: Math.round(hotelUnitPrice * 100), // prix unitaire pour 1 hôtel
          recurring: { interval: 'year' },
        },
        quantity: quantity, // Stripe multiplie automatiquement
      }];

    // ─── CAMPINGS ───
    } else if (category === 'camping') {
      const count = Math.max(5, Math.min(300, unitCount || 20));
      const calc = calculateDynamicPrice('camping', count);
      const campingUnitAnnual = calc.priceHT; // prix annuel pour 1 camping
      const campingSetupTotal = calc.setupFee * quantity; // frais de mise en place × nombre de campings
      const campingTotalAnnual = campingUnitAnnual * quantity; // prix annuel total
      priceHT = campingTotalAnnual + campingSetupTotal; // total 1ère année
      productName = `My Guide Digital — Camping (${count} emplacements)${quantity > 1 ? ` × ${quantity} campings` : ''} — 1ère année`;
      productDescription = `${count} emplacements × ${calc.unitPrice}€/empl./an${quantity > 1 ? ` × ${quantity} campings` : ''} + Frais de mise en place ${calc.setupFee}€${quantity > 1 ? ` × ${quantity}` : ''}`;
      planType = calc.planType;
      mode = 'payment'; // 1ère année = paiement unique (inclut frais de mise en place)

      // Le prix unitaire par camping (annuel + setup) pour Stripe
      const campingFirstYearPerUnit = campingUnitAnnual + calc.setupFee;
      lineItems = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `My Guide Digital — Camping (${count} emplacements) — 1ère année`,
              description: `${count} emplacements × ${calc.unitPrice}€/empl./an (${campingUnitAnnual}€) + Frais de mise en place ${calc.setupFee}€`,
            },
            unit_amount: Math.round(campingFirstYearPerUnit * 100),
          },
          quantity: quantity,
        },
      ];

    } else {
      return res.status(400).json({ message: 'Catégorie invalide. Utilisez: hotes, hotel, camping' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription`,
      metadata: {
        userId: req.userId,
        planId: planId,
        planType: planType,
        category: category,
        unitCount: String(unitCount || ''),
        quantity: String(quantity),
        priceHT: String(priceHT),
        durationDays: String(durationDays),
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

// Upgrade subscription — redirige vers un nouveau checkout
router.post('/upgrade', authenticateToken, async (req: any, res) => {
  try {
    const { planId, category, unitCount, quantity: rawQty } = req.body;
    const quantity = Math.max(1, Math.min(50, parseInt(rawQty) || 1));

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

    // Get user
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Calculer le prix selon la catégorie (réutilise la même logique que checkout)
    let priceHT: number;
    let productName: string;
    let productDescription: string;
    let planType: string;
    let mode: 'payment' | 'subscription' = 'payment';
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let durationDays = 365;

    if (category === 'hotes') {
      const hostPlan = HOST_PLANS[planId];
      if (!hostPlan) return res.status(400).json({ message: 'Plan invalide' });
      priceHT = hostPlan.price * quantity;
      productName = `Upgrade — ${hostPlan.name}${quantity > 1 ? ` (${quantity} locations)` : ''}`;
      productDescription = `Upgrade vers ${hostPlan.name} — ${quantity} location${quantity > 1 ? 's' : ''}`;
      planType = hostPlan.planType;
      durationDays = hostPlan.durationDays;
      if (planId === 'hotes-annuel') { mode = 'subscription'; }
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: { name: productName, description: productDescription },
          unit_amount: Math.round(hostPlan.price * 100),
          ...(planId === 'hotes-annuel' && { recurring: { interval: 'year' as const } }),
        },
        quantity: quantity,
      }];
    } else if (category === 'hotel') {
      const count = Math.max(5, Math.min(500, unitCount || 20));
      const calc = calculateDynamicPrice('hotel', count);
      priceHT = calc.priceHT * quantity;
      productName = `Upgrade — Hôtel (${count} chambres)${quantity > 1 ? ` × ${quantity}` : ''}`;
      productDescription = `${calc.description}${quantity > 1 ? ` — ${quantity} hôtels` : ''}`;
      planType = calc.planType;
      mode = 'subscription';
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: { name: productName, description: productDescription },
          unit_amount: Math.round(calc.priceHT * 100),
          recurring: { interval: 'year' },
        },
        quantity: quantity,
      }];
    } else if (category === 'camping') {
      const count = Math.max(5, Math.min(300, unitCount || 20));
      const calc = calculateDynamicPrice('camping', count);
      const campingFirstYearPerUnit = calc.priceHT + calc.setupFee;
      priceHT = campingFirstYearPerUnit * quantity;
      productName = `Upgrade — Camping (${count} emplacements)${quantity > 1 ? ` × ${quantity}` : ''} — 1ère année`;
      productDescription = `${calc.description}${quantity > 1 ? ` — ${quantity} campings` : ''}`;
      planType = calc.planType;
      mode = 'payment';
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: { name: productName, description: productDescription },
          unit_amount: Math.round(campingFirstYearPerUnit * 100),
        },
        quantity: quantity,
      }];
    } else {
      return res.status(400).json({ message: 'Catégorie invalide' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription`,
      metadata: {
        userId: req.userId,
        planId,
        planType,
        category,
        unitCount: String(unitCount || ''),
        quantity: String(quantity),
        priceHT: String(priceHT),
        durationDays: String(durationDays),
        isUpgrade: 'true',
        previousPlan: currentSubscription.plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'upgrade de l\'abonnement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ══════════════════════════════════════
// Seasonal duplicate checkout — Paiement one-shot pour duplication saisonnière
// ══════════════════════════════════════
router.post('/seasonal-duplicate-checkout', authenticateToken, async (req: any, res) => {
  try {
    const { livretId, seasonalOffer } = req.body;
    // seasonalOffer: 1 | 2 | 3 (mois)

    if (!livretId || ![1, 2, 3].includes(Number(seasonalOffer))) {
      return res.status(400).json({ message: 'Paramètres invalides. livretId et seasonalOffer (1, 2 ou 3) requis.' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe n\'est pas configuré' });
    }

    // Vérifier que le livret appartient à l'utilisateur
    const livret = await prisma.livret.findFirst({
      where: { id: livretId, userId: req.userId }
    });
    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Tarifs saisonniers
    const seasonalPlans: Record<number, { price: number; days: number; name: string }> = {
      1: { price: 9.90, days: 30, name: '1 Mois' },
      2: { price: 14.90, days: 60, name: '2 Mois' },
      3: { price: 19.90, days: 90, name: '3 Mois' },
    };

    const plan = seasonalPlans[Number(seasonalOffer)];
    const bonusDays = 14; // +14 jours offerts
    const totalDays = plan.days + bonusDays;

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `My Guide Digital — Saisonnier ${plan.name}`,
            description: `Duplication de livret — ${plan.name} (${plan.days} jours + ${bonusDays} jours offerts = ${totalDays} jours)`,
          },
          unit_amount: Math.round(plan.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}&type=seasonal`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      metadata: {
        userId: req.userId,
        type: 'seasonal_duplication',
        originalLivretId: livretId,
        seasonalOffer: String(seasonalOffer),
        durationDays: String(totalDays),
        priceHT: String(plan.price),
        planType: `HOTES_SAISON_${seasonalOffer}`,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Seasonal duplicate checkout error:', error);
    res.status(500).json({
      message: 'Erreur lors de la création du paiement saisonnier',
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
        const planType = session.metadata?.planType;
        const category = session.metadata?.category;
        const durationDays = parseInt(session.metadata?.durationDays || '365', 10);
        const metaPriceHT = parseFloat(session.metadata?.priceHT || '0');
        const unitCount = session.metadata?.unitCount || '';
        const metaType = session.metadata?.type; // 'seasonal_duplication' pour les duplications

        if (!userId || !planType) {
          console.error('Metadata manquante dans la session Stripe');
          break;
        }

        // ── CAS SPÉCIAL : Duplication saisonnière ──
        if (metaType === 'seasonal_duplication') {
          const originalLivretId = session.metadata?.originalLivretId;
          const seasonalOffer = session.metadata?.seasonalOffer;

          if (!originalLivretId) {
            console.error('originalLivretId manquant pour la duplication saisonnière');
            break;
          }

          // Calculer la date de fin du livret saisonnier
          const seasonalEndDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

          // Dupliquer le livret avec type SEASONAL
          try {
            const originalLivret = await prisma.livret.findFirst({
              where: { id: originalLivretId, userId },
              include: { modules: true }
            });

            if (originalLivret) {
              let qrBaseUrl = process.env.QR_CODE_BASE_URL;
              if (!qrBaseUrl) {
                qrBaseUrl = process.env.NODE_ENV === 'production'
                  ? 'https://app.myguidedigital.com/guide'
                  : 'http://192.168.0.126:3000/guide';
              }
              const qrCodeUrl = `${qrBaseUrl}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

              await prisma.livret.create({
                data: {
                  name: `${originalLivret.name} (Saisonnier)`,
                  address: originalLivret.address,
                  userId,
                  welcomeTitle: originalLivret.welcomeTitle,
                  welcomeSubtitle: originalLivret.welcomeSubtitle,
                  backgroundImage: originalLivret.backgroundImage,
                  showProfilePhoto: originalLivret.showProfilePhoto,
                  titleFont: originalLivret.titleFont,
                  titleColor: originalLivret.titleColor,
                  subtitleColor: originalLivret.subtitleColor,
                  tileColor: originalLivret.tileColor,
                  iconColor: originalLivret.iconColor,
                  languages: originalLivret.languages || JSON.stringify(['fr']),
                  translations: originalLivret.translations || null,
                  qrCode: qrCodeUrl,
                  type: 'SEASONAL',
                  seasonalEndDate,
                  duplicatedFromId: originalLivretId,
                  modules: {
                    create: originalLivret.modules.map(module => ({
                      type: module.type,
                      name: module.name,
                      isActive: module.isActive,
                      order: module.order,
                      content: module.content,
                      translations: module.translations,
                    }))
                  }
                }
              });

              console.log(`✅ Livret saisonnier créé (offre ${seasonalOffer} mois) pour l'utilisateur ${userId}`);
            }
          } catch (dupErr) {
            console.error('Erreur duplication saisonnière dans webhook:', dupErr);
          }

          // Créer la facture pour le paiement saisonnier
          const invoiceAmountSeasonal = session.amount_total ? session.amount_total / 100 : metaPriceHT;
          const invoiceNumberSeasonal = await generateInvoiceNumber();
          await prisma.invoice.create({
            data: {
              invoiceNumber: invoiceNumberSeasonal,
              userId,
              amount: invoiceAmountSeasonal,
              currency: session.currency?.toUpperCase() || 'EUR',
              status: 'PAID',
              stripePaymentIntentId: session.payment_intent as string || null,
              stripeInvoiceId: session.invoice as string || null,
              paidAt: new Date(),
            }
          });

          console.log(`Facture saisonnière créée pour l'utilisateur ${userId}`);
          break; // Sortir du case, pas besoin de créer un abonnement
        }

        // ── CAS STANDARD : Abonnement ──

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

        // Calculer la date de fin en fonction de la durée du plan
        const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        const checkoutQuantity = parseInt(session.metadata?.quantity || '1', 10);

        // Créer le nouvel abonnement
        const subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            plan: planType,
            status: 'ACTIVE',
            stripeSessionId: session.id,
            stripeSubscriptionId: session.subscription as string || null,
            startDate: new Date(),
            endDate: endDate,
            quantity: checkoutQuantity,
          }
        });

        // Mettre à jour les livrets existants de type TRIAL vers ANNUAL si c'est un nouvel abonnement
        await prisma.livret.updateMany({
          where: { userId, type: 'TRIAL' },
          data: { type: 'ANNUAL' }
        });

        // Créer la facture avec numéro séquentiel
        const invoiceAmount = session.amount_total ? session.amount_total / 100 : metaPriceHT;
        const invoiceNumber1 = await generateInvoiceNumber();
        await prisma.invoice.create({
          data: {
            invoiceNumber: invoiceNumber1,
            userId: userId,
            subscriptionId: subscription.id,
            amount: invoiceAmount,
            currency: session.currency?.toUpperCase() || 'EUR',
            status: 'PAID',
            stripePaymentIntentId: session.payment_intent as string || null,
            stripeInvoiceId: session.invoice as string || null,
            paidAt: new Date(),
          }
        });

        // Mettre à jour le referral d'affiliation si applicable
        try {
          const referral = await prisma.affiliateReferral.findFirst({
            where: {
              referredUserId: userId,
              status: 'PENDING',
            },
            include: { affiliate: true }
          });

          if (referral && referral.affiliate.status === 'APPROVED') {
            const commissionRate = referral.affiliate.commissionRate / 100; // 30% -> 0.30
            const saleAmountHT = metaPriceHT || invoiceAmount;
            const commissionAmount = Math.round(saleAmountHT * commissionRate * 100) / 100;
            const now = new Date();

            await prisma.affiliateReferral.update({
              where: { id: referral.id },
              data: {
                subscriptionId: subscription.id,
                saleAmount: saleAmountHT,
                commissionAmount: commissionAmount,
                status: 'VALIDATED',
                periodMonth: now.getMonth() + 1,
                periodYear: now.getFullYear(),
              }
            });

            // Incrémenter le total des gains de l'affilié
            await prisma.affiliate.update({
              where: { id: referral.affiliate.id },
              data: {
                totalEarnings: { increment: commissionAmount }
              }
            });

            console.log(`✅ [AFFILIATE] Commission de ${commissionAmount}€ enregistrée pour l'affilié ${referral.affiliate.affiliateCode}`);
          }
        } catch (affiliateErr) {
          console.error('Erreur lors de la mise à jour du referral affilié:', affiliateErr);
          // Ne pas bloquer le processus de souscription
        }

        console.log(`Abonnement ${planType} créé pour l'utilisateur ${userId} (${category}, ${unitCount} unités, ${durationDays}j)`);
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
