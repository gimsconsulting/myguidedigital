import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';
import jwt from 'jsonwebtoken';
import { query, param, body, validationResult } from 'express-validator';
import { validateCsrfToken } from '../middleware/csrf';

const router = express.Router();
const prisma = new PrismaClient();

// Valeurs valides pour les enums
const VALID_PLANS = ['TRIAL', 'MONTHLY', 'YEARLY', 'LIFETIME'];
const VALID_SUBSCRIPTION_STATUSES = ['ACTIVE', 'EXPIRED', 'CANCELLED'];
const VALID_INVOICE_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];

// Fonction helper pour logger les actions sensibles des admins
function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  details: Record<string, any> = {},
  req: express.Request
) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    admin: {
      id: adminId,
      email: adminEmail,
    },
    action,
    details,
    request: {
      ip,
      userAgent,
      method: req.method,
      path: req.path,
      query: req.query,
    },
  };

  // Logger avec un format structuré pour faciliter l'analyse
  console.log('🔐 [ADMIN ACTION]', JSON.stringify(logEntry, null, 2));

  // En production, vous pourriez aussi envoyer ces logs vers un service externe
  // (ex: Winston, Logstash, CloudWatch, etc.)
}

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!authHeader) {
      console.warn('🚫 [SECURITY] Tentative d\'accès admin sans token:', {
        ip,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.warn('🚫 [SECURITY] Tentative d\'accès admin avec utilisateur inexistant:', {
        ip,
        userId: decoded.userId,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
    }

    if (user.role !== 'ADMIN') {
      console.warn('🚫 [SECURITY] Tentative d\'accès admin par utilisateur non-admin:', {
        ip,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      return res.status(403).json({ message: 'Accès refusé. Administrateur requis.' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.warn('🚫 [SECURITY] Tentative d\'accès admin avec token invalide:', {
      ip,
      path: req.path,
      method: req.method,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Vue d'ensemble - KPIs
router.get('/overview', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const admin = (req as any).user;
    logAdminAction(admin.id, admin.email, 'VIEW_OVERVIEW', {}, req);

    // Total utilisateurs
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { subscriptions: { some: { status: 'ACTIVE' } } }
    });
    const trialUsers = await prisma.user.count({
      where: { subscriptions: { some: { plan: 'TRIAL', status: 'ACTIVE' } } }
    });
    // Utilisateurs payants = tous les plans sauf TRIAL
    const PAID_PLANS = ['MONTHLY', 'YEARLY', 'HOTES_ANNUEL', 'HOTES_SAISON_1', 'HOTES_SAISON_2', 'HOTES_SAISON_3', 'HOTEL_ANNUEL', 'CAMPING_ANNUEL'];
    const paidUsers = await prisma.user.count({
      where: { subscriptions: { some: { plan: { in: PAID_PLANS }, status: 'ACTIVE' } } }
    });

    // Toutes les factures payées (incluant les notes de crédit)
    const invoices = await prisma.invoice.findMany({
      where: { status: 'PAID' },
      include: { subscription: true }
    });

    // Fonction utilitaire : montant HT avec prise en compte des notes de crédit
    // Les notes de crédit (type=CREDIT_NOTE) sont soustraites, les factures normales sont ajoutées
    // Montant stocké = TTC, on divise par 1.21 pour obtenir le HT
    const getInvoiceHT = (inv: any): number => {
      const ht = inv.amount / 1.21;
      return (inv.type === 'CREDIT_NOTE') ? -ht : ht;
    };

    const totalRevenue = invoices.reduce((sum, inv) => sum + getInvoiceHT(inv), 0);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthlyRevenue = invoices
      .filter(inv => inv.paidAt && new Date(inv.paidAt) >= currentMonth)
      .reduce((sum, inv) => sum + getInvoiceHT(inv), 0);

    // Revenus HT par catégorie (notes de crédit soustraites)
    const hotesPlanTypes = ['HOTES_ANNUEL', 'HOTES_SAISON_1', 'HOTES_SAISON_2', 'HOTES_SAISON_3'];
    const hotelPlanTypes = ['HOTEL_ANNUEL'];
    const campingPlanTypes = ['CAMPING_ANNUEL'];
    const legacyPlanTypes = ['MONTHLY', 'YEARLY'];

    const revenueByCategory = {
      hotes: invoices.filter(inv => inv.subscription && hotesPlanTypes.includes(inv.subscription.plan)).reduce((sum, inv) => sum + getInvoiceHT(inv), 0),
      hotels: invoices.filter(inv => inv.subscription && hotelPlanTypes.includes(inv.subscription.plan)).reduce((sum, inv) => sum + getInvoiceHT(inv), 0),
      campings: invoices.filter(inv => inv.subscription && campingPlanTypes.includes(inv.subscription.plan)).reduce((sum, inv) => sum + getInvoiceHT(inv), 0),
      legacy: invoices.filter(inv => inv.subscription && legacyPlanTypes.includes(inv.subscription.plan)).reduce((sum, inv) => sum + getInvoiceHT(inv), 0),
    };

    // Abonnements actifs par catégorie
    const allActiveSubs = await prisma.subscription.findMany({ where: { status: 'ACTIVE' } });
    const subscriptionsByCategory = {
      trial: allActiveSubs.filter(s => s.plan === 'TRIAL').length,
      hotes: allActiveSubs.filter(s => hotesPlanTypes.includes(s.plan)).length,
      hotesAnnuel: allActiveSubs.filter(s => s.plan === 'HOTES_ANNUEL').length,
      hotesSaison: allActiveSubs.filter(s => ['HOTES_SAISON_1', 'HOTES_SAISON_2', 'HOTES_SAISON_3'].includes(s.plan)).length,
      hotels: allActiveSubs.filter(s => hotelPlanTypes.includes(s.plan)).length,
      campings: allActiveSubs.filter(s => campingPlanTypes.includes(s.plan)).length,
      legacy: allActiveSubs.filter(s => legacyPlanTypes.includes(s.plan)).length,
      total: allActiveSubs.length,
    };

    // Livrets
    const totalLivrets = await prisma.livret.count();
    const activeLivrets = await prisma.livret.count({ where: { isActive: true } });
    const inactiveLivrets = totalLivrets - activeLivrets;

    // Abonnements expirant bientôt (7 jours)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoon = await prisma.subscription.count({
      where: { status: 'ACTIVE', endDate: { lte: sevenDaysFromNow, gte: new Date() } }
    });

    // Abonnements expirés récemment (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyExpired = await prisma.subscription.count({
      where: { status: 'EXPIRED', endDate: { gte: thirtyDaysAgo } }
    });

    // Taux de conversion (essai → payant)
    const totalTrials = await prisma.subscription.count({ where: { plan: 'TRIAL' } });
    const convertedTrials = await prisma.subscription.count({
      where: { plan: { in: PAID_PLANS }, status: 'ACTIVE' }
    });
    const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials * 100).toFixed(1) : '0';

    // Dernières inscriptions (5 dernières)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, firstName: true, lastName: true, createdAt: true, userType: true }
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        trial: trialUsers,
        paid: paidUsers
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        byCategory: revenueByCategory
      },
      livrets: {
        total: totalLivrets,
        active: activeLivrets,
        inactive: inactiveLivrets
      },
      subscriptions: {
        expiringSoon,
        recentlyExpired,
        byCategory: subscriptionsByCategory
      },
      conversionRate: parseFloat(conversionRate as string),
      recentUsers
    });
  } catch (error: any) {
    console.error('Erreur overview admin:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données' });
  }
});

// Liste des utilisateurs
router.get('/users', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('La recherche ne peut pas dépasser 100 caractères'),
  query('plan').optional().isIn(VALID_PLANS).withMessage(`Le plan doit être l'un des suivants: ${VALID_PLANS.join(', ')}`),
  query('status').optional().isIn(VALID_SUBSCRIPTION_STATUSES).withMessage(`Le statut doit être l'un des suivants: ${VALID_SUBSCRIPTION_STATUSES.join(', ')}`),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const admin = (req as any).user;
    const { page = 1, limit = 20, search, plan, status } = req.query;
    
    logAdminAction(
      admin.id,
      admin.email,
      'VIEW_USERS_LIST',
      {
        filters: { search, plan, status },
        pagination: { page, limit },
      },
      req
    );
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      const searchLower = (search as string).toLowerCase();
      where.OR = [
        { email: { contains: search as string } },
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        subscriptions: {
          where: {
            ...(plan ? { plan: plan as string } : {}),
            ...(status ? { status: status as string } : {})
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        livrets: {
          select: { id: true }
        },
        _count: {
          select: {
            livrets: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        createdAt: user.createdAt,
        subscription: user.subscriptions[0] || null,
        livretsCount: user._count.livrets
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Supprimer un utilisateur (action critique - CSRF même avec JWT pour double protection)
// Mettre à jour le rôle d'un utilisateur (promouvoir en ADMIN ou rétrograder en USER)
router.put('/users/:userId/role', authenticateToken, requireAdmin, [
  param('userId').isUUID().withMessage('ID utilisateur invalide'),
  body('role').isIn(['USER', 'ADMIN']).withMessage('Le rôle doit être USER ou ADMIN'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const admin = (req as any).user;
    const { userId } = req.params;
    const { role } = req.body;

    // Empêcher un admin de se rétrograder lui-même
    if (userId === admin.id && role === 'USER') {
      logAdminAction(
        admin.id,
        admin.email,
        'UPDATE_USER_ROLE_ATTEMPT_SELF_DEMOTE',
        { targetUserId: userId, attemptedRole: role },
        req
      );
      return res.status(400).json({ 
        message: 'Vous ne pouvez pas vous rétrograder vous-même' 
      });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      logAdminAction(
        admin.id,
        admin.email,
        'UPDATE_USER_ROLE_NOT_FOUND',
        { targetUserId: userId, attemptedRole: role },
        req
      );
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    logAdminAction(
      admin.id,
      admin.email,
      'UPDATE_USER_ROLE',
      { 
        targetUserId: userId,
        targetUserEmail: user.email,
        oldRole: user.role,
        newRole: role
      },
      req
    );

    res.json({
      message: `Rôle de l'utilisateur mis à jour avec succès`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du rôle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route pour prolonger l'essai d'un utilisateur de 14 jours
router.post('/users/:userId/extend-trial', authenticateToken, requireAdmin, [
  param('userId').isUUID().withMessage('ID utilisateur invalide'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const admin = (req as any).user;
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Trouver l'abonnement actif (TRIAL ou autre)
    let subscription = user.subscriptions.find(s => s.status === 'ACTIVE');
    
    if (!subscription) {
      // Si pas d'abonnement actif, chercher un expiré
      subscription = user.subscriptions.find(s => s.status === 'EXPIRED' && s.plan === 'TRIAL');
    }

    if (subscription) {
      // Prolonger l'abonnement existant
      const currentEndDate = subscription.endDate ? new Date(subscription.endDate) : new Date();
      const newEndDate = new Date(Math.max(currentEndDate.getTime(), Date.now()));
      newEndDate.setDate(newEndDate.getDate() + 14);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          endDate: newEndDate,
          trialDaysLeft: 14,
          plan: 'TRIAL'
        }
      });
    } else {
      // Créer un nouvel abonnement trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      await prisma.subscription.create({
        data: {
          userId: userId,
          plan: 'TRIAL',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: endDate,
          trialDaysLeft: 14
        }
      });
    }

    logAdminAction(
      admin.id,
      admin.email,
      'EXTEND_TRIAL',
      { 
        targetUserId: userId,
        targetUserEmail: user.email,
        extraDays: 14
      },
      req
    );

    res.json({
      message: `14 jours d'essai supplémentaires accordés à ${user.email}`
    });
  } catch (error: any) {
    console.error('Error extending trial:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la prolongation de l\'essai',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.delete('/users/:userId', authenticateToken, requireAdmin, validateCsrfToken, [
  param('userId').notEmpty().withMessage('L\'ID utilisateur est requis').isUUID().withMessage('L\'ID utilisateur doit être un UUID valide'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const { userId } = req.params;
    const currentUser = (req as any).user;

    // Empêcher la suppression de soi-même
    if (userId === currentUser.id) {
      logAdminAction(
        currentUser.id,
        currentUser.email,
        'DELETE_USER_ATTEMPT_SELF',
        { attemptedUserId: userId },
        req
      );
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        livrets: { select: { id: true } },
        subscriptions: { select: { id: true } },
        invoices: { select: { id: true } }
      }
    });

    if (!user) {
      logAdminAction(
        currentUser.id,
        currentUser.email,
        'DELETE_USER_NOT_FOUND',
        { attemptedUserId: userId },
        req
      );
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Logger AVANT la suppression (action critique)
    logAdminAction(
      currentUser.id,
      currentUser.email,
      'DELETE_USER',
      {
        deletedUser: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        associatedData: {
          livretsCount: user.livrets.length,
          subscriptionsCount: user.subscriptions.length,
          invoicesCount: user.invoices.length,
        },
      },
      req
    );

    // Supprimer l'utilisateur (les relations seront supprimées en cascade grâce à onDelete: Cascade dans le schema)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ 
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Statistiques financières
router.get('/revenue', authenticateToken, requireAdmin, [
  query('period').optional().isInt({ min: 1, max: 60 }).withMessage('La période doit être entre 1 et 60 mois'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const admin = (req as any).user;
    const { period = '12' } = req.query; // Nombre de mois
    
    logAdminAction(
      admin.id,
      admin.email,
      'VIEW_REVENUE_STATS',
      { period },
      req
    );
    const months = Number(period);

    // Revenus mensuels
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - months))
        }
      },
      include: {
        subscription: true
      },
      orderBy: { paidAt: 'asc' }
    });

    // Fonction utilitaire : montant HT avec prise en compte des notes de crédit
    const getRevInvHT = (inv: any): number => {
      const ht = inv.amount / 1.21;
      return (inv.type === 'CREDIT_NOTE') ? -ht : ht;
    };

    // Grouper par mois (en HT, notes de crédit soustraites)
    const monthlyRevenue: { [key: string]: number } = {};
    invoices.forEach(inv => {
      if (inv.paidAt) {
        const month = new Date(inv.paidAt).toISOString().slice(0, 7); // YYYY-MM
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + getRevInvHT(inv);
      }
    });

    // Revenus HT par plan (notes de crédit soustraites)
    const revenueByPlan = {
      monthly: invoices.filter(inv => inv.subscription?.plan === 'MONTHLY').reduce((sum, inv) => sum + getRevInvHT(inv), 0),
      yearly: invoices.filter(inv => inv.subscription?.plan === 'YEARLY').reduce((sum, inv) => sum + getRevInvHT(inv), 0),
      lifetime: invoices.filter(inv => inv.subscription?.plan === 'LIFETIME').reduce((sum, inv) => sum + getRevInvHT(inv), 0)
    };

    // Abonnements actifs par plan
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' }
    });

    const subscriptionsByPlan = {
      monthly: activeSubscriptions.filter(s => s.plan === 'MONTHLY').length,
      yearly: activeSubscriptions.filter(s => s.plan === 'YEARLY').length,
      lifetime: activeSubscriptions.filter(s => s.plan === 'LIFETIME').length,
      trial: activeSubscriptions.filter(s => s.plan === 'TRIAL').length
    };

    // MRR et ARR
    const mrr = revenueByPlan.monthly + (revenueByPlan.yearly / 12);
    const arr = mrr * 12;

    res.json({
      monthlyRevenue,
      revenueByPlan,
      subscriptionsByPlan,
      mrr: parseFloat(mrr.toFixed(2)),
      arr: parseFloat(arr.toFixed(2)),
      totalRevenue: invoices.reduce((sum, inv) => sum + getRevInvHT(inv), 0)
    });
  } catch (error: any) {
    console.error('Erreur statistiques financières:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// Liste des abonnements
router.get('/subscriptions', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
  query('plan').optional().isIn(VALID_PLANS).withMessage(`Le plan doit être l'un des suivants: ${VALID_PLANS.join(', ')}`),
  query('status').optional().isIn(VALID_SUBSCRIPTION_STATUSES).withMessage(`Le statut doit être l'un des suivants: ${VALID_SUBSCRIPTION_STATUSES.join(', ')}`),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const admin = (req as any).user;
    const { page = 1, limit = 20, plan, status } = req.query;
    
    logAdminAction(
      admin.id,
      admin.email,
      'VIEW_SUBSCRIPTIONS_LIST',
      {
        filters: { plan, status },
        pagination: { page, limit },
      },
      req
    );
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (plan) where.plan = plan;
    if (status) where.status = status;

    const subscriptions = await prisma.subscription.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.subscription.count({ where });

    res.json({
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Erreur liste abonnements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des abonnements' });
  }
});

// Statistiques des livrets
router.get('/livrets', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const admin = (req as any).user;
    
    logAdminAction(
      admin.id,
      admin.email,
      'VIEW_LIVRETS_STATS',
      {},
      req
    );
    const totalLivrets = await prisma.livret.count();
    const activeLivrets = await prisma.livret.count({ where: { isActive: true } });
    
    const livretsWithStats = await prisma.livret.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        modules: {
          select: { id: true, type: true }
        },
        statistics: {
          select: { id: true }
        },
        _count: {
          select: {
            modules: true,
            statistics: true
          }
        }
      },
      orderBy: {
        statistics: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Répartition par type de module
    const modules = await prisma.module.findMany({
      select: { type: true }
    });
    const moduleTypes: { [key: string]: number } = {};
    modules.forEach(m => {
      moduleTypes[m.type] = (moduleTypes[m.type] || 0) + 1;
    });

    res.json({
      total: totalLivrets,
      active: activeLivrets,
      inactive: totalLivrets - activeLivrets,
      topLivrets: livretsWithStats.map(l => ({
        id: l.id,
        name: l.name,
        user: l.user,
        modulesCount: l._count.modules,
        viewsCount: l._count.statistics,
        isActive: l.isActive,
        createdAt: l.createdAt
      })),
      moduleTypes
    });
  } catch (error: any) {
    console.error('Erreur statistiques livrets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// Liste des factures
router.get('/invoices', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
  query('status').optional().isIn(VALID_INVOICE_STATUSES).withMessage(`Le statut doit être l'un des suivants: ${VALID_INVOICE_STATUSES.join(', ')}`),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const admin = (req as any).user;
    const { page = 1, limit = 20, status } = req.query;
    
    logAdminAction(
      admin.id,
      admin.email,
      'VIEW_INVOICES_LIST',
      {
        filters: { status },
        pagination: { page, limit },
      },
      req
    );
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        subscription: {
          select: {
            plan: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.invoice.count({ where });

    res.json({
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Erreur liste factures:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
});

// ═══════════════════════════════════════════════════════
// CHATBOT APPLICATION — Configuration du contexte
// ═══════════════════════════════════════════════════════

// GET /api/admin/chatbot-config — Récupérer la config du chatbot
router.get('/chatbot-config', authenticateToken, async (req: any, res: express.Response) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Récupérer la config (il n'y en a qu'une seule)
    let config = await prisma.appChatbotConfig.findFirst();
    
    if (!config) {
      // Créer une config par défaut si elle n'existe pas
      config = await prisma.appChatbotConfig.create({
        data: {
          context: '',
          isActive: true,
        }
      });
    }

    res.json({ config });
  } catch (error: any) {
    console.error('Get chatbot config error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la configuration du chatbot' });
  }
});

// PUT /api/admin/chatbot-config — Mettre à jour la config du chatbot
router.put('/chatbot-config', authenticateToken, async (req: any, res: express.Response) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    const { context, isActive } = req.body;

    // Récupérer ou créer la config
    let config = await prisma.appChatbotConfig.findFirst();
    
    if (config) {
      config = await prisma.appChatbotConfig.update({
        where: { id: config.id },
        data: {
          ...(context !== undefined && { context }),
          ...(isActive !== undefined && { isActive }),
        }
      });
    } else {
      config = await prisma.appChatbotConfig.create({
        data: {
          context: context || '',
          isActive: isActive !== undefined ? isActive : true,
        }
      });
    }

    logAdminAction(req.userId, user.email, 'UPDATE_CHATBOT_CONFIG', {
      contextLength: config.context.length,
      isActive: config.isActive,
    }, req);

    res.json({ 
      message: 'Configuration du chatbot mise à jour',
      config 
    });
  } catch (error: any) {
    console.error('Update chatbot config error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la configuration du chatbot' });
  }
});

// ═══════════════════════════════════════════════
// GESTION DES DÉMOS (Admin)
// ═══════════════════════════════════════════════

// GET /admin/demo-bookings - Récupérer toutes les réservations de démo
router.get('/demo-bookings', requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { status, from, to } = req.query;

    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (from && typeof from === 'string') {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      where.date = { ...where.date, gte: fromDate };
    }

    if (to && typeof to === 'string') {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      where.date = { ...where.date, lte: toDate };
    }

    const bookings = await prisma.demoBooking.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json(bookings);
  } catch (error: any) {
    console.error('Get demo bookings error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
  }
});

// PUT /admin/demo-bookings/:id/status - Modifier le statut d'une démo
router.put('/demo-bookings/:id/status', requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const booking = await prisma.demoBooking.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
        ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
    });

    const admin = (req as any).user;
    logAdminAction(admin.id, admin.email, 'UPDATE_DEMO_STATUS', {
      bookingId: id,
      newStatus: status,
      prospectEmail: booking.email,
    }, req);

    res.json({ message: 'Statut mis à jour', booking });
  } catch (error: any) {
    console.error('Update demo status error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
});

// GET /admin/demo-bookings/blocked-slots - Récupérer les créneaux bloqués
router.get('/demo-bookings-blocked', requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const blockedSlots = await prisma.blockedSlot.findMany({
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json(blockedSlots);
  } catch (error: any) {
    console.error('Get blocked slots error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des créneaux bloqués' });
  }
});

// POST /admin/demo-bookings/block-slot - Bloquer un créneau
router.post('/demo-bookings-block', requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { date, startTime, endTime, reason } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ message: 'La date et l\'heure de début sont requises' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const blockedSlot = await prisma.blockedSlot.create({
      data: {
        date: targetDate,
        startTime,
        endTime: endTime || '',
        reason: reason || null,
      },
    });

    const admin = (req as any).user;
    logAdminAction(admin.id, admin.email, 'BLOCK_DEMO_SLOT', {
      date,
      startTime,
      reason,
    }, req);

    res.status(201).json({ message: 'Créneau bloqué', blockedSlot });
  } catch (error: any) {
    console.error('Block slot error:', error);
    res.status(500).json({ message: 'Erreur lors du blocage du créneau' });
  }
});

// DELETE /admin/demo-bookings/block-slot/:id - Débloquer un créneau
router.delete('/demo-bookings-block/:id', requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    await prisma.blockedSlot.delete({
      where: { id },
    });

    const admin = (req as any).user;
    logAdminAction(admin.id, admin.email, 'UNBLOCK_DEMO_SLOT', {
      blockedSlotId: id,
    }, req);

    res.json({ message: 'Créneau débloqué' });
  } catch (error: any) {
    console.error('Unblock slot error:', error);
    res.status(500).json({ message: 'Erreur lors du déblocage du créneau' });
  }
});

// POST /admin/demo-bookings/block-day - Bloquer une journée entière
router.post('/demo-bookings-block-day', requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'La date est requise' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Générer tous les créneaux de la journée et les bloquer
    const SLOT_TOTAL = 50;
    const START_HOUR = 10;
    const END_HOUR = 17;
    const DEMO_DURATION = 30;
    const slots: { startTime: string; endTime: string }[] = [];
    let currentMinutes = START_HOUR * 60;
    
    while (currentMinutes + DEMO_DURATION <= END_HOUR * 60) {
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endH = Math.floor((currentMinutes + DEMO_DURATION) / 60);
      const endM = (currentMinutes + DEMO_DURATION) % 60;
      slots.push({
        startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
        endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
      });
      currentMinutes += SLOT_TOTAL;
    }

    // Supprimer les éventuels blocages existants pour cette date
    await prisma.blockedSlot.deleteMany({
      where: {
        date: {
          gte: new Date(targetDate),
          lte: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000 - 1),
        },
      },
    });

    // Créer les blocages
    await prisma.blockedSlot.createMany({
      data: slots.map(slot => ({
        date: targetDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: reason || 'Journée bloquée',
      })),
    });

    const admin = (req as any).user;
    logAdminAction(admin.id, admin.email, 'BLOCK_DEMO_DAY', {
      date,
      reason,
      slotsBlocked: slots.length,
    }, req);

    res.status(201).json({ message: `Journée bloquée (${slots.length} créneaux)` });
  } catch (error: any) {
    console.error('Block day error:', error);
    res.status(500).json({ message: 'Erreur lors du blocage de la journée' });
  }
});

export default router;
