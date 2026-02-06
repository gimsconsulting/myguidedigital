'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
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

// Initialiser i18n une seule fois - de manière synchrone si possible
if (!i18n.isInitialized) {
  try {
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
          order: typeof window !== 'undefined' ? ['localStorage', 'navigator', 'htmlTag'] : ['htmlTag'],
          caches: typeof window !== 'undefined' ? ['localStorage'] : [],
        },
        react: {
          useSuspense: false,
          // Réduire les événements qui déclenchent des re-renders
          bindI18n: 'languageChanged loaded',
          bindI18nStore: 'added removed',
        },
        // Fallback pour les langues
        fallbackLng: {
          default: ['fr'],
          'es': ['fr', 'en'],
          'de': ['fr', 'en'],
          'it': ['fr', 'en'],
          'nl': ['fr', 'en'],
          'pt': ['fr', 'en'],
          'zh': ['en', 'fr'],
        },
        // Initialisation immédiate et synchrone
        initImmediate: true,
        lng: typeof window !== 'undefined' ? undefined : 'fr', // Forcer 'fr' côté serveur
        // S'assurer que i18n est marqué comme prêt
        load: 'languageOnly',
      });
    
    // Mettre à jour l'attribut lang au démarrage (côté client uniquement)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language || 'fr';
      
      // Écouter les changements de langue pour mettre à jour l'attribut lang du HTML
      i18n.on('languageChanged', (lng) => {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lng;
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de i18n:', error);
  }
}

// Exporter l'instance i18n
export const i18nInstance = i18n;

// Composant Provider - Utiliser React.createElement pour éviter les problèmes de parsing
export function I18nProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(I18nextProvider, { i18n: i18nInstance }, children);
}
