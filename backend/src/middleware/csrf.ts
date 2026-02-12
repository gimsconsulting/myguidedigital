import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Store des tokens CSRF en mémoire (en production, utiliser Redis ou une session)
const csrfTokens = new Map<string, { token: string; expiresAt: Date }>();

// Durée de vie d'un token CSRF (1 heure)
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000;

// Nettoyer les tokens expirés toutes les heures
setInterval(() => {
  const now = new Date();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expiresAt < now) {
      csrfTokens.delete(sessionId);
    }
  }
}, CSRF_TOKEN_EXPIRY);

/**
 * Génère un token CSRF pour une session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + CSRF_TOKEN_EXPIRY);

  csrfTokens.set(sessionId, { token, expiresAt });

  return token;
}

/**
 * Vérifie si un token CSRF est valide pour une session
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) {
    return false;
  }
  
  if (stored.expiresAt < new Date()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

/**
 * Obtient l'ID de session depuis la requête
 * Approche simplifiée : utilise le header x-csrf-session-id si disponible, sinon génère un nouveau sessionId
 * @param req La requête Express
 * @param res La réponse Express (optionnelle, nécessaire pour créer un cookie de secours)
 * @param allowCreate Si true, crée un nouveau sessionId si aucun n'est fourni. Si false, retourne null si aucun n'est fourni.
 */
function getSessionId(req: Request, res?: Response, allowCreate: boolean = true): string | null {
  // Pour les utilisateurs authentifiés, utiliser leur userId
  const userId = (req as any).userId;
  
  if (userId) {
    return `user:${userId}`;
  }
  
  // APPROCHE SIMPLIFIÉE : Utiliser UNIQUEMENT le header x-csrf-session-id
  // Express normalise les headers en minuscules, donc 'x-csrf-session-id' devrait fonctionner
  // Ne plus dépendre du cookie pour éviter les problèmes de synchronisation
  let sessionId: string | null = null;
  
  // Essayer toutes les variantes de casse possibles (Express devrait normaliser, mais au cas où)
  const headerKeys = ['x-csrf-session-id', 'X-CSRF-Session-Id', 'X-Csrf-Session-Id'];
  for (const key of headerKeys) {
    if (req.headers[key]) {
      sessionId = req.headers[key] as string;
      break;
    }
  }
  
  // Si aucun header n'est trouvé, essayer de chercher dans tous les headers (debug)
  if (!sessionId) {
    const allHeaders = Object.keys(req.headers);
    const csrfHeaders = allHeaders.filter(h => h.toLowerCase().includes('csrf') && h.toLowerCase().includes('session'));
    if (csrfHeaders.length > 0) {
      // Log pour debug : on a trouvé des headers CSRF mais pas avec le nom attendu
      console.warn('⚠️ [CSRF] Headers CSRF trouvés mais nom incorrect:', csrfHeaders);
    }
  }
  
  // Fallback : utiliser le cookie SEULEMENT si aucun header n'est trouvé ET si allowCreate est true
  // (pour la génération initiale du token)
  if (!sessionId && allowCreate) {
    sessionId = req.cookies?.csrf_session_id || null;
  }
  
  if (!sessionId) {
    if (!allowCreate) {
      // Lors de la validation, ne pas créer un nouveau sessionId si aucun n'est fourni
      return null;
    }
    
    // Générer un nouveau sessionId si aucun n'est fourni (seulement lors de la génération du token)
    sessionId = `anon:${crypto.randomBytes(16).toString('hex')}`;
    
    // Créer aussi un cookie de secours (au cas où)
    if (res) {
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('csrf_session_id', sessionId, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: CSRF_TOKEN_EXPIRY,
        path: '/',
      });
    }
  }
  
  return sessionId;
}

/**
 * Middleware pour générer et retourner un token CSRF
 */
export function getCsrfToken(req: Request, res: Response, next: NextFunction) {
  const sessionId = getSessionId(req, res, true); // allowCreate = true pour générer un nouveau sessionId si nécessaire
  if (!sessionId) {
    return res.status(500).json({ message: 'Erreur lors de la génération du sessionId' });
  }
  const token = generateCsrfToken(sessionId);
  
  // Retourner le token ET le sessionId pour que le frontend puisse l'envoyer dans un header
  // Cela garantit la cohérence même si le cookie ne fonctionne pas
  res.json({ 
    csrfToken: token,
    sessionId: sessionId // Inclure le sessionId dans la réponse
  });
}

/**
 * Middleware pour valider le token CSRF sur les requêtes modifiantes
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Ignorer les requêtes GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Obtenir le sessionId depuis le header (priorité) ou le cookie (secours)
  // allowCreate = false : ne pas créer de nouveau sessionId lors de la validation
  const sessionId = getSessionId(req, res, false);
  const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
  
  // Si le sessionId n'existe pas, c'est une erreur
  if (!sessionId) {
    console.warn('🚫 [CSRF] SessionId manquant lors de la validation:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      hasCookies: !!req.cookies,
      allCookies: Object.keys(req.cookies || {}),
      timestamp: new Date().toISOString(),
    });
    return res.status(403).json({ 
      message: 'Session CSRF invalide. Veuillez rafraîchir la page.',
      code: 'CSRF_SESSION_MISSING'
    });
  }
  
  if (!token) {
    console.warn('🚫 [CSRF] Token CSRF manquant:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
    return res.status(403).json({ 
      message: 'Token CSRF manquant',
      code: 'CSRF_TOKEN_MISSING'
    });
  }
  
  const isValid = verifyCsrfToken(sessionId, token as string);
  
  if (!isValid) {
    console.warn('🚫 [CSRF] Token CSRF invalide:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      sessionId,
      timestamp: new Date().toISOString(),
    });
    return res.status(403).json({ 
      message: 'Token CSRF invalide ou expiré',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  next();
}
