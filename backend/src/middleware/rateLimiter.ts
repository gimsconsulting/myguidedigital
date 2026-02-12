import rateLimit from 'express-rate-limit';

// En développement, désactiver le rate limiting ou le rendre très permissif
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Rate limiter pour les routes de login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 10, // Limite très élevée en dev, 10 en production
  message: {
    error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    retryAfter: 15 * 60, // secondes
  },
  standardHeaders: true, // Retourne les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies
  skipFailedRequests: false, // Compter les requêtes échouées
  handler: (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.warn(`⚠️ [RATE LIMIT] Trop de tentatives de login depuis IP: ${ip}`);
    res.status(429).json({
      error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      retryAfter: 15 * 60,
    });
  },
});

// Rate limiter pour les routes d'inscription
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // Limite à 3 inscriptions par IP par heure
  message: {
    error: 'Trop de tentatives d\'inscription. Veuillez réessayer dans une heure.',
    retryAfter: 60 * 60, // secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  handler: (req, res) => {
    const ip = req.ip || req.socket.remoteAddress;
    console.warn(`⚠️ [RATE LIMIT] Trop de tentatives d'inscription depuis IP: ${ip}`);
    res.status(429).json({
      error: 'Trop de tentatives d\'inscription. Veuillez réessayer dans une heure.',
      retryAfter: 60 * 60,
    });
  },
});

// Rate limiter pour le chatbot IA (éviter l'abus de l'API OpenAI)
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDevelopment ? 50 : 15, // 15 messages par minute en production
  message: {
    error: 'Trop de messages. Veuillez patienter quelques instants.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.warn(`⚠️ [RATE LIMIT] Trop de messages chat depuis IP: ${ip}`);
    res.status(429).json({
      error: 'Trop de messages. Veuillez patienter quelques instants avant de renvoyer un message.',
      message: 'Trop de messages. Veuillez patienter quelques instants.',
      retryAfter: 60,
      fallback: true,
    });
  },
});

// Rate limiter général pour les routes d'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite à 20 requêtes par IP par fenêtre de 15 minutes
  message: {
    error: 'Trop de requêtes. Veuillez réessayer plus tard.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
