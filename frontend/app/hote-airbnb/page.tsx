'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

export default function NosServicesPage() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const whyBlocks = [
    {
      icon: '📱',
      title: t('services.why.block1Title', 'Accessible partout, à tout moment'),
      desc: t('services.why.block1Desc', 'Votre livret d\'accueil est 100% digital et consultable sur smartphone, tablette ou ordinateur. Vos voyageurs accèdent à toutes les informations essentielles d\'un simple scan de QR code, sans rien télécharger.'),
    },
    {
      icon: '🎨',
      title: t('services.why.block2Title', 'Personnalisation complète à votre image'),
      desc: t('services.why.block2Desc', 'Intégrez votre logo, vos couleurs et votre identité visuelle pour offrir un accueil professionnel et cohérent avec votre marque. Chaque détail reflète votre établissement.'),
    },
    {
      icon: '🌿',
      title: t('services.why.block3Title', 'Une démarche éco-responsable'),
      desc: t('services.why.block3Desc', 'Fini les impressions papier répétitives. Avec My Guide Digital, seul le QR code est imprimé. Réduisez votre empreinte écologique tout en modernisant votre accueil.'),
    },
    {
      icon: '🚀',
      title: t('services.why.block4Title', 'Des outils innovants intégrés'),
      desc: t('services.why.block4Desc', 'Chatbot IA disponible 24h/24, traduction multilingue automatique, statistiques d\'utilisation et check-in digitalisé : tout est pensé pour enrichir l\'expérience de vos voyageurs.'),
    },
  ];

  const features = [
    {
      icon: '🌍',
      title: t('services.features.f1Title', 'Traduction multilingue automatique'),
      desc: t('services.features.f1Desc', 'Accueillez des voyageurs du monde entier grâce à la traduction automatique de votre livret en plusieurs langues.'),
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: '📊',
      title: t('services.features.f2Title', 'Statistiques et suivi d\'engagement'),
      desc: t('services.features.f2Desc', 'Mesurez l\'impact de votre livret grâce à des données de consultation détaillées.'),
      gradient: 'from-emerald-500 to-teal-400',
    },
    {
      icon: '🔄',
      title: t('services.features.f3Title', 'Mises à jour instantanées et duplication'),
      desc: t('services.features.f3Desc', 'Modifiez vos informations en temps réel depuis votre tableau de bord.'),
      gradient: 'from-amber-500 to-orange-400',
    },
    {
      icon: '📍',
      title: t('services.features.f4Title', 'Recommandations et points d\'intérêt locaux'),
      desc: t('services.features.f4Desc', 'Partagez vos meilleures adresses, restaurants, activités et sites touristiques à proximité.'),
      gradient: 'from-rose-500 to-pink-400',
    },
    {
      icon: '🔗',
      title: t('services.features.f5Title', 'Liens utiles et ventes additionnelles'),
      desc: t('services.features.f5Desc', 'Ajoutez des liens cliquables vers vos partenaires, réservations d\'activités ou boutique en ligne.'),
      gradient: 'from-violet-500 to-purple-400',
    },
    {
      icon: '🎨',
      title: t('services.features.f6Title', 'Personnalisation avancée et marque blanche'),
      desc: t('services.features.f6Desc', 'Adaptez chaque module de votre livret : couleurs, polices, logo, catégories personnalisées et conseils sur mesure.'),
      gradient: 'from-fuchsia-500 to-pink-400',
    },
    {
      icon: '📲',
      title: t('services.features.f7Title', 'Accès simplifié par QR code'),
      desc: t('services.features.f7Desc', 'Un simple scan depuis le smartphone suffit pour accéder à l\'intégralité de votre livret.'),
      gradient: 'from-indigo-500 to-blue-400',
    },
    {
      icon: '🤖',
      title: t('services.features.f8Title', 'Chatbot IA intégré 24h/24'),
      desc: t('services.features.f8Desc', 'Votre assistant intelligent répond instantanément aux questions de vos voyageurs, jour et nuit.'),
      gradient: 'from-primary to-pink-400',
    },
    {
      icon: '📝',
      title: t('services.features.f9Title', 'Gestion de contenu intuitive'),
      desc: t('services.features.f9Desc', 'Ajoutez facilement des photos, vidéos, documents PDF et textes. Réorganisez vos modules en quelques clics.'),
      gradient: 'from-teal-500 to-emerald-400',
    },
  ];

  const testimonials = [
    {
      name: t('services.testimonials.t1Name', 'Aurélien B.'),
      role: t('services.testimonials.t1Role', 'Propriétaire de gîte'),
      text: t('services.testimonials.t1Text', 'Super service pour la gestion de notre gîte. L\'outil est tellement agréable et intuitif que nous avons décidé de l\'adopter définitivement.'),
      rating: 5,
    },
    {
      name: t('services.testimonials.t2Name', 'Caroline M.'),
      role: t('services.testimonials.t2Role', 'Hôte Airbnb'),
      text: t('services.testimonials.t2Text', 'Application au top ! Depuis plus d\'un an en location saisonnière, mes clients la trouvent super pratique.'),
      rating: 5,
    },
    {
      name: t('services.testimonials.t3Name', 'Jan F.'),
      role: t('services.testimonials.t3Role', 'Multi-propriétaire'),
      text: t('services.testimonials.t3Text', 'Depuis 2 ans nous utilisons My Guide Digital pour nos deux gîtes.'),
      rating: 5,
    },
    {
      name: t('services.testimonials.t4Name', 'Élodie S.'),
      role: t('services.testimonials.t4Role', 'Conciergerie'),
      text: t('services.testimonials.t4Text', 'Application très facile d\'utilisation, simple, efficace et complète.'),
      rating: 5,
    },
    {
      name: t('services.testimonials.t5Name', 'Tiffany C.'),
      role: t('services.testimonials.t5Role', 'Gestionnaire de locations'),
      text: t('services.testimonials.t5Text', 'Je gère plusieurs locations de vacances et les livrets me font gagner énormément de temps.'),
      rating: 5,
    },
    {
      name: t('services.testimonials.t6Name', 'Christophe R.'),
      role: t('services.testimonials.t6Role', 'Location saisonnière'),
      text: t('services.testimonials.t6Text', 'Nous avons plusieurs appartements en location saisonnière. La création d\'un livret est rapide et intuitive.'),
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950">

      {/* ══════════════════════════════════════ */}
      {/* NAVIGATION */}
      {/* ══════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.home', 'Accueil')}
              </Link>
              <Link href="/hote-airbnb" className="text-white font-semibold text-sm border-b-2 border-primary pb-0.5">
                {t('nav.services', 'Nos services')}
              </Link>
              <Link href="/tarifs" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.pricing', 'Nos tarifs')}
              </Link>
              <Link href="/blog" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.blog', 'Blog')}
              </Link>
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.contact', 'Contact')}
              </Link>
              <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.login', 'Connexion')}
              </Link>
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <Link href="/register">
                <button className="relative group px-6 py-2.5 rounded-full font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    <span>✨</span>
                    <span>{t('nav.testApp', 'Testez gratuitement')}</span>
                  </span>
                </button>
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Menu"
              >
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
            <div className="md:hidden border-t border-white/5 py-4 space-y-3">
              <Link href="/" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home', 'Accueil')}</Link>
              <Link href="/hote-airbnb" className="block text-white font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.contact', 'Contact')}</Link>
              <Link href="/login" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login', 'Connexion')}</Link>
              <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full relative group px-6 py-2.5 rounded-full font-semibold text-sm text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>{t('nav.testApp', 'Testez gratuitement')}</span>
                  </span>
                </button>
              </Link>
              <div className="pt-2">
                <LanguageSelector />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════ */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-pink-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/70 text-sm font-medium">{t('services.badge', 'Solution tout-en-un pour l\'accueil digital')}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              {t('services.hero.title1', 'Réinventez l\'accueil')}<br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('services.hero.title2', 'de vos voyageurs')}
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-4 font-medium">
              {t('services.hero.subtitle', 'Transformez chaque séjour en une expérience unique')}
            </h2>
            <p className="text-lg text-white/40 max-w-3xl mx-auto mb-10 leading-relaxed">
              {t('services.hero.description', 'Facilitez l\'accès aux informations essentielles, personnalisez l\'accueil de vos visiteurs et répondez aux attentes des voyageurs d\'aujourd\'hui.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <span className="relative">{t('services.hero.cta', 'Créer votre livret d\'accueil digital')}</span>
                </button>
              </Link>
              <Link href="/tarifs">
                <button className="px-8 py-4 rounded-full font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-lg">
                  {t('services.hero.pricing', 'Découvrir nos tarifs')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* POURQUOI MY GUIDE DIGITAL - 4 blocs */}
      {/* ══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-white/70 text-sm font-medium">{t('services.why.badge', '💡 Pourquoi nous choisir')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('services.why.title1', 'Pourquoi My Guide Digital est')}{' '}
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('services.why.title2', 'la solution idéale')}
              </span>{' '}?
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">
              {t('services.why.subtitle', 'Un livret d\'accueil digital pensé pour répondre aux attentes des voyageurs et simplifier votre quotidien.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyBlocks.map((block, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-pink-500/50 to-purple-500/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 h-full">
                  <div className="text-4xl mb-5">{block.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{block.title}</h3>
                  <p className="text-white/40 leading-relaxed">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/register">
              <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative">{t('services.hero.cta', 'Créer votre livret d\'accueil digital')}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* NOS FONCTIONNALITÉS - 9 blocs */}
      {/* ══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-transparent to-purple-950/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-white/70 text-sm font-medium">{t('services.features.badge', '⚡ Fonctionnalités')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('services.features.title1', 'Découvrez nos solutions')}<br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('services.features.title2', 'pour un accueil parfait')}
              </span>
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">
              {t('services.features.subtitle', 'Chaque fonctionnalité est conçue pour améliorer l\'accueil de vos voyageurs.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-pink-500/40 to-purple-500/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-7 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed flex-grow">{feature.desc}</p>
                  <div className="mt-5">
                    <Link href="/register" className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-sm font-semibold group/link">
                      {t('services.features.learnMore', 'En savoir plus')}
                      <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/register">
              <button className="relative group px-10 py-4 rounded-full font-bold text-slate-900 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/30 text-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
                <span className="relative">{t('services.features.ctaTest', '🚀 Tester gratuitement My Guide Digital')}</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* TÉMOIGNAGES */}
      {/* ══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="text-white/70 text-sm font-medium">{t('services.testimonials.badge', '⭐ Témoignages')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('services.testimonials.title1', 'Ils ont adopté My Guide Digital,')}<br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('services.testimonials.title2', 'découvrez leurs témoignages !')}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-pink-500/30 to-purple-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-5 italic flex-grow">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-white/30 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* DEMO + MIGRATION */}
      {/* ══════════════════════════════════════ */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('services.demo.title', 'Vous souhaitez')}{' '}
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('services.demo.titleHighlight', 'découvrir le livret')}
              </span>{' '}?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demo */}
            <div className="group relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative rounded-2xl p-8 sm:p-10 overflow-hidden bg-gradient-to-br from-primary/20 via-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative text-center">
                  <div className="text-4xl mb-4">🎥</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {t('services.demo.demoTitle', 'Vous souhaitez une démonstration ?')}
                  </h3>
                  <p className="text-white/60 mb-6 leading-relaxed">
                    {t('services.demo.demoDesc', 'En moins de 30 minutes, découvrez l\'outil et permettez à vos équipes une prise en main immédiate.')}
                  </p>
                  <Link href="/contact">
                    <button className="relative group/btn px-8 py-3 rounded-full font-bold text-slate-900 overflow-hidden transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                      <span className="relative">{t('services.demo.demoCta', 'Réserver une démo')}</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Migration */}
            <div className="group relative">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-primary to-pink-500 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/[0.08] overflow-hidden">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {t('services.demo.migrationTitle', 'On s\'occupe de tout')}
                  </h3>
                  <p className="text-white/40 mb-6 leading-relaxed">
                    {t('services.demo.migrationDesc', 'Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet.')}
                  </p>
                  <Link href="/contact">
                    <button className="relative group/btn px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                      <span className="relative">{t('services.demo.migrationCta', 'Nous contacter')}</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* PROGRAMME D'AFFILIATION */}
      {/* ══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent"></div>
        <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="group relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/50 via-primary/50 to-pink-500/50 rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/[0.08] overflow-hidden">
              {/* Bande supérieure dégradée */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-primary to-pink-500"></div>
              
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                  {/* Contenu texte */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                      <span className="text-emerald-400 text-sm font-semibold">🤝 {t('services.affiliation.badge', 'Programme Partenaire')}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                      {t('services.affiliation.title', 'Gagnez de l\'argent en')}{' '}
                      <span className="bg-gradient-to-r from-emerald-400 via-primary to-pink-400 bg-clip-text text-transparent">
                        {t('services.affiliation.titleHighlight', 'recommandant My Guide Digital')}
                      </span>
                    </h2>
                    <p className="text-white/50 text-lg leading-relaxed mb-8">
                      {t('services.affiliation.desc', 'Rejoignez notre programme d\'affiliation et percevez 30% de commission sur chaque vente. Revenus récurrents sur les renouvellements, dashboard de suivi en temps réel et paiements rapides.')}
                    </p>

                    {/* Avantages clés */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      {[
                        { icon: '💰', label: t('services.affiliation.advantage1', '30% de commission'), sub: t('services.affiliation.advantage1Sub', 'Sur chaque vente') },
                        { icon: '🔄', label: t('services.affiliation.advantage2', 'Revenus récurrents'), sub: t('services.affiliation.advantage2Sub', 'Sur les renouvellements') },
                        { icon: '⚡', label: t('services.affiliation.advantage3', 'Paiement rapide'), sub: t('services.affiliation.advantage3Sub', 'Sous 7 jours') },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] text-center">
                          <div className="text-2xl mb-2">{item.icon}</div>
                          <p className="text-white font-semibold text-sm">{item.label}</p>
                          <p className="text-white/30 text-xs mt-1">{item.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                      <Link href="/affiliation">
                        <button className="relative group/btn px-8 py-4 rounded-full font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 text-lg">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 transition-all duration-300"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 blur-xl opacity-40 group-hover/btn:opacity-70 transition-opacity"></div>
                          <span className="relative flex items-center gap-2">
                            <span>🚀</span>
                            <span>{t('services.affiliation.cta', 'Devenir partenaire affilié')}</span>
                          </span>
                        </button>
                      </Link>
                      <Link href="/affiliation">
                        <button className="px-8 py-4 rounded-full font-semibold text-white/70 hover:text-white border border-white/10 hover:border-emerald-500/30 hover:bg-white/5 transition-all duration-300 text-lg">
                          {t('services.affiliation.learnMore', 'En savoir plus')}
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Illustration côté droit */}
                  <div className="flex-shrink-0 hidden lg:block">
                    <div className="relative w-64 h-64">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-primary/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
                      <div className="relative bg-white/[0.05] rounded-3xl border border-white/[0.08] p-8 h-full flex flex-col items-center justify-center gap-4">
                        <div className="text-6xl">🤝</div>
                        <div className="text-center">
                          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">30%</p>
                          <p className="text-white/40 text-sm mt-1">{t('services.affiliation.commissionLabel', 'de commission')}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-emerald-400 text-xs font-medium">{t('services.affiliation.openStatus', 'Programme ouvert')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CTA FINAL */}
      {/* ══════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-pink-500/10 to-purple-500/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            {t('services.cta.title', 'Il est temps de créer votre livret !')}
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/60">
            {t('services.cta.desc', 'Testez gratuitement et offrez une expérience mémorable à vos voyageurs.')}<br />
            <strong className="text-white">{t('services.cta.launch', 'Lancez-vous !')}</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative">{t('services.cta.createCta', 'Créer mon livret d\'accueil')}</span>
              </button>
            </Link>
            <Link href="/tarifs">
              <button className="px-8 py-4 rounded-full font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-lg">
                {t('services.cta.pricingCta', 'Voir nos tarifs')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════ */}
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
