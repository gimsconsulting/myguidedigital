import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get statistics for a livret
router.get('/livret/:livretId', authenticateToken, async (req: any, res) => {
  try {
    // Verify ownership
    const livret = await prisma.livret.findFirst({
      where: {
        id: req.params.livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Get all statistics
    const allStats = await prisma.statistic.findMany({
      where: { livretId: req.params.livretId },
      orderBy: { viewedAt: 'desc' }
    });

    // Get unique views per module
    const moduleStats = await prisma.statistic.groupBy({
      by: ['moduleType'],
      where: {
        livretId: req.params.livretId,
        moduleType: { not: null }
      },
      _count: {
        id: true
      }
    });

    // Get total openings (moduleType is null)
    const totalOpenings = await prisma.statistic.count({
      where: {
        livretId: req.params.livretId,
        moduleType: null
      }
    });

    // Get unique visitors per module (distinct IPs)
    const uniqueVisitors = await prisma.statistic.groupBy({
      by: ['moduleType', 'ipAddress'],
      where: {
        livretId: req.params.livretId,
        moduleType: { not: null }
      }
    });

    // Count unique visitors per module
    const uniqueVisitorsByModule: Record<string, number> = {};
    uniqueVisitors.forEach(stat => {
      if (stat.moduleType) {
        uniqueVisitorsByModule[stat.moduleType] = (uniqueVisitorsByModule[stat.moduleType] || 0) + 1;
      }
    });

    res.json({
      totalOpenings,
      moduleStats: moduleStats.map(stat => ({
        moduleType: stat.moduleType,
        totalViews: stat._count.id,
        uniqueVisitors: uniqueVisitorsByModule[stat.moduleType || ''] || 0
      })),
      history: allStats.slice(0, 100) // Last 100 entries
    });
  } catch (error: any) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// Record module view (public endpoint)
router.post('/view', async (req, res) => {
  try {
    const { livretId, moduleType } = req.body;

    if (!livretId) {
      return res.status(400).json({ message: 'livretId requis' });
    }

    await prisma.statistic.create({
      data: {
        livretId,
        moduleType: moduleType || null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }
    });

    res.json({ message: 'Statistique enregistrée' });
  } catch (error: any) {
    console.error('Record view error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la statistique' });
  }
});

// Reset statistics
router.delete('/livret/:livretId', authenticateToken, async (req: any, res) => {
  try {
    // Verify ownership
    const livret = await prisma.livret.findFirst({
      where: {
        id: req.params.livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    await prisma.statistic.deleteMany({
      where: { livretId: req.params.livretId }
    });

    res.json({ message: 'Statistiques réinitialisées' });
  } catch (error: any) {
    console.error('Reset statistics error:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation des statistiques' });
  }
});

export default router;
