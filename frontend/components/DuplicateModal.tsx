'use client';

import { useState } from 'react';
import { livretsApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

interface SlotsInfo {
  plan: string;
  isTrial: boolean;
  hasPaidSubscription: boolean;
  annual: { used: number; max: number; available: number };
  seasonal: { used: number };
}

interface DuplicateModalProps {
  isOpen: boolean;
  livretId: string;
  livretName: string;
  slotsInfo: SlotsInfo | null;
  onClose: () => void;
  onDuplicated: () => void;
  onSeasonalPayment: () => void;
}

export default function DuplicateModal({
  isOpen,
  livretId,
  livretName,
  slotsInfo,
  onClose,
  onDuplicated,
  onSeasonalPayment,
}: DuplicateModalProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  if (!isOpen) return null;

  const annualUsed = slotsInfo?.annual.used || 0;
  const annualMax = slotsInfo?.annual.max || 0;
  const annualAvailable = slotsInfo?.annual.available || 0;
  const hasPaidSub = slotsInfo?.hasPaidSubscription || false;

  const handleUseAnnualSlot = async () => {
    if (annualAvailable <= 0) {
      toast.error('Aucun slot annuel disponible');
      return;
    }

    setIsDuplicating(true);
    try {
      await livretsApi.duplicate(livretId, { type: 'annual' });
      toast.success('Livret dupliqué avec succès !');
      onDuplicated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la duplication');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dupliquer votre livret</h2>
          <p className="text-gray-400 text-sm mt-1 truncate max-w-md mx-auto">{livretName}</p>
          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content — Two columns */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* ── Colonne Annuel ── */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-violet-300 transition-all duration-300 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Annuel</h3>

              {/* Compteur slots */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  <span className={annualAvailable > 0 ? 'text-violet-600' : 'text-gray-400'}>{annualUsed}</span>
                  <span className="text-gray-300 mx-1">/</span>
                  <span className="text-gray-400">{annualMax}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Livret(s)</p>
              </div>

              {/* Bouton */}
              {hasPaidSub && annualAvailable > 0 ? (
                <button
                  onClick={handleUseAnnualSlot}
                  disabled={isDuplicating}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-violet-600/25 mt-auto"
                >
                  {isDuplicating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Duplication...
                    </span>
                  ) : (
                    'Utiliser un livret'
                  )}
                </button>
              ) : hasPaidSub && annualAvailable <= 0 ? (
                <div className="mt-auto">
                  <p className="text-gray-400 text-sm mb-3">Tous vos slots annuels sont utilisés</p>
                  <Link href="/subscription" onClick={onClose}>
                    <button className="w-full py-3 rounded-xl font-semibold text-violet-600 border-2 border-violet-200 hover:bg-violet-50 transition-all duration-300">
                      Augmenter mon abonnement
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="mt-auto">
                  <p className="text-gray-400 text-sm mb-3">Abonnement annuel requis</p>
                  <Link href="/subscription" onClick={onClose}>
                    <button className="w-full py-3 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all duration-300 shadow-lg shadow-violet-600/25">
                      S&apos;abonner
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* ── Colonne Saisonnier ── */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-amber-300 transition-all duration-300 flex flex-col">
              <p className="text-gray-400 text-sm mb-1">À partir de</p>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">9,90€</span>
              </div>
              <p className="text-gray-500 font-medium mb-4">par livret</p>

              <div className="mb-6 space-y-1">
                <p className="text-amber-500 font-semibold text-sm">3 offres disponibles</p>
                <p className="text-gray-400 text-sm">Sans engagement</p>
              </div>

              {/* Bouton */}
              <button
                onClick={() => {
                  onClose();
                  onSeasonalPayment();
                }}
                className="w-full py-3 rounded-xl font-semibold text-gray-900 bg-amber-400 hover:bg-amber-500 transition-all duration-300 shadow-sm hover:shadow-md mt-auto"
              >
                Paiement saisonnier
              </button>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 gap-2">
            <Link href="/tarifs/hotes" onClick={onClose} className="text-sm text-gray-500 hover:text-violet-600 transition underline underline-offset-4">
              Consulter nos tarifs
            </Link>
            <Link href="/subscription" onClick={onClose} className="text-sm text-gray-500 hover:text-violet-600 transition">
              Ajouter plusieurs livrets ? <span className="underline underline-offset-4">Mon abonnement</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
