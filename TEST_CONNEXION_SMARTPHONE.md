# Test de connexion depuis smartphone

## Vérifications à faire

### 1. Vérifier que les serveurs écoutent sur 0.0.0.0

Le serveur doit écouter sur `0.0.0.0` et non seulement sur `127.0.0.1` pour être accessible depuis le réseau.

**Backend :**
```bash
cd backend
npm run dev
```
Vérifiez dans les logs qu'il dit "Server running on port 3001"

**Frontend :**
```bash
cd frontend
npm run dev
```
Vérifiez dans les logs qu'il dit qu'il écoute sur `0.0.0.0:3000` ou qu'il est accessible depuis le réseau.

### 2. Vérifier l'adresse IP

Votre IP actuelle devrait être : **192.168.0.126**

Si elle a changé, mettez à jour :
- `backend/.env` : `QR_CODE_BASE_URL="http://NOUVELLE_IP:3000/guide"`
- `frontend/.env.local` : `NEXT_PUBLIC_API_URL=http://NOUVELLE_IP:3001`

### 3. Tester depuis votre ordinateur

Sur votre ordinateur, ouvrez :
- `http://192.168.0.126:3000` → Devrait fonctionner
- `http://192.168.0.126:3001/health` → Devrait retourner `{"status":"ok"}`

### 4. Tester depuis smartphone

**IMPORTANT :** Votre smartphone et votre ordinateur doivent être sur le **même réseau Wi-Fi**.

1. Sur votre smartphone, ouvrez un navigateur
2. Allez sur : `http://192.168.0.126:3000`
3. Si ça ne fonctionne pas, essayez : `http://192.168.0.126:3001/health`

### 5. Vérifier le firewall Windows

Le firewall peut bloquer les connexions. Autorisez les ports :

```powershell
# Vérifier les règles
netsh advfirewall firewall show rule name="Next.js Frontend"
netsh advfirewall firewall show rule name="Node.js Backend"

# Si elles n'existent pas, les créer :
netsh advfirewall firewall add rule name="Next.js Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3001
```

### 6. Alternative : Désactiver temporairement le firewall

Pour tester uniquement :
1. Ouvrez "Pare-feu Windows Defender"
2. Désactivez-le temporairement
3. Testez depuis le smartphone
4. Réactivez-le après

## Solution rapide : Utiliser ngrok

Si rien ne fonctionne, utilisez ngrok pour créer un tunnel public :

1. Téléchargez ngrok : https://ngrok.com/download
2. Exécutez : `ngrok http 3000`
3. Utilisez l'URL fournie (ex: `https://abc123.ngrok.io`)
4. Mettez à jour `QR_CODE_BASE_URL` dans `backend/.env`
