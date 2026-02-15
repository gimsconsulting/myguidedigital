'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface TrialExpiredModalProps {
  isOpen: boolean;
  daysLeft?: number;
}

export default function TrialExpiredModal({ isOpen, daysLeft }: TrialExpiredModalProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-center">
          <div className="text-5xl mb-3">⏰</div>
          <h2 className="text-2xl font-bold text-white">
            {t('trial.expiredTitle', 'Votre période d\'essai est terminée')}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-center mb-6 leading-relaxed">
            {t('trial.expiredMessage', 'Votre essai gratuit de 14 jours est arrivé à son terme. Pour continuer à accéder à votre tableau de bord et à vos livrets d\'accueil, veuillez choisir un abonnement.')}
          </p>

          {/* Avantages */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🚀</span> {t('trial.whySubscribe', 'Pourquoi souscrire ?')}
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span>{t('trial.benefit1', 'Accès illimité à tous vos livrets d\'accueil')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span>{t('trial.benefit2', 'QR codes personnalisés pour vos hébergements')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span>{t('trial.benefit3', 'Statistiques de consultation en temps réel')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✅</span>
                <span>{t('trial.benefit4', 'Support prioritaire et mises à jour incluses')}</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-400 text-center mb-4">
            {t('trial.dataKept', 'Vos livrets et données sont conservés. Vous retrouverez tout après votre souscription.')}
          </p>

          {/* Bouton principal */}
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-3 px-6 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 shadow-lg shadow-primary/30 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {t('trial.chooseSubscription', 'Choisir mon abonnement')}
          </button>
        </div>
      </div>
    </div>
  );
}
