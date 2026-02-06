# ✅ Étapes finales pour accéder à l'application

## 📋 Vérifications

### 1. Vous devez avoir 2 terminaux ouverts :

- **Terminal 1** : ngrok frontend (port 3000)
  - URL : `https://jone-pretelephonic-trembly.ngrok-free.dev`
  
- **Terminal 2** : localtunnel backend (port 3001)
  - URL : `https://xxxxx.loca.lt` (à remplacer par votre URL)

### 2. Configuration à faire :

#### A. Ajouter l'URL localtunnel dans `frontend/.env.local`

Ouvrez `frontend/.env.local` et modifiez :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001

# Configuration ngrok pour l'API backend (port 3001)
NEXT_PUBLIC_API_URL_NGROK=https://VOTRE_URL_LOCALTUNNEL.loca.lt
```

**Remplacez `VOTRE_URL_LOCALTUNNEL` par l'URL que vous avez obtenue dans le terminal localtunnel.**

#### B. Vérifier `backend/.env`

Le fichier `backend/.env` doit contenir :

```env
FRONTEND_URL=https://jone-pretelephonic-trembly.ngrok-free.dev
QR_CODE_BASE_URL=https://jone-pretelephonic-trembly.ngrok-free.dev/guide
```

✅ **C'est déjà configuré !**

---

## 🚀 Redémarrer les serveurs

### 1. Redémarrer le Backend

Dans le terminal backend :
- Appuyez sur **Ctrl+C** pour arrêter
- Relancez : `npm run dev`

### 2. Redémarrer le Frontend

Dans le terminal frontend :
- Appuyez sur **Ctrl+C** pour arrêter
- Relancez : `npm run dev`

---

## 📱 Accéder à l'application

### Option 1 : Depuis votre ordinateur (localhost)

- **URL** : `http://localhost:3000`
- **Fonctionne** : ✅ Normalement
- **API** : Utilise `localhost:3001` automatiquement

### Option 2 : Depuis votre smartphone (via ngrok)

- **URL** : `https://jone-pretelephonic-trembly.ngrok-free.dev`
- **Fonctionne** : ✅ Si localtunnel est configuré
- **API** : Utilise l'URL localtunnel automatiquement

---

## ✅ Vérification

1. **Backend localtunnel** : Visitez `https://VOTRE_URL_LOCALTUNNEL.loca.lt/api/health`
   - Devrait retourner : `{"status":"ok","timestamp":"..."}`

2. **Frontend ngrok** : Visitez `https://jone-pretelephonic-trembly.ngrok-free.dev`
   - Devrait afficher la page d'accueil

3. **Test connexion** : Connectez-vous depuis le smartphone
   - Devrait fonctionner sans erreur réseau

---

## ⚠️ Important

- **Gardez les 3 terminaux ouverts** :
  - Terminal 1 : ngrok frontend
  - Terminal 2 : localtunnel backend
  - Terminal 3 : Backend (`npm run dev`)
  - Terminal 4 : Frontend (`npm run dev`)

- **Si vous redémarrez ngrok ou localtunnel** :
  - Les URLs changent
  - Mettez à jour les fichiers de configuration
  - Redémarrez les serveurs
