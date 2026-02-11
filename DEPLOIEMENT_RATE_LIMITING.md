# 🚀 Déploiement - Rate Limiting et Protection contre les Attaques par Force Brute

## ✅ Corrections Apportées

### 1. **Package.json** (`backend/package.json`)
- ✅ Ajout de `express-rate-limit` version `^7.1.5`

### 2. **Middleware de Rate Limiting** (`backend/src/middleware/rateLimiter.ts`)
- ✅ `loginLimiter` : 5 tentatives par IP toutes les 15 minutes
- ✅ `registerLimiter` : 3 inscriptions par IP par heure
- ✅ Logging des tentatives suspectes

### 3. **Route Login** (`backend/src/routes/auth.ts`)
- ✅ Rate limiting appliqué (5 tentatives / 15 min)
- ✅ Verrouillage de compte après 5 tentatives échouées (30 minutes)
- ✅ Compteur de tentatives échouées par email
- ✅ Logger les tentatives suspectes (IP, email, timestamp)
- ✅ Protection contre les timing attacks

### 4. **Route Register** (`backend/src/routes/auth.ts`)
- ✅ Rate limiting appliqué (3 tentatives / heure)
- ✅ Logger les tentatives suspectes

## 📋 Instructions de Déploiement

### Étape 1 : Installer la dépendance

Sur votre VPS :

```bash
cd /root/myguidedigital/myguidedigital/backend
npm install express-rate-limit@^7.1.5
```

### Étape 2 : Vérifier que les fichiers sont présents

```bash
# Vérifier le middleware
ls -la src/middleware/rateLimiter.ts

# Vérifier que les imports sont corrects dans auth.ts
grep "rateLimiter" src/routes/auth.ts
```

### Étape 3 : Compiler le TypeScript

```bash
npm run build
```

### Étape 4 : Redémarrer le Backend

```bash
pm2 restart my-guidedigital-backend
```

### Étape 5 : Vérifier les logs

```bash
pm2 logs my-guidedigital-backend --lines 50
```

Vous devriez voir le backend démarrer sans erreur.

## 🔒 Sécurité Améliorée

### Protection Rate Limiting

- ✅ **Login** : Maximum 5 tentatives par IP toutes les 15 minutes
- ✅ **Register** : Maximum 3 inscriptions par IP par heure
- ✅ Les requêtes réussies ne comptent pas dans la limite
- ✅ Headers `RateLimit-*` retournés pour informer le client

### Verrouillage de Compte

- ✅ **5 tentatives échouées** → Compte verrouillé pendant **30 minutes**
- ✅ Compteur par email (pas seulement par IP)
- ✅ Message d'erreur avec temps restant avant déverrouillage
- ✅ Réinitialisation automatique après connexion réussie

### Logging et Monitoring

- ✅ Toutes les tentatives suspectes sont loggées :
  - Tentatives avec email inexistant
  - Tentatives échouées (avec compteur)
  - Comptes verrouillés
  - Connexions réussies après échecs
- ✅ Informations loggées : IP, email, timestamp

## 🧪 Tests

### Test 1 : Rate Limiting sur Login

```bash
# Essayer de se connecter 6 fois rapidement
for i in {1..6}; do
  curl -X POST https://app.myguidedigital.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done
```

**Résultat attendu** : Après 5 tentatives, vous devriez recevoir une erreur 429 "Trop de tentatives".

### Test 2 : Verrouillage de Compte

```bash
# Essayer de se connecter 5 fois avec le même email mais mauvais mot de passe
for i in {1..5}; do
  curl -X POST https://app.myguidedigital.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"votre-email@example.com","password":"wrong"}'
  echo ""
done
```

**Résultat attendu** : 
- Les 4 premières tentatives : Erreur 401 avec `attemptsRemaining`
- La 5ème tentative : Erreur 423 "Compte temporairement verrouillé" avec `lockedUntil`

### Test 3 : Rate Limiting sur Register

```bash
# Essayer de s'inscrire 4 fois rapidement
for i in {1..4}; do
  curl -X POST https://app.myguidedigital.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"test123"}'
  echo ""
done
```

**Résultat attendu** : Après 3 tentatives, erreur 429.

## 📊 Monitoring

### Vérifier les logs de sécurité

```bash
# Voir les tentatives suspectes
pm2 logs my-guidedigital-backend | grep "SECURITY"

# Voir les rate limits
pm2 logs my-guidedigital-backend | grep "RATE LIMIT"
```

### Exemples de logs

```
⚠️ [SECURITY] Tentative de connexion avec email inexistant: attacker@example.com depuis IP: 192.168.1.100
⚠️ [SECURITY] Tentative de connexion échouée (3/5): user@example.com depuis IP: 192.168.1.100
🔒 [SECURITY] Compte verrouillé après 5 tentatives échouées: user@example.com depuis IP: 192.168.1.100
✅ [SECURITY] Connexion réussie après tentatives échouées: user@example.com depuis IP: 192.168.1.100
⚠️ [RATE LIMIT] Trop de tentatives de login depuis IP: 192.168.1.100
```

## ⚠️ Notes Importantes

1. **Store en mémoire** : Les tentatives échouées sont stockées en mémoire. En cas de redémarrage du serveur, les compteurs sont réinitialisés. Pour une production à grande échelle, utiliser Redis.

2. **Nettoyage automatique** : Les tentatives expirées sont nettoyées toutes les heures automatiquement.

3. **IP vs Email** : 
   - Le rate limiting est basé sur l'IP (protection contre les attaques distribuées)
   - Le verrouillage de compte est basé sur l'email (protection ciblée)

4. **Headers RateLimit** : Les clients peuvent utiliser les headers `RateLimit-*` pour afficher des messages à l'utilisateur.

## 🔄 Améliorations Futures (Optionnel)

- [ ] Utiliser Redis pour le stockage des tentatives (scalabilité)
- [ ] Ajouter un CAPTCHA après 3 tentatives échouées
- [ ] Envoyer un email d'alerte lors du verrouillage d'un compte
- [ ] Dashboard admin pour voir les tentatives suspectes
- [ ] Rate limiting basé sur le fingerprint du navigateur

## ✅ Checklist de Déploiement

- [ ] `npm install express-rate-limit` exécuté
- [ ] Fichier `rateLimiter.ts` présent dans `src/middleware/`
- [ ] Imports ajoutés dans `auth.ts`
- [ ] `npm run build` exécuté sans erreur
- [ ] Backend redémarré avec PM2
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Tests effectués (rate limiting fonctionne)
- [ ] Tests effectués (verrouillage de compte fonctionne)

---

**Le Point 2 est maintenant terminé !** 🎉

Une fois le déploiement vérifié, on pourra passer au **Point 3 : Headers de Sécurité HTTP (Helmet)**.
