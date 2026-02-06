'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction - Next.js supporte les imports JSON
// Langues activées : FR, EN, ES, DE, IT, NL, PT, ZH
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import pt from './locales/pt.json';
import zh from './locales/zh.json';
// Temporairement désactivé pour tester
// import ru from './locales/ru.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  nl: { translation: nl },
  pt: { translation: pt },
  zh: { translation: zh },
  // Temporairement désactivé pour tester
  // ru: { translation: ru },
};

// Initialiser uniquement côté client
if (typeof window !== 'undefined') {
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'fr',
        debug: false,
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
        },
      });
  }
}

export default i18n;
