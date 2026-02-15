import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, CustomValidator } from 'express-validator';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter';
import { validateCsrfToken } from '../middleware/csrf';
import { sendWelcomeEmail, sendTrialExpiredEmail } from '../services/email';

const router = express.Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validation personnalisée pour la complexité du mot de passe
const passwordComplexity: CustomValidator = (value: string) => {
  if (!value || typeof value !== 'string') {
    throw new Error('Le mot de passe est requis');
  }

  // Minimum 8 caractères
  if (value.length < 8) {
    throw new Error('Le mot de passe doit contenir au moins 8 caractères');
  }

  // Au moins une majuscule
  if (!/[A-Z]/.test(value)) {
    throw new Error('Le mot de passe doit contenir au moins une majuscule');
  }

  // Au moins une minuscule
  if (!/[a-z]/.test(value)) {
    throw new Error('Le mot de passe doit contenir au moins une minuscule');
  }

  // Au moins un chiffre
  if (!/[0-9]/.test(value)) {
    throw new Error('Le mot de passe doit contenir au moins un chiffre');
  }

  return true;
};

// Interface pour stocker les tentatives de connexion échouées
interface FailedLoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil: Date | null;
}

// Store en mémoire pour les tentatives échouées (en production, utiliser Redis)
const failedLoginAttempts = new Map<string, FailedLoginAttempt>();

// Nettoyer les tentatives expirées toutes les heures
setInterval(() => {
  const now = new Date();
  for (const [email, attempt] of failedLoginAttempts.entries()) {
    // Supprimer les tentatives de plus de 1 heure
    if (attempt.lastAttempt.getTime() < now.getTime() - 60 * 60 * 1000) {
      failedLoginAttempts.delete(email);
    }
    // Déverrouiller les comptes après 30 minutes
    if (attempt.lockedUntil && attempt.lockedUntil < now) {
      failedLoginAttempts.delete(email);
    }
  }
}, 60 * 60 * 1000);

// Register avec rate limiting et CSRF
router.post('/register', registerLimiter, validateCsrfToken, [
  body('email').isEmail().normalizeEmail(),
  body('password').custom(passwordComplexity),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('referralCode').optional().trim(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({ 
        message: firstError.msg || 'Données invalides',
        errors: errors.array() 
      });
    }

    const { email, password, firstName, lastName, referralCode } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      }
    });

    // Create trial subscription
    const startDate = new Date();
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'TRIAL',
        status: 'ACTIVE',
        startDate: startDate,
        trialDaysLeft: 14, // 14 jours d'essai
      }
    });

    // Enregistrer le lien d'affiliation si un code est fourni
    if (referralCode) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { affiliateCode: referralCode }
        });
        if (affiliate && affiliate.status === 'APPROVED') {
          const now = new Date();
          await prisma.affiliateReferral.create({
            data: {
              affiliateId: affiliate.id,
              referredUserId: user.id,
              saleAmount: 0, // Sera mis à jour lors de la souscription
              commissionAmount: 0,
              status: 'PENDING',
              periodMonth: now.getMonth() + 1,
              periodYear: now.getFullYear(),
            }
          });
          console.log(`✅ [AFFILIATE] Referral enregistré: ${referralCode} -> ${user.email}`);
        }
      } catch (err) {
        console.error('Erreur lors de l\'enregistrement du referral:', err);
        // Ne pas bloquer l'inscription si l'affiliation échoue
      }
    }

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined!');
      return res.status(500).json({ message: 'Erreur de configuration serveur' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Envoyer l'email de bienvenue (en arrière-plan, ne bloque pas l'inscription)
    sendWelcomeEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }).catch((error) => {
      // L'erreur est déjà loggée dans sendWelcomeEmail
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      message: error.message || 'Erreur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login avec rate limiting et verrouillage de compte (pas de CSRF car JWT)
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Vérifier si le compte est verrouillé
    const failedAttempt = failedLoginAttempts.get(email);
    if (failedAttempt && failedAttempt.lockedUntil && failedAttempt.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((failedAttempt.lockedUntil.getTime() - Date.now()) / 60000);
      console.warn(`🔒 [SECURITY] Tentative de connexion sur compte verrouillé: ${email} depuis IP: ${ip}`);
      return res.status(423).json({ 
        message: `Compte temporairement verrouillé. Réessayez dans ${minutesLeft} minute(s).`,
        lockedUntil: failedAttempt.lockedUntil
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      // Logger la tentative suspecte
      console.warn(`⚠️ [SECURITY] Tentative de connexion avec email inexistant: ${email} depuis IP: ${ip}`);
      // Attendre un peu pour éviter les timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Incrémenter le compteur de tentatives échouées
      const currentAttempt = failedLoginAttempts.get(email) || {
        email,
        attempts: 0,
        lastAttempt: new Date(),
        lockedUntil: null
      };

      currentAttempt.attempts += 1;
      currentAttempt.lastAttempt = new Date();

      // Verrouiller le compte après 5 tentatives échouées pendant 30 minutes
      if (currentAttempt.attempts >= 5) {
        currentAttempt.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        console.error(`🔒 [SECURITY] Compte verrouillé après 5 tentatives échouées: ${email} depuis IP: ${ip}`);
      }

      failedLoginAttempts.set(email, currentAttempt);

      // Logger la tentative échouée
      console.warn(`⚠️ [SECURITY] Tentative de connexion échouée (${currentAttempt.attempts}/5): ${email} depuis IP: ${ip}`);

      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect',
        attemptsRemaining: Math.max(0, 5 - currentAttempt.attempts),
        locked: currentAttempt.lockedUntil !== null
      });
    }

    // Connexion réussie - réinitialiser les tentatives échouées
    if (failedLoginAttempts.has(email)) {
      failedLoginAttempts.delete(email);
      console.log(`✅ [SECURITY] Connexion réussie après tentatives échouées: ${email} depuis IP: ${ip}`);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        profilePhoto: user.profilePhoto,
        companyName: user.companyName,
        vatNumber: user.vatNumber,
        address: user.address,
        country: user.country,
        accommodationType: user.accommodationType ? JSON.parse(user.accommodationType) : [],
        subscription: user.subscriptions[0] || null,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Google OAuth - Connexion / Inscription via Google
router.post('/google', async (req: express.Request, res: express.Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Token Google manquant' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID is not defined!');
      return res.status(500).json({ message: 'Connexion Google non configurée' });
    }

    // Vérifier le token Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Token Google invalide' });
    }

    const { email, given_name, family_name, picture, sub: googleId } = payload;

    // Chercher un utilisateur existant par email ou googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId },
        ]
      },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (user) {
      // Utilisateur existant → mettre à jour le googleId si pas encore lié
      if (!user.googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }
    } else {
      // Nouvel utilisateur → inscription automatique
      // Générer un mot de passe aléatoire (l'utilisateur se connecte via Google)
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email: email!,
          password: hashedPassword,
          firstName: given_name || '',
          lastName: family_name || '',
          googleId,
          profilePhoto: picture || '',
        },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // Créer l'abonnement d'essai
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'TRIAL',
          status: 'ACTIVE',
          startDate: new Date(),
          trialDaysLeft: 14,
        }
      });

      // Recharger avec la subscription
      user = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }) as any;

      // Envoyer l'email de bienvenue
      sendWelcomeEmail({
        firstName: user!.firstName,
        lastName: user!.lastName,
        email: user!.email,
      }).catch((error) => {
        console.error('Erreur email bienvenue (Google):', error);
      });
    }

    // Générer le JWT
    const token = jwt.sign(
      { userId: user!.id, email: user!.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        phone: user!.phone,
        userType: user!.userType,
        role: user!.role,
        profilePhoto: user!.profilePhoto,
        companyName: user!.companyName,
        vatNumber: user!.vatNumber,
        address: user!.address,
        country: user!.country,
        accommodationType: user!.accommodationType ? JSON.parse(user!.accommodationType) : [],
        subscription: (user as any).subscriptions?.[0] || null,
      }
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion avec Google' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'EXPIRED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Calculer les jours restants de la période d'essai si c'est un abonnement TRIAL
    let subscription = user.subscriptions[0] || null;
    if (subscription && subscription.plan === 'TRIAL' && subscription.startDate) {
      const startDate = new Date(subscription.startDate);
      const now = new Date();
      
      // Calculer la différence en jours (arrondie vers le bas)
      const diffTime = now.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Les jours restants = 14 jours - jours écoulés
      const daysRemaining = Math.max(0, 14 - diffDays);
      
      // Mettre à jour trialDaysLeft dans la base de données si nécessaire
      if (subscription.trialDaysLeft !== daysRemaining) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { trialDaysLeft: daysRemaining }
        });
        subscription.trialDaysLeft = daysRemaining;
      }
      
      // Si la période d'essai est expirée, mettre le statut à EXPIRED
      if (daysRemaining === 0 && subscription.status === 'ACTIVE') {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' }
        });
        subscription.status = 'EXPIRED';

        // Envoyer un email de notification d'expiration du trial
        sendTrialExpiredEmail({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }).catch((error) => {
          console.error('Erreur envoi email expiration trial:', error);
        });
      }
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        profilePhoto: user.profilePhoto,
        companyName: user.companyName,
        vatNumber: user.vatNumber,
        address: user.address,
        country: user.country,
        accommodationType: user.accommodationType ? JSON.parse(user.accommodationType) : [],
        subscription: subscription,
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

// Update profile
router.put('/profile', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim(),
  body('userType').optional().isIn(['PARTICULIER', 'SOCIETE']),
  body('profilePhoto').optional().trim(),
  body('companyName').optional().trim(),
  body('vatNumber').optional().trim(),
  body('address').optional().trim(),
  body('country').optional().trim(),
  body('accommodationType').optional(),
], async (req: any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, phone, userType, profilePhoto, companyName, vatNumber, address, country, accommodationType } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(email && { email }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(userType && { userType }),
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(companyName !== undefined && { companyName }),
        ...(vatNumber !== undefined && { vatNumber }),
        ...(address !== undefined && { address }),
        ...(country !== undefined && { country }),
        ...(accommodationType !== undefined && { accommodationType: JSON.stringify(accommodationType) }),
      }
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        profilePhoto: user.profilePhoto,
        companyName: user.companyName,
        vatNumber: user.vatNumber,
        address: user.address,
        country: user.country,
        accommodationType: user.accommodationType ? JSON.parse(user.accommodationType) : [],
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
});

// Update password (authenticated user) - Pas de CSRF car JWT protège déjà
router.put('/password', authenticateToken, [
  body('password').custom(passwordComplexity),
], async (req: any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error: any) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe' });
  }
});

// Forgot password - Génère un token de réinitialisation (CSRF pour route publique)
router.post('/forgot-password', validateCsrfToken, [
  body('email').isEmail().normalizeEmail(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Pour des raisons de sécurité, on retourne toujours le même message
    // même si l'email n'existe pas (pour éviter l'énumération d'emails)
    if (!user) {
      // Attendre un peu pour simuler le temps de traitement (protection timing attack)
      await new Promise(resolve => setTimeout(resolve, 100));
      return res.json({ 
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' 
      });
    }

    // Vérifier le nombre de tentatives récentes (limite: 3 par heure)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo }
      }
    });

    if (recentTokens >= 3) {
      return res.status(429).json({ 
        message: 'Trop de tentatives. Veuillez réessayer dans une heure.' 
      });
    }

    // Invalider tous les tokens précédents non utilisés pour cet utilisateur
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false
      },
      data: {
        used: true
      }
    });

    // Générer un token sécurisé (32 bytes aléatoires en hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Créer le token avec expiration de 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: expiresAt
      }
    });

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Pour l'instant, on log le token en développement (à retirer en production)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [DEV] Token de réinitialisation généré pour:', email);
      console.log('🔗 [DEV] Lien de réinitialisation:', resetUrl);
      console.log('⚠️  [DEV] En production, ce lien doit être envoyé par email uniquement!');
    }

    // En production, envoyer l'email ici
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({ 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // En développement seulement, retourner le token pour faciliter les tests
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken: resetToken,
        resetUrl: resetUrl 
      })
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation' });
  }
});

// Reset password - Réinitialise le mot de passe avec un token valide (CSRF pour route publique)
router.post('/reset-password', validateCsrfToken, [
  body('token').notEmpty().withMessage('Token de réinitialisation requis'),
  body('password').custom(passwordComplexity),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Trouver le token de réinitialisation
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    // Vérifier que le token existe
    if (!resetToken) {
      return res.status(400).json({ message: 'Token de réinitialisation invalide ou expiré' });
    }

    // Vérifier que le token n'a pas été utilisé
    if (resetToken.used) {
      return res.status(400).json({ message: 'Ce token a déjà été utilisé' });
    }

    // Vérifier que le token n'est pas expiré
    if (new Date() > resetToken.expiresAt) {
      // Marquer le token comme utilisé pour éviter les tentatives répétées
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      });
      return res.status(400).json({ message: 'Token de réinitialisation expiré' });
    }

    // Hash le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    // Invalider tous les autres tokens non utilisés pour cet utilisateur (sécurité supplémentaire)
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        used: false,
        id: { not: resetToken.id }
      },
      data: {
        used: true
      }
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// Nettoyer les tokens expirés (à appeler périodiquement via un cron job)
async function cleanupExpiredTokens() {
  try {
    const deleted = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true }
        ]
      }
    });
    if (deleted.count > 0) {
      console.log(`🧹 Nettoyage: ${deleted.count} token(s) de réinitialisation supprimé(s)`);
    }
  } catch (error: any) {
    console.error('Erreur lors du nettoyage des tokens:', error);
  }
}

// Nettoyer les tokens expirés toutes les heures
// Temporairement désactivé jusqu'à ce que la table password_reset_tokens soit créée
// setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Middleware d'authentification
function authenticateToken(req: any, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }
    req.userId = decoded.userId;
    next();
  });
}

export default router;
export { authenticateToken };
