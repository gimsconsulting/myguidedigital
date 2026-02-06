# 🌐 Configuration Google Translate API

## 📋 Étape 1 : Créer un projet Google Cloud et activer l'API

### 1.1 Créer un compte Google Cloud

1. Allez sur https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Sélectionner un projet" → "Nouveau projet"
4. Donnez un nom à votre projet (ex: "Moovy Translations")
5. Cliquez sur "Créer"

### 1.2 Activer l'API Cloud Translation

1. Dans le menu de gauche, allez dans **"APIs & Services"** → **"Library"**
2. Recherchez **"Cloud Translation API"**
3. Cliquez sur le résultat
4. Cliquez sur **"Enable"** (Activer)

### 1.3 Créer une clé API

1. Allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** → **"API key"**
3. Une clé API sera générée automatiquement
4. **Copiez cette clé** (elle ressemble à : `AIzaSy...`)
5. **Important** : Cliquez sur "Restrict key" pour limiter l'utilisation :
   - Dans "API restrictions", sélectionnez "Restrict key"
   - Cochez uniquement "Cloud Translation API"
   - Cliquez sur "Save"

### 1.4 Activer la facturation (nécessaire pour Google Translate)

⚠️ **Important** : Google Translate API nécessite une carte de crédit, mais offre 500 000 caractères gratuits par mois.

1. Allez dans **"Billing"** (Facturation)
2. Cliquez sur **"Link a billing account"**
3. Ajoutez votre carte de crédit
4. Google vous facturera seulement si vous dépassez les 500k caractères/mois

---

## 📋 Étape 2 : Installer le package Google Cloud Translate

Dans le terminal, dans le dossier `backend` :

```powershell
cd backend
npm install @google-cloud/translate
```

---

## 📋 Étape 3 : Configurer la clé API dans le backend

### 3.1 Ajouter la clé dans .env

Ouvrez `backend/.env` et ajoutez :

```
GOOGLE_TRANSLATE_API_KEY=votre-cle-api-google-ici
```

**Exemple :**
```
GOOGLE_TRANSLATE_API_KEY=AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr
```

### 3.2 Modifier le fichier de traduction

Ouvrez `backend/src/routes/translate.ts` et remplacez le code par celui ci-dessous.

---

## 📋 Étape 4 : Code pour Google Translate API

Voici le code complet à mettre dans `backend/src/routes/translate.ts` :

```typescript
import express from 'express';
import { authenticateToken } from './auth';
import { Translate } from '@google-cloud/translate/build/src/v2';

const router = express.Router();

// Initialiser le client Google Translate
let translate: Translate | null = null;

if (process.env.GOOGLE_TRANSLATE_API_KEY) {
  translate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY,
  });
} else {
  console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non configurée dans .env');
}

class TranslationService {
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    if (sourceLang === targetLang) {
      return text;
    }

    // Si Google Translate n'est pas configuré, retourner le texte original
    if (!translate) {
      console.warn('Google Translate non configuré, retour du texte original');
      return text;
    }

    try {
      // Google Translate utilise des codes de langue en 2 lettres
      const [translation] = await translate.translate(text, {
        from: sourceLang,
        to: targetLang,
      });
      
      return translation;
    } catch (error: any) {
      console.error('Erreur Google Translate:', error.message);
      // En cas d'erreur, retourner le texte original
      return text;
    }
  }

  async translateBatch(texts: string[], sourceLang: string, targetLang: string): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    if (sourceLang === targetLang) {
      return texts;
    }

    if (!translate) {
      console.warn('Google Translate non configuré, retour des textes originaux');
      return texts;
    }

    try {
      const [translations] = await translate.translate(texts, {
        from: sourceLang,
        to: targetLang,
      });
      
      // Google Translate retourne toujours un tableau
      return Array.isArray(translations) ? translations : [translations];
    } catch (error: any) {
      console.error('Erreur Google Translate (batch):', error.message);
      return texts;
    }
  }
}

const translationService = new TranslationService();

// Route pour traduire un texte
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { text, sourceLang = 'fr', targetLang = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Le texte à traduire est requis' });
    }

    if (!sourceLang || !targetLang) {
      return res.status(400).json({ message: 'Les langues source et cible sont requises' });
    }

    const translatedText = await translationService.translate(text, sourceLang, targetLang);

    res.json({
      translatedText,
      sourceLang,
      targetLang,
    });
  } catch (error: any) {
    console.error('Erreur lors de la traduction:', error);
    res.status(500).json({ message: 'Erreur lors de la traduction' });
  }
});

// Route pour traduire plusieurs textes en une seule requête
router.post('/batch', authenticateToken, async (req: any, res) => {
  try {
    const { texts, sourceLang = 'fr', targetLang = 'en' } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({ message: 'Les textes doivent être un tableau' });
    }

    if (!sourceLang || !targetLang) {
      return res.status(400).json({ message: 'Les langues source et cible sont requises' });
    }

    const translations = await translationService.translateBatch(texts, sourceLang, targetLang);

    res.json({
      translations,
      sourceLang,
      targetLang,
    });
  } catch (error: any) {
    console.error('Erreur lors de la traduction multiple:', error);
    res.status(500).json({ message: 'Erreur lors de la traduction multiple' });
  }
});

export default router;
```

---

## 📋 Étape 5 : Redémarrer le backend

1. Arrêtez le serveur backend (Ctrl+C)
2. Redémarrez-le :

```powershell
cd backend
npm run dev
```

---

## 📋 Étape 6 : Tester la traduction

Vous pouvez tester depuis la console du navigateur :

```javascript
// Dans la console du navigateur (F12)
fetch('http://localhost:3001/api/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer VOTRE_TOKEN_JWT'
  },
  body: JSON.stringify({
    text: 'Bonjour',
    sourceLang: 'fr',
    targetLang: 'en'
  })
})
.then(r => r.json())
.then(console.log);
```

**Résultat attendu :** `{ translatedText: "Hello", sourceLang: "fr", targetLang: "en" }`

---

## 💰 Coûts Google Translate API

- **Gratuit** : 500 000 caractères par mois
- **Payant** : 
  - 0-500k caractères : Gratuit
  - Au-delà : ~$20 par million de caractères

**Comparaison avec DeepL :**
- DeepL : 500k caractères gratuits/mois, meilleure qualité
- Google Translate : 500k caractères gratuits/mois, plus rapide, supporte plus de langues

---

## 🔄 Changer entre DeepL et Google Translate

Si vous voulez basculer entre les deux APIs, vous pouvez :

1. **Garder les deux clés** dans `.env` :
```
DEEPL_API_KEY=votre-cle-deepl
GOOGLE_TRANSLATE_API_KEY=votre-cle-google
```

2. **Modifier le code** pour choisir quelle API utiliser selon la disponibilité

Ou simplement remplacer le code dans `translate.ts` selon l'API que vous préférez utiliser.

---

## ✅ Checklist

- [ ] Compte Google Cloud créé
- [ ] Projet créé dans Google Cloud
- [ ] Cloud Translation API activée
- [ ] Clé API créée et restreinte
- [ ] Facturation activée (carte de crédit ajoutée)
- [ ] Package `@google-cloud/translate` installé
- [ ] Clé API ajoutée dans `backend/.env`
- [ ] Code modifié dans `backend/src/routes/translate.ts`
- [ ] Backend redémarré
- [ ] Test de traduction réussi

---

## 🆘 Dépannage

### Erreur "API key not valid"

- Vérifiez que la clé API est correcte dans `.env`
- Vérifiez que la clé n'est pas restreinte à un autre projet
- Vérifiez que Cloud Translation API est bien activée

### Erreur "Billing account required"

- Vous devez activer la facturation même pour le quota gratuit
- Ajoutez une carte de crédit dans Google Cloud Console

### Erreur "Quota exceeded"

- Vous avez dépassé les 500k caractères gratuits
- Vérifiez votre utilisation dans Google Cloud Console
- Ou passez à DeepL qui offre aussi 500k gratuits
