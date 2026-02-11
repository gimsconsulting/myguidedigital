# 🚀 Déploiement - Headers de Sécurité HTTP avec Helmet

## ✅ Corrections Apportées

### 1. **Package.json** (`backend/package.json`)
- ✅ Ajout de `helmet` version `^7.1.0`

### 2. **Configuration Helmet** (`backend/src/index.ts`)
- ✅ Helmet configuré avec tous les headers de sécurité
- ✅ Content Security Policy (CSP) configurée
- ✅ HSTS activé en production uniquement
- ✅ Protection contre XSS, clickjacking, MIME sniffing
- ✅ Configuration compatible avec CORS et les uploads

## 🔒 Headers de Sécurité Ajoutés

Helmet ajoute automatiquement les headers suivants :

### Headers Principaux

1. **Content-Security-Policy (CSP)**
   - Protection contre XSS (Cross-Site Scripting)
   - Autorise les scripts/styles inline pour compatibilité
   - Autorise les images et connexions depuis HTTPS/HTTP

2. **X-Content-Type-Options: nosniff**
   - Empêche le MIME sniffing
   - Force les navigateurs à respecter le Content-Type déclaré

3. **X-Frame-Options: DENY**
   - Protection contre le clickjacking
   - Empêche l'embedding dans des iframes

4. **X-XSS-Protection: 1; mode=block**
   - Active la protection XSS du navigateur
   - (Déprécié mais gardé pour compatibilité)

5. **Strict-Transport-Security (HSTS)** - Production uniquement
   - Force HTTPS pendant 1 an
   - Inclut les sous-domaines
   - Préchargement activé

6. **Referrer-Policy: strict-origin-when-cross-origin**
   - Contrôle les informations envoyées dans le header Referer

7. **Permissions-Policy**
   - Désactive la géolocalisation, microphone, caméra par défaut

8. **Cross-Origin-Embedder-Policy**
   - Désactivé pour compatibilité avec les iframes

9. **Cross-Origin-Opener-Policy**
   - Permet les popups same-origin

10. **Cross-Origin-Resource-Policy**
    - Autorise les ressources cross-origin

## 📋 Instructions de Déploiement

### Étape 1 : Installer la dépendance

Sur votre VPS :

```bash
cd /root/myguidedigital/myguidedigital/backend
npm install helmet@^7.1.0
```

### Étape 2 : Vérifier que les fichiers sont présents

```bash
# Vérifier que helmet est dans package.json
grep "helmet" package.json

# Vérifier que helmet est importé dans index.ts
grep "helmet" src/index.ts
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
pm2 logs my-guidedigital-backend --lines 30
```

Vous devriez voir le backend démarrer sans erreur.

## 🧪 Tests

### Test 1 : Vérifier les headers de sécurité

```bash
# Tester une requête et voir les headers
curl -I https://app.myguidedigital.com/api/health
```

**Résultat attendu** : Vous devriez voir des headers comme :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`
- `Strict-Transport-Security: ...` (en production uniquement)

### Test 2 : Vérifier avec un navigateur

1. Ouvrir votre site dans un navigateur
2. Ouvrir les DevTools (F12)
3. Aller dans l'onglet "Network"
4. Recharger la page
5. Cliquer sur une requête vers l'API
6. Vérifier l'onglet "Headers" → "Response Headers"

Vous devriez voir tous les headers de sécurité listés ci-dessus.

### Test 3 : Vérifier que le site fonctionne toujours

- ✅ Se connecter au dashboard
- ✅ Créer/modifier un livret
- ✅ Uploader une photo de profil
- ✅ Utiliser toutes les fonctionnalités

Si tout fonctionne, c'est bon !

## 🔍 Vérification des Headers

### Commande pour voir tous les headers

```bash
curl -I https://app.myguidedigital.com/api/health 2>&1 | grep -i "x-\|content-security\|strict-transport\|referrer\|permissions"
```

### Headers attendus

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), microphone=(), camera=()
```

## ⚠️ Notes Importantes

### 1. **CSP (Content Security Policy)**

La CSP est configurée de manière permissive pour ne pas casser les fonctionnalités existantes :
- `'unsafe-inline'` et `'unsafe-eval'` sont autorisés pour les scripts
- `'unsafe-inline'` est autorisé pour les styles
- Les images et connexions HTTPS/HTTP sont autorisées

**Pour une sécurité maximale**, vous pouvez durcir la CSP en production :
- Retirer `'unsafe-inline'` et `'unsafe-eval'`
- Utiliser des nonces ou des hashes pour les scripts/styles inline
- Limiter les sources d'images et de connexions

### 2. **HSTS (HTTP Strict Transport Security)**

- ✅ Activé **uniquement en production** (quand `NODE_ENV === 'production'`)
- ✅ Désactivé en développement pour permettre HTTP local
- ✅ Configure pour 1 an avec préchargement

### 3. **Compatibilité avec CORS**

Helmet est configuré pour être compatible avec votre configuration CORS existante. Si vous rencontrez des problèmes CORS après l'installation de Helmet, vérifiez l'ordre des middlewares dans `index.ts` (Helmet doit être avant CORS).

### 4. **Compatibilité avec les Uploads**

La configuration Helmet n'interfère pas avec les uploads de fichiers. Les limites de taille (20MB) restent actives.

## 🔄 Améliorations Futures (Optionnel)

- [ ] Durcir la CSP en production (retirer unsafe-inline/eval)
- [ ] Ajouter des nonces pour les scripts/styles inline
- [ ] Configurer une CSP différente pour le frontend et l'API
- [ ] Ajouter un reporting endpoint pour les violations CSP
- [ ] Tester avec des outils comme SecurityHeaders.com

## ✅ Checklist de Déploiement

- [ ] `npm install helmet` exécuté
- [ ] Helmet importé dans `index.ts`
- [ ] Configuration Helmet ajoutée
- [ ] `npm run build` exécuté sans erreur
- [ ] Backend redémarré avec PM2
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Headers de sécurité vérifiés avec `curl -I`
- [ ] Site fonctionne toujours (tests fonctionnels)
- [ ] Headers visibles dans les DevTools du navigateur

## 📊 Score de Sécurité

Après l'installation de Helmet, votre site devrait avoir un meilleur score sur :
- [SecurityHeaders.com](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

Testez votre site sur ces outils pour voir l'amélioration !

---

**Le Point 3 est maintenant terminé !** 🎉

Une fois le déploiement vérifié, on pourra passer au **Point 4 : Renforcement de la Validation des Mots de Passe**.
