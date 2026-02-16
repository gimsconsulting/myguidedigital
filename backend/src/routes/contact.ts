import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { sendContactEmail } from '../services/email';

const router = express.Router();

// Rate limiter spécifique au formulaire de contact : max 5 messages par heure par IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: {
    error: 'Trop de messages envoyés. Veuillez réessayer dans une heure.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/contact - Envoyer un message de contact
router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail(),
    body('subject').trim().notEmpty().withMessage('Le sujet est requis').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Le message est requis').isLength({ min: 10, max: 5000 }).withMessage('Le message doit contenir entre 10 et 5000 caractères'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;

      // Envoyer l'email
      const sent = await sendContactEmail({ name, email, subject, message });

      if (sent) {
        console.log(`✅ [CONTACT] Message envoyé par ${name} (${email}) - Sujet: ${subject}`);
        return res.status(200).json({
          success: true,
          message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        });
      } else {
        console.error(`❌ [CONTACT] Échec de l'envoi du message de ${name} (${email})`);
        return res.status(500).json({
          success: false,
          message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement par email.',
        });
      }
    } catch (error: any) {
      console.error('❌ [CONTACT] Erreur:', error);
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      });
    }
  }
);

export default router;
