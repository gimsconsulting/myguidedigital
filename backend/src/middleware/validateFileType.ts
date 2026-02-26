import fs from 'fs';
import path from 'path';
import express from 'express';

/**
 * Magic bytes des formats d'image autorisés
 * Chaque entrée contient les premiers octets attendus du fichier
 */
const IMAGE_SIGNATURES: { type: string; magic: number[]; offset?: number }[] = [
  // JPEG : FF D8 FF
  { type: 'image/jpeg', magic: [0xFF, 0xD8, 0xFF] },
  // PNG : 89 50 4E 47 0D 0A 1A 0A
  { type: 'image/png', magic: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },
  // GIF87a : 47 49 46 38 37 61
  { type: 'image/gif', magic: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] },
  // GIF89a : 47 49 46 38 39 61
  { type: 'image/gif', magic: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] },
  // WebP : 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  { type: 'image/webp', magic: [0x52, 0x49, 0x46, 0x46] },
  // BMP : 42 4D
  { type: 'image/bmp', magic: [0x42, 0x4D] },
  // SVG : commence par <?xml ou <svg (texte)
  // Note: SVG est exclu pour des raisons de sécurité (peut contenir du JS)
];

/**
 * Vérifie que le contenu binaire d'un fichier correspond bien à un format d'image autorisé.
 * Supprime le fichier si le contenu ne correspond pas au type déclaré.
 */
export function validateImageMagicBytes(req: express.Request, res: express.Response, next: express.NextFunction) {
  const file = (req as any).file;

  // Si pas de fichier, passer au middleware suivant (une autre vérification s'en chargera)
  if (!file) {
    return next();
  }

  const filePath = file.path;

  try {
    // Lire les 12 premiers octets du fichier
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    // Vérifier si les magic bytes correspondent à un format d'image autorisé
    const isValidImage = IMAGE_SIGNATURES.some(sig => {
      const offset = sig.offset || 0;
      return sig.magic.every((byte, index) => buffer[offset + index] === byte);
    });

    if (!isValidImage) {
      // Supprimer le fichier frauduleux
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error('❌ Erreur suppression fichier invalide:', unlinkErr);
      }

      console.warn(`🚨 [SECURITY] Fichier rejeté — magic bytes invalides. MIME déclaré: ${file.mimetype}, Fichier: ${file.originalname}`);

      return res.status(400).json({
        message: 'Le fichier uploadé n\'est pas une image valide. Formats acceptés : JPEG, PNG, GIF, WebP.',
      });
    }

    // Vérification supplémentaire : l'extension doit correspondre
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

    if (!allowedExtensions.includes(ext)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error('❌ Erreur suppression fichier invalide:', unlinkErr);
      }

      console.warn(`🚨 [SECURITY] Fichier rejeté — extension non autorisée: ${ext}`);

      return res.status(400).json({
        message: `Extension de fichier non autorisée (${ext}). Formats acceptés : JPEG, PNG, GIF, WebP.`,
      });
    }

    next();
  } catch (err) {
    console.error('❌ Erreur validation magic bytes:', err);

    // En cas d'erreur, supprimer le fichier par sécurité
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      // Ignorer
    }

    return res.status(500).json({
      message: 'Erreur lors de la validation du fichier.',
    });
  }
}
