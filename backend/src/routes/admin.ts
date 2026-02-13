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
    logAdminAction(
      admin.id,
      admin.email,
      'VIEW_OVERVIEW',
      {},
      req
    );
    // Total utilisateurs
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE'
          }
        }
      }
    });
    const trialUsers = await prisma.user.count({
      where: {
        subscriptions: {
          some: {
            plan: 'TRIAL',
            status: 'ACTIVE'
          }
        }
      }
    });
    const paidUsers = await prisma.user.count({
      where: {
        subscriptions: {
          some: {
            plan: { in: ['MONTHLY', 'YEARLY', 'LIFETIME'] },
            status: 'ACTIVE'
          }
        }
      }
    });

    // Revenus
    const invoices = await prisma.invoice.findMany({
      where: {
        status: 'PAID'
      },
      include: {
        subscription: true
      }
    });
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthlyRevenue = invoices
      .filter(inv => inv.paidAt && new Date(inv.paidAt) >= currentMonth)
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Revenus par plan
    const monthlyInvoices = invoices.filter(inv => {
      const sub = inv.subscription;
      return sub && sub.plan === 'MONTHLY' && inv.status === 'PAID';
    });
    const yearlyInvoices = invoices.filter(inv => {
      const sub = inv.subscription;
      return sub && sub.plan === 'YEARLY' && inv.status === 'PAID';
    });
    const lifetimeInvoices = invoices.filter(inv => {
      const sub = inv.subscription;
      return sub && sub.plan === 'LIFETIME' && inv.status === 'PAID';
    });

    const revenueByPlan = {
      monthly: monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      yearly: yearlyInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      lifetime: lifetimeInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    };

    // Livrets
    const totalLivrets = await prisma.livret.count();
    const activeLivrets = await prisma.livret.count({ where: { isActive: true } });
    const inactiveLivrets = totalLivrets - activeLivrets;

    // Abonnements expirant bientôt (7 jours)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSoon = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: sevenDaysFromNow,
          gte: new Date()
        }
      }
    });

    // Taux de conversion
    const totalTrials = await prisma.subscription.count({
      where: { plan: 'TRIAL' }
    });
    const convertedTrials = await prisma.subscription.count({
      where: {
        plan: { in: ['MONTHLY', 'YEARLY', 'LIFETIME'] },
        status: 'ACTIVE'
      }
    });
    const conversionRate = totalTrials > 0 ? (convertedTrials / totalTrials * 100).toFixed(1) : '0';

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
        byPlan: revenueByPlan
      },
      livrets: {
        total: totalLivrets,
        active: activeLivrets,
        inactive: inactiveLivrets
      },
      subscriptions: {
        expiringSoon
      },
      conversionRate: parseFloat(conversionRate)
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

    // Grouper par mois
    const monthlyRevenue: { [key: string]: number } = {};
    invoices.forEach(inv => {
      if (inv.paidAt) {
        const month = new Date(inv.paidAt).toISOString().slice(0, 7); // YYYY-MM
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.amount;
      }
    });

    // Revenus par plan
    const revenueByPlan = {
      monthly: invoices.filter(inv => inv.subscription?.plan === 'MONTHLY').reduce((sum, inv) => sum + inv.amount, 0),
      yearly: invoices.filter(inv => inv.subscription?.plan === 'YEARLY').reduce((sum, inv) => sum + inv.amount, 0),
      lifetime: invoices.filter(inv => inv.subscription?.plan === 'LIFETIME').reduce((sum, inv) => sum + inv.amount, 0)
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
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.amount, 0)
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

export default router;
