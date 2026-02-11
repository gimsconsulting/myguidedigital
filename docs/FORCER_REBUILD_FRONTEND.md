# Forcer un rebuild complet du frontend

## Problème
Le frontend utilise encore `https://app.myguidedigital.com:3001` au lieu de `https://app.myguidedigital.com/api/...`

## Solution : Rebuild complet

Sur votre serveur VPS, exécutez ces commandes dans l'ordre :

```bash
# 1. Se connecter au serveur
ssh root@votre-ip

# 2. Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# 3. Vérifier que les modifications sont bien présentes dans le code
grep -A 3 "Production (nom de domaine" frontend/lib/api.ts

# Vous devriez voir :
# // Production (nom de domaine type app.myguidedigital.com) → même origine, pas de port
# // Les requêtes iront vers https://app.myguidedigital.com/api/... (proxy nginx vers le backend)
# // IMPORTANT: En production, on ignore le port même si NEXT_PUBLIC_API_URL est défini avec un port
# if (!isIpAddress(hostname)) {

# 4. Arrêter le frontend PM2
pm2 stop my-guidedigital-frontend

# 5. Supprimer complètement le cache Next.js
cd frontend
rm -rf .next
rm -rf node_modules/.cache

# 6. Vérifier qu'il n'y a pas de variable d'environnement qui force le port
# Si vous avez un fichier .env.local ou .env.production, vérifiez-le
cat .env.local 2>/dev/null || echo "Pas de .env.local"
cat .env.production 2>/dev/null || echo "Pas de .env.production"

# 7. Rebuild complet
npm run build

# 8. Vérifier que le build a réussi (chercher "Compiled successfully")
# Le build devrait se terminer avec un message de succès

# 9. Redémarrer le frontend
cd ..
pm2 restart my-guidedigital-frontend

# 10. Vérifier les logs
pm2 logs my-guidedigital-frontend --lines 30
```

## Vérification après le rebuild

1. Ouvrez votre navigateur sur `https://app.myguidedigital.com`
2. Videz le cache du navigateur :
   - Appuyez sur `Ctrl+Shift+Delete`
   - Sélectionnez "Images et fichiers en cache"
   - Cliquez sur "Effacer les données"
   - OU : Clic droit sur le bouton de rafraîchissement > "Vider le cache et effectuer une actualisation forcée"
3. Ouvrez les DevTools (F12) > Network
4. Essayez de vous connecter
5. Cliquez sur la requête `login` qui apparaît
6. Vérifiez que l'URL est maintenant `https://app.myguidedigital.com/api/auth/login` (sans `:3001`)

## Si ça ne fonctionne toujours pas

Vérifiez dans la console du navigateur (F12 > Console) s'il y a des messages qui indiquent l'URL utilisée. Le code devrait loguer l'URL dans la console.

Si vous voyez encore `:3001`, il y a peut-être un problème avec le code. Dans ce cas, ajoutez un log de débogage temporaire dans `frontend/lib/api.ts` :

```typescript
function getApiUrl(): string {
  if (typeof window === 'undefined') {
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    return envApiUrl || 'http://localhost:3001';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // LOG DE DÉBOGAGE
  console.log('🔍 DEBUG getApiUrl:', {
    hostname,
    protocol,
    isIp: isIpAddress(hostname),
    windowLocation: window.location.href
  });

  // ... reste du code
```

Puis rebuild et vérifiez ce qui est logué dans la console.
