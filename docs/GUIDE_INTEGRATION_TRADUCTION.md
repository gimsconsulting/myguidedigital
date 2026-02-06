# 📖 Guide Étape par Étape : Intégration de la Traduction

## 🎯 Objectif

Ce guide vous explique comment :
1. Intégrer le sélecteur de langue dans votre interface
2. Utiliser les traductions dans vos composants
3. Configurer une API de traduction pour le contenu dynamique

---

## 📋 Étape 1 : Intégrer le sélecteur de langue dans le Layout

### 1.1 Ouvrir le fichier Layout

Ouvrez le fichier : `frontend/components/Layout.tsx`

### 1.2 Importer le composant LanguageSelector

Ajoutez cette ligne en haut du fichier avec les autres imports :

```tsx
import LanguageSelector from '@/components/LanguageSelector';
```

### 1.3 Ajouter le sélecteur dans la navigation desktop

Trouvez la section "Desktop Navigation" (vers la ligne 54) et ajoutez le sélecteur avant le bouton "Déconnexion" :

```tsx
{/* Desktop Navigation */}
<div className="hidden md:flex items-center space-x-4">
  {/* ... autres liens ... */}
  
  {/* Ajouter ici */}
  <LanguageSelector />
  
  {user && (
    <span className="text-sm text-gray-600 hidden lg:inline">
      {user.firstName} {user.lastName}
    </span>
  )}
  <Button variant="outline" size="sm" onClick={handleLogout}>
    Déconnexion
  </Button>
</div>
```

### 1.4 Ajouter le sélecteur dans le menu mobile

Trouvez la section "Mobile Menu" (vers la ligne 116) et ajoutez-le avant le bouton "Déconnexion" :

```tsx
{/* Mobile Menu */}
{isMobileMenuOpen && (
  <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
    {/* ... autres liens ... */}
    
    {/* Ajouter ici */}
    <div className="px-3 py-2">
      <LanguageSelector />
    </div>
    
    {user && (
      <div className="px-3 py-2 text-sm text-gray-600 border-t border-gray-200 mt-2">
        {user.firstName} {user.lastName}
      </div>
    )}
    {/* ... */}
  </div>
)}
```

### 1.5 Résultat attendu

Vous devriez maintenant voir un sélecteur de langue avec un drapeau dans votre navigation, qui permet de changer la langue de l'interface.

---

## 📋 Étape 2 : Utiliser les traductions dans vos composants

### 2.1 Exemple : Traduire la page Dashboard

Ouvrez le fichier : `frontend/app/dashboard/page.tsx`

#### 2.1.1 Ajouter l'import

En haut du fichier, ajoutez :

```tsx
import { useTranslation } from 'react-i18next';
```

#### 2.1.2 Utiliser le hook dans le composant

Dans votre fonction de composant, ajoutez :

```tsx
export default function DashboardPage() {
  const { t } = useTranslation();
  
  // ... reste du code ...
}
```

#### 2.1.3 Remplacer les textes en dur

**Avant :**
```tsx
<h1 className="text-3xl font-bold text-gray-900">Mes livrets</h1>
<button>Créer un livret</button>
```

**Après :**
```tsx
<h1 className="text-3xl font-bold text-gray-900">{t('dashboard.myBooklets')}</h1>
<button>{t('dashboard.createBooklet')}</button>
```

### 2.2 Exemple : Traduire la page de login

Ouvrez le fichier : `frontend/app/login/page.tsx`

#### 2.2.1 Ajouter l'import et le hook

```tsx
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  
  // ... reste du code ...
}
```

#### 2.2.2 Remplacer les textes

**Avant :**
```tsx
<h1>Connexion</h1>
<label>Email</label>
<button>Se connecter</button>
```

**Après :**
```tsx
<h1>{t('auth.login')}</h1>
<label>{t('auth.email')}</label>
<button>{t('common.save')}</button>
```

### 2.3 Liste des clés de traduction disponibles

Voici les principales clés que vous pouvez utiliser :

**Common :**
- `t('common.save')` → "Enregistrer" / "Save"
- `t('common.cancel')` → "Annuler" / "Cancel"
- `t('common.delete')` → "Supprimer" / "Delete"
- `t('common.edit')` → "Modifier" / "Edit"

**Auth :**
- `t('auth.login')` → "Connexion" / "Login"
- `t('auth.register')` → "Inscription" / "Register"
- `t('auth.email')` → "Email"
- `t('auth.password')` → "Mot de passe" / "Password"

**Dashboard :**
- `t('dashboard.title')` → "Tableau de bord" / "Dashboard"
- `t('dashboard.myBooklets')` → "Mes livrets" / "My booklets"
- `t('dashboard.createBooklet')` → "Créer un livret" / "Create a booklet"

**Livret :**
- `t('livret.basicInfo')` → "Informations de base" / "Basic information"
- `t('livret.modules')` → "Modules d'information" / "Information modules"
- `t('livret.statistics')` → "Statistiques" / "Statistics"

---

## 📋 Étape 3 : Configurer une API de traduction (DeepL - Recommandé)

### 3.1 Créer un compte DeepL

1. Allez sur https://www.deepl.com/pro-api
2. Cliquez sur "Sign up" (Inscription)
3. Remplissez le formulaire
4. Vérifiez votre email
5. Une fois connecté, allez dans "Account" → "API keys"
6. Copiez votre clé API (gratuite jusqu'à 500 000 caractères/mois)

### 3.2 Ajouter la clé API dans le backend

Ouvrez ou créez le fichier : `backend/.env`

Ajoutez cette ligne :

```
DEEPL_API_KEY=votre-cle-api-deepl-ici
```

**⚠️ Important :** Remplacez `votre-cle-api-deepl-ici` par votre vraie clé API.

### 3.3 Installer axios dans le backend

Ouvrez un terminal dans le dossier `backend` et exécutez :

```bash
npm install axios
```

### 3.4 Modifier le fichier de traduction backend

Ouvrez le fichier : `backend/src/routes/translate.ts`

Trouvez la classe `TranslationService` et remplacez la méthode `translate` :

**Avant (simulation) :**
```typescript
async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  // Simulation - À REMPLACER par une vraie API
  return `[${targetLang.toUpperCase()}] ${text}`;
}
```

**Après (avec DeepL) :**
```typescript
import axios from 'axios';

async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }

  if (sourceLang === targetLang) {
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
```

### 3.5 Redémarrer le backend

1. Arrêtez le serveur backend (Ctrl+C)
2. Redémarrez-le :
```bash
cd backend
npm run dev
```

### 3.6 Tester la traduction

Vous pouvez tester l'API de traduction depuis votre frontend :

```tsx
import { translationService } from '@/lib/translations';

// Dans un composant
const handleTranslate = async () => {
  const translated = await translationService.translateText(
    'Bonjour',
    'fr',
    'en'
  );
  console.log(translated); // Devrait afficher "Hello"
};
```

---

## 📋 Étape 4 : Traduire automatiquement le contenu des livrets

### 4.1 Modifier la page d'édition du livret

Ouvrez le fichier : `frontend/app/dashboard/livrets/[id]/page.tsx`

#### 4.1.1 Ajouter l'import

```tsx
import { translationService } from '@/lib/translations';
```

#### 4.1.2 Créer une fonction de traduction automatique

Ajoutez cette fonction dans votre composant :

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
      // Ici, vous pouvez sauvegarder les traductions dans la base de données
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

    toast.success('Traduction terminée !');
  } catch (error) {
    toast.error('Erreur lors de la traduction');
    console.error(error);
  }
};
```

#### 4.1.3 Ajouter un bouton pour déclencher la traduction

Dans votre formulaire, ajoutez un bouton :

```tsx
<Button 
  type="button" 
  variant="outline"
  onClick={handleAutoTranslate}
>
  Traduire automatiquement dans les langues sélectionnées
</Button>
```

### 4.2 Exemple complet : Traduire tout le contenu d'un livret

```tsx
const translateLivretContent = async () => {
  const targetLanguages = formData.languages.filter(lang => lang !== 'fr');
  
  if (targetLanguages.length === 0) {
    toast.info('Sélectionnez au moins une langue autre que le français');
    return;
  }

  toast.info('Traduction en cours...');

  // Traduire tous les champs
  const translations: Record<string, any> = {};
  
  for (const lang of targetLanguages) {
    const [title, subtitle, address] = await Promise.all([
      translationService.translateText(formData.welcomeTitle || '', 'fr', lang),
      translationService.translateText(formData.welcomeSubtitle || '', 'fr', lang),
      translationService.translateText(formData.address || '', 'fr', lang),
    ]);
    
    translations[lang] = {
      welcomeTitle: title,
      welcomeSubtitle: subtitle,
      address: address,
    };
  }

  console.log('Traductions complètes:', translations);
  toast.success('Traduction terminée !');
  
  // Ici, vous pouvez sauvegarder les traductions dans la base de données
  // Par exemple, créer un champ translations dans le modèle Livret
};
```

---

## 📋 Étape 5 : Afficher le contenu traduit selon la langue sélectionnée

### 5.1 Dans l'interface publique (guide voyageur)

Ouvrez le fichier : `frontend/app/guide/[qrCode]/page.tsx`

#### 5.1.1 Ajouter le hook de traduction

```tsx
import { useTranslation } from 'react-i18next';

export default function GuidePage() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language; // 'fr', 'en', 'de', etc.
  
  // ... reste du code ...
}
```

#### 5.1.2 Afficher le contenu selon la langue

```tsx
// Si vous avez sauvegardé les traductions dans la base de données
const getTranslatedContent = (livret: any) => {
  const lang = currentLang;
  
  // Si la langue actuelle est le français, utiliser le contenu original
  if (lang === 'fr') {
    return {
      title: livret.welcomeTitle,
      subtitle: livret.welcomeSubtitle,
    };
  }
  
  // Sinon, utiliser les traductions sauvegardées
  // (vous devrez adapter selon votre structure de données)
  return {
    title: livret.translations?.[lang]?.welcomeTitle || livret.welcomeTitle,
    subtitle: livret.translations?.[lang]?.welcomeSubtitle || livret.welcomeSubtitle,
  };
};

const content = getTranslatedContent(livret);

return (
  <div>
    <h1>{content.title}</h1>
    <p>{content.subtitle}</p>
  </div>
);
```

---

## ✅ Checklist de vérification

- [ ] Sélecteur de langue ajouté dans le Layout (desktop et mobile)
- [ ] Hook `useTranslation` utilisé dans au moins un composant
- [ ] Au moins 3 textes traduits avec `t()`
- [ ] Clé API DeepL configurée dans `backend/.env`
- [ ] Méthode `translate` modifiée dans `backend/src/routes/translate.ts`
- [ ] Backend redémarré avec la nouvelle configuration
- [ ] Test de traduction effectué et fonctionnel

---

## 🐛 Dépannage

### Le sélecteur de langue ne s'affiche pas

1. Vérifiez que `LanguageSelector` est bien importé
2. Vérifiez que le composant est bien dans le Layout
3. Vérifiez la console du navigateur pour les erreurs

### Les traductions ne changent pas

1. Vérifiez que `I18nProvider` est bien dans `layout.tsx`
2. Vérifiez que les fichiers JSON de traduction existent
3. Vérifiez la console pour les erreurs de chargement

### L'API de traduction ne fonctionne pas

1. Vérifiez que `DEEPL_API_KEY` est bien dans `backend/.env`
2. Vérifiez que le backend a été redémarré
3. Vérifiez les logs du backend pour les erreurs
4. Testez avec Postman ou curl :
```bash
curl -X POST http://localhost:3001/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"text":"Bonjour","sourceLang":"fr","targetLang":"en"}'
```

---

## 📚 Ressources supplémentaires

- [Documentation i18next](https://www.i18next.com/)
- [Documentation react-i18next](https://react.i18next.com/)
- [Documentation DeepL API](https://www.deepl.com/docs-api)
- [Guide complet de traduction](./TRANSLATION_SETUP.md)
