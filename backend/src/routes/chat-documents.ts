import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from './auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Créer le dossier pour les PDFs du chat
const chatDocsDir = process.env.CHAT_DOCS_DIR || './uploads/chat-documents';
if (!fs.existsSync(chatDocsDir)) {
  fs.mkdirSync(chatDocsDir, { recursive: true });
}

// Configuration de multer pour les PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, chatDocsDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `chat-doc-${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers (seulement PDFs)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max pour les PDFs
  },
  fileFilter: fileFilter
});

// Upload d'un PDF pour un livret
router.post('/:livretId', authenticateToken, upload.single('pdf'), async (req: any, res) => {
  try {
    const { livretId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier PDF fourni' });
    }

    // Vérifier que le livret appartient à l'utilisateur
    const livret = await prisma.livret.findFirst({
      where: {
        id: livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      // Supprimer le fichier uploadé si le livret n'existe pas
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Créer l'entrée dans la base de données
    const chatDocument = await prisma.chatDocument.create({
      data: {
        livretId: livretId,
        fileName: req.file.originalname,
        filePath: `/uploads/chat-documents/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });

    res.json({
      message: 'PDF uploadé avec succès',
      document: chatDocument
    });
  } catch (error: any) {
    console.error('Upload PDF error:', error);
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message || 'Erreur lors de l\'upload du PDF' });
  }
});

// Récupérer tous les PDFs d'un livret
router.get('/:livretId', authenticateToken, async (req: any, res) => {
  try {
    const { livretId } = req.params;

    // Vérifier que le livret appartient à l'utilisateur
    const livret = await prisma.livret.findFirst({
      where: {
        id: livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Récupérer tous les PDFs du livret
    const documents = await prisma.chatDocument.findMany({
      where: {
        livretId: livretId
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    res.json({ documents });
  } catch (error: any) {
    console.error('Get PDFs error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la récupération des PDFs' });
  }
});

// Supprimer un PDF
router.delete('/:documentId', authenticateToken, async (req: any, res) => {
  try {
    const { documentId } = req.params;

    // Récupérer le document avec le livret pour vérifier la propriété
    const document = await prisma.chatDocument.findUnique({
      where: { id: documentId },
      include: { livret: true }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Vérifier que le livret appartient à l'utilisateur
    if (document.livret.userId !== req.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Supprimer le fichier physique
    const fullPath = path.join(process.cwd(), document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Supprimer l'entrée de la base de données
    await prisma.chatDocument.delete({
      where: { id: documentId }
    });

    res.json({ message: 'PDF supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete PDF error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la suppression du PDF' });
  }
});

export default router;
