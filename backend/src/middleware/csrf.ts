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
 * Obtient l'ID de session depuis la requête (utilise l'IP + User-Agent comme identifiant)
 */
function getSessionId(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  // Pour les utilisateurs authentifiés, utiliser leur userId
  const userId = (req as any).userId;
  
  if (userId) {
    return `user:${userId}`;
  }
  
  // Pour les utilisateurs non authentifiés, utiliser IP + User-Agent
  return `anon:${ip}:${crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16)}`;
}

/**
 * Middleware pour générer et retourner un token CSRF
 */
export function getCsrfToken(req: Request, res: Response, next: NextFunction) {
  const sessionId = getSessionId(req);
  const token = generateCsrfToken(sessionId);
  
  res.json({ csrfToken: token });
}

/**
 * Middleware pour valider le token CSRF sur les requêtes modifiantes
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Ignorer les requêtes GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const sessionId = getSessionId(req);
  const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
  
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
  
  if (!verifyCsrfToken(sessionId, token as string)) {
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
