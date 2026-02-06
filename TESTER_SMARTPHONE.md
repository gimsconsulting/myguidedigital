# 📱 Tester l'application sur smartphone (avant hébergement)

## 🚀 Solution 1 : ngrok (Recommandé - fonctionne partout)

### Étape 1 : Configurer ngrok (une seule fois)

1. **Créer un compte gratuit** sur https://dashboard.ngrok.com/signup
2. **Récupérer votre authtoken** : https://dashboard.ngrok.com/get-started/your-authtoken
3. **Configurer ngrok** dans PowerShell :
   ```powershell
   cd "C:\Users\conta\projet my guide digital"
   .\ngrok.exe config add-authtoken VOTRE_AUTHTOKEN_ICI
   ```

### Étape 2 : Lancer ngrok

Dans un **nouveau terminal PowerShell**, exécutez :

```powershell
cd "C:\Users\conta\projet my guide digital"
.\ngrok.exe http 3000
```

Vous obtiendrez une URL comme : `https://abc123-def456.ngrok-free.app`

### Étape 3 : Configurer le backend

1. **Copiez l'URL ngrok** (ex: `https://abc123-def456.ngrok-free.app`)
2. **Modifiez `backend/.env`** :
   ```
   QR_CODE_BASE_URL=https://abc123-def456.ngrok-free.app/guide
   FRONTEND_URL=https://abc123-def456.ngrok-free.app
   ```
3. **Redémarrez le backend** (Ctrl+C puis relancez `npm run dev`)

### Étape 4 : Tester sur smartphone

1. **Sur votre smartphone** (n'importe quel réseau Wi-Fi ou 4G/5G), ouvrez un navigateur
2. **Allez sur** : `https://abc123-def456.ngrok-free.app`
3. **Connectez-vous** et testez toutes les fonctionnalités !

### ⚠️ Important

- L'URL ngrok change à chaque redémarrage de ngrok
- Si vous redémarrez ngrok, mettez à jour `QR_CODE_BASE_URL` dans `backend/.env`
- Pour les QR codes existants, utilisez le bouton "Mettre à jour le QR code" dans le dashboard

---

## 🏠 Solution 2 : Réseau local (si smartphone sur même Wi-Fi)

### Étape 1 : Trouver votre IP locale

Dans PowerShell :
```powershell
ipconfig | findstr /i "IPv4"
```

Vous obtiendrez quelque chose comme : `192.168.0.126`

### Étape 2 : Configurer le backend

1. **Modifiez `backend/.env`** :
   ```
   QR_CODE_BASE_URL=http://192.168.0.126:3000/guide
   ```

2. **Redémarrez le backend**

### Étape 3 : Tester sur smartphone

1. **Assurez-vous que votre smartphone est sur le même Wi-Fi** que votre ordinateur
2. **Sur votre smartphone**, ouvrez un navigateur
3. **Allez sur** : `http://192.168.0.126:3000`
4. **Connectez-vous** et testez !

### ⚠️ Limitations

- Le smartphone doit être sur le même réseau Wi-Fi
- Ne fonctionne pas en 4G/5G
- L'IP peut changer si vous vous reconnectez au Wi-Fi

---

## 🎯 Recommandation

**Utilisez ngrok** pour tester facilement depuis n'importe où, même en 4G/5G !
