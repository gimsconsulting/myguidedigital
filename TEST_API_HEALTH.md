# 🔍 Test de l'API Health

## ❌ Problème Identifié

Le `curl` vers `https://app.myguidedigital.com/api/health` retourne "Cannot GET /api/health".

## 🔍 Causes Possibles

1. **Nginx ne route pas correctement** `/api/health` vers le backend
2. **Le backend écoute sur le port 3001** mais Nginx n'est pas configuré pour proxy les requêtes `/api/*`

## ✅ Solutions

### Solution 1 : Tester directement le Backend (Port 3001)

```bash
# Tester directement sur le port du backend
curl http://localhost:3001/api/health

# Ou depuis l'extérieur (si le port est ouvert)
curl http://VOTRE_IP_VPS:3001/api/health
```

### Solution 2 : Vérifier la Configuration Nginx

Vérifiez que votre configuration Nginx route bien `/api/*` vers le backend :

```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Solution 3 : Tester depuis le Frontend

Si le frontend fonctionne, c'est que le routage fonctionne. Le problème pourrait être spécifique à la route `/api/health`.

## 📊 Analyse des Logs

D'après les logs que vous avez partagés :

✅ **Le backend fonctionne** :
- `🚀 Server running on http://0.0.0.0:3001`
- `📥 GET /api/health - Origin: none` (la requête arrive bien au backend)

❌ **Mais il y a encore des logs verbeux** :
- Les messages sur `GOOGLE_TRANSLATE_API_KEY` sont encore trop verbeux
- Cela signifie que les corrections ne sont peut-être pas encore compilées/déployées

## 🔧 Actions à Faire

### 1. Vérifier que le Code est Compilé

```bash
cd /root/myguidedigital/myguidedigital/backend

# Vérifier que le code source a été modifié
grep -A 5 "Vérifier que la clé API" src/index.ts

# Si vous voyez encore les anciens logs verbeux, recompiler
npm run build

# Redémarrer
pm2 restart my-guidedigital-backend
```

### 2. Vérifier les Logs Après Redémarrage

```bash
pm2 logs my-guidedigital-backend --lines 20
```

**Résultat attendu** : Vous devriez voir seulement :
```
⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée - Les traductions seront désactivées
```

Au lieu de tous les messages verbeux sur le répertoire courant, variables disponibles, etc.

### 3. Tester l'API Health

```bash
# Depuis le serveur directement
curl http://localhost:3001/api/health

# Depuis l'extérieur (si Nginx est configuré)
curl https://app.myguidedigital.com/api/health
```

## ✅ Checklist

- [ ] Code recompilé (`npm run build`)
- [ ] Backend redémarré (`pm2 restart`)
- [ ] Logs vérifiés (moins verbeux)
- [ ] API health testée directement sur le port 3001
- [ ] Configuration Nginx vérifiée (si nécessaire)

---

**Le problème principal** : Les corrections ne semblent pas encore compilées/déployées. Il faut recompiler et redémarrer.
