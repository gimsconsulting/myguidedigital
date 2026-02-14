'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Timeout de sécurité : forcer le rendu après 2 secondes même si i18n n'est pas prêt
    const timeout = setTimeout(() => {
      setForceRender(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Attendre que i18n soit prêt, mais avec un timeout de sécurité
  if (!mounted || (!ready && !forceRender)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-pink-500 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white hover:text-primary transition-colors">
                {t('nav.home', 'Accueil')}
              </Link>
              <Link href="/hote-airbnb" className="text-white hover:text-primary transition-colors">
                {t('nav.services', 'Nos services')}
              </Link>
              <Link href="/tarifs" className="text-white hover:text-primary transition-colors">
                {t('nav.pricing', 'Nos tarifs')}
              </Link>
              <Link href="/blog" className="text-white hover:text-primary transition-colors">
                {t('nav.blog', 'Blog')}
              </Link>
              <Link href="/contact" className="text-white hover:text-primary transition-colors">
                {t('nav.contact', 'Contact')}
              </Link>
              <Link href="/login" className="text-white hover:text-primary transition-colors">
                {t('nav.login', 'Connexion')}
              </Link>
              <LanguageSelector />
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link href="/register">
                <Button 
                  variant="primary" 
                  size="sm"
                  className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
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
              <Link href="/" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.home', 'Accueil')}
              </Link>
              <Link href="/hote-airbnb" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.services', 'Nos services')}
              </Link>
              <Link href="/tarifs" className="block text-white hover:text-primary transition-colors">
                {t('nav.pricing', 'Nos tarifs')}
              </Link>
              <Link href="/blog" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.blog', 'Blog')}
              </Link>
              <Link href="/contact" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.contact', 'Contact')}
              </Link>
              <Link href="/login" className="block text-white hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.login', 'Connexion')}
              </Link>
              <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-full bg-orange-500 text-white hover:bg-orange-600 px-6 py-2 rounded-full font-semibold"
                >
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
      <section className="relative overflow-hidden bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient bg-gradient-purple-pink opacity-20"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-32 sm:pt-40 sm:pb-40 lg:pt-48 lg:pb-48">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">
                {t('home.hero.title', 'Guide d\'accueil digital intelligent')}
              </span>
              <br />
              <span className="text-white">{t('home.hero.subtitle', 'pour Airbnb, locations et hôtes')}</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-10 text-gray-300 max-w-3xl mx-auto">
              {t('home.hero.description', 'Transformez l\'expérience de vos voyageurs avec des livrets d\'accueil modernes et interactifs')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/register">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  {t('home.hero.cta', 'Testez notre App gratuitement')}
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-white text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold"
                >
                  {t('home.hero.login', 'Se connecter')}
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('home.hero.freeTrial', 'Essai gratuit')}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('home.hero.noCard', 'Aucune carte requise')}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {t('home.hero.setup', 'Configuration en 5 min')}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#0F0F1E"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.features.title', 'Tout ce dont vous avez besoin')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.features.subtitle', 'Une plateforme complète pour créer, personnaliser et partager vos livrets d\'accueil digitaux')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group glass-purple p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('home.features.qrCode.title', 'QR Code Instantané')}</h3>
              <p className="text-gray-400">
                {t('home.features.qrCode.description', 'Générez un QR code unique pour chaque livret. Vos voyageurs scannent et accèdent instantanément à toutes les informations.')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group glass-purple p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('home.features.customization.title', 'Personnalisation Totale')}</h3>
              <p className="text-gray-400">
                {t('home.features.customization.description', 'Choisissez vos couleurs, polices et images. Créez une expérience unique qui reflète l\'identité de votre établissement.')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group glass-purple p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('home.features.statistics.title', 'Statistiques Détaillées')}</h3>
              <p className="text-gray-400">
                {t('home.features.statistics.description', 'Suivez les consultations, les modules les plus consultés et l\'engagement de vos voyageurs en temps réel.')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group glass-purple p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('home.features.chat.title', 'Chat Intégré')}</h3>
              <p className="text-gray-400">
                {t('home.features.chat.description', 'Un widget de chat intelligent pour répondre aux questions fréquentes de vos voyageurs 24/7.')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group glass-purple p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('home.features.multilang.title', 'Multi-langues')}</h3>
              <p className="text-gray-400">
                {t('home.features.multilang.description', 'Proposez vos livrets dans plusieurs langues pour accueillir des voyageurs du monde entier.')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group glass-purple p-8 rounded-2xl hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.6s' }}>
              <div className="w-16 h-16 bg-gradient-purple-pink rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform glow-purple">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t('home.features.secure.title', 'Sécurisé & Fiable')}</h3>
              <p className="text-gray-400">
                {t('home.features.secure.description', 'Vos données sont protégées avec les dernières technologies de sécurité. Disponibilité garantie 99.9%.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MGD Chat Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-dark-light relative overflow-hidden">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side: Smartphone with Chat */}
            <div className="relative animate-fade-in flex justify-center lg:justify-end">
              {/* Phone Frame */}
              <div className="relative w-64 sm:w-80 lg:w-96">
                {/* Phone Body */}
                <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
                  
                  {/* Screen */}
                  <div className="relative bg-gradient-to-br from-primary/30 via-pink-500/20 to-primary/40 rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="pt-8 px-4 pb-2 flex justify-between items-center text-white text-xs">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 border border-white rounded-sm"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="px-4 pb-6 space-y-4 min-h-[500px]">
                      {/* Bot Message 1 */}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="bg-gradient-purple-pink rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-lg">
                          <p className="text-white text-sm">{t('home.chat.botMessage1', 'Salut ! Moi c\'est MGD, votre assistant digital. Que puis-je faire pour vous aujourd\'hui ?')}</p>
                        </div>
                      </div>

                      {/* User Message 1 */}
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] shadow-lg">
                          <p className="text-gray-900 text-sm font-medium">{t('home.chat.userMessage1', 'Où se trouve le sèche-linge ?')}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      {/* Bot Message 2 */}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="bg-gradient-purple-pink rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-lg">
                          <p className="text-white text-sm">{t('home.chat.botMessage2', 'Il est situé dans la buanderie, au rez-de-chaussée ! 🏠')}</p>
                        </div>
                      </div>

                      {/* User Message 2 */}
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] shadow-lg">
                          <p className="text-gray-900 text-sm font-medium">{t('home.chat.userMessage2', 'Vous êtes disponible à toute heure ?')}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      {/* Bot Message 3 */}
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="bg-gradient-purple-pink rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-lg">
                          <p className="text-white text-sm">{t('home.chat.botMessage3', 'Absolument ! Je suis là pour vous aider jour et nuit 🌙')}</p>
                        </div>
                      </div>

                      {/* Input Field */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 flex items-center gap-2 shadow-lg">
                          <input 
                            type="text" 
                            placeholder={t('home.chat.placeholder', 'Tapez votre message...')} 
                            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm outline-none"
                            readOnly
                          />
                          <button className="w-8 h-8 bg-gradient-purple-pink rounded-full flex items-center justify-center glow-purple">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Stars */}
                <div className="absolute -top-4 -right-4 w-16 h-16 text-primary animate-pulse">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="absolute top-1/2 -left-8 w-12 h-12 text-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="absolute bottom-8 -right-6 w-10 h-10 text-yellow-400 animate-pulse" style={{ animationDelay: '1s' }}>
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Side: Text Content */}
            <div className="animate-slide-up space-y-6">
              {/* Icon */}
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 rounded-2xl bg-dark-lighter flex items-center justify-center border-2 border-primary/30 glow-purple">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Floating chat bubbles */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-purple-pink rounded-full glow-purple"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-purple-pink rounded-full glow-purple"></div>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                {t('home.chat.title', 'Révolutionnez l\'accueil de vos voyageurs grâce à l\'IA')}
              </h2>

              {/* Description */}
              <div className="space-y-4 text-lg text-gray-300">
                <p>
                  {t('home.chat.description1', 'Reposez-vous enfin ! Laissez')} <span className="text-primary font-semibold">MGD</span> {t('home.chat.description1Cont', 'prendre soin de vos clients à votre place.')}
                </p>
                <p>
                  {t('home.chat.description2', 'Notre assistant conversationnel intelligent permet aux voyageurs de trouver rapidement les informations dont ils ont besoin, tout en vous offrant une tranquillité d\'esprit totale.')}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{t('home.chat.available', 'Disponible en permanence, sans interruption')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{t('home.chat.native', 'Natif dans chaque livret d\'accueil digital')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{t('home.chat.adaptable', 'Adaptable à votre établissement et vos services')}</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <Link href="/register">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    {t('home.hero.cta', 'Testez notre App gratuitement')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-dark-light via-dark-lighter to-dark-light relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                {t('home.benefits.title', 'Pourquoi choisir nos livrets digitaux ?')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-purple-pink rounded-lg flex items-center justify-center glow-purple">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{t('home.benefits.economic.title', 'Économique & Écologique')}</h3>
                    <p className="text-gray-400">
                      {t('home.benefits.economic.description', 'Réduisez vos coûts d\'impression et votre impact environnemental. Plus besoin de réimprimer à chaque changement.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-purple-pink rounded-lg flex items-center justify-center glow-purple">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{t('home.benefits.realtime.title', 'Mise à jour en temps réel')}</h3>
                    <p className="text-gray-400">
                      {t('home.benefits.realtime.description', 'Modifiez vos informations instantanément. Vos voyageurs voient toujours les dernières mises à jour.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-purple-pink rounded-lg flex items-center justify-center glow-purple">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{t('home.benefits.ux.title', 'Expérience utilisateur optimale')}</h3>
                    <p className="text-gray-400">
                      {t('home.benefits.ux.description', 'Interface intuitive et moderne. Vos voyageurs trouvent rapidement ce qu\'ils cherchent.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="glass-dark rounded-3xl p-8 lg:p-12 glow-gradient">
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-purple rounded-xl p-6 glow-purple">
                    <div className="text-3xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent mb-2">17</div>
                    <div className="text-gray-300">{t('home.benefits.modules', 'Modules disponibles')}</div>
                  </div>
                  <div className="glass-purple rounded-xl p-6 glow-purple">
                    <div className="text-3xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent mb-2">24/7</div>
                    <div className="text-gray-300">{t('home.benefits.availability', 'Disponibilité')}</div>
                  </div>
                  <div className="glass-purple rounded-xl p-6 glow-purple">
                    <div className="text-3xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent mb-2">5min</div>
                    <div className="text-gray-300">{t('home.benefits.configuration', 'Configuration')}</div>
                  </div>
                  <div className="glass-purple rounded-xl p-6 glow-purple">
                    <div className="text-3xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent mb-2">100%</div>
                    <div className="text-gray-300">{t('home.benefits.customizable', 'Personnalisable')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo + Migration CTA Section */}
      <section id="tarifs" className="py-20 sm:py-24 lg:py-32 bg-dark scroll-mt-16 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.pricing.title', 'Comment démarrer ?')}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {t('home.pricing.subtitle', 'Nous vous accompagnons à chaque étape')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demo Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-purple-pink rounded-2xl p-8 sm:p-10 overflow-hidden">
                <div className="absolute inset-0 bg-dark/30"></div>
                <div className="relative text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {t('home.demo.title', 'Vous souhaitez une démonstration ?')}
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    {t('home.demo.desc', 'En moins de 30 minutes, découvrez l\'outil et permettez à vos équipes une prise en main immédiate.')}
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      {t('home.demo.cta', 'Demander une démo')}
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
                    {t('home.migration.title', 'On s\'occupe de tout')}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {t('home.migration.desc', 'Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet, traduit et enrichi de recommandations locales.')}
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      {t('home.migration.cta', 'Nous contacter')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Lien vers tarifs détaillés */}
          <div className="text-center mt-12 animate-fade-in">
            <Link href="/tarifs" className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-lg font-semibold group">
              {t('home.pricing.seeAll', 'Découvrir tous nos tarifs détaillés')}
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.testimonials.title', 'Ce que nos clients disent')}
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-400 text-sm sm:text-base">{t('home.testimonials.rating', '5/5 basé sur nos retours clients')}</span>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Testimonial 1 */}
            <div className="glass-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-purple-pink flex items-center justify-center flex-shrink-0 glow-purple">
                    <span className="text-white font-bold text-lg">SM</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{t('home.testimonials.testimonial1.name', 'Sophie Martin')}</h3>
                    <p className="text-sm text-gray-400">{t('home.testimonials.testimonial1.role', 'Gîte rural')}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                &quot;{t('home.testimonials.testimonial1.text', 'La création de nos livrets digitaux a transformé notre façon de communiquer avec nos hôtes. Plus besoin d\'imprimer à chaque changement, et nos clients accèdent à toutes les infos via leur smartphone. Un gain de temps énorme !')}&quot;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center flex-shrink-0 glow-purple">
                    <span className="text-white font-bold text-lg">PL</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{t('home.testimonials.testimonial2.name', 'Pierre Lambert')}</h3>
                    <p className="text-sm text-gray-400">{t('home.testimonials.testimonial2.role', 'Hôtel 4 étoiles')}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                &quot;{t('home.testimonials.testimonial2.text', 'L\'assistant MGD intégré répond aux questions de nos clients même la nuit. Plus besoin d\'avoir quelqu\'un à la réception 24/7. Nos voyageurs sont autonomes et nous économisons des heures de travail chaque semaine.')}&quot;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center flex-shrink-0 glow-purple">
                    <span className="text-white font-bold text-lg">MD</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{t('home.testimonials.testimonial3.name', 'Marie Dubois')}</h3>
                    <p className="text-sm text-gray-400">{t('home.testimonials.testimonial3.role', 'Chambres d\'hôtes')}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                &quot;{t('home.testimonials.testimonial3.text', 'La personnalisation des couleurs et du design nous permet de créer des livrets qui correspondent parfaitement à notre identité. Nos clients adorent l\'interface moderne et intuitive. Le QR code est un vrai plus pour l\'accès rapide !')}&quot;
              </p>
            </div>

            {/* Testimonial 4 */}
            <div className="glass-dark rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-up glow-purple hover:glow-gradient" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-pink-500 flex items-center justify-center flex-shrink-0 glow-purple">
                    <span className="text-white font-bold text-lg">JT</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{t('home.testimonials.testimonial4.name', 'Jean Tremblay')}</h3>
                    <p className="text-sm text-gray-400">{t('home.testimonials.testimonial4.role', 'Résidence de vacances')}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                &quot;{t('home.testimonials.testimonial4.text', 'Les statistiques de consultation nous donnent une vision claire de ce que nos clients recherchent vraiment. On peut adapter nos livrets en fonction des modules les plus consultés. C\'est un outil précieux pour améliorer l\'expérience client !')}&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 bg-dark-light relative overflow-hidden scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              {t('home.faq.title', 'Questions fréquentes')}
            </h2>
            <p className="text-gray-400 text-lg">
              {t('home.faq.subtitle', 'Tout ce que vous devez savoir sur My Guide Digital')}
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: t('home.faq.q1', "Qu'est-ce que My Guide Digital ?"),
                answer: t('home.faq.a1', "My Guide Digital est un livret d'accueil numérique alimenté par l'IA qui permet de centraliser toutes les informations utiles pour vos voyageurs et de les rendre autonomes pendant leur séjour.")
              },
              {
                question: t('home.faq.q2', "À qui s'adresse la solution My Guide Digital ?"),
                answer: t('home.faq.a2', "My Guide Digital s'adresse aux hôtes AirBnB, gestionnaires de conciergerie et professionnels du voyage qui souhaitent digitaliser leur accueil et optimiser la relation avec leurs voyageurs.")
              },
              {
                question: t('home.faq.q3', "Quels sont les principaux bénéfices pour un hôte AirBnB ?"),
                answer: t('home.faq.a3', "Un hôte AirBnB peut créer un livret d'accueil professionnel en quelques minutes, réduire les questions répétitives, gagner plusieurs heures par semaine et augmenter ses avis 5 étoiles grâce à My Guide Digital.")
              },
              {
                question: t('home.faq.q4', "Comment l'IA de My Guide Digital m'aide‑t‑elle au quotidien ?"),
                answer: t('home.faq.a4', "L'IA de My Guide Digital répond automatiquement aux questions fréquentes de vos voyageurs, les guide dans l'utilisation du logement ou des services et vous évite d'être sollicité en permanence.")
              },
              {
                question: t('home.faq.q5', "Puis‑je tester My Guide Digital gratuitement ?"),
                answer: t('home.faq.a5', "Oui, vous pouvez tester la solution gratuitement grâce au bouton « Testez la solution gratuitement » présent à plusieurs endroits sur le site.")
              },
              {
                question: t('home.faq.q6', "En quoi My Guide Digital améliore‑t‑il l'expérience client ?"),
                answer: t('home.faq.a6', "En donnant un accès clair et instantané à toutes les informations, My Guide Digital améliore le confort des voyageurs, réduit les frictions et vous aide à obtenir davantage d'avis 5 étoiles.")
              },
              {
                question: t('home.faq.q7', "La solution My Guide Digital convient‑elle aux conciergeries avec plusieurs biens ?"),
                answer: t('home.faq.a7', "Oui, My Guide Digital permet aux gestionnaires de conciergerie d'automatiser la communication pour plusieurs logements et de standardiser la qualité d'accueil sur l'ensemble du parc.")
              },
              {
                question: t('home.faq.q8', "My Guide Digital permet‑il de réduire mes coûts opérationnels ?"),
                answer: t('home.faq.a8', "En automatisant les réponses et en digitalisant le livret d'accueil, My Guide Digital réduit le temps passé sur le support aux voyageurs et donc vos coûts opérationnels.")
              },
              {
                question: t('home.faq.q9', "Existe‑t‑il un programme d'affiliation ou de parrainage avec My Guide Digital ?"),
                answer: t('home.faq.a9', "Oui, vous pouvez proposer un code promo à votre communauté pour leur faire bénéficier de 15% de réduction sur l'abonnement, ce qui vous permet de gagner de l'argent grâce à My Guide Digital.")
              },
              {
                question: t('home.faq.q10', "Où puis‑je trouver les tarifs et les conditions d'utilisation de My Guide Digital ?"),
                answer: t('home.faq.a10', "Les tarifs sont accessibles via la page « Nos tarifs » et les informations légales via les pages « Mentions légales » et « Conditions Générales » en bas du site.")
              }
            ].map((faq, index) => (
              <div key={index} className="glass-dark rounded-xl overflow-hidden hover:glow-purple transition-all">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl"
                >
                  <h3 className="text-lg font-normal text-white pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
            {t('home.cta.title', 'Prêt à transformer l\'expérience de vos voyageurs ?')}
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Rejoignez des dizaines d&apos;établissements qui font confiance à notre plateforme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                {t('home.cta.cta', 'Testez notre App gratuitement')}
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-white text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold">
                {t('home.cta.login', 'J\'ai déjà un compte')}
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
                <li><Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link></li>
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
