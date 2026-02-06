# Solution pour ERR_CONNECTION_FAILED sur smartphone

## ✅ Vérifications effectuées

- ✅ Serveur écoute sur `0.0.0.0:3000` (accessible depuis le réseau)
- ✅ IP locale : `192.168.0.126`
- ✅ Firewall : règles ajoutées

## 🔍 Vérifications à faire de votre côté

### 1. Même réseau Wi-Fi

**CRITIQUE** : Votre smartphone et votre ordinateur doivent être sur le **même réseau Wi-Fi**.

- Vérifiez que les deux sont connectés au même routeur
- Si votre smartphone est en 4G/5G, ça ne fonctionnera pas

### 2. Test depuis votre ordinateur

Sur votre ordinateur, ouvrez dans le navigateur :
- `http://192.168.0.126:3000` → **Doit fonctionner**
- `http://192.168.0.126:3001/health` → **Doit retourner** `{"status":"ok"}`

Si ça ne fonctionne pas sur l'ordinateur, le problème vient du serveur.

### 3. Test depuis smartphone (même Wi-Fi)

Sur votre smartphone (connecté au même Wi-Fi) :
1. Ouvrez un navigateur
2. Allez sur : `http://192.168.0.126:3000`
3. Si ERR_CONNECTION_FAILED :
   - Vérifiez que vous êtes bien sur le même Wi-Fi
   - Vérifiez que l'IP n'a pas changé

### 4. Vérifier l'IP actuelle

Si l'IP a changé, trouvez la nouvelle :
```powershell
ipconfig | findstr /i "IPv4"
```

Puis mettez à jour :
- `backend/.env` : `QR_CODE_BASE_URL="http://NOUVELLE_IP:3000/guide"`
- `frontend/.env.local` : `NEXT_PUBLIC_API_URL=http://NOUVELLE_IP:3001`

## 🚀 Solution alternative : ngrok (recommandé)

Si le problème persiste, utilisez **ngrok** pour créer un tunnel public :

### Installation ngrok

1. Téléchargez : https://ngrok.com/download
2. Extrayez `ngrok.exe` dans un dossier (ex: `C:\ngrok\`)
3. Ouvrez un terminal et allez dans ce dossier

### Utilisation

```bash
# Dans un nouveau terminal
cd C:\ngrok
.\ngrok.exe http 3000
```

Vous obtiendrez une URL comme : `https://abc123.ngrok.io`

### Mettre à jour la configuration

1. **Backend** - Modifiez `backend/.env` :
   ```
   QR_CODE_BASE_URL="https://abc123.ngrok.io/guide"
   ```

2. **Redémarrez le backend**

3. **Mettez à jour le QR code** de votre livret (bouton "Mettre à jour le QR code")

4. **Testez** : L'URL ngrok fonctionnera depuis n'importe quel réseau !

## 📱 Test rapide

1. Sur votre smartphone, ouvrez un navigateur
2. Allez sur : `http://192.168.0.126:3000`
3. Si ça fonctionne → Le QR code devrait fonctionner aussi
4. Si ça ne fonctionne pas → Utilisez ngrok

## ⚠️ Important

- ngrok est gratuit mais l'URL change à chaque redémarrage
- Pour la production, utilisez un vrai nom de domaine
- ngrok est parfait pour tester en développement
