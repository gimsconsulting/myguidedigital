import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { globalLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth';
import livretRoutes from './routes/livrets';
import moduleRoutes from './routes/modules';
import statisticsRoutes from './routes/statistics';
import subscriptionRoutes from './routes/subscriptions';
import invoiceRoutes from './routes/invoices';
import uploadRoutes from './routes/upload';
import translateRoutes from './routes/translate';
import adminRoutes from './routes/admin';
import chatDocumentsRoutes from './routes/chat-documents';
import chatRoutes from './routes/chat';
import appChatRoutes from './routes/app-chat';
import affiliateRoutes from './routes/affiliates';
import contactRoutes from './routes/contact';
import blogRoutes from './routes/blog';
import demoBookingRoutes from './routes/demo-bookings';

// Import cron pour les rappels de démo
import { checkAndSendReminders, cleanupPastDemos } from './services/demoReminder';

// Import CSRF middleware
import { getCsrfToken, validateCsrfToken } from './middleware/csrf';

// Charger le fichier .env : essayer racine du projet puis backend/.env
const fs = require('fs');
const candidates = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend', '.env'),
  path.join(__dirname, '..', '.env'), // depuis backend/dist/index.js -> backend/.env
];
let envPath = candidates.find((p) => fs.existsSync(p));
if (!envPath) {
  console.error('❌ Aucun fichier .env trouvé. Chemins testés:', candidates);
} else {
  console.log('📁 Fichier .env utilisé:', envPath);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Erreur lors du chargement du .env:', result.error);
  } else {
    console.log('✅ Fichier .env chargé');
  }
}

// Vérifier que la clé API est chargée (seulement en développement)
if (process.env.NODE_ENV === 'development') {
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    console.log('✅ GOOGLE_TRANSLATE_API_KEY chargée');
  } else {
    console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée - Les traductions seront désactivées');
  }
}

const app = express();
const prisma = new PrismaClient();

// Configuration du proxy trust pour express-rate-limit derrière Nginx
// IMPORTANT: Doit être configuré AVANT les middlewares de rate limiting
// Utiliser 1 (nombre de proxies) au lieu de true pour satisfaire express-rate-limit v7+
app.set('trust proxy', 1);

// Configuration Helmet pour les headers de sécurité HTTP
// IMPORTANT: Helmet doit être configuré AVANT les autres middlewares
app.use(helmet({
  // Désactiver contentSecurityPolicy par défaut pour éviter les conflits avec CORS
  // On va le configurer manuellement si nécessaire
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-inline/eval pour compatibilité avec certains frameworks
      styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline pour les styles inline
      imgSrc: ["'self'", "data:", "https:", "http:"], // Autoriser les images depuis n'importe quelle source HTTPS/HTTP
      connectSrc: ["'self'", "https:", "http:"], // Autoriser les connexions API
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null, // Désactiver en dev pour permettre HTTP
    },
  },
  // Cross-Origin Embedder Policy - désactivé pour compatibilité
  crossOriginEmbedderPolicy: false,
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Désactiver DNS Prefetch Control (peut améliorer les performances)
  dnsPrefetchControl: true,
  // Frameguard - protection contre le clickjacking
  frameguard: { action: 'deny' },
  // Hide Powered-By header
  hidePoweredBy: true,
  // HSTS - HTTP Strict Transport Security (seulement en production HTTPS)
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true
  } : false,
  // IE No Open
  ieNoOpen: true,
  // No Sniff - empêche le MIME sniffing
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,
  // Permissions Policy (anciennement Feature Policy) - Désactivé car non supporté dans cette version de Helmet
  // permissionsPolicy: {
  //   features: {
  //     geolocation: ["'self'"],
  //     microphone: ["'none'"],
  //     camera: ["'none'"],
  //   },
  // },
  // Referrer Policy - Désactivé car syntaxe incompatible avec cette version de Helmet
  referrerPolicy: false,
  // XSS Protection (déprécié mais gardé pour compatibilité)
  xssFilter: true,
}));

// Cookie parser pour les cookies (nécessaire pour CSRF sessionId)
app.use(cookieParser());

// IMPORTANT: Le webhook Stripe DOIT recevoir le raw body AVANT express.json()
// Sinon la vérification de signature Stripe échouera
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Augmenter la limite de taille du body pour les uploads de fichiers (20MB)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Middleware CORS - Configuration permissive pour le développement
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configuration CORS très permissive pour le développement
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Log pour débogage
    console.log('🔍 CORS check - Origin:', origin || 'undefined', 'NODE_ENV:', process.env.NODE_ENV);
    
    // En développement, autoriser TOUTES les origines
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('✅ CORS: Autorisation de l\'origine (dev mode):', origin || 'sans origine');
      return callback(null, true);
    }
    
    // En production, vérifier les origines autorisées
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:3000',
      'http://192.168.0.126:3000',
      'http://127.0.0.1:3000',
      'https://jone-pretelephonic-trembly.ngrok-free.dev',
      'https://app.myguidedigital.com',
      'https://myguidedigital.com',
      'https://www.myguidedigital.com',
    ];
    
    // Patterns pour ngrok, localtunnel et myguidedigital
    const ngrokPattern = /^https:\/\/.*\.ngrok-free\.dev$/;
    const ngrokIoPattern = /^https:\/\/.*\.ngrok\.io$/;
    const locaPattern = /^https:\/\/.*\.loca\.lt$/;
    const myguidedigitalPattern = /^https:\/\/(.*\.)?myguidedigital\.com$/;
    
    // Si pas d'origine (requêtes same-origin ou depuis le serveur)
    if (!origin) {
      console.log('✅ CORS: Pas d\'origine (same-origin), autorisé');
      return callback(null, true);
    }
    
    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origine autorisée (liste):', origin);
      return callback(null, true);
    }
    
    // Vérifier les patterns
    if (ngrokPattern.test(origin) || ngrokIoPattern.test(origin) || locaPattern.test(origin) || myguidedigitalPattern.test(origin)) {
      console.log('✅ CORS: Origine autorisée (pattern):', origin);
      return callback(null, true);
    }
    
    // Si aucune correspondance, refuser
    console.log('❌ CORS: Origine NON autorisée:', origin);
    console.log('📋 Origines autorisées:', allowedOrigins);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder', 'X-Requested-With', 'Accept', 'x-csrf-token', 'x-csrf-session-id'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // Cache preflight pour 24h
};

app.use(cors(corsOptions));

// Rate limiter global — protection anti-DDoS de base
app.use('/api/', globalLimiter);

// Gérer explicitement les requêtes OPTIONS (preflight) AVANT les routes
app.options('*', (req: express.Request, res: express.Response) => {
  console.log('🔵 Requête OPTIONS (preflight) reçue:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, bypass-tunnel-reminder, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// Logger toutes les requêtes pour debug
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});
// Note: express.json() et express.raw() pour le webhook sont configurés plus haut

// Servir les fichiers statiques (uploads)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(uploadDir));
// Aussi servir via /api/uploads pour que le proxy nginx puisse y accéder en production
app.use('/api/uploads', express.static(uploadDir));
// Servir les images du blog
app.use('/uploads/blog', express.static(path.join(uploadDir, 'blog')));
app.use('/api/uploads/blog', express.static(path.join(uploadDir, 'blog')));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route pour obtenir le token CSRF (accessible sans authentification)
app.get('/api/csrf-token', getCsrfToken);

// Routes
// Note: Les routes authentifiées avec JWT n'ont pas besoin de CSRF car les tokens JWT ne sont pas dans des cookies
// Mais on applique CSRF aux routes publiques critiques (login, register, password reset)
app.use('/api/auth', authRoutes);
app.use('/api/livrets', livretRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat-documents', chatDocumentsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/app-chat', appChatRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/demo-bookings', demoBookingRoutes);

// Error handling middleware - Gestion améliorée des erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Erreur de parsing JSON
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('❌ [ERROR] Erreur de parsing JSON:', {
      url: req.url,
      method: req.method,
      ip: req.ip || req.socket.remoteAddress,
      error: err.message
    });
    return res.status(400).json({
      error: 'JSON malformé',
      message: 'Le corps de la requête contient du JSON invalide'
    });
  }

  // Erreur Prisma
  if (err.code && err.code.startsWith('P')) {
    console.error('❌ [PRISMA ERROR]', {
      code: err.code,
      meta: err.meta,
      message: err.message,
      url: req.url,
      method: req.method
    });
    
    // Erreur P2000 : valeur trop longue pour la colonne
    if (err.code === 'P2000') {
      return res.status(400).json({
        error: 'Données trop longues',
        message: `Le champ ${err.meta?.column_name || 'données'} est trop long. Veuillez réduire la taille.`
      });
    }
    
    // Erreur P2002 : contrainte unique violée
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflit',
        message: 'Cette valeur existe déjà'
      });
    }
    
    // Erreur P2025 : enregistrement non trouvé
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Non trouvé',
        message: 'L\'enregistrement demandé n\'existe pas'
      });
    }
  }

  // Erreur générique
  console.error('❌ [ERROR]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress
  });

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Écouter sur toutes les interfaces réseau

// Créer le serveur sans l'écouter immédiatement pour permettre le rechargement
const server = app.listen(PORT, HOST as string, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Accessible via: http://localhost:${PORT} or http://192.168.0.126:${PORT}`);
  console.log(`🔄 Hot reload enabled - watching for changes...`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} est déjà utilisé.`);
    console.error(`💡 Solution: Trouvez et terminez le processus avec:`);
    console.error(`   Windows: netstat -ano | findstr :${PORT}`);
    console.error(`   Puis: taskkill /PID [NUMERO] /F`);
    process.exit(1);
  } else {
    console.error('❌ Erreur serveur:', err);
    process.exit(1);
  }
});

// Permettre la fermeture propre du serveur lors du rechargement
if (process.env.NODE_ENV === 'development') {
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
  
  // Gérer aussi SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
}

// ═══════════════════════════════════════════════
// CRON JOBS - Rappels de démo automatiques
// ═══════════════════════════════════════════════
// Vérifier les rappels toutes les minutes
const reminderInterval = setInterval(() => {
  checkAndSendReminders();
}, 60 * 1000); // Toutes les 60 secondes

// Nettoyer les démos passées toutes les heures
const cleanupInterval = setInterval(() => {
  cleanupPastDemos();
}, 60 * 60 * 1000); // Toutes les heures

console.log('⏰ [CRON] Rappels démo activés (vérification toutes les minutes)');

// Graceful shutdown
process.on('beforeExit', async () => {
  clearInterval(reminderInterval);
  clearInterval(cleanupInterval);
  await prisma.$disconnect();
});
