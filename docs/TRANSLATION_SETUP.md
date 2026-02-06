# 🌍 Guide de Configuration de la Traduction Automatique

Ce guide explique comment intégrer la traduction automatique dans toute l'application Moovy.

## 📋 Vue d'ensemble

Le système de traduction comprend deux parties :

1. **Traductions statiques de l'interface** : Utilise `i18next` pour traduire les textes de l'interface utilisateur (boutons, labels, messages, etc.)
2. **Traduction automatique du contenu dynamique** : Utilise une API de traduction (Google Translate, DeepL, etc.) pour traduire le contenu des livrets et modules

## 🚀 Installation

### 1. Dépendances déjà installées

Les packages suivants sont déjà installés :
- `i18next` : Bibliothèque de traduction
- `react-i18next` : Intégration React pour i18next
- `i18next-browser-languagedetector` : Détection automatique de la langue du navigateur

### 2. Structure des fichiers créés

```
frontend/
├── i18n/
│   ├── config.ts              # Configuration i18next
│   ├── client.ts              # Provider React pour i18next
│   └── locales/
│       ├── fr.json            # Traductions françaises
│       ├── en.json            # Traductions anglaises
│       ├── de.json            # Traductions allemandes
│       ├── it.json            # Traductions italiennes
│       ├── es.json            # Traductions espagnoles
│       ├── pt.json            # Traductions portugaises
│       ├── zh.json            # Traductions chinoises
│       ├── ru.json            # Traductions russes
│       └── nl.json            # Traductions néerlandaises
├── lib/
│   └── translations.ts        # Service de traduction automatique
└── components/
    └── LanguageSelector.tsx   # Composant sélecteur de langue

backend/
└── src/
    └── routes/
        └── translate.ts       # API de traduction automatique
```

## 🔧 Configuration

### 1. Configuration i18next (Frontend)

Le fichier `frontend/i18n/config.ts` configure i18next avec :
- Détection automatique de la langue du navigateur
- Sauvegarde de la langue dans `localStorage`
- Fallback vers le français si la langue n'est pas supportée

### 2. Intégration dans les composants

#### Utiliser les traductions statiques

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

#### Utiliser le sélecteur de langue

```tsx
import LanguageSelector from '@/components/LanguageSelector';

function Header() {
  return (
    <header>
      <LanguageSelector />
    </header>
  );
}
```

#### Traduire du contenu dynamique

```tsx
import { translationService } from '@/lib/translations';

async function translateContent() {
  const translated = await translationService.translateText(
    'Bonjour',
    'fr',
    'en'
  );
  console.log(translated); // "Hello"
}
```

### 3. Configuration de l'API de traduction (Backend)

Le fichier `backend/src/routes/translate.ts` contient une structure pour intégrer une vraie API de traduction.

#### Option 1 : Google Translate API

1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Activer l'API Cloud Translation
3. Créer une clé API
4. Installer le package :
```bash
cd backend
npm install @google-cloud/translate
```

5. Modifier `backend/src/routes/translate.ts` :
```typescript
import { Translate } from '@google-cloud/translate/build/src/v2';

const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const [translation] = await translate.translate(text, {
    from: sourceLang,
    to: targetLang,
  });
  return translation;
}
```

6. Ajouter dans `backend/.env` :
```
GOOGLE_TRANSLATE_API_KEY=votre-cle-api
GOOGLE_CLOUD_PROJECT_ID=votre-project-id
```

#### Option 2 : DeepL API (Recommandé pour la qualité)

1. Créer un compte sur [DeepL](https://www.deepl.com/pro-api)
2. Obtenir une clé API gratuite (500 000 caractères/mois)
3. Installer axios :
```bash
cd backend
npm install axios
```

4. Modifier `backend/src/routes/translate.ts` :
```typescript
import axios from 'axios';

async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
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
}
```

5. Ajouter dans `backend/.env` :
```
DEEPL_API_KEY=votre-cle-api-deepl
```

## 📝 Utilisation dans l'application

### 1. Traduire l'interface utilisateur

Tous les textes de l'interface doivent utiliser `t()` au lieu de texte en dur :

**Avant :**
```tsx
<button>Enregistrer</button>
```

**Après :**
```tsx
const { t } = useTranslation();
<button>{t('common.save')}</button>
```

### 2. Traduire le contenu des livrets

Quand un utilisateur crée ou modifie un livret, le système peut automatiquement traduire le contenu dans les langues sélectionnées :

```tsx
import { translationService } from '@/lib/translations';

const translations = await translationService.translateLivretContent(
  {
    welcomeTitle: 'Bienvenue',
    welcomeSubtitle: 'Accédez à notre guide',
    address: '123 Rue Example',
  },
  'fr',
  ['en', 'de', 'es']
);
```

### 3. Ajouter de nouvelles traductions

Pour ajouter une nouvelle clé de traduction :

1. Ajouter la clé dans tous les fichiers `frontend/i18n/locales/*.json`
2. Utiliser la clé dans vos composants avec `t('namespace.key')`

Exemple :
```json
// fr.json
{
  "newFeature": {
    "title": "Nouvelle fonctionnalité",
    "description": "Description de la nouvelle fonctionnalité"
  }
}
```

```tsx
const { t } = useTranslation();
<h1>{t('newFeature.title')}</h1>
```

## 🎯 Prochaines étapes

1. **Intégrer une vraie API de traduction** :
   - Choisir entre Google Translate API ou DeepL API
   - Configurer les clés API dans `.env`
   - Modifier `backend/src/routes/translate.ts`

2. **Traduire tous les composants existants** :
   - Remplacer tous les textes en dur par des appels à `t()`
   - Ajouter les traductions manquantes dans les fichiers JSON

3. **Ajouter le sélecteur de langue** :
   - Intégrer `<LanguageSelector />` dans le Layout
   - Ajouter dans la navigation principale

4. **Traduction automatique du contenu** :
   - Implémenter la traduction automatique lors de la création/modification des livrets
   - Sauvegarder les traductions dans la base de données

## 📚 Ressources

- [Documentation i18next](https://www.i18next.com/)
- [Documentation react-i18next](https://react.i18next.com/)
- [Google Translate API](https://cloud.google.com/translate/docs)
- [DeepL API](https://www.deepl.com/docs-api)

## ⚠️ Notes importantes

- **Coûts** : Les APIs de traduction peuvent avoir des coûts. DeepL offre 500 000 caractères gratuits par mois.
- **Qualité** : DeepL offre généralement une meilleure qualité de traduction que Google Translate.
- **Performance** : Mettre en cache les traductions pour éviter les appels API répétés.
- **Fallback** : Toujours prévoir un fallback vers la langue source en cas d'erreur de traduction.
