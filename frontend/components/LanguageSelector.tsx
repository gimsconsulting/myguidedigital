'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';

// Langues activées : FR, EN, ES, DE, IT, NL, PT, ZH
const languages = [
  { code: 'fr', name: 'Français', countryCode: 'fr' },
  { code: 'en', name: 'English', countryCode: 'gb' },
  { code: 'es', name: 'Español', countryCode: 'es' },
  { code: 'de', name: 'Deutsch', countryCode: 'de' },
  { code: 'it', name: 'Italiano', countryCode: 'it' },
  { code: 'nl', name: 'Nederlands', countryCode: 'nl' },
  { code: 'pt', name: 'Português', countryCode: 'pt' },
  { code: 'zh', name: '中文', countryCode: 'cn' },
  // Temporairement désactivé pour tester
  // { code: 'ru', name: 'Русский', countryCode: 'ru' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Utiliser directement i18n.language sans état local pour éviter les re-renders
  const currentLanguage = languages.find(lang => lang.code === (i18n.language || 'fr')) || languages[0];

  const changeLanguage = async (langCode: string) => {
    try {
      setIsOpen(false);
      await i18n.changeLanguage(langCode);
      // Forcer un re-render en déclenchant un événement personnalisé
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('languagechange'));
      }
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        aria-label="Changer la langue"
      >
        <div className="w-5 h-4 flex items-center justify-center rounded overflow-hidden border border-gray-300">
          <img
            src={`https://flagcdn.com/w20/${currentLanguage.countryCode}.png`}
            alt={currentLanguage.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'text-sm';
                emojiSpan.textContent = '🇫🇷';
                parent.appendChild(emojiSpan);
              }
            }}
          />
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">{currentLanguage.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                    (i18n.language || 'fr') === lang.code ? 'bg-primary/10 text-primary font-medium' : ''
                  }`}
                >
                  <div className="w-6 h-4 flex items-center justify-center rounded overflow-hidden border border-gray-300 flex-shrink-0">
                    <img
                      src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                      alt={lang.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const emojiSpan = document.createElement('span');
                          emojiSpan.className = 'text-sm';
                          emojiSpan.textContent = '🇫🇷';
                          parent.appendChild(emojiSpan);
                        }
                      }}
                    />
                  </div>
                  <span className="text-sm flex-1">{lang.code.toUpperCase()} {lang.name}</span>
                  {(i18n.language || 'fr') === lang.code && (
                    <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
