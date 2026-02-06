# 🔧 Solution pour ngrok gratuit (1 seul tunnel)

## ❌ Problème

Avec ngrok gratuit, vous ne pouvez avoir **qu'un seul tunnel actif** à la fois. Vous ne pouvez pas lancer deux tunnels ngrok simultanément.

## ✅ Solution : Utiliser localtunnel pour le backend

**localtunnel** est gratuit et permet plusieurs tunnels simultanés.

---

## 🚀 Configuration

### Étape 1 : Installer localtunnel

Dans PowerShell (en administrateur) :

```powershell
npm install -g localtunnel
```

### Étape 2 : Lancer ngrok pour le Frontend

Dans un **premier terminal** :

```powershell
cd "C:\Users\conta\projet my guide digital"
.\ngrok.exe http 3000
```

Notez l'URL obtenue (ex: `https://abc123-def456.ngrok-free.app`)

### Étape 3 : Lancer localtunnel pour le Backend

Dans un **deuxième terminal** :

```powershell
lt --port 3001
```

Vous obtiendrez une URL comme : `https://xyz789.loca.lt`

**Notez cette URL** (ex: `https://xyz789.loca.lt`)

---

### Étape 4 : Configurer le Backend

Modifiez `backend/.env` :

```env
FRONTEND_URL=https://abc123-def456.ngrok-free.app
QR_CODE_BASE_URL=https://abc123-def456.ngrok-free.app/guide
```

### Étape 5 : Configurer le Frontend

Modifiez `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL_NGROK=https://xyz789.loca.lt
```

### Étape 6 : Redémarrer les serveurs

1. **Redémarrez le backend** (Ctrl+C puis relancez `npm run dev`)
2. **Redémarrez le frontend** (Ctrl+C puis relancez `npm run dev`)

---

## 📱 Tester sur smartphone

1. **Sur votre smartphone**, ouvrez un navigateur
2. **Allez sur** : `https://abc123-def456.ngrok-free.app` (votre URL ngrok frontend)
3. **Connectez-vous** et testez !

---

## ⚠️ Important

- **Gardez les deux terminaux ouverts** :
  - Terminal 1 : ngrok frontend (port 3000)
  - Terminal 2 : localtunnel backend (port 3001)

- **Les URLs changent** :
  - ngrok : change à chaque redémarrage
  - localtunnel : change à chaque redémarrage
  - Mettez à jour les fichiers de configuration si vous redémarrez

---

## 🔄 Alternative : Utiliser le réseau local

Si vous êtes sur le même Wi-Fi que votre smartphone :

1. Trouvez votre IP locale :
   ```powershell
   ipconfig | findstr /i "IPv4"
   ```

2. Utilisez `http://VOTRE_IP:3000` sur le smartphone
3. Le code détectera automatiquement l'IP et utilisera `http://VOTRE_IP:3001` pour l'API

---

## 📝 Résumé

- **Frontend** : ngrok (port 3000) → `https://abc123-def456.ngrok-free.app`
- **Backend** : localtunnel (port 3001) → `https://xyz789.loca.lt`
- **Local** : `http://localhost:3000` fonctionne toujours normalement
