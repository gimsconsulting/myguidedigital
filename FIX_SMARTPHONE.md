# Solution pour smartphone - ERR_CONNECTION_FAILED

## ✅ État actuel
- ✅ PC : Les liens fonctionnent (`http://192.168.0.126:3000`)
- ❌ Smartphone : ERR_CONNECTION_FAILED

## 🔍 Causes possibles

### 1. Réseau différent
**Le plus probable** : Votre smartphone n'est pas sur le même réseau Wi-Fi que votre PC.

**Solution :**
- Vérifiez que votre smartphone est connecté au **même Wi-Fi** que votre PC
- Si votre smartphone est en 4G/5G, ça ne fonctionnera pas

### 2. Isolation des clients Wi-Fi
Certains routeurs isolent les appareils entre eux (fonction "Isolation des clients" ou "AP Isolation").

**Solution :**
- Accédez à l'interface de votre routeur (généralement `192.168.1.1` ou `192.168.0.1`)
- Désactivez "Isolation des clients" ou "AP Isolation"
- Redémarrez le routeur

### 3. Firewall du smartphone
Certains smartphones ont un firewall ou une protection qui bloque les connexions locales.

**Solution :**
- Vérifiez les paramètres de sécurité de votre smartphone
- Désactivez temporairement le VPN si vous en avez un

## 🚀 Solution recommandée : ngrok

La solution la plus simple et fiable est d'utiliser **ngrok** qui crée un tunnel public.

### Installation

1. Téléchargez ngrok : https://ngrok.com/download
2. Extrayez `ngrok.exe` (ex: dans `C:\ngrok\`)

### Utilisation

1. Ouvrez un **nouveau terminal PowerShell**
2. Exécutez :
   ```powershell
   cd C:\ngrok
   .\ngrok.exe http 3000
   ```

3. Vous verrez quelque chose comme :
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

4. Copiez l'URL `https://abc123.ngrok.io`

### Configuration

1. **Modifiez `backend/.env`** :
   ```
   QR_CODE_BASE_URL="https://abc123.ngrok.io/guide"
   ```
   (Remplacez par votre URL ngrok)

2. **Redémarrez le backend** :
   ```bash
   cd backend
   npm run dev
   ```

3. **Mettez à jour le QR code** :
   - Allez dans votre livret
   - Cliquez sur "Mettre à jour le QR code"
   - Le QR code pointera vers l'URL ngrok

4. **Testez** : L'URL ngrok fonctionnera depuis n'importe quel réseau (Wi-Fi, 4G, etc.) !

## ⚠️ Important pour ngrok

- L'URL change à chaque fois que vous redémarrez ngrok
- Pour garder la même URL, créez un compte gratuit sur ngrok.com
- ngrok est parfait pour le développement et les tests

## 📱 Test rapide

Avant d'utiliser ngrok, testez depuis votre smartphone :
1. Assurez-vous d'être sur le **même Wi-Fi** que votre PC
2. Ouvrez un navigateur sur le smartphone
3. Allez sur : `http://192.168.0.126:3000`
4. Si ça fonctionne → Le QR code devrait fonctionner aussi
5. Si ERR_CONNECTION_FAILED → Utilisez ngrok
