import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

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

// Vérifier que la clé API est chargée (pour debug)
console.log('🔍 Vérification des variables d\'environnement...');
if (process.env.GOOGLE_TRANSLATE_API_KEY) {
  console.log('✅ GOOGLE_TRANSLATE_API_KEY chargée:', process.env.GOOGLE_TRANSLATE_API_KEY.substring(0, 15) + '...');
} else {
  console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée dans les variables d\'environnement');
  console.log('📁 Répertoire courant:', process.cwd());
  console.log('📋 Variables disponibles:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('API') || k.includes('TRANSLATE')));
  
  // Essayer de lire directement le fichier
  try {
    const envContent = envPath ? fs.readFileSync(envPath, 'utf8') : '';
    const hasKey = envContent.includes('GOOGLE_TRANSLATE_API_KEY');
    console.log('📄 Contenu du .env contient GOOGLE_TRANSLATE_API_KEY?', hasKey);
    if (hasKey) {
      const keyLine = envContent.split('\n').find((line: string) => line.includes('GOOGLE_TRANSLATE_API_KEY'));
      console.log('📝 Ligne trouvée:', keyLine?.substring(0, 50));
    }
  } catch (err: any) {
    console.error('❌ Erreur lecture fichier .env:', err.message);
  }
}

const app = express();
const prisma = new PrismaClient();

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
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // Cache preflight pour 24h
};

app.use(cors(corsOptions));

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
// Middleware pour parser JSON (sauf pour le webhook Stripe qui utilise raw body)
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
