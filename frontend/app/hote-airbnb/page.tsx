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
    cta: 'En savoir plus',
  },
  {
    icon: '📊',
    title: 'Statistiques et suivi d\'engagement',
    desc: 'Mesurez l\'impact de votre livret grâce à des données de consultation détaillées. Identifiez les sections les plus consultées, les moments de pic d\'utilisation et optimisez votre contenu en conséquence.',
    cta: 'En savoir plus',
  },
  {
    icon: '🔄',
    title: 'Mises à jour instantanées et duplication',
    desc: 'Modifiez vos informations en temps réel depuis votre tableau de bord. Dupliquez facilement vos livrets pour gérer plusieurs hébergements sans repartir de zéro. Un gain de temps considérable.',
    cta: 'En savoir plus',
  },
  {
    icon: '📍',
    title: 'Recommandations et points d\'intérêt locaux',
    desc: 'Partagez vos meilleures adresses, restaurants, activités et sites touristiques à proximité. Enrichissez le séjour de vos voyageurs en leur offrant des conseils personnalisés et authentiques.',
    cta: 'En savoir plus',
  },
  {
    icon: '🔗',
    title: 'Liens utiles et ventes additionnelles',
    desc: 'Ajoutez des liens cliquables vers vos partenaires, réservations d\'activités ou boutique en ligne. Créez de nouvelles opportunités de revenus tout en améliorant l\'expérience de vos hôtes.',
    cta: 'En savoir plus',
  },
  {
    icon: '🎨',
    title: 'Personnalisation avancée et marque blanche',
    desc: 'Adaptez chaque module de votre livret : couleurs, polices, logo, catégories personnalisées et conseils sur mesure. Offrez un accueil digital qui vous ressemble vraiment.',
    cta: 'En savoir plus',
  },
  {
    icon: '📲',
    title: 'Accès simplifié par QR code',
    desc: 'Un simple scan depuis le smartphone suffit pour accéder à l\'intégralité de votre livret. Placez le QR code à l\'entrée, sur la table de nuit ou dans votre email de bienvenue. Aucune application requise.',
    cta: 'En savoir plus',
  },
  {
    icon: '🤖',
    title: 'Chatbot IA intégré 24h/24',
    desc: 'Votre assistant intelligent répond instantanément aux questions de vos voyageurs, jour et nuit. Code Wi-Fi, horaires, consignes, recommandations : tout est traité automatiquement à partir de votre contenu.',
    cta: 'En savoir plus',
  },
  {
    icon: '📝',
    title: 'Gestion de contenu intuitive',
    desc: 'Ajoutez facilement des photos, vidéos, documents PDF et textes. Réorganisez vos modules en quelques clics pour créer un livret complet et attractif, sans aucune compétence technique.',
    cta: 'En savoir plus',
  },
];

const testimonials = [
  {
    name: 'Aurélien B.',
    text: 'Super service pour la gestion de notre gîte. L\'outil est tellement agréable et intuitif que nous avons décidé de l\'adopter définitivement. Nos voyageurs adorent et nous le font savoir !',
    rating: 5,
  },
  {
    name: 'Caroline M.',
    text: 'Application au top ! Depuis plus d\'un an en location saisonnière, mes clients la trouvent super pratique. La traduction dans plusieurs langues, même les plus rares, est un vrai atout. Je recommande fortement.',
    rating: 5,
  },
  {
    name: 'Jan F.',
    text: 'Depuis 2 ans nous utilisons My Guide Digital pour nos deux gîtes. Le grand avantage c\'est de pouvoir modifier un seul module quand on change un équipement. Les locataires ont toutes les infos sur leur téléphone.',
    rating: 5,
  },
  {
    name: 'Élodie S.',
    text: 'Application très facile d\'utilisation, simple, efficace et complète. Le service d\'assistance est au petit soin et réactif. Une aide précieuse pour notre conciergerie en développement !',
    rating: 5,
  },
  {
    name: 'Tiffany C.',
    text: 'Je gère plusieurs locations de vacances et les livrets me font gagner énormément de temps dans les échanges avec les voyageurs. La traduction est excellente et les retours toujours positifs.',
    rating: 5,
  },
  {
    name: 'Christophe R.',
    text: 'Nous avons plusieurs appartements en location saisonnière. La création d\'un livret est rapide et intuitive avec de nombreuses options de personnalisation. Modifiable à tout moment. On recommande vivement !',
    rating: 5,
  },
];

export default function NosServicesPage() {
  const { t } = useTranslation();
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
              <Link href="/" className="text-white hover:text-primary transition-colors">{t('nav.home', 'Accueil')}</Link>
              <Link href="/hote-airbnb" className="text-primary font-semibold">{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="text-white hover:text-primary transition-colors">{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="text-white hover:text-primary transition-colors">{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="text-white hover:text-primary transition-colors">{t('nav.contact', 'Contact')}</Link>
              <Link href="/login" className="text-white hover:text-primary transition-colors">{t('nav.login', 'Connexion')}</Link>
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <Link href="/register">
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold">
                  <span className="flex items-center gap-2">
                    <span>&gt;</span>
                    <span>{t('nav.testApp', 'Testez notre App gratuitement')}</span>
                  </span>
                </Button>
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-primary transition-colors"
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
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-primary/20 py-4 space-y-3">
              <Link href="/" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home', 'Accueil')}</Link>
              <Link href="/hote-airbnb" className="block text-primary font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.contact', 'Contact')}</Link>
              <Link href="/login" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login', 'Connexion')}</Link>
              <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold">
                  <span className="flex items-center justify-center gap-2">
                    <span>&gt;</span>
                    <span>{t('nav.testApp', 'Testez notre App gratuitement')}</span>
                  </span>
                </Button>
              </Link>
              <div className="pt-2">
                <LanguageSelector />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark via-dark-light to-dark-lighter relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Réinventez l&apos;accueil<br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">
                de vos voyageurs avec My Guide Digital
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-4 font-medium">
              Transformez chaque séjour en une expérience unique
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Facilitez l&apos;accès aux informations essentielles, personnalisez l&apos;accueil de vos visiteurs et répondez aux attentes des voyageurs d&apos;aujourd&apos;hui. My Guide Digital accompagne les hôteliers, gestionnaires de campings et propriétaires de locations saisonnières avec des outils digitaux innovants pour un accueil mémorable et sans effort.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="bg-gradient-to-r from-primary to-pink-500 text-white hover:from-primary-light hover:to-pink-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                  Créer votre livret d&apos;accueil digital
                </Button>
              </Link>
              <Link href="/tarifs">
                <Button variant="outline" size="lg" className="bg-gradient-to-r from-purple-600 to-primary text-white hover:from-purple-700 hover:to-primary-light border-0 text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold">
                  Découvrir nos tarifs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section - 4 blocks */}
      <section className="py-20 sm:py-24 bg-dark relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi My Guide Digital est <span className="bg-gradient-purple-pink bg-clip-text text-transparent">la solution idéale</span> ?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Un livret d&apos;accueil digital pensé pour répondre aux attentes des voyageurs et simplifier votre quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyBlocks.map((block, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-2xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-300 animate-slide-up h-full">
                  <div className="text-4xl mb-4">{block.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{block.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{block.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-primary to-pink-500 text-white hover:from-primary-light hover:to-pink-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Créer votre livret d&apos;accueil digital
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - 9 blocks */}
      <section className="py-20 sm:py-24 bg-dark-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Découvrez nos solutions<br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">pour un accueil parfait</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Chaque fonctionnalité est conçue pour améliorer l&apos;accueil de vos voyageurs. Découvrez-les toutes ou testez-les directement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-2xl p-8 border border-primary/10 hover:border-primary/30 transition-all duration-300 animate-slide-up h-full flex flex-col">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed flex-grow">{feature.desc}</p>
                  <div className="mt-6">
                    <Link href="/register" className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-sm font-semibold group/link">
                      {feature.cta}
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
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-0 shadow-lg font-bold text-lg px-10 py-4 rounded-full">
                Tester gratuitement My Guide Digital
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Ils ont adopté My Guide Digital,<br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">découvrez leurs témoignages !</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 animate-slide-up h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 italic flex-grow">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="border-t border-primary/10 pt-4">
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo + Migration CTA */}
      <section className="py-16 sm:py-20 bg-dark-light relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Vous souhaitez <span className="bg-gradient-purple-pink bg-clip-text text-transparent">découvrir le livret</span> ?
            </h2>
          </div>

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
                      Réserver une démo
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

      {/* CTA Final */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-purple-pink relative overflow-hidden">
        <div className="absolute inset-0 bg-dark/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Il est temps de créer votre livret !
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Testez gratuitement et offrez une expérience mémorable à vos voyageurs.<br />
            <strong>Lancez-vous !</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-primary to-pink-500 text-white hover:from-primary-light hover:to-pink-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Créer mon livret d&apos;accueil
              </Button>
            </Link>
            <Link href="/tarifs">
              <Button variant="outline" size="lg" className="bg-gradient-to-r from-purple-600 to-primary text-white hover:from-purple-700 hover:to-primary-light border-0 text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold">
                Voir nos tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-lighter text-white py-12 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-pink-500 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
              <p className="text-gray-400 mt-4 max-w-md">
                Le livret d&apos;accueil digital destiné à tous les types d&apos;hébergements : locations courte durée, hôtels, gîtes, chambres d&apos;hôtes, campings.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
                <li><Link href="/hote-airbnb" className="hover:text-primary transition-colors">Nos services</Link></li>
                <li><Link href="/tarifs" className="hover:text-primary transition-colors">Nos tarifs</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-primary transition-colors">Nous contacter</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Se connecter</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Créer un compte</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary/10 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} My Guide Digital. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
