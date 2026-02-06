# Configuration de ngrok

## Étapes pour configurer ngrok

### 1. Créer un compte (gratuit)

1. Allez sur : https://dashboard.ngrok.com/signup
2. Créez un compte (gratuit)
3. Connectez-vous

### 2. Récupérer votre authtoken

1. Une fois connecté, allez sur : https://dashboard.ngrok.com/get-started/your-authtoken
2. Copiez votre authtoken (une longue chaîne de caractères)

### 3. Configurer ngrok

Dans votre terminal PowerShell, exécutez :

```powershell
# Remplacez YOUR_AUTHTOKEN par votre token
.\ngrok.exe config add-authtoken YOUR_AUTHTOKEN
```

### 4. Lancer ngrok

```powershell
.\ngrok.exe http 3000
```

Vous obtiendrez une URL comme : `https://abc123.ngrok.io`

### 5. Mettre à jour la configuration

1. **Backend** - Modifiez `backend/.env` :
   ```
   QR_CODE_BASE_URL="https://abc123.ngrok.io/guide"
   ```

2. **Redémarrez le backend**

3. **Mettez à jour le QR code** de votre livret

## Alternative : Utiliser localhost.run (sans inscription)

Si vous ne voulez pas créer de compte, vous pouvez utiliser `localhost.run` :

```powershell
# Installation (une seule fois)
ssh -R 80:localhost:3000 serveo.net
```

Mais ngrok est plus simple et plus fiable.
