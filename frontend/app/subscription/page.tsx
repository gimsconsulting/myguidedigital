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

  // Hôtels
  const [roomCount, setRoomCount] = useState(20);
  const pricePerRoom = useMemo(() => getPricePerRoom(roomCount), [roomCount]);
  const hotelTotalPrice = useMemo(() => pricePerRoom * roomCount, [pricePerRoom, roomCount]);
  const hotelMonthly = useMemo(() => (hotelTotalPrice / 12).toFixed(2), [hotelTotalPrice]);

  // Campings
  const [pitchCount, setPitchCount] = useState(20);
  const pricePerPitch = useMemo(() => getPricePerPitch(pitchCount), [pitchCount]);
  const campingAnnualPrice = useMemo(() => pricePerPitch * pitchCount, [pricePerPitch, pitchCount]);
  const campingFirstYear = useMemo(() => campingAnnualPrice + SETUP_FEE_CAMPING, [campingAnnualPrice]);
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

  const handleSelectPlan = async (planId: string) => {
    try {
      const response = await subscriptionsApi.checkout({ planId });
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
          { id: 'hotes' as CategoryTab, label: '🏠 Hôtes Airbnb, gîtes & chambres d\'hôtes', shortLabel: '🏠 Hôtes & locations' },
          { id: 'hotels' as CategoryTab, label: '🏨 Hôtels', shortLabel: '🏨 Hôtels' },
          { id: 'campings' as CategoryTab, label: '🏕️ Campings & résidences de tourisme', shortLabel: '🏕️ Campings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
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
                      <span className="text-white/80 text-lg"> HT/an</span>
                    </div>
                    <p className="text-sm text-white/80 mb-6">Soit 4,92€/mois par livret</p>
                    <ul className="text-left space-y-3 mb-8">
                      {['Toutes les fonctionnalités', 'Livrets illimités', 'Chatbot IA inclus', 'Support prioritaire', 'Statistiques avancées', 'Mises à jour incluses', 'Sans engagement'].map((item, i) => (
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
                      onClick={() => handleSelectPlan('yearly')}
                    >
                      Souscrire — 59€ HT/an
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
                      <span className="text-gray-400"> HT</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">par livret</p>
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
                      onClick={() => handleSelectPlan('seasonal-1')}
                    >
                      Souscrire — 9,90€
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
                      <span className="text-white/80"> HT</span>
                    </div>
                    <p className="text-sm text-white/80 mb-6">Soit 7,45€/livret/mois</p>
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
                      onClick={() => handleSelectPlan('seasonal-2')}
                    >
                      Souscrire — 14,90€
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
                      <span className="text-gray-400"> HT</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Soit 6,63€/livret/mois</p>
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
                      onClick={() => handleSelectPlan('seasonal-3')}
                    >
                      Souscrire — 19,90€
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features incluses */}
          <div className="mt-10 bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Toutes les formules incluent</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Livrets illimités', 'Chatbot IA 24h/24', 'Traduction multilingue', 'QR code personnalisé', 'Statistiques', 'Personnalisation complète', 'Support inclus', 'Mises à jour'].map((item, i) => (
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
            {/* Calculateur */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Calculez votre tarif hôtel</h3>

                {/* Nombre de chambres */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <label className="text-gray-600 text-sm font-medium">Nombre de chambres :</label>
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                      Total : {hotelTotalPrice}€ HT/an
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Soit {hotelMonthly}€/mois pour {roomCount} chambres</p>
                  </div>
                </div>

                {/* Grille tarifaire */}
                <div className="mt-6">
                  <p className="text-center text-gray-500 text-sm mb-3">Grille tarifaire dégressive</p>
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
                    onClick={() => handleSelectPlan('hotel')}
                  >
                    Souscrire — {hotelTotalPrice}€ HT/an
                  </Button>
                </div>
              </div>
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
            {/* Calculateur */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Calculez votre tarif camping</h3>

                {/* Nombre d'emplacements */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <label className="text-gray-600 text-sm font-medium">Nombre d&apos;emplacements :</label>
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
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                      Total : {campingAnnualPrice}€ HT/an
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Soit {campingMonthly}€/mois pour {pitchCount} emplacements</p>
                    <p className="text-xs text-gray-400 mt-2">
                      + Frais de mise en place : <strong className="text-gray-700">{SETUP_FEE_CAMPING}€ HT</strong> (unique, 1ère année)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      1ère année : <strong className="text-gray-900">{campingFirstYear}€ HT</strong>
                    </p>
                  </div>
                </div>

                {/* Grille tarifaire */}
                <div className="mt-6">
                  <p className="text-center text-gray-500 text-sm mb-3">Grille tarifaire dégressive</p>
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
                    onClick={() => handleSelectPlan('camping')}
                  >
                    Souscrire — {campingAnnualPrice}€ HT/an
                  </Button>
                </div>
              </div>
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
