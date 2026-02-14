'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

export default function HoteAirbnbPage() {
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
              <Link href="/hote-airbnb" className="text-primary font-semibold">{t('nav.airbnbHost', 'Hôte AirBnB')}</Link>
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
              <Link href="/hote-airbnb" className="block text-primary font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.airbnbHost', 'Hôte AirBnB')}</Link>
              <Link href="/tarifs" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.contact', 'Contact')}</Link>
              <Link href="/login" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login', 'Connexion')}</Link>
              <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full bg-orange-500 text-white hover:bg-orange-600 px-6 py-2 rounded-full font-semibold">
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
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">
                {t('airbnb.title', 'Pour les hôtes Airbnb')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              {t('airbnb.subtitle', 'Simplifiez la gestion de vos locations et offrez une expérience exceptionnelle à vos voyageurs')}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-dark-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="glass-dark rounded-2xl p-8 animate-slide-up">
              <h2 className="text-3xl font-bold text-white mb-4">{t('airbnb.whyTitle', 'Pourquoi choisir My Guide Digital pour votre location Airbnb ?')}</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  {t('airbnb.why1', 'En tant qu\'hôte Airbnb, vous savez à quel point il est important de fournir une expérience mémorable à vos voyageurs. My Guide Digital vous permet de créer des guides d\'accueil digitaux personnalisés qui facilitent la vie de vos invités et la vôtre.')}
                </p>
                <p>
                  {t('airbnb.why2', 'Plus besoin d\'imprimer des documents à chaque arrivée. Un simple QR code permet à vos voyageurs d\'accéder instantanément à toutes les informations dont ils ont besoin : règles de la maison, recommandations locales, codes WiFi, et bien plus encore.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-purple rounded-2xl p-6 hover:glow-purple transition-all">
                <h3 className="text-xl font-bold text-white mb-3">{t('airbnb.time.title', 'Gain de temps')}</h3>
                <p className="text-gray-300">
                  {t('airbnb.time.description', 'Créez votre guide une fois, utilisez-le pour toutes vos réservations. Mettez à jour les informations en temps réel sans réimprimer.')}
                </p>
              </div>
              <div className="glass-purple rounded-2xl p-6 hover:glow-purple transition-all">
                <h3 className="text-xl font-bold text-white mb-3">{t('airbnb.autonomy.title', 'Autonomie des voyageurs')}</h3>
                <p className="text-gray-300">
                  {t('airbnb.autonomy.description', 'L\'assistant MGD répond aux questions fréquentes 24/7, réduisant le nombre de messages que vous recevez.')}
                </p>
              </div>
              <div className="glass-purple rounded-2xl p-6 hover:glow-purple transition-all">
                <h3 className="text-xl font-bold text-white mb-3">{t('airbnb.professional.title', 'Professionnalisme')}</h3>
                <p className="text-gray-300">
                  {t('airbnb.professional.description', 'Montrez à vos invités que vous êtes un hôte professionnel avec un guide moderne et bien organisé.')}
                </p>
              </div>
              <div className="glass-purple rounded-2xl p-6 hover:glow-purple transition-all">
                <h3 className="text-xl font-bold text-white mb-3">{t('airbnb.multilang.title', 'Multi-langues')}</h3>
                <p className="text-gray-300">
                  {t('airbnb.multilang.description', 'Accueillez des voyageurs du monde entier en proposant votre guide dans plusieurs langues.')}
                </p>
              </div>
            </div>

            <div className="text-center pt-8">
              <Link href="/register">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-gradient-to-r from-primary via-pink-500 to-primary text-white hover:opacity-90 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  {t('nav.testApp', 'Testez notre App gratuitement')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
