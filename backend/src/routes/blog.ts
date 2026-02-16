import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const router = express.Router();
const prisma = new PrismaClient();

// ───── Upload configuration pour les images du blog ─────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const blogUploadDir = path.join(uploadDir, 'blog');

// Créer les dossiers si nécessaire
if (!fs.existsSync(blogUploadDir)) {
  fs.mkdirSync(blogUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, blogUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `blog-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter,
});

// ───── Middleware requireAdmin ─────
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
  }
  (req as any).user = user;
  next();
};

// ───── Helper: générer un slug unique ─────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder uniquement alphanumériques, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-'); // Supprimer tirets multiples
}

// ═══════════════════════════════════════════════════════════
// ROUTES PUBLIQUES
// ═══════════════════════════════════════════════════════════

// GET /api/blog - Liste des articles publiés (public)
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { category, featured, page = '1', limit = '20', search } = req.query;

    const where: any = { status: 'PUBLISHED' };
    if (category && category !== 'all') where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { excerpt: { contains: search as string } },
      ];
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          category: true,
          tags: true,
          featured: true,
          readTime: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
      }),
      prisma.blogArticle.count({ where }),
    ]);

    res.json({
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur lors de la récupération des articles:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/blog/article/:slug - Article unique (public)
router.get('/article/:slug', async (req: express.Request, res: express.Response) => {
  try {
    const article = await prisma.blogArticle.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!article || article.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json(article);
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur article:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// ROUTES ADMIN (authentifiées)
// ═══════════════════════════════════════════════════════════

// GET /api/blog/admin/list - Tous les articles (admin)
router.get('/admin/list', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { status, category, page = '1', limit = '50' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (category && category !== 'all') where.category = category;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.blogArticle.count({ where }),
    ]);

    res.json({
      articles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur admin list:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/blog/admin/:id - Détail article (admin)
router.get('/admin/:id', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const article = await prisma.blogArticle.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json(article);
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur admin detail:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/blog/admin - Créer un article (admin)
router.post('/admin', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { title, excerpt, content, thumbnail, category, tags, status, featured, readTime, metaTitle, metaDesc } = req.body;

    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({ message: 'Titre, extrait, contenu et catégorie requis' });
    }

    // Générer slug unique
    let slug = generateSlug(title);
    const existing = await prisma.blogArticle.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await prisma.blogArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        thumbnail: thumbnail || null,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        status: status || 'DRAFT',
        featured: featured || false,
        readTime: readTime || null,
        metaTitle: metaTitle || null,
        metaDesc: metaDesc || null,
        authorId: (req as any).user.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    console.log('✅ [BLOG] Article créé:', article.id, article.title);
    res.status(201).json(article);
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur création:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/blog/admin/:id - Modifier un article (admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { title, excerpt, content, thumbnail, category, tags, status, featured, readTime, metaTitle, metaDesc } = req.body;

    const existingArticle = await prisma.blogArticle.findUnique({ where: { id: req.params.id } });
    if (!existingArticle) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Si le titre change, mettre à jour le slug
    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      slug = generateSlug(title);
      const slugExists = await prisma.blogArticle.findFirst({
        where: { slug, id: { not: req.params.id } },
      });
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Si on publie pour la première fois
    let publishedAt = existingArticle.publishedAt;
    if (status === 'PUBLISHED' && !existingArticle.publishedAt) {
      publishedAt = new Date();
    }

    const article = await prisma.blogArticle.update({
      where: { id: req.params.id },
      data: {
        title: title || existingArticle.title,
        slug,
        excerpt: excerpt ?? existingArticle.excerpt,
        content: content ?? existingArticle.content,
        thumbnail: thumbnail !== undefined ? thumbnail : existingArticle.thumbnail,
        category: category || existingArticle.category,
        tags: tags !== undefined ? (tags ? JSON.stringify(tags) : null) : existingArticle.tags,
        status: status || existingArticle.status,
        featured: featured !== undefined ? featured : existingArticle.featured,
        readTime: readTime !== undefined ? readTime : existingArticle.readTime,
        metaTitle: metaTitle !== undefined ? metaTitle : existingArticle.metaTitle,
        metaDesc: metaDesc !== undefined ? metaDesc : existingArticle.metaDesc,
        publishedAt,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    console.log('✅ [BLOG] Article modifié:', article.id, article.title);
    res.json(article);
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur modification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/blog/admin/:id - Supprimer un article (admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const article = await prisma.blogArticle.findUnique({ where: { id: req.params.id } });
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    await prisma.blogArticle.delete({ where: { id: req.params.id } });

    console.log('✅ [BLOG] Article supprimé:', req.params.id);
    res.json({ message: 'Article supprimé avec succès' });
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ═══════════════════════════════════════════════════════════
// UPLOAD D'IMAGES POUR LE BLOG
// ═══════════════════════════════════════════════════════════

// POST /api/blog/admin/upload-image - Upload image (admin)
router.post('/admin/upload-image', authenticateToken, requireAdmin, upload.single('image'), async (req: any, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }

    const imageUrl = `/uploads/blog/${req.file.filename}`;
    console.log('✅ [BLOG] Image uploadée:', imageUrl);

    res.json({
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur upload image:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload' });
  }
});

// ═══════════════════════════════════════════════════════════
// INTEGRATION PEXELS
// ═══════════════════════════════════════════════════════════

// GET /api/blog/admin/pexels/search - Recherche Pexels (admin)
router.get('/admin/pexels/search', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const { query, page = '1', per_page = '15' } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Requête de recherche requise' });
    }

    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) {
      return res.status(500).json({ message: 'Clé API Pexels non configurée' });
    }

    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        Authorization: pexelsApiKey,
      },
      params: {
        query,
        page: parseInt(page as string),
        per_page: parseInt(per_page as string),
        locale: 'fr-FR',
      },
    });

    const photos = response.data.photos.map((photo: any) => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      photographer: photo.photographer,
      alt: photo.alt,
      src: {
        original: photo.src.original,
        large: photo.src.large,
        large2x: photo.src.large2x,
        medium: photo.src.medium,
        small: photo.src.small,
        portrait: photo.src.portrait,
        landscape: photo.src.landscape,
        tiny: photo.src.tiny,
      },
    }));

    res.json({
      photos,
      total_results: response.data.total_results,
      page: response.data.page,
      per_page: response.data.per_page,
    });
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur Pexels:', error.message);
    res.status(500).json({ message: 'Erreur lors de la recherche Pexels' });
  }
});

// GET /api/blog/admin/stats - Statistiques blog (admin)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req: express.Request, res: express.Response) => {
  try {
    const [total, published, draft, featured] = await Promise.all([
      prisma.blogArticle.count(),
      prisma.blogArticle.count({ where: { status: 'PUBLISHED' } }),
      prisma.blogArticle.count({ where: { status: 'DRAFT' } }),
      prisma.blogArticle.count({ where: { featured: true } }),
    ]);

    const byCategory = await prisma.blogArticle.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    res.json({
      total,
      published,
      draft,
      featured,
      byCategory: byCategory.reduce((acc: any, item) => {
        acc[item.category] = item._count.id;
        return acc;
      }, {}),
    });
  } catch (error: any) {
    console.error('❌ [BLOG] Erreur stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
