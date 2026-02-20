'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

const features = [
  {
    title: '17 modules personnalisables',
    desc: 'Wi-Fi, digicode, numéros utiles, consignes d\'arrivée et départ, informations pratiques, activités à proximité, livre d\'or, mot de bienvenue, état des lieux et bien plus encore.',
    icon: '🧩',
  },
  {
    title: 'Gestion centralisée de vos livrets',
    desc: 'Que vous possédiez un seul bien ou un portefeuille entier, créez et administrez tous vos livrets d\'accueil depuis un tableau de bord unique et intuitif.',
    icon: '📋',
  },
  {
    title: 'Duplication en un clic',
    desc: 'Gagnez un temps précieux en répliquant un livret existant pour l\'adapter rapidement à un nouveau logement.',
    icon: '📑',
  },
  {
    title: 'Personnalisation à votre image',
    desc: 'Intégrez votre logo, choisissez vos couleurs, personnalisez votre profil et votre QR code pour refléter l\'identité unique de chaque hébergement.',
    icon: '🎨',
  },
  {
    title: 'Recommandations locales illimitées',
    desc: 'Suggérez sans limite des restaurants, activités et points d\'intérêt autour de chaque logement pour enrichir le séjour de vos voyageurs.',
    icon: '📍',
  },
  {
    title: 'Traduction automatique multilingue',
    desc: 'Communiquez avec une clientèle internationale grâce à la traduction automatique de vos livrets en plusieurs langues, en un seul clic.',
    icon: '🌍',
  },
  {
    title: 'Chatbot IA intégré',
    desc: 'Offrez à vos voyageurs un assistant intelligent disponible 24h/24 qui répond à toutes leurs questions à partir du contenu de votre livret.',
    icon: '🤖',
  },
  {
    title: 'Accessible sur tous les appareils',
    desc: 'Vos voyageurs accèdent au livret depuis n\'importe quel smartphone, tablette ou ordinateur via un simple QR code, sans aucun téléchargement.',
    icon: '📱',
  },
  {
    title: 'Statistiques d\'utilisation',
    desc: 'Analysez les consultations de vos livrets en temps réel pour mieux comprendre les besoins de vos voyageurs et optimiser votre accueil.',
    icon: '📊',
  },
  {
    title: 'Support réactif et dédié',
    desc: 'Notre équipe est disponible pour vous accompagner à chaque étape, avec un support humain et personnalisé.',
    icon: '💬',
  },
];

const testimonials = [
  {
    name: 'Marie-Claire D.',
    role: 'Propriétaire de gîte à Dinant',
    text: 'Depuis que j\'utilise My Guide Digital, mes voyageurs trouvent toutes les informations sans m\'appeler. Le QR code à l\'entrée fait mouche à chaque fois ! Mes notes ont grimpé à 4.9 étoiles.',
    rating: 5,
  },
  {
    name: 'Thomas L.',
    role: 'Hôte Airbnb à Bruxelles',
    text: 'L\'outil est incroyablement simple. J\'ai créé mon premier livret en moins de 20 minutes. La traduction automatique est un vrai plus avec ma clientèle internationale.',
    rating: 5,
  },
  {
    name: 'Sophie & Laurent P.',
    role: 'Chambre d\'hôtes à Durbuy',
    text: 'Le chatbot IA est une révolution ! Nos hôtes posent leurs questions à n\'importe quelle heure et obtiennent des réponses instantanées. On ne pourrait plus s\'en passer.',
    rating: 5,
  },
  {
    name: 'Jean-Marc V.',
    role: 'Gestionnaire de 5 locations à Liège',
    text: 'La duplication de livrets m\'a fait gagner un temps fou. Je gère mes 5 biens depuis un seul tableau de bord. Le rapport qualité-prix est imbattable.',
    rating: 5,
  },
  {
    name: 'Isabelle G.',
    role: 'Propriétaire de maison d\'hôtes à Namur',
    text: 'Mes clients adorent le livret digital ! Fini les classeurs poussiéreux. La personnalisation avec nos couleurs et notre logo donne un rendu très professionnel.',
    rating: 5,
  },
  {
    name: 'Patrick S.',
    role: 'Hôte Airbnb à Gand',
    text: 'J\'hésitais avec un concurrent mais le chatbot IA et le prix m\'ont convaincu. Le support est très réactif, ils m\'ont aidé à configurer mon livret en 10 minutes.',
    rating: 5,
  },
];

const faqs = [
  {
    question: 'Toutes les fonctionnalités sont-elles incluses dans chaque abonnement ?',
    answer: 'Oui, absolument ! Quel que soit votre plan (mensuel, annuel ou à vie), vous bénéficiez de l\'ensemble des fonctionnalités : tous les modules, le chatbot IA, la traduction multilingue, les statistiques et la personnalisation complète.',
  },
  {
    question: 'Puis-je créer plusieurs livrets pour différents logements ?',
    answer: 'Oui, vous pouvez créer autant de livrets que nécessaire. Chaque hébergement dispose de son propre livret personnalisable avec un QR code unique.',
  },
  {
    question: 'Le livret fonctionne-t-il sur mobile sans application ?',
    answer: 'Oui, le livret est 100% responsive et s\'ouvre directement dans le navigateur. Vos voyageurs scannent simplement le QR code, aucun téléchargement n\'est nécessaire.',
  },
  {
    question: 'Comment fonctionne le chatbot IA ?',
    answer: 'Le chatbot analyse automatiquement le contenu de votre livret et les documents que vous fournissez. Il répond aux questions de vos voyageurs 24h/24 de manière naturelle et pertinente.',
  },
  {
    question: 'Puis-je personnaliser entièrement l\'apparence de mon livret ?',
    answer: 'Absolument. Vous pouvez intégrer votre logo, choisir vos couleurs, personnaliser chaque module et adapter le contenu à l\'identité de chaque hébergement.',
  },
  {
    question: 'Y a-t-il un essai gratuit ?',
    answer: 'Oui, vous pouvez tester gratuitement l\'ensemble de la plateforme sans carte bancaire. Créez votre compte et explorez toutes les fonctionnalités à votre rythme.',
  },
  {
    question: 'Quelles langues sont disponibles pour la traduction ?',
    answer: 'Notre système de traduction automatique prend en charge de nombreuses langues dont le français, l\'anglais, l\'espagnol, l\'italien, l\'allemand, le portugais, le néerlandais, et bien d\'autres.',
  },
  {
    question: 'Et si j\'ai besoin d\'aide pour configurer mon livret ?',
    answer: 'Notre support est à votre disposition pour vous accompagner. Que ce soit par email ou via notre plateforme, nous vous répondons rapidement et avec le sourire !',
  },
];

export default function TarifsHotesPage() {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<'annual' | 'seasonal'>('annual');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="md:hidden flex items-center gap-3">
              <LanguageSelector />
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
            <span className="text-primary">Hôtes & Locations meublées</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="text-white">Un tarif adapté,</span>
            <br />
            <span className="bg-gradient-purple-pink bg-clip-text text-transparent">pensé pour chaque hôte</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-4 animate-fade-in">
            Pour les particuliers, conciergeries, propriétaires de gîtes, chambres d&apos;hôtes et gestionnaires de locations courte durée.
          </p>
          <p className="text-base text-primary font-semibold animate-fade-in">
            Essai gratuit • Sans carte bancaire • Sans engagement
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 bg-dark relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Toggle Annuel / Offres courtes durées */}
          <div className="flex justify-center mb-12 animate-fade-in">
            <div className="glass-dark rounded-full p-1.5 border border-primary/30 inline-flex">
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  billingPeriod === 'annual'
                    ? 'bg-gradient-purple-pink text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annuel
              </button>
              <button
                onClick={() => setBillingPeriod('seasonal')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  billingPeriod === 'seasonal'
                    ? 'bg-gradient-purple-pink text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Offres courtes durées
              </button>
            </div>
          </div>

          {billingPeriod === 'annual' ? (
            /* Plan Annuel unique */
            <div className="flex justify-center max-w-md mx-auto">
              <div className="w-full bg-gradient-purple-pink border-2 border-primary rounded-2xl p-8 sm:p-10 transition-all duration-300 animate-slide-up relative glow-gradient">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-6 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  ⭐ OFFRE ANNUELLE
                </div>
                <div className="absolute top-0 right-0 glass-dark text-white px-4 py-1 rounded-bl-xl rounded-tr-2xl text-sm font-bold">
                  OFFRE DE LANCEMENT
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-white mb-3">
                    <span className="text-7xl font-bold">59€</span>
                    <span className="text-2xl font-normal text-white/80 ml-1">HT/an</span>
                  </h3>
                  <p className="text-sm text-white/80 mb-2">Soit 4,92€/mois par livret</p>
                  <p className="text-xs text-white/60 mb-6">14 jours d&apos;essai gratuit • Sans carte bancaire</p>
                  <ul className="text-left space-y-3 mb-8">
                    {['Toutes les fonctionnalités incluses', 'Livrets illimités', 'Chatbot IA intégré', '17 modules personnalisables', 'Traduction multilingue', 'QR Code & personnalisation', 'Statistiques d\'utilisation', 'Support inclus', 'Mises à jour incluses'].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-white mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button variant="primary" className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0 shadow-lg font-bold text-base py-3">
                      Essayer gratuitement
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Plans Saisonniers */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* 1 Mois */}
              <div className="glass-dark border-2 border-primary/20 rounded-2xl p-8 hover:border-primary/50 hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient relative">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">1 Mois</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent">9,90€</span>
                    <span className="text-gray-400"> HT</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">par livret</p>
                  <ul className="text-left space-y-3 mb-8">
                    {['Toutes les fonctionnalités', 'Idéal pour la haute saison', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button variant="primary" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg text-base py-3">
                      Essayer gratuitement
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 2 Mois - Featured */}
              <div className="bg-gradient-purple-pink border-2 border-primary rounded-2xl p-8 hover:scale-105 transition-all duration-300 transform md:scale-105 animate-slide-up relative glow-gradient" style={{ animationDelay: '0.1s' }}>
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
                  <Link href="/register">
                    <Button variant="primary" className="w-full bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0 shadow-lg font-bold text-base py-3">
                      Essayer gratuitement
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 3 Mois */}
              <div className="glass-dark border-2 border-primary/20 rounded-2xl p-8 hover:border-primary/50 hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient relative" style={{ animationDelay: '0.2s' }}>
                <div className="absolute top-0 right-0 glass-dark text-white px-4 py-1 rounded-bl-xl rounded-tr-2xl text-sm font-bold">
                  -33%
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">3 Mois</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent">19,90€</span>
                    <span className="text-gray-400"> HT</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Soit 6,63€/livret/mois</p>
                  <ul className="text-left space-y-3 mb-8">
                    {['Toutes les fonctionnalités', 'Idéal saison complète', 'Meilleur prix saisonnier', 'Sans reconduction', 'Chatbot IA inclus'].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button variant="primary" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg text-base py-3">
                      Essayer gratuitement
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mention essai gratuit */}
          <p className="text-center text-gray-400 mt-8 text-sm animate-fade-in">
            Prix par livret. <strong className="text-primary">Essai gratuit sans carte bancaire.</strong>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-dark-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Tout ce dont vous avez besoin,<br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">dans chaque abonnement</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Chaque fonctionnalité est conçue pour simplifier votre accueil et enchanter vos voyageurs.
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

      {/* Plus de 10 hébergements */}
      <section className="py-16 sm:py-20 bg-dark relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-purple-pink rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-dark/30"></div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Vous gérez plus de 10 hébergements ?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Bénéficiez de notre tarif dégressif adapté aux gestionnaires multi-biens. Prenez rendez-vous avec notre équipe pour une offre personnalisée.
              </p>
              <Link href="/contact">
                <Button variant="primary" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-0 shadow-lg font-bold text-lg px-8 py-4 rounded-full">
                  Demander un devis personnalisé
                </Button>
              </Link>
            </div>
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
                    En moins de 30 minutes, découvrez l&apos;outil et permettez à vos équipes une prise en main immédiate. Idéal pour optimiser votre accueil !
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
                    Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet, traduit et enrichi de recommandations locales.
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
              Ce qu&apos;en disent <span className="bg-gradient-purple-pink bg-clip-text text-transparent">nos utilisateurs</span>
            </h2>
            <p className="text-xl text-gray-400">
              Des centaines d&apos;hôtes nous font déjà confiance au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 animate-slide-up">
                  {/* Stars */}
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
              Tout ce que vous devez savoir avant de vous lancer
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
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
            Prêt à digitaliser votre accueil ?
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Créez votre premier livret en quelques minutes et offrez une expérience mémorable à vos voyageurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Créer mon livret gratuitement
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-white text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold">
                Nous contacter
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
                <a href="#" className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300" title="Facebook">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300" title="Instagram">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-black flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300" title="TikTok">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.34 6.34 0 001.88-4.5V8.73a8.19 8.19 0 004.7 1.49V6.77a4.83 4.83 0 01-1-.08z"/></svg>
                </a>
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
                <li><Link href="/mentions-legales" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.legal', 'Mentions légales')}</Link></li>
                <li><Link href="/confidentialite" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.privacy', 'Confidentialité')}</Link></li>
                <li><Link href="/cgvu" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.cgvu', 'CGVU')}</Link></li>
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
