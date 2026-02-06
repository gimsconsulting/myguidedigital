# 🎯 Guide Pratique : Intégration de la Traduction - Étape par Étape

## ✅ Étape 1 : Vérifier que le sélecteur de langue est intégré

### 1.1 Vérification automatique

Le sélecteur de langue a déjà été ajouté dans `frontend/components/Layout.tsx`. 

**Pour vérifier :**
1. Ouvrez votre application dans le navigateur
2. Connectez-vous à votre compte
3. Regardez en haut à droite de la navigation
4. Vous devriez voir un drapeau 🇫🇷 avec un menu déroulant

### 1.2 Si le sélecteur n'apparaît pas

Vérifiez que le fichier `frontend/components/Layout.tsx` contient bien :

```tsx
import LanguageSelector from './LanguageSelector';
```

Et que `<LanguageSelector />` est présent dans la navigation (lignes ~94 et ~160).

---

## ✅ Étape 2 : Tester le changement de langue

### 2.1 Test simple

1. Cliquez sur le drapeau 🇫🇷 dans la navigation
2. Sélectionnez une autre langue (par exemple 🇬🇧 English)
3. Observez si l'interface change

**Note :** Pour l'instant, seuls les textes traduits avec `t()` changeront. Les textes en dur ne changeront pas encore.

---

## ✅ Étape 3 : Traduire un premier composant (Exemple : Dashboard)

### 3.1 Ouvrir le fichier Dashboard

Ouvrez : `frontend/app/dashboard/page.tsx`

### 3.2 Vérifier l'import

Vérifiez que cette ligne est présente en haut du fichier :

```tsx
import { useTranslation } from 'react-i18next';
```

### 3.3 Vérifier le hook

Vérifiez que dans la fonction `DashboardPage()`, vous avez :

```tsx
const { t } = useTranslation();
```

### 3.4 Remplacer les textes

Trouvez ces lignes dans le fichier :

**Ligne ~100 :**
```tsx
<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Livrets</h1>
```

**Remplacez par :**
```tsx
<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.myBooklets')}</h1>
```

**Ligne ~106 :**
```tsx
+ Créer un livret
```

**Remplacez par :**
```tsx
+ {t('dashboard.createBooklet')}
```

**Ligne ~132 :**
```tsx
<p className="text-gray-600 mb-4">Aucun livret créé pour le moment</p>
```

**Remplacez par :**
```tsx
<p className="text-gray-600 mb-4">{t('dashboard.noBooklets')}</p>
```

**Ligne ~134 :**
```tsx
Créer votre premier livret
```

**Remplacez par :**
```tsx
{t('dashboard.createBooklet')}
```

### 3.5 Tester

1. Sauvegardez le fichier
2. Rafraîchissez votre navigateur
3. Changez la langue avec le sélecteur
4. Les textes que vous avez modifiés devraient changer !

---

## ✅ Étape 4 : Configurer DeepL API pour la traduction automatique

### 4.1 Créer un compte DeepL (5 minutes)

1. **Allez sur** : https://www.deepl.com/pro-api
2. **Cliquez sur** "Sign up" (Inscription) en haut à droite
3. **Remplissez le formulaire** :
   - Email
   - Mot de passe
   - Acceptez les conditions
4. **Vérifiez votre email** : Cliquez sur le lien dans l'email reçu
5. **Connectez-vous** sur https://www.deepl.com/pro-api
6. **Allez dans** "Account" (Compte) → "API keys" (Clés API)
7. **Copiez votre clé API** (elle ressemble à : `abc123def456-...`)

### 4.2 Ajouter la clé dans le backend

1. **Ouvrez** le fichier `backend/.env`
2. **Ajoutez** cette ligne (remplacez par votre vraie clé) :

```
DEEPL_API_KEY=votre-cle-api-deepl-ici
```

**Exemple :**
```
DEEPL_API_KEY=abc123def456-7890-ghij-klmn-opqrstuvwxyz
```

3. **Sauvegardez** le fichier

### 4.3 Installer axios dans le backend

Ouvrez un terminal dans le dossier `backend` et exécutez :

```powershell
cd backend
npm install axios
```

### 4.4 Modifier le fichier de traduction

1. **Ouvrez** le fichier : `backend/src/routes/translate.ts`

2. **Trouvez** cette section (vers la ligne 15) :

```typescript
class TranslationService {
  // Pour l'instant, on simule la traduction
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // Simulation - À REMPLACER par une vraie API
    return `[${targetLang.toUpperCase()}] ${text}`;
  }
}
```

3. **Remplacez** par ce code :

```typescript
import axios from 'axios';

class TranslationService {
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    if (sourceLang === targetLang) {
      return text;
    }

    // Vérifier que la clé API est configurée
    if (!process.env.DEEPL_API_KEY) {
      console.warn('DEEPL_API_KEY non configurée, retour du texte original');
      return text;
    }

    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        {
          text: [text],
          source_lang: sourceLang.toUpperCase(),
          target_lang: targetLang.toUpperCase(),
        },
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data.translations[0].text;
    } catch (error: any) {
      console.error('Erreur DeepL:', error.response?.data || error.message);
      // En cas d'erreur, retourner le texte original
      return text;
    }
  }
}
```

4. **Ajoutez** l'import en haut du fichier (si ce n'est pas déjà fait) :

```typescript
import axios from 'axios';
```

### 4.5 Redémarrer le backend

1. **Arrêtez** le serveur backend (Ctrl+C dans le terminal)
2. **Redémarrez-le** :

```powershell
cd backend
npm run dev
```

### 4.6 Tester la traduction API

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

## ✅ Étape 5 : Traduire automatiquement le contenu d'un livret

### 5.1 Ajouter un bouton de traduction

Ouvrez : `frontend/app/dashboard/livrets/[id]/page.tsx`

#### 5.1.1 Ajouter l'import

En haut du fichier, ajoutez :

```tsx
import { translationService } from '@/lib/translations';
```

#### 5.1.2 Créer la fonction de traduction

Dans votre composant, ajoutez cette fonction (après `handleLanguageToggle`) :

```tsx
const handleAutoTranslate = async () => {
  try {
    // Récupérer les langues sélectionnées (sauf le français)
    const targetLanguages = formData.languages.filter(lang => lang !== 'fr');
    
    if (targetLanguages.length === 0) {
      toast.info('Sélectionnez au moins une langue autre que le français');
      return;
    }

    toast.info('Traduction en cours...');

    // Traduire le titre
    if (formData.welcomeTitle) {
      const translations = await Promise.all(
        targetLanguages.map(lang => 
          translationService.translateText(formData.welcomeTitle, 'fr', lang)
        )
      );
      
      console.log('Traductions du titre:', translations);
      toast.success(`Traduit dans ${targetLanguages.length} langue(s)`);
    }

    // Traduire le sous-titre
    if (formData.welcomeSubtitle) {
      const translations = await Promise.all(
        targetLanguages.map(lang => 
          translationService.translateText(formData.welcomeSubtitle, 'fr', lang)
        )
      );
      
      console.log('Traductions du sous-titre:', translations);
    }
  } catch (error) {
    toast.error('Erreur lors de la traduction');
    console.error(error);
  }
};
```

#### 5.1.3 Ajouter le bouton

Dans la section "Langues du livret", ajoutez un bouton après les checkboxes :

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Langues du livret
  </label>
  <div className="flex flex-wrap gap-4 mb-2">
    {/* ... checkboxes existantes ... */}
  </div>
  
  {/* Ajouter ce bouton */}
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={handleAutoTranslate}
    className="mt-2"
  >
    Traduire automatiquement le contenu
  </Button>
  
  <p className="text-sm text-gray-500 mt-2">
    Nous vous offrons la possibilité de traduire automatiquement chaque champ dans les langues que vous aurez sélectionnées.
  </p>
</div>
```

### 5.2 Tester la traduction automatique

1. **Ouvrez** un livret dans votre dashboard
2. **Saisissez** un titre et sous-titre en français
3. **Sélectionnez** d'autres langues (ex: 🇬🇧 English, 🇩🇪 Deutsch)
4. **Cliquez** sur "Traduire automatiquement le contenu"
5. **Vérifiez** la console du navigateur (F12) pour voir les traductions

---

## 📝 Résumé des fichiers modifiés

### Fichiers déjà modifiés (automatique) :
- ✅ `frontend/components/Layout.tsx` - Sélecteur de langue ajouté
- ✅ `frontend/app/dashboard/page.tsx` - Hook useTranslation ajouté
- ✅ `frontend/i18n/client.ts` - Configuration i18next
- ✅ `frontend/i18n/locales/*.json` - Fichiers de traduction créés
- ✅ `backend/src/routes/translate.ts` - Route API créée

### Fichiers à modifier manuellement :
- ⚠️ `backend/.env` - Ajouter `DEEPL_API_KEY=votre-cle`
- ⚠️ `backend/src/routes/translate.ts` - Remplacer la simulation par DeepL
- ⚠️ `frontend/app/dashboard/livrets/[id]/page.tsx` - Ajouter le bouton de traduction

---

## 🎯 Checklist finale

- [ ] Sélecteur de langue visible dans la navigation
- [ ] Changement de langue fonctionne
- [ ] Au moins 3 textes traduits avec `t()` dans Dashboard
- [ ] Compte DeepL créé
- [ ] Clé API DeepL ajoutée dans `backend/.env`
- [ ] Backend modifié pour utiliser DeepL
- [ ] Backend redémarré
- [ ] Test de traduction API réussi
- [ ] Bouton de traduction ajouté dans l'édition du livret
- [ ] Traduction automatique testée et fonctionnelle

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. **Vérifiez les logs du backend** dans le terminal
2. **Vérifiez la console du navigateur** (F12)
3. **Vérifiez que la clé API DeepL est correcte** dans `.env`
4. **Vérifiez que le backend a été redémarré** après les modifications
