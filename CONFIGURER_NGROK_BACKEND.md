# 🔧 Configuration ngrok pour Backend + Frontend

## 📋 Vue d'ensemble

Pour tester l'application sur smartphone via ngrok, vous devez créer **2 tunnels ngrok** :
1. **Tunnel 1** : Frontend (port 3000)
2. **Tunnel 2** : Backend (port 3001)

---

## 🚀 Étapes de configuration

### Étape 1 : Lancer le tunnel ngrok pour le Frontend

Dans un **premier terminal PowerShell** :

```powershell
cd "C:\Users\conta\projet my guide digital"
.\ngrok.exe http 3000
```

Vous obtiendrez une URL comme : `https://abc123-def456.ngrok-free.app`

**Notez cette URL** (ex: `https://abc123-def456.ngrok-free.app`)

---

### Étape 2 : Lancer le tunnel ngrok pour le Backend

Dans un **deuxième terminal PowerShell** (ouvrez-en un nouveau) :

```powershell
cd "C:\Users\conta\projet my guide digital"
.\ngrok.exe http 3001
```

Vous obtiendrez une **autre URL** comme : `https://xyz789-uvw012.ngrok-free.app`

**Notez cette URL** (ex: `https://xyz789-uvw012.ngrok-free.app`)

---

### Étape 3 : Configurer le Backend

Modifiez `backend/.env` :

```env
FRONTEND_URL=https://abc123-def456.ngrok-free.app
QR_CODE_BASE_URL=https://abc123-def456.ngrok-free.app/guide
```

(Remplacez `abc123-def456` par votre URL ngrok frontend)

---

### Étape 4 : Configurer le Frontend

Créez ou modifiez `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL_NGROK=https://xyz789-uvw012.ngrok-free.app
```

(Remplacez `xyz789-uvw012` par votre URL ngrok backend)

---

### Étape 5 : Redémarrer les serveurs

1. **Redémarrez le backend** (Ctrl+C puis relancez `npm run dev`)
2. **Redémarrez le frontend** (Ctrl+C puis relancez `npm run dev`)

---

## 📱 Tester sur smartphone

1. **Sur votre smartphone**, ouvrez un navigateur
2. **Allez sur** : `https://abc123-def456.ngrok-free.app` (votre URL ngrok frontend)
3. **Connectez-vous** et testez toutes les fonctionnalités !

---

## ⚠️ Important

### Les deux tunnels doivent rester ouverts

- **Terminal 1** : ngrok frontend (port 3000) → **Gardez-le ouvert**
- **Terminal 2** : ngrok backend (port 3001) → **Gardez-le ouvert**

Si vous fermez un tunnel, l'application ne fonctionnera plus depuis le smartphone.

### Les URLs changent à chaque redémarrage

Si vous redémarrez ngrok :
1. **Notez les nouvelles URLs**
2. **Mettez à jour** `backend/.env` et `frontend/.env.local`
3. **Redémarrez** le backend et le frontend

---

## 🔄 Alternative : Utiliser localhost (depuis votre ordinateur)

Si vous testez depuis votre ordinateur (pas depuis smartphone) :
- Vous pouvez utiliser `http://localhost:3000` normalement
- Le code détecte automatiquement localhost et utilise `localhost:3001` pour l'API

---

## 📝 Résumé des URLs

- **Frontend local** : `http://localhost:3000`
- **Backend local** : `http://localhost:3001`
- **Frontend ngrok** : `https://abc123-def456.ngrok-free.app` (à noter)
- **Backend ngrok** : `https://xyz789-uvw012.ngrok-free.app` (à noter)

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Backend ngrok** : Visitez `https://xyz789-uvw012.ngrok-free.app/api/health`
   - Devrait retourner : `{"status":"ok","timestamp":"..."}`

2. **Frontend ngrok** : Visitez `https://abc123-def456.ngrok-free.app`
   - Devrait afficher la page d'accueil

3. **Test connexion** : Connectez-vous depuis le smartphone
   - Devrait fonctionner sans erreur réseau
