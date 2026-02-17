'use client';

import { useState } from 'react';
import { subscriptionsApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

interface SeasonalPaymentModalProps {
  isOpen: boolean;
  livretId: string;
  onClose: () => void;
}

const seasonalOffers = [
  { id: 1, months: 1, days: 30, price: 9.90, bonus: 14 },
  { id: 2, months: 2, days: 60, price: 14.90, bonus: 14 },
  { id: 3, months: 3, days: 90, price: 19.90, bonus: 14 },
];

function formatDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SeasonalPaymentModal({ isOpen, livretId, onClose }: SeasonalPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  if (!isOpen) return null;

  const handlePay = async (offer: typeof seasonalOffers[0]) => {
    setIsProcessing(offer.id);
    try {
      const response = await subscriptionsApi.seasonalDuplicateCheckout({
        livretId,
        seasonalOffer: offer.id,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Erreur lors de la redirection vers le paiement');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du paiement');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Paiement saisonnier</h2>
          <p className="text-gray-500 mt-2">Choisissez l&apos;offre souhaitée</p>
          {/* Close button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cards */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {seasonalOffers.map((offer) => {
              const totalDays = offer.days + offer.bonus;
              const endDate = formatDate(totalDays);
              return (
                <div
                  key={offer.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100 transition-all duration-300 flex flex-col"
                >
                  {/* Badge */}
                  <div className="inline-flex mx-auto mb-5">
                    <span className="px-5 py-1.5 rounded-full bg-amber-400 text-white font-semibold text-sm shadow-sm">
                      Offre {offer.months} mois
                    </span>
                  </div>

                  {/* Prix */}
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">{offer.price.toFixed(2).replace('.', ',')} €</span>
                    <div className="text-gray-400 text-sm mt-1">
                      <span className="font-medium">ht</span>
                      <br />
                      Pour {offer.days} jours
                    </div>
                  </div>

                  {/* Bonus */}
                  <div className="mb-5">
                    <p className="text-amber-500 font-bold text-lg">+{offer.bonus} jours offerts</p>
                    <p className="text-gray-400 text-xs">De votre période d&apos;essai restante</p>
                  </div>

                  {/* Bouton */}
                  <button
                    onClick={() => handlePay(offer)}
                    disabled={isProcessing !== null}
                    className="w-full py-3 rounded-xl font-semibold text-gray-900 bg-amber-400 hover:bg-amber-500 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md text-base mt-auto"
                  >
                    {isProcessing === offer.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                        Redirection...
                      </span>
                    ) : (
                      `Payer pour ${offer.months} mois`
                    )}
                  </button>

                  {/* Date */}
                  <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                    Si vous souscrivez aujourd&apos;hui, votre livret sera actif jusqu&apos;au {endDate}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
