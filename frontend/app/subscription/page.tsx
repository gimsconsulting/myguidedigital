'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

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
  const [hostQty, setHostQty] = useState(1);

  // Hôtels
  const [roomCount, setRoomCount] = useState(20);
  const [hotelQty, setHotelQty] = useState(1);
  const pricePerRoom = useMemo(() => getPricePerRoom(roomCount), [roomCount]);
  const hotelUnitPrice = useMemo(() => pricePerRoom * roomCount, [pricePerRoom, roomCount]);
  const hotelTotalPrice = useMemo(() => hotelUnitPrice * hotelQty, [hotelUnitPrice, hotelQty]);
  const hotelMonthly = useMemo(() => (hotelTotalPrice / 12).toFixed(2), [hotelTotalPrice]);

  // Campings
  const [pitchCount, setPitchCount] = useState(20);
  const [campingQty, setCampingQty] = useState(1);
  const pricePerPitch = useMemo(() => getPricePerPitch(pitchCount), [pitchCount]);
  const campingUnitPrice = useMemo(() => pricePerPitch * pitchCount, [pricePerPitch, pitchCount]);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <p className="mt-6 text-gray-500 font-medium">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  const features = [
    { icon: '📚', label: 'Livrets illimités', desc: 'Créez autant de livrets que nécessaire' },
    { icon: '🤖', label: 'Chatbot IA 24/7', desc: 'Assistance intelligente pour vos hôtes' },
    { icon: '🌍', label: 'Multilingue', desc: 'Traduction automatique incluse' },
    { icon: '📊', label: 'Statistiques', desc: 'Suivez les performances en temps réel' },
    { icon: '🎨', label: 'Personnalisation', desc: 'Aux couleurs de votre marque' },
    { icon: '📱', label: 'QR Codes', desc: 'Accès instantané pour vos voyageurs' },
  ];

  const testimonials = [
    { name: 'Marie-Claire D.', role: 'Propriétaire de gîte — Durbuy', text: "Depuis que j'utilise My Guide Digital, mes voyageurs sont ravis. Tout est accessible en un clic !" },
    { name: 'Philippe L.', role: 'Hôtel 3★ — Bruges', text: "L'outil nous a permis de réduire les appels à la réception de 40%. Un vrai gain de temps." },
    { name: 'Sophie V.', role: 'Camping 4★ — Côte belge', text: "La mise en place a été rapide et le support est excellent. Nos campeurs adorent le livret digital." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════ */}
        {/* HEADER PREMIUM */}
        {/* ══════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/70 text-sm font-medium">Offres disponibles</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Choisissez l&apos;abonnement <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                adapté à votre activité
              </span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto">
              Créez des livrets d&apos;accueil digitaux exceptionnels pour vos voyageurs.
              Tous les plans incluent l&apos;accès à toutes les fonctionnalités.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* BADGE ESSAI GRATUIT */}
        {/* ══════════════════════════════════════ */}
        {user?.subscription?.plan === 'TRIAL' && (
          <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-200">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🎁</span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-white font-bold text-lg">Période d&apos;essai gratuite en cours</p>
                <p className="text-white/80 text-sm">
                  {user.subscription.trialDaysLeft
                    ? `Il vous reste ${user.subscription.trialDaysLeft} jour${user.subscription.trialDaysLeft > 1 ? 's' : ''} pour profiter de toutes les fonctionnalités`
                    : "Profitez de toutes les fonctionnalités pendant votre essai"}
                </p>
              </div>
              {user.subscription.trialDaysLeft && (
                <div className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{user.subscription.trialDaysLeft}</span>
                  </div>
                  <span className="text-white/60 text-xs">jours</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* CODE PROMO */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white">🏷️</span>
            </div>
            <div className="flex-1 w-full">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Entrez votre code promo"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-gray-400"
                />
                <button className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-200 transition-all duration-300 text-sm">
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* ONGLETS CATÉGORIE */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'hotes' as CategoryTab, emoji: '🏠', title: 'Hôtes & Locations', subtitle: 'Airbnb, gîtes, chambres d\'hôtes & conciergeries' },
              { id: 'hotels' as CategoryTab, emoji: '🏨', title: 'Hôtels', subtitle: 'Tarif dégressif par chambre' },
              { id: 'campings' as CategoryTab, emoji: '🏕️', title: 'Campings', subtitle: 'Tarif dégressif par emplacement' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group rounded-2xl p-4 md:p-5 text-center transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-primary to-pink-500 text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary/30 hover:shadow-md'
                }`}
              >
                <span className="text-2xl md:text-3xl block mb-2">{tab.emoji}</span>
                <p className={`font-bold text-sm md:text-base ${activeTab === tab.id ? 'text-white' : 'text-gray-900'}`}>
                  {tab.title}
                </p>
                <p className={`text-xs mt-1 hidden md:block ${activeTab === tab.id ? 'text-white/70' : 'text-gray-400'}`}>
                  {tab.subtitle}
                </p>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-primary to-pink-500 rotate-45 rounded-sm"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB: HÔTES AIRBNB, GÎTES & CHAMBRES D'HÔTES         */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'hotes' && (
          <div className="space-y-8">
            {/* Sélecteur quantité */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Combien de locations possédez-vous ?</h3>
                <p className="text-sm text-gray-400 mt-1">1 abonnement = 1 location avec son propre livret d&apos;accueil</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setHostQty(Math.max(1, hostQty - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary font-bold text-xl flex items-center justify-center transition-all duration-200"
                >−</button>
                <div className="relative">
                  <input
                    type="number"
                    value={hostQty}
                    onChange={(e) => { const v = parseInt(e.target.value) || 1; setHostQty(Math.max(1, Math.min(50, v))); }}
                    min={1} max={50}
                    className="w-24 text-center bg-gradient-to-br from-primary/5 to-pink-500/5 border-2 border-primary/20 rounded-xl px-3 py-3 text-gray-900 font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button
                  onClick={() => setHostQty(Math.min(50, hostQty + 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary font-bold text-xl flex items-center justify-center transition-all duration-200"
                >+</button>
                <span className="text-gray-400 text-sm">{hostQty === 1 ? 'location' : 'locations'}</span>
              </div>
            </div>

            {/* Toggle Annuel / Saisonnier */}
            <div className="flex justify-center">
              <div className="bg-white rounded-full p-1.5 flex border border-gray-200 shadow-sm">
                <button
                  onClick={() => setHostBilling('annual')}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    hostBilling === 'annual'
                      ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/20'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  💎 Annuel
                  {hostBilling === 'annual' && <span className="ml-1 text-xs opacity-80">Économisez 84%</span>}
                </button>
                <button
                  onClick={() => setHostBilling('seasonal')}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    hostBilling === 'seasonal'
                      ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/20'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ☀️ Saisonnier
                </button>
              </div>
            </div>

            {hostBilling === 'annual' ? (
              /* ═══ Plan Annuel ═══ */
              <div className="flex justify-center">
                <div className="relative w-full max-w-lg group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-3xl overflow-hidden shadow-2xl">
                    {/* Badge */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-400 text-center py-2">
                      <span className="text-amber-900 font-bold text-sm">⭐ OFFRE DE LANCEMENT — Tarif préférentiel</span>
                    </div>

                    <div className="pt-14 px-8 pb-8">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white/80 mb-4">Abonnement Annuel</h3>
                        <div className="mb-2">
                          <span className="text-7xl font-bold text-white">59€</span>
                        </div>
                        <p className="text-white/50 text-sm mb-1">HT / an / livret</p>
                        <p className="text-white/40 text-xs mb-6">Soit seulement 4,92€/mois par livret</p>

                        {hostQty > 1 && (
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 mb-6 inline-block border border-white/10">
                            <p className="text-white font-bold">
                              {hostQty} locations × 59€ = <span className="text-amber-400 text-xl">{(59 * hostQty)}€ HT/an</span>
                            </p>
                          </div>
                        )}

                        {/* Features */}
                        <div className="space-y-3 mb-8 text-left">
                          {['Toutes les fonctionnalités incluses', 'Livrets illimités par location', 'Chatbot IA disponible 24h/24', 'Support prioritaire', 'Statistiques avancées', 'Mises à jour automatiques', 'Sans engagement — résiliable'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-white/80 text-sm">{item}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleSelectPlan('hotes-annuel', 'hotes', undefined, hostQty)}
                          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02]"
                        >
                          Souscrire — {(59 * hostQty)}€ HT/an {hostQty > 1 ? `(${hostQty} locations)` : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ═══ Plans Saisonniers ═══ */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1 Mois */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm h-full flex flex-col">
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">📅</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">1 Mois</h3>
                      <p className="text-gray-400 text-xs mb-4">Idéal pour la haute saison</p>
                      <div className="mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">9,90€</span>
                      </div>
                      <p className="text-gray-400 text-xs mb-6">HT / livret • Sans reconduction</p>
                      {hostQty > 1 && (
                        <div className="bg-primary/5 rounded-lg px-3 py-2 mb-4">
                          <p className="text-sm font-bold text-primary">{hostQty} × 9,90€ = {(9.90 * hostQty).toFixed(2)}€ HT</p>
                        </div>
                      )}
                      <div className="space-y-2.5 mb-6 text-left">
                        {['Toutes les fonctionnalités', 'Idéal haute saison', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectPlan('hotes-saison-1', 'hotes', undefined, hostQty)}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-xl"
                    >
                      Souscrire — {(9.90 * hostQty).toFixed(2)}€ HT
                    </button>
                  </div>
                </div>

                {/* 2 Mois — LE PLUS DEMANDÉ */}
                <div className="relative group md:-mt-4 md:mb-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-2xl p-7 shadow-2xl h-full flex flex-col overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-400 text-center py-1.5">
                      <span className="text-amber-900 font-bold text-xs">⭐ LE PLUS DEMANDÉ</span>
                    </div>
                    <div className="text-center flex-1 mt-6">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">🔥</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">2 Mois</h3>
                      <p className="text-white/40 text-xs mb-4">Parfait pour la saison estivale</p>
                      <div className="mb-2">
                        <span className="text-5xl font-bold text-white">14,90€</span>
                      </div>
                      <p className="text-white/40 text-xs mb-1">HT / livret • Soit 7,45€/mois</p>
                      <p className="text-amber-400 text-xs font-bold mb-6">Économisez 25%</p>
                      {hostQty > 1 && (
                        <div className="bg-white/10 rounded-lg px-3 py-2 mb-4">
                          <p className="text-sm font-bold text-amber-400">{hostQty} × 14,90€ = {(14.90 * hostQty).toFixed(2)}€ HT</p>
                        </div>
                      )}
                      <div className="space-y-2.5 mb-6 text-left">
                        {['Toutes les fonctionnalités', 'Parfait pour l\'été', 'Économie de 25%', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-white/80 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectPlan('hotes-saison-2', 'hotes', undefined, hostQty)}
                      className="w-full py-3.5 rounded-xl font-bold text-amber-900 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl"
                    >
                      Souscrire — {(14.90 * hostQty).toFixed(2)}€ HT
                    </button>
                  </div>
                </div>

                {/* 3 Mois */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full text-xs font-bold shadow-lg">
                      -33%
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">🏖️</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">3 Mois</h3>
                      <p className="text-gray-400 text-xs mb-4">Saison complète</p>
                      <div className="mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">19,90€</span>
                      </div>
                      <p className="text-gray-400 text-xs mb-6">HT / livret • Soit 6,63€/mois</p>
                      {hostQty > 1 && (
                        <div className="bg-primary/5 rounded-lg px-3 py-2 mb-4">
                          <p className="text-sm font-bold text-primary">{hostQty} × 19,90€ = {(19.90 * hostQty).toFixed(2)}€ HT</p>
                        </div>
                      )}
                      <div className="space-y-2.5 mb-6 text-left">
                        {['Toutes les fonctionnalités', 'Idéal saison complète', 'Meilleur prix saisonnier', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectPlan('hotes-saison-3', 'hotes', undefined, hostQty)}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-xl"
                    >
                      Souscrire — {(19.90 * hostQty).toFixed(2)}€ HT
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <p className="text-amber-900 font-bold text-sm">1 abonnement = 1 location</p>
                <p className="text-amber-800 text-xs mt-1">Si vous possédez plusieurs locations (Airbnb, gîtes, chambres d&apos;hôtes), sélectionnez le nombre ci-dessus. Chaque location disposera de son propre livret d&apos;accueil digital.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB: HÔTELS                                          */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'hotels' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Sélecteur nombre d'hôtels */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Combien d&apos;hôtels possédez-vous ?</h3>
              <p className="text-sm text-gray-400 mb-4">1 abonnement = 1 hôtel</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setHotelQty(Math.max(1, hotelQty - 1))} className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary font-bold text-xl flex items-center justify-center transition-all">−</button>
                <input type="number" value={hotelQty} onChange={(e) => { const v = parseInt(e.target.value) || 1; setHotelQty(Math.max(1, Math.min(20, v))); }} min={1} max={20} className="w-24 text-center bg-gradient-to-br from-primary/5 to-pink-500/5 border-2 border-primary/20 rounded-xl px-3 py-3 text-gray-900 font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={() => setHotelQty(Math.min(20, hotelQty + 1))} className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary font-bold text-xl flex items-center justify-center transition-all">+</button>
                <span className="text-gray-400 text-sm">{hotelQty === 1 ? 'hôtel' : 'hôtels'}</span>
              </div>
            </div>

            {/* Calculateur */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-pink-500/5">
                  <h3 className="text-xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                      <span className="text-white">🏨</span>
                    </div>
                    Calculez votre tarif hôtel
                  </h3>
                </div>

                <div className="p-8">
                  {/* Slider chambres */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-gray-600 text-sm font-medium">Nombre de chambres {hotelQty > 1 ? '(par hôtel)' : ''}</label>
                      <div className="bg-gradient-to-r from-primary to-pink-500 text-white px-4 py-1.5 rounded-lg font-bold text-lg">
                        {roomCount}
                      </div>
                    </div>
                    <input
                      type="range" min={5} max={500} step={1} value={roomCount}
                      onChange={(e) => handleRoomChange(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>5</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span>
                    </div>
                  </div>

                  {/* Résultat */}
                  <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 rounded-2xl p-6 text-center text-white">
                    <p className="text-white/50 text-sm mb-1">Prix par chambre / an</p>
                    <p className="text-4xl font-bold mb-4">{pricePerRoom}€ <span className="text-lg text-white/50">HT</span></p>
                    <div className="border-t border-white/10 pt-4 space-y-2">
                      <p className="text-white/70">
                        1 hôtel ({roomCount} ch.) : <strong className="text-white">{hotelUnitPrice}€ HT/an</strong>
                      </p>
                      {hotelQty > 1 && <p className="text-white/50 text-sm">× {hotelQty} hôtels</p>}
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                        {hotelTotalPrice}€ HT/an
                      </p>
                      <p className="text-white/40 text-xs">Soit {hotelMonthly}€/mois</p>
                    </div>
                  </div>

                  {/* Grille tarifaire */}
                  <div className="mt-6">
                    <p className="text-center text-gray-400 text-sm mb-3">Grille tarifaire dégressive</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center">
                      {hotelTiers.map((tier, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-2.5 text-xs font-medium transition-all duration-300 ${
                            getPricePerRoom(parseInt(tier.rooms)) === pricePerRoom
                              ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg scale-105'
                              : 'bg-gray-50 text-gray-500 border border-gray-100'
                          }`}
                        >
                          <p className="font-bold text-sm">{tier.price}</p>
                          <p className="opacity-70 text-[10px]">{tier.rooms} ch.</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton */}
                  <div className="mt-8">
                    <button
                      onClick={() => handleSelectPlan('hotel', 'hotel', roomCount, hotelQty)}
                      className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02]"
                    >
                      Souscrire — {hotelTotalPrice}€ HT/an {hotelQty > 1 ? `(${hotelQty} hôtels)` : ''}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <p className="text-amber-900 font-bold text-sm">1 abonnement = 1 hôtel</p>
                <p className="text-amber-800 text-xs mt-1">Le tarif est calculé en fonction du nombre de chambres. Si vous possédez plusieurs hôtels, indiquez le nombre ci-dessus.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB: CAMPINGS                                        */}
        {/* ══════════════════════════════════════════════════════ */}
        {activeTab === 'campings' && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Sélecteur nombre de campings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Combien de campings possédez-vous ?</h3>
              <p className="text-sm text-gray-400 mb-4">1 abonnement = 1 camping</p>
              <div className="flex items-center justify-center gap-4">
                <button onClick={() => setCampingQty(Math.max(1, campingQty - 1))} className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary font-bold text-xl flex items-center justify-center transition-all">−</button>
                <input type="number" value={campingQty} onChange={(e) => { const v = parseInt(e.target.value) || 1; setCampingQty(Math.max(1, Math.min(20, v))); }} min={1} max={20} className="w-24 text-center bg-gradient-to-br from-primary/5 to-pink-500/5 border-2 border-primary/20 rounded-xl px-3 py-3 text-gray-900 font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={() => setCampingQty(Math.min(20, campingQty + 1))} className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary font-bold text-xl flex items-center justify-center transition-all">+</button>
                <span className="text-gray-400 text-sm">{campingQty === 1 ? 'camping' : 'campings'}</span>
              </div>
            </div>

            {/* Calculateur */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                  <h3 className="text-xl font-bold text-gray-900 text-center flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white">🏕️</span>
                    </div>
                    Calculez votre tarif camping
                  </h3>
                </div>

                <div className="p-8">
                  {/* Slider emplacements */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-gray-600 text-sm font-medium">Nombre d&apos;emplacements {campingQty > 1 ? '(par camping)' : ''}</label>
                      <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-1.5 rounded-lg font-bold text-lg">
                        {pitchCount}
                      </div>
                    </div>
                    <input
                      type="range" min={5} max={300} step={1} value={pitchCount}
                      onChange={(e) => handlePitchChange(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>5</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span>
                    </div>
                  </div>

                  {/* Résultat */}
                  <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 rounded-2xl p-6 text-center text-white">
                    <p className="text-white/50 text-sm mb-1">Prix par emplacement / an</p>
                    <p className="text-4xl font-bold mb-4">{pricePerPitch}€ <span className="text-lg text-white/50">HT</span></p>
                    <div className="border-t border-white/10 pt-4 space-y-2">
                      <p className="text-white/70">
                        1 camping ({pitchCount} empl.) : <strong className="text-white">{campingUnitPrice}€ HT/an</strong>
                      </p>
                      {campingQty > 1 && <p className="text-white/50 text-sm">× {campingQty} campings</p>}
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {campingAnnualPrice}€ HT/an
                      </p>
                      <p className="text-white/40 text-xs">Soit {campingMonthly}€/mois</p>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/50 text-xs">
                          + Frais de mise en place : <strong className="text-amber-400">{campingSetupTotal}€ HT</strong> (unique, 1ère année)
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                          1ère année : <strong className="text-white text-lg">{campingFirstYear}€ HT</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grille tarifaire */}
                  <div className="mt-6">
                    <p className="text-center text-gray-400 text-sm mb-3">Grille tarifaire dégressive</p>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                      {campingTiers.map((tier, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-2.5 text-xs font-medium transition-all duration-300 ${
                            getPricePerPitch(parseInt(tier.pitches)) === pricePerPitch
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg scale-105'
                              : 'bg-gray-50 text-gray-500 border border-gray-100'
                          }`}
                        >
                          <p className="font-bold text-sm">{tier.price}</p>
                          <p className="opacity-70 text-[10px]">{tier.pitches} empl.</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton */}
                  <div className="mt-8">
                    <button
                      onClick={() => handleSelectPlan('camping', 'camping', pitchCount, campingQty)}
                      className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02]"
                    >
                      Souscrire — {campingFirstYear}€ HT (1ère année) {campingQty > 1 ? `(${campingQty} campings)` : ''}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <p className="text-amber-900 font-bold text-sm">1 abonnement = 1 camping</p>
                <p className="text-amber-800 text-xs mt-1">Le tarif est calculé en fonction du nombre d&apos;emplacements. Les frais de mise en place (160€) ne sont facturés que la première année.</p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* FEATURES INCLUSES */}
        {/* ══════════════════════════════════════ */}
        <div className="mt-12 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Tout est inclus, sans surprise</h2>
            <p className="text-gray-400 mt-2">Chaque abonnement comprend l&apos;accès à toutes nos fonctionnalités</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{feat.icon}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{feat.label}</p>
                  <p className="text-gray-400 text-xs">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* TÉMOIGNAGES */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Ils nous font confiance</h2>
            <p className="text-gray-400 mt-2">Découvrez ce que nos clients pensent de My Guide Digital</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-300"></div>
                <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* GARANTIES */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🔒', label: 'Paiement sécurisé', desc: 'Via Stripe' },
              { icon: '❌', label: 'Sans engagement', desc: 'Résiliable à tout moment' },
              { icon: '🔄', label: 'Satisfait ou remboursé', desc: '14 jours pour tester' },
              { icon: '💬', label: 'Support réactif', desc: 'Par email & chat' },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl mb-2">{g.icon}</span>
                <p className="font-bold text-gray-900 text-sm">{g.label}</p>
                <p className="text-gray-400 text-xs mt-1">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* CTA CONTACT */}
        {/* ══════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 p-8 shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Besoin d&apos;un devis personnalisé ? 🤝
            </h2>
            <p className="text-white/50 mb-6 max-w-lg mx-auto">
              Vous avez un projet spécifique ou des besoins particuliers ? Notre équipe est là pour vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl"
              >
                Contactez-nous
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-300"
              >
                Voir tous nos tarifs
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
