# 🔍 Diagnostic : Erreur de connexion sur localhost:3000

## ❌ Problème identifié

Le backend n'est **pas accessible** sur le port 3001. C'est pourquoi vous avez une erreur de connexion.

## ✅ Solution

### 1. Vérifier que le backend est démarré

Dans le terminal backend, vous devriez voir :
```
🚀 Server running on port 3001
```

Si ce n'est pas le cas, démarrez le backend :

```powershell
cd "C:\Users\conta\projet my guide digital\backend"
npm run dev
```

### 2. Vérifier que le backend écoute bien

Le backend doit afficher :
```
🚀 Server running on port 3001
📊 Environment: development
✅ Fichier .env chargé
```

### 3. Tester l'API backend

Ouvrez un nouveau terminal et testez :

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
```

Vous devriez voir : `{"status":"ok","timestamp":"..."}`

### 4. Vérifier la console du navigateur

1. Ouvrez `http://localhost:3000` dans votre navigateur
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Regardez les messages d'erreur

Vous devriez voir quelque chose comme :
- `✅ Utilisation de localhost pour l'API: http://localhost:3001`
- Ou une erreur réseau si le backend n'est pas accessible

### 5. Vérifier les erreurs réseau

1. Dans les outils de développement (F12)
2. Allez dans l'onglet **Network** (Réseau)
3. Essayez de vous connecter
4. Regardez la requête vers `/api/auth/login`
5. Vérifiez le statut (200 = OK, 500 = erreur serveur, ERR_NETWORK = backend inaccessible)

## 🔧 Causes possibles

1. **Backend non démarré** → Démarrez-le avec `npm run dev` dans le dossier backend
2. **Port 3001 déjà utilisé** → Arrêtez le processus qui utilise le port 3001
3. **Erreur dans le backend** → Regardez les logs du terminal backend
4. **Problème de CORS** → Vérifiez que `FRONTEND_URL` est bien configuré dans `backend/.env`

## ✅ Configuration actuelle

- **Frontend** : `http://localhost:3000` ✅
- **Backend** : `http://localhost:3001` ❌ (non accessible)
- **API URL configurée** : `http://localhost:3001` ✅

## 🚀 Action immédiate

**Démarrez le backend maintenant** :

```powershell
cd "C:\Users\conta\projet my guide digital\backend"
npm run dev
```

Puis réessayez de vous connecter sur `http://localhost:3000`.
