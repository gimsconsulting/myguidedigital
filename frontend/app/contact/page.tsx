'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

export default function ContactPage() {
  const { t } = useTranslation();

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
              <Link href="/hote-airbnb" className="text-white hover:text-primary transition-colors">{t('nav.airbnbHost', 'Hôte AirBnB')}</Link>
              <Link href="/#tarifs" className="text-white hover:text-primary transition-colors">{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="text-white hover:text-primary transition-colors">{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="text-primary font-semibold">{t('nav.contact', 'Contact')}</Link>
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
              <button className="text-white hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">
                {t('contact.title', 'Contactez-nous')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('contact.subtitle', 'Nous sommes là pour vous aider. N\'hésitez pas à nous contacter.')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email */}
            <div className="bg-dark-light/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('contact.email', 'Email')}</h3>
                <a 
                  href="mailto:contact@myguidedigital.com" 
                  className="text-primary hover:text-primary-light transition-colors text-lg"
                >
                  contact@myguidedigital.com
                </a>
              </div>
            </div>

            {/* Téléphone */}
            <div className="bg-dark-light/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('contact.phone', 'Téléphone')}</h3>
                <a 
                  href="tel:+33123456789" 
                  className="text-primary hover:text-primary-light transition-colors text-lg"
                >
                  +33 1 23 45 67 89
                </a>
              </div>
            </div>

            {/* Adresse */}
            <div className="bg-dark-light/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('contact.address', 'Adresse')}</h3>
                <p className="text-gray-300 text-lg">
                  123 Rue de l'Innovation<br />
                  75001 Paris, France
                </p>
              </div>
            </div>
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
                <li><Link href="/hote-airbnb" className="hover:text-primary transition-colors">{t('nav.airbnbHost', 'Hôte AirBnB')}</Link></li>
                <li><Link href="/#tarifs" className="hover:text-primary transition-colors">{t('nav.pricing', 'Nos tarifs')}</Link></li>
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
