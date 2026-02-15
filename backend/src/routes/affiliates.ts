import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, query, param } from 'express-validator';
import crypto from 'crypto';
import { authenticateToken } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware admin — vérifie que l'utilisateur authentifié est ADMIN
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, email: true } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('requireAdmin error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Générer un code d'affiliation unique (ex: MGD-A7X3K9)
function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MGD-${code}`;
}

// ══════════════════════════════════════
// ROUTES PUBLIQUES
// ══════════════════════════════════════

// Vérifier si un code d'affiliation est valide (route publique pour l'inscription)
router.get('/verify/:code', async (req: express.Request, res: express.Response) => {
  try {
    const { code } = req.params;
    const affiliate = await prisma.affiliate.findUnique({
      where: { affiliateCode: code },
      select: { id: true, affiliateCode: true, status: true, companyName: true }
    });

    if (!affiliate || affiliate.status !== 'APPROVED') {
      return res.status(404).json({ valid: false, message: 'Code d\'affiliation invalide' });
    }

    res.json({ valid: true, affiliateCode: affiliate.affiliateCode, companyName: affiliate.companyName });
  } catch (error: any) {
    console.error('Verify affiliate code error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ══════════════════════════════════════
// ROUTES AUTHENTIFIÉES (Client)
// ══════════════════════════════════════

// Demander à devenir affilié
router.post('/apply', authenticateToken, [
  body('companyName').trim().notEmpty().withMessage('Le nom de la société est requis'),
  body('vatNumber').trim().notEmpty().withMessage('Le numéro de TVA est requis'),
  body('contactName').trim().notEmpty().withMessage('Le nom du responsable est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('address').optional().trim(),
  body('country').optional().trim(),
  body('iban').optional().trim(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Données invalides', errors: errors.array() });
    }

    const userId = (req as any).userId;

    // Vérifier si déjà affilié
    const existing = await prisma.affiliate.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ message: 'Vous avez déjà soumis une demande d\'affiliation', affiliate: existing });
    }

    // Générer un code unique
    let affiliateCode = generateAffiliateCode();
    let codeExists = true;
    while (codeExists) {
      const check = await prisma.affiliate.findUnique({ where: { affiliateCode } });
      if (!check) codeExists = false;
      else affiliateCode = generateAffiliateCode();
    }

    const { companyName, vatNumber, contactName, email, address, country, iban } = req.body;

    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        affiliateCode,
        companyName,
        vatNumber,
        contactName,
        email,
        address,
        country,
        iban,
        commissionRate: 30,
        status: 'PENDING',
      }
    });

    res.status(201).json({ message: 'Demande d\'affiliation soumise avec succès', affiliate });
  } catch (error: any) {
    console.error('Apply affiliate error:', error);
    res.status(500).json({ message: 'Erreur lors de la soumission de la demande' });
  }
});

// Récupérer mon profil d'affilié
router.get('/me', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).userId;
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            referredUser: {
              select: { email: true, firstName: true, lastName: true, createdAt: true }
            }
          }
        }
      }
    });

    if (!affiliate) {
      return res.status(404).json({ message: 'Vous n\'êtes pas affilié' });
    }

    // Stats mensuelles
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyReferrals = await prisma.affiliateReferral.findMany({
      where: {
        affiliateId: affiliate.id,
        periodMonth: currentMonth,
        periodYear: currentYear,
      }
    });

    const monthlyEarnings = monthlyReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);
    const pendingEarnings = affiliate.totalEarnings - affiliate.totalPaid;

    res.json({
      ...affiliate,
      monthlyEarnings,
      pendingEarnings,
      affiliateLink: `${process.env.FRONTEND_URL || 'https://app.myguidedigital.com'}/register?ref=${affiliate.affiliateCode}`,
    });
  } catch (error: any) {
    console.error('Get affiliate me error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mes statistiques détaillées
router.get('/stats', authenticateToken, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).userId;
    const affiliate = await prisma.affiliate.findUnique({ where: { userId } });

    if (!affiliate) {
      return res.status(404).json({ message: 'Vous n\'êtes pas affilié' });
    }

    // Stats par mois (12 derniers mois)
    const monthlyStats = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const referrals = await prisma.affiliateReferral.findMany({
        where: {
          affiliateId: affiliate.id,
          periodMonth: month,
          periodYear: year,
        }
      });

      const totalSales = referrals.reduce((sum, r) => sum + r.saleAmount, 0);
      const totalCommission = referrals.reduce((sum, r) => sum + r.commissionAmount, 0);
      const count = referrals.length;

      monthlyStats.push({
        month,
        year,
        label: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        referralCount: count,
        totalSales: Math.round(totalSales * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        paid: referrals.filter(r => r.status === 'PAID').length,
        pending: referrals.filter(r => r.status === 'PENDING' || r.status === 'VALIDATED').length,
      });
    }

    res.json({
      affiliate: {
        id: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
        totalEarnings: affiliate.totalEarnings,
        totalPaid: affiliate.totalPaid,
        pendingEarnings: Math.round((affiliate.totalEarnings - affiliate.totalPaid) * 100) / 100,
      },
      monthlyStats,
    });
  } catch (error: any) {
    console.error('Get affiliate stats error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ══════════════════════════════════════
// ROUTES ADMIN
// ══════════════════════════════════════

// Lister tous les affiliés
router.get('/admin/list', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const [affiliates, total] = await Promise.all([
      prisma.affiliate.findMany({
        where,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          _count: { select: { referrals: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.affiliate.count({ where }),
    ]);

    res.json({ affiliates, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    console.error('Admin list affiliates error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Détail d'un affilié avec ses referrals
router.get('/admin/:affiliateId', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { affiliateId } = req.params;

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        referrals: {
          orderBy: { createdAt: 'desc' },
          include: {
            referredUser: {
              select: { email: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!affiliate) {
      return res.status(404).json({ message: 'Affilié non trouvé' });
    }

    // Stats résumées
    const pendingReferrals = affiliate.referrals.filter(r => r.status === 'PENDING' || r.status === 'VALIDATED');
    const paidReferrals = affiliate.referrals.filter(r => r.status === 'PAID');
    const pendingAmount = pendingReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);
    const paidAmount = paidReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);

    // Stats par mois pour la clôture
    const monthlyBreakdown: Record<string, any> = {};
    for (const ref of affiliate.referrals) {
      const key = `${ref.periodYear}-${String(ref.periodMonth).padStart(2, '0')}`;
      if (!monthlyBreakdown[key]) {
        monthlyBreakdown[key] = { month: ref.periodMonth, year: ref.periodYear, referrals: [], totalSales: 0, totalCommission: 0, status: 'PENDING' };
      }
      monthlyBreakdown[key].referrals.push(ref);
      monthlyBreakdown[key].totalSales += ref.saleAmount;
      monthlyBreakdown[key].totalCommission += ref.commissionAmount;
      if (ref.status === 'PAID') monthlyBreakdown[key].status = 'PAID';
    }

    res.json({
      affiliate,
      summary: {
        totalReferrals: affiliate.referrals.length,
        pendingAmount: Math.round(pendingAmount * 100) / 100,
        paidAmount: Math.round(paidAmount * 100) / 100,
        totalEarnings: affiliate.totalEarnings,
      },
      monthlyBreakdown: Object.values(monthlyBreakdown).sort((a: any, b: any) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      }),
    });
  } catch (error: any) {
    console.error('Admin get affiliate detail error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Approuver / Rejeter / Suspendre un affilié
router.put('/admin/:affiliateId/status', authenticateToken, requireAdmin, [
  body('status').isIn(['APPROVED', 'REJECTED', 'SUSPENDED']).withMessage('Statut invalide'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Données invalides', errors: errors.array() });
    }

    const { affiliateId } = req.params;
    const { status } = req.body;

    const affiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: { status },
    });

    res.json({ message: `Affilié ${status === 'APPROVED' ? 'approuvé' : status === 'REJECTED' ? 'rejeté' : 'suspendu'}`, affiliate });
  } catch (error: any) {
    console.error('Admin update affiliate status error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer des referrals comme payés (clôture mensuelle)
router.put('/admin/pay/:affiliateId', authenticateToken, requireAdmin, [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Mois invalide'),
  body('year').isInt({ min: 2024 }).withMessage('Année invalide'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Données invalides', errors: errors.array() });
    }

    const { affiliateId } = req.params;
    const { month, year } = req.body;

    // Trouver les referrals non payés du mois
    const referrals = await prisma.affiliateReferral.findMany({
      where: {
        affiliateId,
        periodMonth: month,
        periodYear: year,
        status: { in: ['PENDING', 'VALIDATED'] },
      }
    });

    if (referrals.length === 0) {
      return res.status(400).json({ message: 'Aucune commission à payer pour cette période' });
    }

    const totalToPay = referrals.reduce((sum, r) => sum + r.commissionAmount, 0);

    // Mettre à jour les referrals
    await prisma.affiliateReferral.updateMany({
      where: {
        affiliateId,
        periodMonth: month,
        periodYear: year,
        status: { in: ['PENDING', 'VALIDATED'] },
      },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      }
    });

    // Mettre à jour le total payé de l'affilié
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        totalPaid: { increment: totalToPay },
      }
    });

    res.json({
      message: `${referrals.length} commissions marquées comme payées`,
      totalPaid: Math.round(totalToPay * 100) / 100,
      referralCount: referrals.length,
    });
  } catch (error: any) {
    console.error('Admin pay affiliate error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Vue d'ensemble des affiliés (pour admin dashboard)
router.get('/admin/overview', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const totalAffiliates = await prisma.affiliate.count();
    const approvedAffiliates = await prisma.affiliate.count({ where: { status: 'APPROVED' } });
    const pendingAffiliates = await prisma.affiliate.count({ where: { status: 'PENDING' } });

    const totalReferrals = await prisma.affiliateReferral.count();
    const allReferrals = await prisma.affiliateReferral.findMany();
    const totalSales = allReferrals.reduce((sum, r) => sum + r.saleAmount, 0);
    const totalCommissions = allReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);
    const totalPaidCommissions = allReferrals.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.commissionAmount, 0);
    const pendingCommissions = totalCommissions - totalPaidCommissions;

    // Mois en cours
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthReferrals = await prisma.affiliateReferral.findMany({
      where: { periodMonth: currentMonth, periodYear: currentYear },
    });
    const currentMonthSales = currentMonthReferrals.reduce((sum, r) => sum + r.saleAmount, 0);
    const currentMonthCommissions = currentMonthReferrals.reduce((sum, r) => sum + r.commissionAmount, 0);

    // Top affiliés
    const topAffiliates = await prisma.affiliate.findMany({
      where: { status: 'APPROVED' },
      orderBy: { totalEarnings: 'desc' },
      take: 5,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { referrals: true } }
      }
    });

    res.json({
      totalAffiliates,
      approvedAffiliates,
      pendingAffiliates,
      totalReferrals,
      totalSales: Math.round(totalSales * 100) / 100,
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      totalPaidCommissions: Math.round(totalPaidCommissions * 100) / 100,
      pendingCommissions: Math.round(pendingCommissions * 100) / 100,
      currentMonth: {
        sales: Math.round(currentMonthSales * 100) / 100,
        commissions: Math.round(currentMonthCommissions * 100) / 100,
        referrals: currentMonthReferrals.length,
      },
      topAffiliates,
    });
  } catch (error: any) {
    console.error('Admin affiliate overview error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
