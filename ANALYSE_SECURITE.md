# 🔒 Analyse de Sécurité - MyGuideDigital

**Date:** $(date)  
**Version:** 1.0  
**Statut:** ⚠️ CRITIQUE - Plusieurs failles de sécurité identifiées

---

## 📋 Résumé Exécutif

Cette analyse révèle **plusieurs failles de sécurité critiques** nécessitant une attention immédiate, notamment :
- ❌ **Absence de protection contre les attaques par force brute**
- ❌ **Réinitialisation de mot de passe non sécurisée**
- ❌ **Absence de headers de sécurité HTTP**
- ❌ **Validation de mot de passe trop faible**
- ❌ **Absence de rate limiting**
- ❌ **Tokens JWT stockés dans localStorage (vulnérable au XSS)**
- ⚠️ **Messages d'erreur révélant des informations**

---

## 🔴 CRITIQUE - Failles à Corriger Immédiatement

### 1. ❌ Réinitialisation de Mot de Passe Non Sécurisée

**Fichier:** `backend/src/routes/auth.ts` (lignes 296-332)

**Problème:**
```typescript
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req: express.Request, res: express.Response) => {
  // ❌ AUCUNE VÉRIFICATION DE TOKEN/RÉSUMÉ
  // ❌ N'IMPORTE QUI PEUT RÉINITIALISER LE MOT DE PASSE D'UN UTILISATEUR
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // ❌ Pas de vérification de token de réinitialisation
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
});
```

**Impact:** 🔴 **CRITIQUE** - N'importe qui peut réinitialiser le mot de passe de n'importe quel utilisateur.

**Solution:**
- Implémenter un système de token de réinitialisation avec expiration (15-30 min)
- Envoyer un email avec un lien sécurisé contenant le token
- Vérifier le token avant de permettre la réinitialisation
- Limiter le nombre de tentatives de réinitialisation par email/IP

---

### 2. ❌ Absence de Protection contre les Attaques par Force Brute

**Fichier:** `backend/src/routes/auth.ts` (lignes 94-154)

**Problème:**
- Aucun rate limiting sur `/api/auth/login`
- Aucun système de verrouillage de compte après X tentatives échouées
- Messages d'erreur identiques pour email inexistant/mot de passe incorrect (bon point, mais insuffisant)

**Impact:** 🔴 **CRITIQUE** - Un attaquant peut tenter des milliers de mots de passe par seconde.

**Solution:**
- Implémenter `express-rate-limit` avec des limites différentes pour login/register
- Ajouter un système de verrouillage temporaire après 5 tentatives échouées
- Logger les tentatives de connexion suspectes (IP, timestamp, email)

---

### 3. ❌ Absence de Headers de Sécurité HTTP

**Fichier:** `backend/src/index.ts`

**Problème:**
- Aucun header de sécurité configuré (Helmet.js)
- Pas de protection contre XSS, clickjacking, MIME sniffing, etc.

**Impact:** 🟠 **ÉLEVÉ** - Vulnérable aux attaques XSS, clickjacking, et autres.

**Solution:**
- Installer et configurer `helmet` pour ajouter les headers de sécurité
- Configurer CSP (Content Security Policy)
- Ajouter HSTS (HTTP Strict Transport Security) en production

---

### 4. ❌ Validation de Mot de Passe Trop Faible

**Fichier:** `backend/src/routes/auth.ts` (ligne 13)

**Problème:**
```typescript
body('password').isLength({ min: 6 })
```
- Seulement 6 caractères minimum
- Aucune exigence de complexité (majuscules, chiffres, caractères spéciaux)
- Aucune vérification contre les mots de passe courants

**Impact:** 🟠 **ÉLEVÉ** - Mots de passe faciles à deviner/cracker.

**Solution:**
- Augmenter la longueur minimale à 8-12 caractères
- Exiger au moins une majuscule, une minuscule, un chiffre, un caractère spécial
- Utiliser une bibliothèque comme `zxcvbn` pour vérifier la force du mot de passe
- Bloquer les mots de passe courants (top 10,000)

---

### 5. ❌ Tokens JWT Stockés dans localStorage

**Fichier:** `frontend/lib/store.ts` (lignes 32-33)

**Problème:**
```typescript
localStorage.setItem('token', token);
```
- localStorage est vulnérable au XSS
- Pas de protection contre le vol de token

**Impact:** 🟠 **ÉLEVÉ** - Si une faille XSS est exploitée, les tokens peuvent être volés.

**Solution:**
- Utiliser `httpOnly` cookies pour stocker les tokens (meilleure sécurité)
- OU utiliser `sessionStorage` au lieu de `localStorage` (moins persistant)
- Implémenter un système de refresh tokens avec rotation
- Ajouter une protection CSRF si on utilise des cookies

---

### 6. ❌ Absence de Rate Limiting Global

**Fichier:** `backend/src/index.ts`

**Problème:**
- Aucun rate limiting sur les routes API
- Les endpoints peuvent être surchargés

**Impact:** 🟡 **MOYEN** - Risque de DoS (Denial of Service).

**Solution:**
- Implémenter `express-rate-limit` globalement
- Configurer des limites différentes par route (login: 5/min, autres: 100/min)
- Utiliser Redis pour le rate limiting distribué en production

---

## 🟡 MOYEN - Améliorations Recommandées

### 7. ⚠️ Messages d'Erreur Trop Détaillés en Développement

**Fichier:** `backend/src/routes/auth.ts` (lignes 84-90)

**Problème:**
```typescript
res.status(500).json({ 
  message: error.message || 'Erreur lors de l\'inscription',
  details: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
```

**Impact:** 🟡 **MOYEN** - En développement, les stack traces peuvent révéler des informations sensibles.

**Solution:**
- Ne jamais exposer les stack traces en production
- Logger les erreurs complètes côté serveur uniquement
- Retourner des messages d'erreur génériques aux clients

---

### 8. ⚠️ Absence de Validation d'Email Unicité lors de la Mise à Jour

**Fichier:** `backend/src/routes/auth.ts` (lignes 226-268)

**Problème:**
```typescript
router.put('/profile', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  // ❌ Pas de vérification que l'email n'est pas déjà utilisé par un autre utilisateur
```

**Impact:** 🟡 **MOYEN** - Un utilisateur pourrait prendre l'email d'un autre.

**Solution:**
- Vérifier l'unicité de l'email avant la mise à jour
- Exclure l'utilisateur actuel de la vérification

---

### 9. ⚠️ CORS Trop Permissif en Développement

**Fichier:** `backend/src/index.ts` (lignes 79-82)

**Problème:**
```typescript
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  return callback(null, true); // ❌ Autorise TOUTES les origines
}
```

**Impact:** 🟡 **MOYEN** - En développement, n'importe quelle origine peut accéder à l'API.

**Solution:**
- Même en développement, limiter aux origines connues
- Utiliser une liste blanche d'origines autorisées

---

### 10. ⚠️ Absence de Protection CSRF

**Problème:**
- Pas de protection CSRF pour les requêtes POST/PUT/DELETE
- Les tokens JWT dans localStorage ne protègent pas contre CSRF

**Impact:** 🟡 **MOYEN** - Risque d'attaques CSRF si un utilisateur est connecté.

**Solution:**
- Si on garde localStorage: ajouter des tokens CSRF
- Si on passe aux cookies: utiliser `csurf` middleware
- Vérifier l'origine des requêtes (header `Origin` ou `Referer`)

---

### 11. ⚠️ Validation Insuffisante des Données Utilisateur

**Fichier:** `backend/src/routes/auth.ts`

**Problème:**
- Pas de validation de longueur maximale pour les champs texte
- Pas de sanitization contre les injections XSS dans les champs texte

**Impact:** 🟡 **MOYEN** - Risque d'injection XSS si les données sont affichées sans échappement.

**Solution:**
- Ajouter des limites de longueur (email: 255, firstName/lastName: 100)
- Sanitizer les entrées avec `express-validator` ou `dompurify`
- Échapper les données lors de l'affichage côté frontend

---

### 12. ⚠️ Logs Contenant des Informations Sensibles

**Fichier:** `backend/src/routes/auth.ts`, `backend/src/index.ts`

**Problème:**
```typescript
console.log('🔍 [CLIENT] getApiUrl - hostname:', hostname);
console.error('Login error:', error); // Peut contenir des mots de passe en clair
```

**Impact:** 🟡 **MOYEN** - Les logs peuvent contenir des informations sensibles.

**Solution:**
- Ne jamais logger les mots de passe ou tokens
- Masquer les données sensibles dans les logs
- Utiliser un système de logging structuré (Winston, Pino)

---

## ✅ Points Positifs Identifiés

1. ✅ **Hachage des mots de passe avec bcrypt** (10 rounds)
2. ✅ **Messages d'erreur génériques** pour login (ne révèle pas si l'email existe)
3. ✅ **Validation avec express-validator** sur les routes d'authentification
4. ✅ **Protection des routes avec middleware `authenticateToken`**
5. ✅ **Vérification du rôle ADMIN** pour les routes admin
6. ✅ **Protection contre l'auto-suppression** dans admin (ligne 243)
7. ✅ **Utilisation de Prisma ORM** (protection contre SQL injection)
8. ✅ **Normalisation des emails** avec `normalizeEmail()`

---

## 📝 Plan d'Action Recommandé

### Phase 1 - CRITIQUE (À faire immédiatement)
1. ✅ Corriger la réinitialisation de mot de passe (tokens avec expiration)
2. ✅ Implémenter le rate limiting sur login/register
3. ✅ Ajouter Helmet.js pour les headers de sécurité
4. ✅ Renforcer la validation des mots de passe

### Phase 2 - ÉLEVÉ (Cette semaine)
5. ✅ Migrer les tokens JWT vers httpOnly cookies ou sessionStorage
6. ✅ Implémenter un système de verrouillage de compte
7. ✅ Ajouter la protection CSRF
8. ✅ Améliorer la validation des données utilisateur

### Phase 3 - MOYEN (Ce mois)
9. ✅ Améliorer les logs (masquer les données sensibles)
10. ✅ Configurer CORS de manière plus stricte
11. ✅ Ajouter un système de refresh tokens
12. ✅ Implémenter un audit log pour les actions sensibles

---

## 🔧 Bibliothèques Recommandées

```json
{
  "dependencies": {
    "helmet": "^7.0.0",                    // Headers de sécurité
    "express-rate-limit": "^7.0.0",         // Rate limiting
    "express-validator": "^7.0.0",         // Déjà installé ✅
    "bcryptjs": "^2.4.3",                  // Déjà installé ✅
    "jsonwebtoken": "^9.0.0",              // Déjà installé ✅
    "zxcvbn": "^4.4.2",                    // Vérification force mot de passe
    "cookie-parser": "^1.4.6",             // Pour les cookies httpOnly
    "csurf": "^1.11.0",                    // Protection CSRF (si cookies)
    "winston": "^3.11.0"                    // Logging structuré
  }
}
```

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Note:** Cette analyse a été effectuée sur la base du code actuel. Il est recommandé de faire une revue de sécurité complète après chaque déploiement majeur.
