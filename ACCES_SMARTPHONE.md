# Accès depuis un Smartphone

## Problème
Le QR code pointe vers `localhost:3000` qui n'est accessible que depuis votre ordinateur. Pour accéder depuis un smartphone, il faut utiliser l'adresse IP locale de votre machine.

## Solution

### 1. Vérifier que les deux serveurs sont accessibles depuis le réseau local

**Backend** doit être accessible sur : `http://192.168.0.126:3001`
**Frontend** doit être accessible sur : `http://192.168.0.126:3000`

### 2. Configurer le firewall Windows

Le firewall Windows peut bloquer les connexions entrantes. Autorisez les ports :

```powershell
# Autoriser le port 3000 (Frontend)
netsh advfirewall firewall add rule name="Next.js Frontend" dir=in action=allow protocol=TCP localport=3000

# Autoriser le port 3001 (Backend)
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3001
```

### 3. Démarrer Next.js avec l'IP locale

Au lieu de `npm run dev`, utilisez :

```bash
cd frontend
npm run dev -- -H 0.0.0.0
```

Ou modifiez `package.json` :
```json
"dev": "next dev -H 0.0.0.0"
```

### 4. Vérifier l'accès

Depuis votre smartphone (connecté au même Wi-Fi) :
- Ouvrez un navigateur
- Allez sur `http://192.168.0.126:3000`
- Vous devriez voir le site

### 5. Scanner le QR code

Le QR code devrait maintenant pointer vers `http://192.168.0.126:3000/guide/...` qui sera accessible depuis votre smartphone.

## Alternative : Utiliser ngrok (pour tester depuis n'importe où)

Si vous voulez tester depuis n'importe quel réseau :

1. Installez ngrok : https://ngrok.com/
2. Exécutez : `ngrok http 3000`
3. Utilisez l'URL fournie par ngrok dans le QR_CODE_BASE_URL

## Important

- Votre smartphone et votre ordinateur doivent être sur le même réseau Wi-Fi
- L'adresse IP peut changer si vous vous reconnectez au Wi-Fi
- Pour la production, utilisez un nom de domaine réel
