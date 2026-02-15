'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

// --- Fonctions de calcul de prix ---
function getPricePerRoom(roomCount: number): number {
  if (roomCount >= 400) return 5;
  if (roomCount >= 300) return 6;
  if (roomCount >= 200) return 7;
  if (roomCount >= 150) return 8;
  if (roomCount >= 100) return 9;
  if (roomCount >= 75) return 10;
  if (roomCount >= 50) return 11;
  if (roomCount >= 30) return 13;
  if (roomCount >= 20) return 15;
  if (roomCount >= 10) return 17;
  return 19;
}

function getPricePerPitch(pitchCount: number): number {
  if (pitchCount >= 150) return 10;
  if (pitchCount >= 100) return 14;
  if (pitchCount >= 75) return 18;
  if (pitchCount >= 50) return 22;
  if (pitchCount >= 30) return 27;
  if (pitchCount >= 10) return 33;
  return 39;
}

const SETUP_FEE_CAMPING = 160;

// --- Données des grilles tarifaires ---
const hotelTiers = [
  { rooms: '5-9', price: '19€' },
  { rooms: '10-19', price: '17€' },
  { rooms: '20-29', price: '15€' },
  { rooms: '30-49', price: '13€' },
  { rooms: '50-74', price: '11€' },
  { rooms: '75-99', price: '10€' },
  { rooms: '100-149', price: '9€' },
  { rooms: '150-199', price: '8€' },
  { rooms: '200-299', price: '7€' },
  { rooms: '300-399', price: '6€' },
  { rooms: '400+', price: '5€' },
];

const campingTiers = [
  { pitches: '5-9', price: '39€' },
  { pitches: '10-29', price: '33€' },
  { pitches: '30-49', price: '27€' },
  { pitches: '50-74', price: '22€' },
  { pitches: '75-99', price: '18€' },
  { pitches: '100-149', price: '14€' },
  { pitches: '150+', price: '10€' },
];

type CategoryTab = 'hotes' | 'hotels' | 'campings';
type HostBilling = 'annual' | 'seasonal';

export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [activeTab, setActiveTab] = useState<CategoryTab>('hotes');

  // Hôtes
  const [hostBilling, setHostBilling] = useState<HostBilling>('annual');
  const [hostQty, setHostQty] = useState(1); // nombre de locations / livrets

  // Hôtels
  const [roomCount, setRoomCount] = useState(20);
  const [hotelQty, setHotelQty] = useState(1); // nombre d'hôtels
  const pricePerRoom = useMemo(() => getPricePerRoom(roomCount), [roomCount]);
  const hotelUnitPrice = useMemo(() => pricePerRoom * roomCount, [pricePerRoom, roomCount]); // prix pour 1 hôtel
  const hotelTotalPrice = useMemo(() => hotelUnitPrice * hotelQty, [hotelUnitPrice, hotelQty]);
  const hotelMonthly = useMemo(() => (hotelTotalPrice / 12).toFixed(2), [hotelTotalPrice]);

  // Campings
  const [pitchCount, setPitchCount] = useState(20);
  const [campingQty, setCampingQty] = useState(1); // nombre de campings
  const pricePerPitch = useMemo(() => getPricePerPitch(pitchCount), [pitchCount]);
  const campingUnitPrice = useMemo(() => pricePerPitch * pitchCount, [pricePerPitch, pitchCount]); // prix pour 1 camping
  const campingAnnualPrice = useMemo(() => campingUnitPrice * campingQty, [campingUnitPrice, campingQty]);
  const campingSetupTotal = useMemo(() => SETUP_FEE_CAMPING * campingQty, [campingQty]);
  const campingFirstYear = useMemo(() => campingAnnualPrice + campingSetupTotal, [campingAnnualPrice, campingSetupTotal]);
  const campingMonthly = useMemo(() => (campingAnnualPrice / 12).toFixed(2), [campingAnnualPrice]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);

  const handleRoomChange = (value: number) => {
    if (value < 5) value = 5;
    if (value > 500) value = 500;
    setRoomCount(value);
  };

  const handlePitchChange = (value: number) => {
    if (value < 5) value = 5;
    if (value > 300) value = 300;
    setPitchCount(value);
  };

  const handleSelectPlan = async (planId: string, category: string, unitCount?: number, quantity?: number) => {
    try {
      const response = await subscriptionsApi.checkout({ planId, category, unitCount, quantity: quantity || 1 });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      alert('Erreur lors de la création de la session de paiement');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Abonnement</h1>
        <p className="text-gray-500">Choisissez la formule adaptée à votre type d&apos;hébergement</p>
      </div>

      {/* Trial info */}
      {user?.subscription?.plan === 'TRIAL' && (
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-primary font-medium">
            Vous bénéficiez actuellement de la période d&apos;essai gratuite.
            {user.subscription.trialDaysLeft && (
              <span className="ml-2">
                Nombre de jours restants : {user.subscription.trialDaysLeft}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Code promo */}
      <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vous avez un code promo ?</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Entrez votre code ici"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
          />
          <Button variant="primary" className="px-6">
            Valider
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { id: 'hotes' as CategoryTab, label: '🏠 Hôtes Airbnb, gîtes, chambres d\'hôtes\n& conciergeries', shortLabel: '🏠 Hôtes & locations' },
          { id: 'hotels' as CategoryTab, label: '🏨 Hôtels', shortLabel: '🏨 Hôtels' },
          { id: 'campings' as CategoryTab, label: '🏕️ Campings & résidences de tourisme', shortLabel: '🏕️ Campings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 whitespace-pre-line text-center ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/30'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/50 hover:text-primary shadow-sm'
            }`}
          >
            <span className="hidden md:inline">{tab.label}</span>
            <span className="md:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB: HÔTES AIRBNB, GÎTES & CHAMBRES D'HÔTES */}
      {/* ============================================================ */}
      {activeTab === 'hotes' && (
        <div>
          {/* Sélecteur de quantité (nombre de locations) */}
          <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Combien de locations possédez-vous ?</h3>
            <p className="text-sm text-gray-500 mb-4 text-center">Chaque location nécessite son propre livret d&apos;accueil digital (1 abonnement = 1 location)</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setHostQty(Math.max(1, hostQty - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center transition-colors"
              >−</button>
              <input
                type="number"
                value={hostQty}
                onChange={(e) => { const v = parseInt(e.target.value) || 1; setHostQty(Math.max(1, Math.min(50, v))); }}
                min={1}
                max={50}
                className="w-20 text-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setHostQty(Math.min(50, hostQty + 1))}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center transition-colors"
              >+</button>
              <span className="text-gray-500 text-sm">{hostQty === 1 ? 'location' : 'locations'}</span>
            </div>
          </div>

          {/* Toggle Annuel / Saisonnier */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 rounded-full p-1 flex border border-gray-200">
              <button
                onClick={() => setHostBilling('annual')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  hostBilling === 'annual'
                    ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annuel
              </button>
              <button
                onClick={() => setHostBilling('seasonal')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  hostBilling === 'seasonal'
                    ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Saisonnier
              </button>
            </div>
          </div>

          {hostBilling === 'annual' ? (
            /* Plan Annuel unique */
            <div className="flex justify-center">
              <div className="relative w-full max-w-md transform hover:scale-105 transition-all duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-2xl p-8 border-2 border-primary overflow-hidden shadow-xl">
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-6 py-1.5 rounded-b-full shadow-lg whitespace-nowrap">
                    ⭐ OFFRE DE LANCEMENT
                  </div>
                  <div className="text-center mt-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Annuel</h3>
                    <div className="mb-2">
                      <span className="text-6xl font-bold text-white" style={{ fontSize: '3.75rem' }}>59€</span>
                      <span className="text-white/80 text-lg"> HT/an/livret</span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">Soit 4,92€/mois par livret</p>
                    {hostQty > 1 && (
                      <div className="bg-white/20 rounded-lg px-4 py-2 mb-4 inline-block">
                        <p className="text-white font-bold text-lg">{hostQty} locations × 59€ = <span className="text-yellow-300">{(59 * hostQty).toFixed(0)}€ HT/an</span></p>
                      </div>
                    )}
                    <ul className="text-left space-y-3 mb-8">
                      {['Toutes les fonctionnalités', 'Livrets illimités par location', 'Chatbot IA inclus', 'Support prioritaire', 'Statistiques avancées', 'Mises à jour incluses', 'Sans engagement'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-white text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="primary"
                      className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0 shadow-lg font-bold text-base py-3"
                      onClick={() => handleSelectPlan('hotes-annuel', 'hotes', undefined, hostQty)}
                    >
                      Souscrire — {(59 * hostQty).toFixed(0)}€ HT/an {hostQty > 1 ? `(${hostQty} locations)` : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Plans Saisonniers */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1 Mois */}
              <div className="relative transform hover:scale-105 transition-all duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 shadow-lg h-full">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">1 Mois</h3>
                    <div className="mb-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">9,90€</span>
                      <span className="text-gray-400"> HT/livret</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">par location</p>
                    {hostQty > 1 && (
                      <p className="text-sm font-bold text-primary mb-4">{hostQty} loc. × 9,90€ = {(9.90 * hostQty).toFixed(2)}€ HT</p>
                    )}
                    <ul className="text-left space-y-3 mb-8">
                      {['Toutes les fonctionnalités', 'Idéal haute saison', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="primary"
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg text-base py-3"
                      onClick={() => handleSelectPlan('hotes-saison-1', 'hotes', undefined, hostQty)}
                    >
                      Souscrire — {(9.90 * hostQty).toFixed(2)}€ HT
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2 Mois - Featured */}
              <div className="relative transform md:scale-105 hover:scale-110 transition-all duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 border-2 border-primary rounded-2xl p-8 shadow-xl h-full">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-6 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                    ⭐ LE PLUS DEMANDÉ
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="text-2xl font-bold text-white mb-2">2 Mois</h3>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-white">14,90€</span>
                      <span className="text-white/80"> HT/livret</span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">Soit 7,45€/livret/mois</p>
                    {hostQty > 1 && (
                      <p className="text-sm font-bold text-yellow-300 mb-4">{hostQty} loc. × 14,90€ = {(14.90 * hostQty).toFixed(2)}€ HT</p>
                    )}
                    <ul className="text-left space-y-3 mb-8">
                      {['Toutes les fonctionnalités', 'Parfait pour l\'été', 'Économie de 25%', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-white text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="primary"
                      className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0 shadow-lg font-bold text-base py-3"
                      onClick={() => handleSelectPlan('hotes-saison-2', 'hotes', undefined, hostQty)}
                    >
                      Souscrire — {(14.90 * hostQty).toFixed(2)}€ HT
                    </Button>
                  </div>
                </div>
              </div>

              {/* 3 Mois */}
              <div className="relative transform hover:scale-105 transition-all duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 shadow-lg h-full">
                  <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-xl rounded-tr-2xl text-sm font-bold">
                    -33%
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">3 Mois</h3>
                    <div className="mb-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">19,90€</span>
                      <span className="text-gray-400"> HT/livret</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Soit 6,63€/livret/mois</p>
                    {hostQty > 1 && (
                      <p className="text-sm font-bold text-primary mb-4">{hostQty} loc. × 19,90€ = {(19.90 * hostQty).toFixed(2)}€ HT</p>
                    )}
                    <ul className="text-left space-y-3 mb-8">
                      {['Toutes les fonctionnalités', 'Idéal saison complète', 'Meilleur prix saisonnier', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="primary"
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg text-base py-3"
                      onClick={() => handleSelectPlan('hotes-saison-3', 'hotes', undefined, hostQty)}
                    >
                      Souscrire — {(19.90 * hostQty).toFixed(2)}€ HT
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info importante */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-amber-800 text-sm">
              <strong>💡 1 abonnement = 1 location.</strong> Si vous possédez plusieurs locations (Airbnb, gîtes, chambres d&apos;hôtes), sélectionnez le nombre de locations ci-dessus. Chaque location disposera de son propre livret d&apos;accueil digital.
            </p>
          </div>

          {/* Features incluses */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Toutes les formules incluent</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Livrets illimités par location', 'Chatbot IA 24h/24', 'Traduction multilingue', 'QR code personnalisé', 'Statistiques', 'Personnalisation complète', 'Support inclus', 'Mises à jour'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: HÔTELS */}
      {/* ============================================================ */}
      {activeTab === 'hotels' && (
        <div>
          <div className="max-w-2xl mx-auto">
            {/* Sélecteur nombre d'hôtels */}
            <div className="mb-6 bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Combien d&apos;hôtels possédez-vous ?</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">Chaque hôtel nécessite son propre abonnement (1 abonnement = 1 hôtel)</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setHotelQty(Math.max(1, hotelQty - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center transition-colors"
                >−</button>
                <input
                  type="number"
                  value={hotelQty}
                  onChange={(e) => { const v = parseInt(e.target.value) || 1; setHotelQty(Math.max(1, Math.min(20, v))); }}
                  min={1}
                  max={20}
                  className="w-20 text-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => setHotelQty(Math.min(20, hotelQty + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center transition-colors"
                >+</button>
                <span className="text-gray-500 text-sm">{hotelQty === 1 ? 'hôtel' : 'hôtels'}</span>
              </div>
            </div>

            {/* Calculateur */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Calculez votre tarif {hotelQty > 1 ? 'par hôtel' : 'hôtel'}
                </h3>

                {/* Nombre de chambres */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <label className="text-gray-600 text-sm font-medium">Nombre de chambres {hotelQty > 1 ? '(par hôtel)' : ''} :</label>
                  <input
                    type="number"
                    value={roomCount}
                    onChange={(e) => handleRoomChange(parseInt(e.target.value) || 5)}
                    min={5}
                    max={500}
                    className="w-24 text-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Slider */}
                <div className="mb-6 px-2">
                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={1}
                    value={roomCount}
                    onChange={(e) => handleRoomChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5</span>
                    <span>100</span>
                    <span>200</span>
                    <span>300</span>
                    <span>400</span>
                    <span>500</span>
                  </div>
                </div>

                {/* Résultat prix */}
                <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm mb-2">Prix par chambre / an</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{pricePerRoom}€ <span className="text-lg text-gray-500">HT/chambre/an</span></p>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <p className="text-lg text-gray-600">
                      1 hôtel ({roomCount} chambres) : <strong className="text-gray-900">{hotelUnitPrice}€ HT/an</strong>
                    </p>
                    {hotelQty > 1 && (
                      <p className="text-sm text-gray-500 mt-1">
                        × {hotelQty} hôtels
                      </p>
                    )}
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mt-2">
                      Total : {hotelTotalPrice}€ HT/an
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Soit {hotelMonthly}€/mois pour {hotelQty > 1 ? `${hotelQty} hôtels ×` : ''} {roomCount} chambres</p>
                  </div>
                </div>

                {/* Grille tarifaire */}
                <div className="mt-6">
                  <p className="text-center text-gray-500 text-sm mb-3">Grille tarifaire dégressive (par hôtel)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {hotelTiers.map((tier, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-2 text-xs transition-all duration-300 ${
                          getPricePerRoom(parseInt(tier.rooms)) === pricePerRoom
                            ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg scale-105'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        <p className="font-bold">{tier.price}</p>
                        <p className="opacity-80">{tier.rooms}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton */}
                <div className="mt-8 text-center">
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-primary to-pink-500 text-white border-0 shadow-lg font-bold text-base py-3 px-10 rounded-full"
                    onClick={() => handleSelectPlan('hotel', 'hotel', roomCount, hotelQty)}
                  >
                    Souscrire — {hotelTotalPrice}€ HT/an {hotelQty > 1 ? `(${hotelQty} hôtels)` : ''}
                  </Button>
                </div>
              </div>
            </div>

            {/* Info importante */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-800 text-sm">
                <strong>💡 1 abonnement = 1 hôtel.</strong> Le tarif est calculé en fonction du nombre de chambres de votre établissement. Si vous possédez plusieurs hôtels, indiquez le nombre ci-dessus.
              </p>
            </div>

            {/* Features incluses */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Toutes les formules incluent</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Livret par typologie de chambre', 'QR code par chambre', 'Chatbot IA 24h/24', 'Traduction multilingue', 'Statistiques avancées', 'Personnalisation aux couleurs de l\'hôtel', 'Mise à jour en temps réel', 'Support prioritaire'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB: CAMPINGS */}
      {/* ============================================================ */}
      {activeTab === 'campings' && (
        <div>
          <div className="max-w-2xl mx-auto">
            {/* Sélecteur nombre de campings */}
            <div className="mb-6 bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Combien de campings possédez-vous ?</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">Chaque camping nécessite son propre abonnement (1 abonnement = 1 camping)</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCampingQty(Math.max(1, campingQty - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center transition-colors"
                >−</button>
                <input
                  type="number"
                  value={campingQty}
                  onChange={(e) => { const v = parseInt(e.target.value) || 1; setCampingQty(Math.max(1, Math.min(20, v))); }}
                  min={1}
                  max={20}
                  className="w-20 text-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => setCampingQty(Math.min(20, campingQty + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl flex items-center justify-center transition-colors"
                >+</button>
                <span className="text-gray-500 text-sm">{campingQty === 1 ? 'camping' : 'campings'}</span>
              </div>
            </div>

            {/* Calculateur */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Calculez votre tarif {campingQty > 1 ? 'par camping' : 'camping'}
                </h3>

                {/* Nombre d'emplacements */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <label className="text-gray-600 text-sm font-medium">Nombre d&apos;emplacements {campingQty > 1 ? '(par camping)' : ''} :</label>
                  <input
                    type="number"
                    value={pitchCount}
                    onChange={(e) => handlePitchChange(parseInt(e.target.value) || 5)}
                    min={5}
                    max={300}
                    className="w-24 text-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Slider */}
                <div className="mb-6 px-2">
                  <input
                    type="range"
                    min={5}
                    max={300}
                    step={1}
                    value={pitchCount}
                    onChange={(e) => handlePitchChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                    <span>200</span>
                    <span>300</span>
                  </div>
                </div>

                {/* Résultat prix */}
                <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm mb-2">Prix par emplacement / an</p>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{pricePerPitch}€ <span className="text-lg text-gray-500">HT/empl./an</span></p>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <p className="text-lg text-gray-600">
                      1 camping ({pitchCount} emplacements) : <strong className="text-gray-900">{campingUnitPrice}€ HT/an</strong>
                    </p>
                    {campingQty > 1 && (
                      <p className="text-sm text-gray-500 mt-1">
                        × {campingQty} campings
                      </p>
                    )}
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mt-2">
                      Total : {campingAnnualPrice}€ HT/an
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Soit {campingMonthly}€/mois</p>
                    <p className="text-xs text-gray-400 mt-2">
                      + Frais de mise en place : <strong className="text-gray-700">{SETUP_FEE_CAMPING}€ × {campingQty} = {campingSetupTotal}€ HT</strong> (unique, 1ère année)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      1ère année : <strong className="text-gray-900">{campingFirstYear}€ HT</strong>
                    </p>
                  </div>
                </div>

                {/* Grille tarifaire */}
                <div className="mt-6">
                  <p className="text-center text-gray-500 text-sm mb-3">Grille tarifaire dégressive (par camping)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
                    {campingTiers.map((tier, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-2 text-xs transition-all duration-300 ${
                          getPricePerPitch(parseInt(tier.pitches)) === pricePerPitch
                            ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg scale-105'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        <p className="font-bold">{tier.price}</p>
                        <p className="opacity-80">{tier.pitches}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton */}
                <div className="mt-8 text-center">
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-primary to-pink-500 text-white border-0 shadow-lg font-bold text-base py-3 px-10 rounded-full"
                    onClick={() => handleSelectPlan('camping', 'camping', pitchCount, campingQty)}
                  >
                    Souscrire — {campingFirstYear}€ HT (1ère année) {campingQty > 1 ? `(${campingQty} campings)` : ''}
                  </Button>
                </div>
              </div>
            </div>

            {/* Info importante */}
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-800 text-sm">
                <strong>💡 1 abonnement = 1 camping.</strong> Le tarif est calculé en fonction du nombre d&apos;emplacements de votre camping. Si vous possédez plusieurs campings, indiquez le nombre ci-dessus.
              </p>
            </div>

            {/* Features incluses */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Toutes les formules incluent</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Livret par type d\'hébergement', 'QR code par emplacement', 'Chatbot IA 24h/24', 'Traduction multilingue', 'Animations & services', 'Personnalisation complète', 'Duplication de livrets', 'Support inclus'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact pour devis personnalisé */}
      <div className="mt-10 text-center bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <p className="text-gray-500 text-sm">
          Besoin d&apos;un devis personnalisé ou d&apos;une démonstration ?{' '}
          <a href="/contact" className="text-primary hover:text-pink-500 font-semibold transition-colors">
            Contactez-nous →
          </a>
        </p>
      </div>
    </div>
  );
}
