import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from './auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Créer le dossier pour les PDFs du chat
// Utiliser un chemin absolu pour éviter les problèmes de chemin relatif
const chatDocsDir = process.env.CHAT_DOCS_DIR || path.join(process.cwd(), 'uploads', 'chat-documents');
if (!fs.existsSync(chatDocsDir)) {
  fs.mkdirSync(chatDocsDir, { recursive: true });
  console.log(`📁 Dossier créé: ${chatDocsDir}`);
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
  console.log('🔍 Vérification du fichier:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  // Accepter les PDFs (mimetype peut varier selon le navigateur)
  const isPdf = file.mimetype === 'application/pdf' || 
                file.mimetype === 'application/x-pdf' ||
                file.originalname.toLowerCase().endsWith('.pdf');
  
  if (isPdf) {
    console.log('✅ Fichier PDF accepté');
    cb(null, true);
  } else {
    console.error('❌ Type de fichier non autorisé:', file.mimetype);
    cb(new Error(`Seuls les fichiers PDF sont autorisés. Type reçu: ${file.mimetype || 'inconnu'}`));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max pour les PDFs (augmenté pour correspondre à Nginx)
  },
  fileFilter: fileFilter
});

// Upload d'un PDF pour un livret
router.post('/:livretId', authenticateToken, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('📥 Route upload appelée, avant multer');
  next();
}, upload.single('pdf'), (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Gérer les erreurs de multer AVANT le handler principal
  if (err) {
    console.error('❌ Erreur multer:', err);
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Le fichier est trop volumineux. Taille maximale : 10MB' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Champ de fichier incorrect. Le champ doit s\'appeler "pdf"' });
      }
      return res.status(400).json({ message: `Erreur upload: ${err.message}` });
    }
    // Erreur du fileFilter
    return res.status(400).json({ message: err.message || 'Erreur lors de l\'upload du fichier' });
  }
  next();
}, async (req: any, res: express.Response) => {
  try {
    const { livretId } = req.params;

    console.log('📥 Requête reçue:', {
      livretId,
      hasFile: !!req.file,
      body: req.body,
      headers: req.headers['content-type'],
      files: req.files,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    if (!req.file) {
      console.error('❌ Aucun fichier reçu dans req.file');
      console.error('Détails de la requête:', {
        contentType: req.headers['content-type'],
        bodyKeys: Object.keys(req.body),
        files: req.files
      });
      return res.status(400).json({ message: 'Aucun fichier PDF fourni. Assurez-vous que le champ du formulaire s\'appelle "pdf"' });
    }

    console.log('📤 Upload PDF:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

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
    // Utiliser un chemin relatif pour le stockage en base (accessible via API)
    const relativePath = path.join('uploads', 'chat-documents', req.file.filename).replace(/\\/g, '/');
    const chatDocument = await prisma.chatDocument.create({
      data: {
        livretId: livretId,
        fileName: req.file.originalname,
        filePath: relativePath,
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
    // Le filePath peut être relatif ou absolu, gérer les deux cas
    let fullPath: string;
    if (path.isAbsolute(document.filePath)) {
      fullPath = document.filePath;
    } else {
      fullPath = path.join(process.cwd(), document.filePath);
    }
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Fichier supprimé: ${fullPath}`);
    } else {
      console.warn(`⚠️ Fichier non trouvé: ${fullPath}`);
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
