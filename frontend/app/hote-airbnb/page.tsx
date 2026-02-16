'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

const whyBlocks = [
  {
    icon: '📱',
    title: 'Accessible partout, à tout moment',
    desc: 'Votre livret d\'accueil est 100% digital et consultable sur smartphone, tablette ou ordinateur. Vos voyageurs accèdent à toutes les informations essentielles d\'un simple scan de QR code, sans rien télécharger.',
  },
  {
    icon: '🎨',
    title: 'Personnalisation complète à votre image',
    desc: 'Intégrez votre logo, vos couleurs et votre identité visuelle pour offrir un accueil professionnel et cohérent avec votre marque. Chaque détail reflète votre établissement.',
  },
  {
    icon: '🌿',
    title: 'Une démarche éco-responsable',
    desc: 'Fini les impressions papier répétitives. Avec My Guide Digital, seul le QR code est imprimé. Réduisez votre empreinte écologique tout en modernisant votre accueil.',
  },
  {
    icon: '🚀',
    title: 'Des outils innovants intégrés',
    desc: 'Chatbot IA disponible 24h/24, traduction multilingue automatique, statistiques d\'utilisation et check-in digitalisé : tout est pensé pour enrichir l\'expérience de vos voyageurs.',
  },
];

const features = [
  {
    icon: '🌍',
    title: 'Traduction multilingue automatique',
    desc: 'Accueillez des voyageurs du monde entier grâce à la traduction automatique de votre livret en plusieurs langues. Le contenu s\'adapte automatiquement à la langue de chaque visiteur pour une expérience fluide et naturelle.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: '📊',
    title: 'Statistiques et suivi d\'engagement',
    desc: 'Mesurez l\'impact de votre livret grâce à des données de consultation détaillées. Identifiez les sections les plus consultées, les moments de pic d\'utilisation et optimisez votre contenu en conséquence.',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    icon: '🔄',
    title: 'Mises à jour instantanées et duplication',
    desc: 'Modifiez vos informations en temps réel depuis votre tableau de bord. Dupliquez facilement vos livrets pour gérer plusieurs hébergements sans repartir de zéro. Un gain de temps considérable.',
    gradient: 'from-amber-500 to-orange-400',
  },
  {
    icon: '📍',
    title: 'Recommandations et points d\'intérêt locaux',
    desc: 'Partagez vos meilleures adresses, restaurants, activités et sites touristiques à proximité. Enrichissez le séjour de vos voyageurs en leur offrant des conseils personnalisés et authentiques.',
    gradient: 'from-rose-500 to-pink-400',
  },
  {
    icon: '🔗',
    title: 'Liens utiles et ventes additionnelles',
    desc: 'Ajoutez des liens cliquables vers vos partenaires, réservations d\'activités ou boutique en ligne. Créez de nouvelles opportunités de revenus tout en améliorant l\'expérience de vos hôtes.',
    gradient: 'from-violet-500 to-purple-400',
  },
  {
    icon: '🎨',
    title: 'Personnalisation avancée et marque blanche',
    desc: 'Adaptez chaque module de votre livret : couleurs, polices, logo, catégories personnalisées et conseils sur mesure. Offrez un accueil digital qui vous ressemble vraiment.',
    gradient: 'from-fuchsia-500 to-pink-400',
  },
  {
    icon: '📲',
    title: 'Accès simplifié par QR code',
    desc: 'Un simple scan depuis le smartphone suffit pour accéder à l\'intégralité de votre livret. Placez le QR code à l\'entrée, sur la table de nuit ou dans votre email de bienvenue. Aucune application requise.',
    gradient: 'from-indigo-500 to-blue-400',
  },
  {
    icon: '🤖',
    title: 'Chatbot IA intégré 24h/24',
    desc: 'Votre assistant intelligent répond instantanément aux questions de vos voyageurs, jour et nuit. Code Wi-Fi, horaires, consignes, recommandations : tout est traité automatiquement à partir de votre contenu.',
    gradient: 'from-primary to-pink-400',
  },
  {
    icon: '📝',
    title: 'Gestion de contenu intuitive',
    desc: 'Ajoutez facilement des photos, vidéos, documents PDF et textes. Réorganisez vos modules en quelques clics pour créer un livret complet et attractif, sans aucune compétence technique.',
    gradient: 'from-teal-500 to-emerald-400',
  },
];

const testimonials = [
  {
    name: 'Aurélien B.',
    role: 'Propriétaire de gîte',
    text: 'Super service pour la gestion de notre gîte. L\'outil est tellement agréable et intuitif que nous avons décidé de l\'adopter définitivement. Nos voyageurs adorent et nous le font savoir !',
    rating: 5,
  },
  {
    name: 'Caroline M.',
    role: 'Hôte Airbnb',
    text: 'Application au top ! Depuis plus d\'un an en location saisonnière, mes clients la trouvent super pratique. La traduction dans plusieurs langues, même les plus rares, est un vrai atout. Je recommande fortement.',
    rating: 5,
  },
  {
    name: 'Jan F.',
    role: 'Multi-propriétaire',
    text: 'Depuis 2 ans nous utilisons My Guide Digital pour nos deux gîtes. Le grand avantage c\'est de pouvoir modifier un seul module quand on change un équipement. Les locataires ont toutes les infos sur leur téléphone.',
    rating: 5,
  },
  {
    name: 'Élodie S.',
    role: 'Conciergerie',
    text: 'Application très facile d\'utilisation, simple, efficace et complète. Le service d\'assistance est au petit soin et réactif. Une aide précieuse pour notre conciergerie en développement !',
    rating: 5,
  },
  {
    name: 'Tiffany C.',
    role: 'Gestionnaire de locations',
    text: 'Je gère plusieurs locations de vacances et les livrets me font gagner énormément de temps dans les échanges avec les voyageurs. La traduction est excellente et les retours toujours positifs.',
    rating: 5,
  },
  {
    name: 'Christophe R.',
    role: 'Location saisonnière',
    text: 'Nous avons plusieurs appartements en location saisonnière. La création d\'un livret est rapide et intuitive avec de nombreuses options de personnalisation. Modifiable à tout moment. On recommande vivement !',
    rating: 5,
  },
];

export default function NosServicesPage() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <span className="text-white/70 text-sm font-medium">Solution tout-en-un pour l&apos;accueil digital</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              Réinventez l&apos;accueil<br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                de vos voyageurs
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-4 font-medium">
              Transformez chaque séjour en une expérience unique
            </h2>
            <p className="text-lg text-white/40 max-w-3xl mx-auto mb-10 leading-relaxed">
              Facilitez l&apos;accès aux informations essentielles, personnalisez l&apos;accueil de vos visiteurs et répondez aux attentes des voyageurs d&apos;aujourd&apos;hui. My Guide Digital accompagne les hôteliers, gestionnaires de campings et propriétaires de locations saisonnières.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <span className="relative">Créer votre livret d&apos;accueil digital</span>
                </button>
              </Link>
              <Link href="/tarifs">
                <button className="px-8 py-4 rounded-full font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-lg">
                  Découvrir nos tarifs
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
              <span className="text-white/70 text-sm font-medium">💡 Pourquoi nous choisir</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi My Guide Digital est{' '}
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                la solution idéale
              </span>{' '}?
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">
              Un livret d&apos;accueil digital pensé pour répondre aux attentes des voyageurs et simplifier votre quotidien.
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
                <span className="relative">Créer votre livret d&apos;accueil digital</span>
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
              <span className="text-white/70 text-sm font-medium">⚡ Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Découvrez nos solutions<br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                pour un accueil parfait
              </span>
            </h2>
            <p className="text-xl text-white/40 max-w-2xl mx-auto">
              Chaque fonctionnalité est conçue pour améliorer l&apos;accueil de vos voyageurs.
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
                      En savoir plus
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
                <span className="relative">🚀 Tester gratuitement My Guide Digital</span>
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
              <span className="text-white/70 text-sm font-medium">⭐ Témoignages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Ils ont adopté My Guide Digital,<br />
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                découvrez leurs témoignages !
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
              Vous souhaitez{' '}
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                découvrir le livret
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
                    Vous souhaitez une démonstration ?
                  </h3>
                  <p className="text-white/60 mb-6 leading-relaxed">
                    En moins de 30 minutes, découvrez l&apos;outil et permettez à vos équipes une prise en main immédiate. Idéal pour optimiser votre accueil !
                  </p>
                  <Link href="/contact">
                    <button className="relative group/btn px-8 py-3 rounded-full font-bold text-slate-900 overflow-hidden transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                      <span className="relative">Réserver une démo</span>
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
                    On s&apos;occupe de tout
                  </h3>
                  <p className="text-white/40 mb-6 leading-relaxed">
                    Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet, traduit et enrichi de recommandations locales.
                  </p>
                  <Link href="/contact">
                    <button className="relative group/btn px-8 py-3 rounded-full font-bold text-white overflow-hidden transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                      <span className="relative">Nous contacter</span>
                    </button>
                  </Link>
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
            Il est temps de créer votre livret !
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/60">
            Testez gratuitement et offrez une expérience mémorable à vos voyageurs.<br />
            <strong className="text-white">Lancez-vous !</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative">Créer mon livret d&apos;accueil</span>
              </button>
            </Link>
            <Link href="/tarifs">
              <button className="px-8 py-4 rounded-full font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-lg">
                Voir nos tarifs
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
              <p className="bg-gradient-to-r from-purple-300/60 via-violet-300/50 to-purple-400/60 bg-clip-text text-transparent mb-6 leading-relaxed max-w-md">
                La solution moderne pour créer et partager vos livrets d&apos;accueil digitaux. Simplifiez l&apos;expérience de vos voyageurs.
              </p>
              <div className="flex gap-3">
                {['facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
                    <span className="bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent text-xs font-semibold">{social.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white text-sm uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Accueil</Link></li>
                <li><Link href="/hote-airbnb" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Nos services</Link></li>
                <li><Link href="/tarifs" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Nos tarifs</Link></li>
                <li><Link href="/blog" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Blog</Link></li>
                <li><Link href="/login" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Contact</Link></li>
                <li><Link href="/#faq" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">FAQ</Link></li>
                <li><Link href="/affiliation" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Programme d&apos;affiliation</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center">
            <p className="bg-gradient-to-r from-purple-400/30 via-violet-300/30 to-purple-400/30 bg-clip-text text-transparent text-sm">
              © {new Date().getFullYear()} My Guide Digital. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
