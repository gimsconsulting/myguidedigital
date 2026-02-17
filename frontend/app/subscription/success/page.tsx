'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type'); // 'seasonal' pour les duplications saisonnières

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (sessionId) {
      // Attendre que le webhook Stripe soit traité
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setError('Session ID manquant');
      setIsLoading(false);
    }
  }, [sessionId]);

  // Countdown auto-redirect
  useEffect(() => {
    if (!isLoading && !error) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = '/dashboard';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary/10 to-pink-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vérification du paiement…</h2>
          <p className="text-gray-500 text-sm">Merci de patienter quelques instants</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de paiement</h1>
              <p className="text-gray-500 mb-6">{error}</p>
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-pink-500 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour aux abonnements
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSeasonal = type === 'seasonal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Card principale */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Bandeau supérieur vert */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

            <div className="p-8 sm:p-10 text-center">
              {/* Check animé */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Titre */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Merci pour votre paiement !
              </h1>
              <p className="text-gray-500 mb-6">
                {isSeasonal
                  ? 'Votre livret saisonnier a été créé avec succès. Il est maintenant disponible dans votre tableau de bord.'
                  : 'Votre abonnement a été activé avec succès. Profitez de toutes les fonctionnalités premium !'}
              </p>

              {/* Infos détaillées */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Paiement confirmé</p>
                    <p className="text-xs text-gray-400">Votre facture est disponible dans votre espace client</p>
                  </div>
                </div>

                {isSeasonal ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Livret saisonnier activé</p>
                      <p className="text-xs text-gray-400">+14 jours offerts inclus dans la durée</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Abonnement premium actif</p>
                      <p className="text-xs text-gray-400">Accès complet à toutes les fonctionnalités</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Facture générée</p>
                    <p className="text-xs text-gray-400">Disponible dans la section Factures</p>
                  </div>
                </div>
              </div>

              {/* Bouton principal */}
              <button
                onClick={() => { window.location.href = '/dashboard'; }}
                className="relative group/btn w-full px-6 py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Valider l&apos;activation de mon compte
                </span>
              </button>

              {/* Countdown */}
              <p className="text-xs text-gray-400 mt-4">
                Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}…
              </p>
            </div>
          </div>
        </div>

        {/* Lien d'aide */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Un problème ?{' '}
          <Link href="/contact" className="text-primary hover:text-pink-500 font-medium transition-colors">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
}
