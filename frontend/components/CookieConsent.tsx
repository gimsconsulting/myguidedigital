'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleAcceptNecessaryOnly = () => {
    const consent = {
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
                  Ce site utilise uniquement des <strong className="text-white/80">cookies strictement nécessaires</strong> au 
                  fonctionnement du service (authentification, session, sécurité, préférences de langue). 
                  Aucun cookie analytics ou marketing n&apos;est déposé.{' '}
                  <Link href="/cookies" className="text-pink-400 hover:text-pink-300 underline underline-offset-2 transition-colors">
                    En savoir plus
                  </Link>
                </p>
              </div>
            </div>

            {/* Détails des cookies (accordéon) */}
            {showDetails && (
              <div className="mb-5 space-y-3 animate-fade-in">
                {/* Cookie nécessaire */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="text-sm">🔒</span>
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-semibold">Cookies strictement nécessaires</p>
                        <p className="text-white/40 text-xs mt-0.5">Indispensables au fonctionnement du site</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Toujours actif
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-white/40 uppercase tracking-wider">
                          <th className="text-left py-1.5 pr-3">Cookie</th>
                          <th className="text-left py-1.5 pr-3">Finalité</th>
                          <th className="text-left py-1.5">Durée</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/50">
                        <tr className="border-t border-white/5">
                          <td className="py-1.5 pr-3 font-mono text-primary/70 text-[11px]">cookie-consent</td>
                          <td className="py-1.5 pr-3">Choix cookies</td>
                          <td className="py-1.5">12 mois</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="py-1.5 pr-3 font-mono text-primary/70 text-[11px]">auth-token</td>
                          <td className="py-1.5 pr-3">Authentification</td>
                          <td className="py-1.5">Session</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="py-1.5 pr-3 font-mono text-primary/70 text-[11px]">i18nextLng</td>
                          <td className="py-1.5 pr-3">Langue</td>
                          <td className="py-1.5">12 mois</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="py-1.5 pr-3 font-mono text-primary/70 text-[11px]">csrf-token</td>
                          <td className="py-1.5 pr-3">Sécurité CSRF</td>
                          <td className="py-1.5">Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info analytics & marketing */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-sm">ℹ️</span>
                    </div>
                    <div>
                      <p className="text-white/90 text-sm font-semibold">Pas de cookies analytics ni marketing</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        My Guide Digital n&apos;utilise pas de cookies de mesure d&apos;audience ni de cookies marketing. 
                        Seuls des logs serveurs sont utilisés à des fins de sécurité et maintenance.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Liens légaux */}
                <div className="flex flex-wrap gap-3 mt-2">
                  <Link href="/mentions-legales" className="text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2">
                    Mentions légales
                  </Link>
                  <Link href="/confidentialite" className="text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2">
                    Politique de confidentialité
                  </Link>
                  <Link href="/cookies" className="text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2">
                    Politique de cookies
                  </Link>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Bouton en savoir plus */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="order-2 sm:order-1 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20 hover:bg-white/5 transition-all duration-300"
              >
                {showDetails ? '↑ Masquer les détails' : '⚙️ En savoir plus'}
              </button>

              {/* Bouton accepter */}
              <button
                onClick={handleAcceptAll}
                className="order-1 sm:order-2 sm:ml-auto relative group px-6 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <span className="relative">✓ J&apos;ai compris</span>
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
