import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from './auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Créer le dossier uploads s'il n'existe pas
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accepter seulement les images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: fileFilter
});

// Middleware pour logger les erreurs multer
const multerErrorHandler = (err: any, req: any, res: any, next: any) => {
  // #region agent log
  try {
    const logPath = path.join(process.cwd(), '..', '..', '.cursor', 'debug.log');
    const logEntry = JSON.stringify({
      location: 'upload.ts:46',
      message: 'Multer error',
      data: {
        error: err.message,
        code: err.code,
        contentType: req.headers['content-type'],
      },
      timestamp: Date.now(),
      runId: 'run1',
      hypothesisId: 'A'
    }) + '\n';
    fs.appendFileSync(logPath, logEntry);
  } catch (e) {}
  // #endregion
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux (max 5MB)' });
    }
  }
  next(err);
};

// Upload de photo de profil
router.post('/profile-photo', authenticateToken, upload.single('photo'), multerErrorHandler, async (req: any, res: any) => {
  // #region agent log
  try {
    const logPath = path.join(process.cwd(), '..', '..', '.cursor', 'debug.log');
    const logEntry = JSON.stringify({
      location: 'upload.ts:49',
      message: 'Upload route hit',
      data: {
        contentType: req.headers['content-type'],
        hasFile: !!req.file,
        bodyKeys: Object.keys(req.body || {}),
      },
      timestamp: Date.now(),
      runId: 'run1',
      hypothesisId: 'A'
    }) + '\n';
    fs.appendFileSync(logPath, logEntry);
  } catch (e) {}
  // #endregion
  try {
    if (!req.file) {
      // #region agent log
      try {
        const logPath = path.join(process.cwd(), '..', '..', '.cursor', 'debug.log');
        const logEntry = JSON.stringify({
          location: 'upload.ts:56',
          message: 'No file received',
          data: {
            contentType: req.headers['content-type'],
            bodyKeys: Object.keys(req.body || {}),
          },
          timestamp: Date.now(),
          runId: 'run1',
          hypothesisId: 'A'
        }) + '\n';
        fs.appendFileSync(logPath, logEntry);
      } catch (e) {}
      // #endregion
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Construire l'URL du fichier
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Mettre à jour la photo de profil de l'utilisateur
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { profilePhoto: fileUrl }
    });

    res.json({
      message: 'Photo de profil uploadée avec succès',
      profilePhoto: fileUrl,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de l\'upload' });
  }
});

export default router;
