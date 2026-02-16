'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,     // Toujours actif
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait son choix
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Petit délai pour un affichage élégant
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto">
        {/* Glow effect */}
        <div className="absolute inset-0 max-w-4xl mx-auto bg-gradient-to-r from-primary/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>

        <div className="relative bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Bande gradient en haut */}
          <div className="h-1 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>

          <div className="p-5 sm:p-6">
            {/* En-tête */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🍪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Nous respectons votre vie privée
                </h3>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience de navigation, 
                  analyser le trafic du site et personnaliser le contenu. 
                  Vous pouvez choisir les cookies que vous acceptez.{' '}
                  <Link href="/cookies" className="text-pink-400 hover:text-pink-300 underline underline-offset-2 transition-colors">
                    Politique de cookies
                  </Link>
                </p>
              </div>
            </div>

            {/* Détails des cookies (accordéon) */}
            {showDetails && (
              <div className="mb-5 space-y-3 animate-fade-in">
                {/* Cookie nécessaire */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="text-sm">🔒</span>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-semibold">Cookies nécessaires</p>
                        <p className="text-white/40 text-xs mt-0.5">Essentiels au fonctionnement du site (authentification, sécurité, préférences)</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Toujours actif
                    </span>
                  </div>
                </div>

                {/* Cookie analytique */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-sm">📊</span>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-semibold">Cookies analytiques</p>
                        <p className="text-white/40 text-xs mt-0.5">Nous aident à comprendre comment vous utilisez le site (Google Analytics)</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/70 after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                </div>

                {/* Cookie marketing */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <span className="text-sm">📢</span>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-semibold">Cookies marketing</p>
                        <p className="text-white/40 text-xs mt-0.5">Utilisés pour diffuser des publicités pertinentes et mesurer leur efficacité</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/70 after:border-white/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-pink-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Bouton personnaliser */}
              <button
                onClick={() => {
                  if (showDetails) {
                    handleSavePreferences();
                  } else {
                    setShowDetails(true);
                  }
                }}
                className="order-3 sm:order-1 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                {showDetails ? '✓ Enregistrer mes préférences' : '⚙️ Personnaliser'}
              </button>

              {/* Bouton refuser */}
              <button
                onClick={handleRejectAll}
                className="order-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                Refuser tout
              </button>

              {/* Bouton accepter */}
              <button
                onClick={handleAcceptAll}
                className="order-1 sm:order-3 sm:ml-auto relative group px-6 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <span className="relative">✓ Accepter tout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
