# Instructions pour accéder au QR code depuis un smartphone

## ✅ Modifications effectuées

1. **QR_CODE_BASE_URL** mis à jour : `http://192.168.0.126:3000/guide`
2. **Next.js** configuré pour écouter sur `0.0.0.0` (accessible depuis le réseau)
3. **CORS** mis à jour pour accepter les requêtes depuis l'IP locale
4. **Firewall** : règles ajoutées pour les ports 3000 et 3001

## 🔄 Actions requises

### 1. Redémarrer les serveurs

**Backend :**
```bash
cd backend
npm run dev
```

**Frontend :**
```bash
cd frontend
npm run dev
```

Le frontend devrait maintenant écouter sur `0.0.0.0:3000`, ce qui le rend accessible depuis votre réseau local.

### 2. Vérifier l'accès depuis votre ordinateur

Ouvrez dans votre navigateur :
- `http://192.168.0.126:3000` - Devrait afficher le site
- `http://192.168.0.126:3001/health` - Devrait retourner `{"status":"ok"}`

### 3. Tester depuis votre smartphone

1. **Assurez-vous que votre smartphone est sur le même réseau Wi-Fi** que votre ordinateur
2. Ouvrez un navigateur sur votre smartphone
3. Allez sur : `http://192.168.0.126:3000`
4. Vous devriez voir le site

### 4. Scanner le QR code

1. Allez dans votre dashboard
2. Ouvrez votre livret
3. Le QR code devrait maintenant pointer vers `http://192.168.0.126:3000/guide/...`
4. Scannez-le avec votre smartphone
5. Ça devrait fonctionner !

## ⚠️ Important

- **L'adresse IP peut changer** si vous vous reconnectez au Wi-Fi
- Si ça ne fonctionne pas, vérifiez votre IP avec : `ipconfig` (cherchez "Adresse IPv4")
- Mettez à jour le `.env` du backend si l'IP change

## 🔍 Dépannage

Si le smartphone ne peut toujours pas accéder :

1. Vérifiez que les deux appareils sont sur le même Wi-Fi
2. Vérifiez que le firewall Windows autorise les connexions
3. Testez d'abord avec l'URL directe : `http://192.168.0.126:3000`
4. Vérifiez que les serveurs tournent bien

## 📱 Alternative : ngrok (pour tester depuis n'importe où)

Si vous voulez tester depuis n'importe quel réseau :

1. Installez ngrok : https://ngrok.com/download
2. Exécutez : `ngrok http 3000`
3. Utilisez l'URL fournie (ex: `https://abc123.ngrok.io`)
4. Mettez à jour `QR_CODE_BASE_URL` dans le `.env` du backend
