'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

const accommodationTypes = [
  {
    id: 'airbnb',
    href: '/tarifs/hotes',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5M10.5 21H3m0 0V3.545M3 3.545h18M3 3.545L12 1.5l9 2.045" />
      </svg>
    ),
    titleKey: 'tarifs.types.airbnb.title',
    titleDefault: 'Hôtes Airbnb, gîtes & chambres d\'hôtes',
    descKey: 'tarifs.types.airbnb.desc',
    descDefault: 'Offrez une expérience fluide et boostez vos avis 5 étoiles grâce à un livret d\'accueil digital personnalisé.',
  },
  {
    id: 'hotel',
    href: '/tarifs/hotels',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    titleKey: 'tarifs.types.hotel.title',
    titleDefault: 'Hôtels',
    descKey: 'tarifs.types.hotel.desc',
    descDefault: 'Centralisez les infos et digitalisez votre accueil pour une expérience client moderne et professionnelle.',
  },
  {
    id: 'conciergerie',
    href: '/tarifs/hotes',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    titleKey: 'tarifs.types.conciergerie.title',
    titleDefault: 'Conciergeries & gestionnaires de location',
    descKey: 'tarifs.types.conciergerie.desc',
    descDefault: 'Gagnez du temps avec un outil simple et efficace pour gérer l\'accueil de tous vos biens.',
  },
  {
    id: 'camping',
    href: '/tarifs/campings',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 21h20L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L8 21M12 3l4 18M5 16h14" />
      </svg>
    ),
    titleKey: 'tarifs.types.camping.title',
    titleDefault: 'Campings & résidences de tourisme',
    descKey: 'tarifs.types.camping.desc',
    descDefault: 'Simplifiez la communication avec vos vacanciers et réduisez votre coût d\'impression.',
  },
];

export default function TarifsPage() {
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
              <Link href="/hote-airbnb" className="text-white hover:text-primary transition-colors">{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="text-primary font-semibold">{t('nav.pricing', 'Nos tarifs')}</Link>
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
            <div className="md:hidden py-4 border-t border-primary/20">
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home', 'Accueil')}</Link>
                <Link href="/hote-airbnb" className="text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.services', 'Nos services')}</Link>
                <Link href="/tarifs" className="text-primary font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing', 'Nos tarifs')}</Link>
                <Link href="/blog" className="text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
                <Link href="/contact" className="text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.contact', 'Contact')}</Link>
                <Link href="/login" className="text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login', 'Connexion')}</Link>
                <LanguageSelector />
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold w-full">
                    {t('nav.testApp', 'Testez notre App gratuitement')}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Sélection du type d'hébergement */}
      <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 bg-dark relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-white">{t('tarifs.hero.titleLine1', 'Sélectionnez')}</span>
              <br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">{t('tarifs.hero.titleLine2', 'votre type d\'hébergement')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mt-6">
              {t('tarifs.hero.subtitle', 'Sélectionnez votre hébergement pour afficher le tarif associé.')}
            </p>
            <p className="text-lg sm:text-xl text-primary font-semibold mt-2">
              {t('tarifs.hero.trial', 'Profitez d\'un essai gratuit, sans carte bancaire.')}
            </p>
          </div>

          {/* Grille des types d'hébergement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {accommodationTypes.map((type, index) => {
              const cardContent = (
                <>
                  {/* "Bientôt" badge for cards without link */}
                  {!type.href && (
                    <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
                      Bientôt
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      type.href
                        ? 'bg-dark-lighter text-primary group-hover:bg-gradient-purple-pink group-hover:text-white'
                        : 'bg-dark-lighter text-gray-500'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight">
                        {t(type.titleKey, type.titleDefault)}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                        {t(type.descKey, type.descDefault)}
                      </p>
                    </div>
                  </div>

                  {/* Bouton Voir nos tarifs */}
                  {type.href && (
                    <div className="mt-5">
                      <span className="inline-block w-full text-center bg-gradient-to-r from-primary to-pink-500 text-white font-semibold py-2.5 px-6 rounded-full text-sm shadow-lg group-hover:shadow-pink-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                        Voir nos tarifs ici →
                      </span>
                    </div>
                  )}
                </>
              );

              if (type.href) {
                return (
                  <div key={type.id} className="relative group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                    <Link
                      href={type.href}
                      className="relative block glass-dark rounded-2xl p-6 sm:p-8 text-left transition-all duration-300 hover:scale-[1.03] cursor-pointer border-2 border-primary/20 hover:border-primary/50"
                    >
                      {cardContent}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={type.id} className="relative group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-2xl blur-lg opacity-20"></div>
                  <div
                    className="relative glass-dark rounded-2xl p-6 sm:p-8 text-left transition-all duration-300 border-2 border-primary/10 opacity-70"
                  >
                    {cardContent}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Features Comparison Section */}
      <section className="py-20 sm:py-24 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('tarifs.features.title', 'Tout est inclus')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('tarifs.features.subtitle', 'Pas de fonctionnalités cachées, pas de suppléments. Tout est inclus dans chaque plan.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📱', titleKey: 'tarifs.features.list.qrcode', title: 'QR Code personnalisé', desc: 'Générez un QR code unique pour chaque livret' },
              { icon: '🤖', titleKey: 'tarifs.features.list.ai', title: 'Chatbot IA intégré', desc: 'Assistant intelligent pour vos voyageurs' },
              { icon: '🎨', titleKey: 'tarifs.features.list.design', title: 'Personnalisation complète', desc: 'Couleurs, logo, style à votre image' },
              { icon: '📊', titleKey: 'tarifs.features.list.stats', title: 'Statistiques détaillées', desc: 'Suivez les consultations en temps réel' },
              { icon: '🌍', titleKey: 'tarifs.features.list.multilang', title: 'Multilingue', desc: 'Traduction automatique pour vos voyageurs internationaux' },
              { icon: '📝', titleKey: 'tarifs.features.list.modules', title: '17 modules disponibles', desc: 'WiFi, règles, activités, restaurants et bien plus' },
              { icon: '🔄', titleKey: 'tarifs.features.list.realtime', title: 'Mise à jour instantanée', desc: 'Modifiez en temps réel, vos voyageurs voient les changements' },
              { icon: '📋', titleKey: 'tarifs.features.list.poster', title: 'Affiche imprimable', desc: 'Générez une affiche avec QR code pour votre logement' },
              { icon: '💼', titleKey: 'tarifs.features.list.card', title: 'Carte de visite digitale', desc: 'Partagez vos coordonnées professionnelles' },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{t(feature.titleKey, feature.title)}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
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
                    {t('tarifs.demo.title', 'Vous souhaitez une démonstration ?')}
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {t('tarifs.demo.desc', 'En moins de 30 minutes, découvrez l\'outil et permettez à vos équipes une prise en main immédiate.')}
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      {t('tarifs.demo.cta', 'Demander une démo')}
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
                    {t('tarifs.migration.title', 'On s\'occupe de tout')}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {t('tarifs.migration.desc', 'Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet, traduit et enrichi de recommandations locales.')}
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      {t('tarifs.migration.cta', 'Nous contacter')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-purple-pink relative overflow-hidden">
        <div className="absolute inset-0 bg-dark/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            {t('tarifs.cta.title', 'Prêt à transformer l\'expérience de vos voyageurs ?')}
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            {t('tarifs.cta.subtitle', 'Rejoignez des dizaines d\'établissements qui font confiance à notre plateforme')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-gradient-to-r from-primary to-pink-500 text-white hover:from-primary-light hover:to-pink-400 border-0 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-pink-500/30 transition-all duration-300 font-semibold">
                {t('tarifs.cta.cta', 'Testez notre App gratuitement')}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="bg-gradient-to-r from-purple-600 to-primary text-white hover:from-purple-500 hover:to-primary-light border-0 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300 font-semibold">
                {t('tarifs.cta.login', 'J\'ai déjà un compte')}
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
              <h3 className="text-2xl font-bold mb-4 bg-gradient-purple-pink bg-clip-text text-transparent">
                My Guide Digital
              </h3>
              <p className="text-gray-400 mb-4">
                {t('home.footer.description', 'La solution moderne pour créer et partager vos livrets d\'accueil digitaux.')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('home.footer.navigation', 'Navigation')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-primary transition-colors">{t('nav.home', 'Accueil')}</Link></li>
                <li><Link href="/hote-airbnb" className="hover:text-primary transition-colors">{t('nav.services', 'Nos services')}</Link></li>
                <li><Link href="/tarifs" className="hover:text-primary transition-colors">{t('nav.pricing', 'Nos tarifs')}</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">{t('nav.blog', 'Blog')}</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">{t('nav.login', 'Connexion')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('home.footer.support', 'Support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">{t('home.footer.documentation', 'Documentation')}</a></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">{t('home.footer.contact', 'Contact')}</Link></li>
                <li><Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary/20 mt-8 pt-8 text-center text-gray-400">
            <p>{t('home.footer.copyright', '© 2026 My Guide Digital. Tous droits réservés.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
