'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

// Grille tarifaire dégressive par emplacement/an
function getPricePerPitch(pitchCount: number): number {
  if (pitchCount >= 150) return 10;
  if (pitchCount >= 100) return 14;
  if (pitchCount >= 75) return 18;
  if (pitchCount >= 50) return 22;
  if (pitchCount >= 30) return 27;
  if (pitchCount >= 10) return 33;
  return 39;
}

const SETUP_FEE = 160; // Frais de mise en place

const features = [
  {
    title: 'Modules adaptés au plein air',
    desc: 'Wi-Fi, digicode, numéros utiles, règlement intérieur, consignes d\'arrivée et de départ, activités, services, livre d\'or, mot de bienvenue… Activez uniquement ce qui est pertinent pour vos campeurs.',
    icon: '⛺',
  },
  {
    title: 'Gestion multi-emplacements',
    desc: 'Créez un livret par type d\'hébergement (mobil-homes, lodges, emplacements nus, chalets…) et gérez l\'ensemble depuis un tableau de bord unique et intuitif.',
    icon: '🗂️',
  },
  {
    title: 'Programmes d\'animation intégrés',
    desc: 'Ajoutez facilement vos programmes d\'activités de la semaine au format PDF ou vidéo. Modifiez-les à tout moment avec diffusion instantanée auprès de tous vos vacanciers.',
    icon: '🎭',
  },
  {
    title: 'Mise à jour en temps réel',
    desc: 'Activité annulée ? Nouveau code de portail ? Changez l\'information en un clic, elle est visible immédiatement. Fini les panneaux d\'affichage à refaire et les impressions coûteuses.',
    icon: '⚡',
  },
  {
    title: 'Personnalisation à l\'image de votre camping',
    desc: 'Intégrez votre logo, vos couleurs et votre identité visuelle. Que vous soyez un camping familial ou un grand domaine classé, le livret reflète votre univers.',
    icon: '🎨',
  },
  {
    title: 'Recommandations locales illimitées',
    desc: 'Valorisez votre région en recommandant sans limite : producteurs locaux, plages, randonnées, marchés, restaurants… Vos campeurs gagnent en autonomie et profitent pleinement de leur séjour.',
    icon: '📍',
  },
  {
    title: 'Traduction automatique multilingue',
    desc: 'Proposez vos livrets en plusieurs langues grâce à la traduction automatique. Solution idéale pour éviter les documents imprimés en masse dans toutes les langues.',
    icon: '🌍',
  },
  {
    title: 'Chatbot IA pour vos vacanciers',
    desc: 'Un assistant intelligent disponible 24h/24 répond aux questions de vos campeurs : horaires de la piscine, code Wi-Fi, activités du jour… Moins de files à l\'accueil, plus de satisfaction.',
    icon: '🤖',
  },
  {
    title: 'Accessible sans téléchargement',
    desc: 'Un QR code à l\'accueil, dans les hébergements ou sur les panneaux d\'info suffit. Vos vacanciers accèdent au livret depuis n\'importe quel appareil, sans installer quoi que ce soit.',
    icon: '📱',
  },
  {
    title: 'Statistiques d\'utilisation',
    desc: 'Suivez les consultations et identifiez les modules les plus populaires. Adaptez vos contenus et services en fonction des besoins réels de vos vacanciers.',
    icon: '📊',
  },
];

const campingTestimonials = [
  {
    name: 'Didier C.',
    role: 'Camping 4 étoiles — Côte belge',
    text: 'Avec 120 emplacements et une clientèle internationale, le livret digital a transformé notre accueil. Les programmes d\'animation sont consultés directement par les vacanciers, plus besoin d\'imprimer des centaines de feuilles chaque semaine !',
    rating: 5,
  },
  {
    name: 'Véronique M.',
    role: 'Village vacances — Luxembourg belge',
    text: 'Le calculateur de prix dégressif rend la solution très accessible pour notre taille. Et le chatbot IA est une vraie révolution : nos saisonniers à l\'accueil sont beaucoup moins sollicités pour les questions basiques.',
    rating: 5,
  },
  {
    name: 'Christophe B.',
    role: 'Camping familial — Vallée de la Semois',
    text: 'On cherchait une alternative aux classeurs plastifiés dans les mobil-homes. Le QR code est simple, les clients adorent, et on met à jour les infos en 2 minutes depuis le téléphone. Parfait pour un petit camping comme le nôtre.',
    rating: 5,
  },
  {
    name: 'Anne-Sophie T.',
    role: 'Domaine de plein air — Ardennes belges',
    text: 'La gestion par type d\'hébergement est idéale. On a un livret pour les mobil-homes, un pour les lodges et un pour les emplacements nus. Chacun avec ses infos spécifiques. La duplication nous fait gagner un temps fou.',
    rating: 5,
  },
  {
    name: 'Bernard L.',
    role: 'Camping 3 étoiles — Bredene',
    text: 'La traduction automatique est un vrai plus avec notre clientèle néerlandaise et allemande. Avant, on imprimait le règlement en 4 langues... Maintenant tout est digital et traduit en un clic.',
    rating: 5,
  },
  {
    name: 'Martine J.',
    role: 'Résidence de tourisme — Malmedy',
    text: 'L\'intégration du programme d\'animation en PDF est exactement ce qu\'il nous fallait. On le met à jour chaque dimanche soir et tous les vacanciers y ont accès lundi matin. Simple et efficace.',
    rating: 5,
  },
];

const campingFaqs = [
  {
    question: 'Faut-il créer un livret pour chaque emplacement ?',
    answer: 'Non, un seul livret peut regrouper les informations communes à tout le camping. Vous pouvez toutefois créer plusieurs livrets si vous avez des zones distinctes (mobil-homes, emplacements nus, lodges…), ou si certains contenus doivent être différenciés par secteur.',
  },
  {
    question: 'Comment est calculé le prix pour un camping ?',
    answer: 'Le tarif est calculé par emplacement et par an, avec une grille dégressive : plus vous avez d\'emplacements, moins le prix unitaire est élevé. Des frais de mise en place de 160€ HT s\'ajoutent une seule fois. Utilisez notre calculateur ci-dessus pour obtenir votre tarif exact.',
  },
  {
    question: 'Comment les vacanciers accèdent-ils au livret ?',
    answer: 'Via un simple QR code affiché à l\'accueil, dans les hébergements, sur les bornes d\'entrée, les bracelets ou dans les emails de confirmation. Aucun téléchargement requis, le livret s\'ouvre sur tous les appareils.',
  },
  {
    question: 'Peut-on intégrer les programmes d\'animation ?',
    answer: 'Oui ! Vous pouvez ajouter vos programmes d\'activités de la semaine au format PDF ou vidéo. Modifiez-les autant que nécessaire, les changements sont visibles instantanément par tous vos vacanciers.',
  },
  {
    question: 'Peut-on l\'intégrer à notre PMS ou système de réservation ?',
    answer: 'Oui, vous pouvez intégrer le lien du livret dans vos emails de confirmation, SMS ou espace client de votre PMS. Nous sommes compatibles avec tous les outils qui permettent l\'envoi de communications automatisées.',
  },
  {
    question: 'Les traductions fonctionnent-elles pour toutes les langues courantes en camping ?',
    answer: 'Oui, notre système prend en charge de nombreuses langues dont le néerlandais, l\'allemand, l\'anglais et l\'espagnol — les plus demandées en camping. Chaque vacancier accède à la version dans la langue de son appareil.',
  },
  {
    question: 'Mes saisonniers peuvent-ils gérer le livret facilement ?',
    answer: 'Absolument. L\'interface est conçue pour être intuitive. Aucune compétence technique n\'est requise. Un saisonnier peut prendre en main l\'outil en quelques minutes.',
  },
  {
    question: 'Et si une activité est annulée ou modifiée en dernière minute ?',
    answer: 'Vous modifiez l\'information en quelques clics et elle est instantanément visible par tous vos vacanciers. Plus besoin de courir modifier les panneaux d\'affichage !',
  },
  {
    question: 'Le livret fonctionne-t-il sans Wi-Fi dans le camping ?',
    answer: 'Le livret reste accessible en 4G/5G selon la couverture mobile. Vous pouvez aussi proposer les QR codes à scanner à l\'accueil avec un accès Wi-Fi local. Les vacanciers peuvent sauvegarder le lien en favoris.',
  },
  {
    question: 'Le livret remplace-t-il l\'accueil du camping ?',
    answer: 'Non, il le complète. Le livret prend en charge les informations répétitives (horaires, règlement, code Wi-Fi, activités…) pour que votre équipe puisse se concentrer sur l\'accueil humain et les demandes spécifiques.',
  },
];

export default function TarifsCampingsPage() {
  const { t } = useTranslation();
  const [pitchCount, setPitchCount] = useState(30);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pricePerPitch = useMemo(() => getPricePerPitch(pitchCount), [pitchCount]);
  const annualPrice = useMemo(() => pricePerPitch * pitchCount, [pricePerPitch, pitchCount]);
  const totalFirstYear = useMemo(() => annualPrice + SETUP_FEE, [annualPrice]);
  const monthlyEquivalent = useMemo(() => (annualPrice / 12).toFixed(2), [annualPrice]);

  const handlePitchChange = (value: number) => {
    if (value < 5) value = 5;
    if (value > 300) value = 300;
    setPitchCount(value);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-pink-500 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white hover:text-primary transition-colors">Accueil</Link>
              <Link href="/hote-airbnb" className="text-white hover:text-primary transition-colors">Nos services</Link>
              <Link href="/tarifs" className="text-primary font-semibold">Nos tarifs</Link>
              <Link href="/blog" className="text-white hover:text-primary transition-colors">Blog</Link>
              <Link href="/contact" className="text-white hover:text-primary transition-colors">Contact</Link>
              <Link href="/login" className="text-white hover:text-primary transition-colors">Connexion</Link>
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <Link href="/register">
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold">
                  <span className="flex items-center gap-2">
                    <span>&gt;</span>
                    <span>Testez gratuitement</span>
                  </span>
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-primary transition-colors" aria-label="Menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-primary/20">
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
                <Link href="/hote-airbnb" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Nos services</Link>
                <Link href="/tarifs" className="text-primary font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Nos tarifs</Link>
                <Link href="/blog" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link href="/contact" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                <Link href="/login" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Connexion</Link>
                <LanguageSelector />
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold w-full">
                    Testez gratuitement
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-8 sm:pt-32 sm:pb-12 bg-dark relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/tarifs" className="hover:text-primary transition-colors">Nos tarifs</Link>
            <span>/</span>
            <span className="text-primary">Campings & plein air</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="text-white">Le livret digital</span>
            <br />
            <span className="bg-gradient-purple-pink bg-clip-text text-transparent">pour les domaines de plein air</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-4 animate-fade-in">
            Pour les campings, villages vacances et résidences de tourisme. Digitalisez votre accueil et simplifiez la vie de vos vacanciers.
          </p>
          <p className="text-base text-primary font-semibold animate-fade-in">
            Essai gratuit • Sans carte bancaire • Tarif dégressif dès 10 emplacements
          </p>
        </div>
      </section>

      {/* Dynamic Pricing Calculator */}
      <section className="py-12 sm:py-16 bg-dark relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-dark rounded-3xl p-8 sm:p-12 border-2 border-primary/30 glow-gradient animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Calculez votre tarif camping
              </h2>
              <p className="text-gray-400">
                Tarif dégressif par emplacement + frais de mise en place uniques de {SETUP_FEE}€ HT
              </p>
            </div>

            {/* Pitch Counter */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handlePitchChange(pitchCount - 5)}
                  className="w-14 h-14 rounded-full bg-dark-lighter border-2 border-primary/30 text-white text-2xl font-bold hover:border-primary hover:bg-primary/20 transition-all duration-300 flex items-center justify-center"
                >
                  −
                </button>
                <div className="text-center min-w-[180px]">
                  <input
                    type="number"
                    value={pitchCount}
                    onChange={(e) => handlePitchChange(parseInt(e.target.value) || 5)}
                    min={5}
                    max={300}
                    className="w-28 text-center text-5xl font-bold bg-transparent text-white border-b-2 border-primary/50 focus:border-primary outline-none pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-gray-400 text-sm mt-2">emplacements</p>
                </div>
                <button
                  onClick={() => handlePitchChange(pitchCount + 5)}
                  className="w-14 h-14 rounded-full bg-dark-lighter border-2 border-primary/30 text-white text-2xl font-bold hover:border-primary hover:bg-primary/20 transition-all duration-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Slider */}
              <div className="w-full max-w-md">
                <input
                  type="range"
                  min={5}
                  max={300}
                  step={1}
                  value={pitchCount}
                  onChange={(e) => handlePitchChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>75</span>
                  <span>150</span>
                  <span>225</span>
                  <span>300</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4">
                <div className="glass-dark rounded-xl p-5 text-center border border-primary/20">
                  <p className="text-gray-400 text-xs mb-1">Par emplacement / an</p>
                  <p className="text-2xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent">{pricePerPitch}€</p>
                  <p className="text-gray-500 text-xs mt-1">HT</p>
                </div>
                <div className="glass-dark rounded-xl p-5 text-center border border-primary/20">
                  <p className="text-gray-400 text-xs mb-1">Abonnement annuel</p>
                  <p className="text-2xl font-bold text-white">{annualPrice}€</p>
                  <p className="text-gray-500 text-xs mt-1">HT / an</p>
                </div>
                <div className="bg-gradient-purple-pink rounded-xl p-5 text-center shadow-lg transform sm:scale-105">
                  <p className="text-white/80 text-xs mb-1">Total 1ère année</p>
                  <p className="text-3xl font-bold text-white">{totalFirstYear}€</p>
                  <p className="text-white/70 text-xs mt-1">HT (avec mise en place)</p>
                </div>
                <div className="glass-dark rounded-xl p-5 text-center border border-primary/20">
                  <p className="text-gray-400 text-xs mb-1">Équivalent mensuel</p>
                  <p className="text-2xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent">{monthlyEquivalent}€</p>
                  <p className="text-gray-500 text-xs mt-1">HT / mois</p>
                </div>
              </div>

              {/* Degressive pricing table */}
              <div className="w-full mt-4">
                <p className="text-center text-gray-400 text-sm mb-4">Grille tarifaire dégressive par emplacement</p>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
                  {[
                    { pitches: '5-9', price: '39€' },
                    { pitches: '10-29', price: '33€' },
                    { pitches: '30-49', price: '27€' },
                    { pitches: '50-74', price: '22€' },
                    { pitches: '75-99', price: '18€' },
                    { pitches: '100-149', price: '14€' },
                    { pitches: '150+', price: '10€' },
                  ].map((tier, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-2 text-xs transition-all duration-300 ${
                        getPricePerPitch(parseInt(tier.pitches)) === pricePerPitch
                          ? 'bg-gradient-purple-pink text-white shadow-lg scale-105'
                          : 'glass-dark text-gray-400 border border-primary/10'
                      }`}
                    >
                      <p className="font-bold">{tier.price}</p>
                      <p className="opacity-80">{tier.pitches}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-gray-500 text-xs mt-3">
                  + Frais de mise en place : <strong className="text-gray-300">{SETUP_FEE}€ HT</strong> (unique, 1ère année uniquement)
                </p>
              </div>

              <Link href="/register" className="mt-4">
                <Button variant="primary" size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg text-lg px-10 py-4 rounded-full font-semibold">
                  Essayer gratuitement — {pitchCount} emplacements
                </Button>
              </Link>

              <p className="text-gray-500 text-sm text-center">
                Prix par emplacement / an. <strong className="text-primary">Essai gratuit sans carte bancaire.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-dark-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Des fonctionnalités<br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">pensées pour le plein air</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Chaque module est conçu pour simplifier le quotidien de vos équipes et enrichir le séjour de vos vacanciers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 flex gap-5">
                  <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo + Migration CTA */}
      <section className="py-16 sm:py-20 bg-dark relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demo Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-purple-pink rounded-2xl p-8 sm:p-10 overflow-hidden">
                <div className="absolute inset-0 bg-dark/30"></div>
                <div className="relative text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Vous souhaitez une démonstration ?
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    En moins de 30 minutes, découvrez l&apos;outil et permettez à vos équipes une prise en main immédiate. Idéal avant la saison !
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      Demander une démo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Migration Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-primary to-pink-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative glass-dark rounded-2xl p-8 sm:p-10 border-2 border-primary/30 overflow-hidden">
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    On s&apos;occupe de tout
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet, traduit et enrichi de recommandations locales. Vous gardez ensuite la main pour les mises à jour.
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      Nous contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-dark-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Des campings <span className="bg-gradient-purple-pink bg-clip-text text-transparent">nous font confiance</span>
            </h2>
            <p className="text-xl text-gray-400">
              Découvrez comment ils ont modernisé leur accueil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campingTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 animate-slide-up">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="border-t border-primary/10 pt-4">
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-24 bg-dark relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-400">
              Tout ce que les gestionnaires de camping nous demandent
            </p>
          </div>

          <div className="space-y-4">
            {campingFaqs.map((faq, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 overflow-hidden animate-slide-up">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <span className="text-white font-semibold text-base">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-5">
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-purple-pink relative overflow-hidden">
        <div className="absolute inset-0 bg-dark/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Modernisez l&apos;accueil de votre camping
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Rejoignez les établissements de plein air qui ont choisi le digital pour enchanter leurs vacanciers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Essayer gratuitement
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-white text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold">
                Demander une démo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                My Guide Digital
              </h3>
              <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-relaxed max-w-md">
                {t('home.footer.description', 'La solution moderne pour créer et partager vos livrets d\'accueil digitaux.')}
              </p>
              <div className="flex gap-3 mb-5">
                {['facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
                    <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-xs font-semibold">{social.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
              </div>
              <a href="https://wa.me/32476342364" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all duration-300 group">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent font-semibold text-sm">WhatsApp</p>
                  <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-xs">+32 476 34 23 64</p>
                </div>
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">{t('home.footer.navigation', 'Navigation')}</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.home', 'Accueil')}</Link></li>
                <li><Link href="/hote-airbnb" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.services', 'Nos services')}</Link></li>
                <li><Link href="/tarifs" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.pricing', 'Nos tarifs')}</Link></li>
                <li><Link href="/blog" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.blog', 'Blog')}</Link></li>
                <li><Link href="/login" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.login', 'Connexion')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">{t('home.footer.support', 'Support')}</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.contact', 'Contact')}</Link></li>
                <li><Link href="/#faq" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">FAQ</Link></li>
                <li><Link href="/affiliation" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.affiliation', 'Programme d\'affiliation')}</Link></li>
                <li><Link href="/cookies" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.cookies', 'Politique de cookies')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center">
            <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-sm">
              © {new Date().getFullYear()} My Guide Digital. {t('home.footer.copyright', 'Tous droits réservés.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
