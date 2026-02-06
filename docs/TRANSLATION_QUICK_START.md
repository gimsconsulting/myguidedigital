# 🚀 Guide Rapide : Intégration de la Traduction

## ✅ Ce qui a été créé

1. **Configuration i18next** : Système de traduction pour l'interface utilisateur
2. **Fichiers de traduction** : 9 langues (fr, en, de, it, es, pt, zh, ru, nl)
3. **API de traduction** : Route backend pour traduire le contenu dynamique
4. **Service de traduction** : Fonctions utilitaires pour traduire le contenu
5. **Sélecteur de langue** : Composant React pour changer la langue

## 📝 Étapes pour activer la traduction

### 1. Intégrer le sélecteur de langue dans le Layout

Ajoutez le sélecteur de langue dans votre navigation :

```tsx
// frontend/components/Layout.tsx
import LanguageSelector from '@/components/LanguageSelector';

// Dans votre navigation
<LanguageSelector />
```

### 2. Utiliser les traductions dans vos composants

**Exemple :**

```tsx
'use client';

import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 3. Configurer une vraie API de traduction (Optionnel mais recommandé)

**Option A : DeepL (Recommandé - Gratuit jusqu'à 500k caractères/mois)**

1. Créer un compte sur https://www.deepl.com/pro-api
2. Obtenir votre clé API
3. Ajouter dans `backend/.env` :
```
DEEPL_API_KEY=votre-cle-api
```

4. Modifier `backend/src/routes/translate.ts` pour utiliser DeepL (voir le guide complet)

**Option B : Google Translate**

1. Créer un projet Google Cloud
2. Activer l'API Cloud Translation
3. Installer : `npm install @google-cloud/translate`
4. Configurer dans `backend/.env`

### 4. Traduire le contenu des livrets automatiquement

Quand un utilisateur crée/modifie un livret, vous pouvez traduire automatiquement :

```tsx
import { translationService } from '@/lib/translations';

// Traduire le contenu dans toutes les langues sélectionnées
const translations = await translationService.translateLivretContent(
  {
    welcomeTitle: livret.welcomeTitle,
    welcomeSubtitle: livret.welcomeSubtitle,
    address: livret.address,
  },
  'fr', // Langue source
  ['en', 'de', 'es'] // Langues cibles
);
```

## 🎯 Prochaines actions recommandées

1. **Ajouter le sélecteur de langue** dans le Layout
2. **Remplacer les textes en dur** par des appels à `t()` dans vos composants
3. **Configurer DeepL ou Google Translate** pour la traduction automatique
4. **Tester** en changeant la langue dans l'interface

## 📚 Documentation complète

Voir `docs/TRANSLATION_SETUP.md` pour le guide complet avec tous les détails.
