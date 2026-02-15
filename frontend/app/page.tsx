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
    const timeout = setTimeout(() => {
      setForceRender(true);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted || (!ready && !forceRender)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.home', 'Accueil')}
              </Link>
              <Link href="/hote-airbnb" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
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

            {/* CTA Button */}
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

            {/* Mobile Menu Button */}
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

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 py-4 space-y-3">
              <Link href="/" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.home', 'Accueil')}
              </Link>
              <Link href="/hote-airbnb" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.services', 'Nos services')}
              </Link>
              <Link href="/tarifs" className="block text-white/80 hover:text-white transition-colors">
                {t('nav.pricing', 'Nos tarifs')}
              </Link>
              <Link href="/blog" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.blog', 'Blog')}
              </Link>
              <Link href="/contact" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.contact', 'Contact')}
              </Link>
              <Link href="/login" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.login', 'Connexion')}
              </Link>
              <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full px-6 py-2.5 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-primary via-pink-500 to-purple-500">
                  <span className="flex items-center justify-center gap-2">
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

      {/* ══════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Premium background orbs */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-pink-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[150px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28 sm:pt-40 sm:pb-36 lg:pt-48 lg:pb-44">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 rounded-full border border-white/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white/60 text-sm font-medium">Plateforme N°1 des livrets d&apos;accueil digitaux</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('home.hero.title', 'Guide d\'accueil digital intelligent')}
              </span>
              <br />
              <span className="text-white">{t('home.hero.subtitle', 'pour Airbnb, locations et hôtes')}</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/50 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.description', 'Transformez l\'expérience de vos voyageurs avec des livrets d\'accueil modernes et interactifs')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link href="/register">
                <button className="relative group px-8 py-4 rounded-full font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <span className="relative">{t('home.hero.cta', 'Testez gratuitement — 14 jours')}</span>
                </button>
              </Link>
              <Link href="/login">
                <button className="px-8 py-4 rounded-full font-semibold text-lg text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                  {t('home.hero.login', 'Se connecter')}
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {t('home.hero.freeTrial', 'Essai gratuit 14 jours')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {t('home.hero.noCard', 'Aucune carte requise')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {t('home.hero.setup', 'Configuration en 5 min')}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* FEATURES SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="pt-16 pb-24 sm:pt-20 sm:pb-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <span className="text-primary text-sm font-medium">🚀 Fonctionnalités</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.features.title', 'Tout ce dont vous avez besoin')}
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              {t('home.features.subtitle', 'Une plateforme complète pour créer, personnaliser et partager vos livrets d\'accueil digitaux')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: t('home.features.qrCode.title', 'QR Code Instantané'),
                desc: t('home.features.qrCode.description', 'Générez un QR code unique pour chaque livret. Vos voyageurs scannent et accèdent instantanément à toutes les informations.'),
                gradient: 'from-purple-500 to-pink-500',
                neon: 'purple',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: t('home.features.customization.title', 'Personnalisation Totale'),
                desc: t('home.features.customization.description', 'Choisissez vos couleurs, polices et images. Créez une expérience unique qui reflète l\'identité de votre établissement.'),
                gradient: 'from-pink-500 to-rose-500',
                neon: 'pink',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: t('home.features.statistics.title', 'Statistiques Détaillées'),
                desc: t('home.features.statistics.description', 'Suivez les consultations, les modules les plus consultés et l\'engagement de vos voyageurs en temps réel.'),
                gradient: 'from-violet-500 to-purple-500',
                neon: 'violet',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                title: t('home.features.chat.title', 'Chat IA Intégré'),
                desc: t('home.features.chat.description', 'Un widget de chat intelligent pour répondre aux questions fréquentes de vos voyageurs 24/7.'),
                gradient: 'from-emerald-500 to-teal-500',
                neon: 'emerald',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                ),
                title: t('home.features.multilang.title', 'Multi-langues'),
                desc: t('home.features.multilang.description', 'Proposez vos livrets dans plusieurs langues pour accueillir des voyageurs du monde entier.'),
                gradient: 'from-amber-500 to-orange-500',
                neon: 'amber',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: t('home.features.secure.title', 'Sécurisé & Fiable'),
                desc: t('home.features.secure.description', 'Vos données sont protégées avec les dernières technologies de sécurité. Disponibilité garantie 99.9%.'),
                gradient: 'from-cyan-500 to-blue-500',
                neon: 'cyan',
              },
            ].map((feature, idx) => (
              <div key={idx} className="group relative" style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* Neon glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500`}></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-7 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* MGD CHAT SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-28 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/30 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side: Smartphone with Chat */}
            <div className="relative animate-fade-in flex justify-center lg:justify-end">
              <div className="relative w-64 sm:w-80 lg:w-96">
                {/* Neon behind phone */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-[3.5rem] blur-2xl opacity-20"></div>
                
                {/* Phone Body */}
                <div className="relative bg-slate-900 rounded-[3rem] p-2 shadow-2xl border border-white/10">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>
                  
                  {/* Screen */}
                  <div className="relative bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5">
                    {/* Status Bar */}
                    <div className="pt-8 px-4 pb-2 flex justify-between items-center text-white text-xs">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 border border-white/40 rounded-sm"></div>
                      </div>
                    </div>

                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">MGD Assistant</p>
                        <p className="text-emerald-400 text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          En ligne
                        </p>
                      </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="px-4 pb-6 space-y-3 min-h-[420px] pt-4">
                      {/* Bot Message 1 */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-white font-bold">AI</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[75%]">
                          <p className="text-white/80 text-sm">{t('home.chat.botMessage1', 'Salut ! Moi c\'est MGD, votre assistant digital. Que puis-je faire pour vous ?')}</p>
                        </div>
                      </div>

                      {/* User Message 1 */}
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gradient-to-r from-primary to-pink-500 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[75%]">
                          <p className="text-white text-sm font-medium">{t('home.chat.userMessage1', 'Où se trouve le sèche-linge ?')}</p>
                        </div>
                      </div>

                      {/* Bot Message 2 */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-white font-bold">AI</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[75%]">
                          <p className="text-white/80 text-sm">{t('home.chat.botMessage2', 'Il est situé dans la buanderie, au rez-de-chaussée ! 🏠')}</p>
                        </div>
                      </div>

                      {/* User Message 2 */}
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gradient-to-r from-primary to-pink-500 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[75%]">
                          <p className="text-white text-sm font-medium">{t('home.chat.userMessage2', 'Vous êtes disponible à toute heure ?')}</p>
                        </div>
                      </div>

                      {/* Bot Message 3 */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-white font-bold">AI</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[75%]">
                          <p className="text-white/80 text-sm">{t('home.chat.botMessage3', 'Absolument ! Je suis là 24/7 🌙')}</p>
                        </div>
                      </div>

                      {/* Input Field */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-3 flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder={t('home.chat.placeholder', 'Tapez votre message...')} 
                            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
                            readOnly
                          />
                          <button className="w-8 h-8 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 text-primary/40 animate-pulse">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="absolute top-1/2 -left-8 w-12 h-12 text-pink-500/40 animate-pulse" style={{ animationDelay: '0.5s' }}>
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Side: Text Content */}
            <div className="animate-slide-up space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <span className="text-emerald-400 text-sm font-medium">🤖 Intelligence Artificielle</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                {t('home.chat.title', 'Révolutionnez l\'accueil grâce à l\'IA')}
              </h2>

              <div className="space-y-4 text-lg text-white/50">
                <p>
                  {t('home.chat.description1', 'Reposez-vous enfin ! Laissez')} <span className="text-primary font-semibold">MGD</span> {t('home.chat.description1Cont', 'prendre soin de vos clients à votre place.')}
                </p>
                <p>
                  {t('home.chat.description2', 'Notre assistant conversationnel intelligent permet aux voyageurs de trouver rapidement les informations dont ils ont besoin.')}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 pt-4">
                {[
                  { text: t('home.chat.available', 'Disponible en permanence, sans interruption'), color: 'from-emerald-500 to-teal-500' },
                  { text: t('home.chat.native', 'Natif dans chaque livret d\'accueil digital'), color: 'from-primary to-pink-500' },
                  { text: t('home.chat.adaptable', 'Adaptable à votre établissement et vos services'), color: 'from-violet-500 to-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/60">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-6">
                <Link href="/register">
                  <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <span className="relative">{t('home.hero.cta', 'Testez gratuitement — 14 jours')}</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* BENEFITS + STATS SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 rounded-full border border-pink-500/20 mb-6">
                <span className="text-pink-400 text-sm font-medium">💡 Avantages</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8">
                {t('home.benefits.title', 'Pourquoi choisir nos livrets digitaux ?')}
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: '🌱',
                    gradient: 'from-emerald-500 to-teal-500',
                    title: t('home.benefits.economic.title', 'Économique & Écologique'),
                    desc: t('home.benefits.economic.description', 'Réduisez vos coûts d\'impression et votre impact environnemental. Plus besoin de réimprimer à chaque changement.'),
                  },
                  {
                    icon: '⚡',
                    gradient: 'from-amber-500 to-orange-500',
                    title: t('home.benefits.realtime.title', 'Mise à jour en temps réel'),
                    desc: t('home.benefits.realtime.description', 'Modifiez vos informations instantanément. Vos voyageurs voient toujours les dernières mises à jour.'),
                  },
                  {
                    icon: '✨',
                    gradient: 'from-primary to-pink-500',
                    title: t('home.benefits.ux.title', 'Expérience utilisateur optimale'),
                    desc: t('home.benefits.ux.description', 'Interface intuitive et moderne. Vos voyageurs trouvent rapidement ce qu\'ils cherchent.'),
                  },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-slide-up">
              {/* Neon glow behind stats */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-60"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 lg:p-10 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { value: '17', label: t('home.benefits.modules', 'Modules disponibles'), gradient: 'from-primary to-pink-500' },
                    { value: '24/7', label: t('home.benefits.availability', 'Disponibilité'), gradient: 'from-emerald-400 to-teal-400' },
                    { value: '5min', label: t('home.benefits.configuration', 'Configuration'), gradient: 'from-amber-400 to-orange-400' },
                    { value: '100%', label: t('home.benefits.customizable', 'Personnalisable'), gradient: 'from-violet-400 to-purple-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="group relative">
                      <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-xl blur opacity-0 group-hover:opacity-30 transition-all duration-500`}></div>
                      <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.06] transition-all duration-300">
                        <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>{stat.value}</div>
                        <div className="text-white/40 text-sm">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* DEMO + MIGRATION CTA SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section id="tarifs" className="py-24 sm:py-28 relative scroll-mt-16">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 rounded-full border border-violet-500/20 mb-4">
              <span className="text-violet-400 text-sm font-medium">🎯 Démarrage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.pricing.title', 'Comment démarrer ?')}
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              {t('home.pricing.subtitle', 'Nous vous accompagnons à chaque étape')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demo Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 border border-white/10 p-8 sm:p-10 h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-3xl">🎬</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {t('home.demo.title', 'Vous souhaitez une démonstration ?')}
                  </h3>
                  <p className="text-white/50 mb-6 leading-relaxed">
                    {t('home.demo.desc', 'En moins de 30 minutes, découvrez l\'outil et permettez à vos équipes une prise en main immédiate.')}
                  </p>
                  <Link href="/contact">
                    <button className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                      {t('home.demo.cta', 'Demander une démo')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Migration Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-white/10 p-8 sm:p-10 h-full">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {t('home.migration.title', 'On s\'occupe de tout')}
                  </h3>
                  <p className="text-white/50 mb-6 leading-relaxed">
                    {t('home.migration.desc', 'Vous avez un livret papier ou un document existant ? Envoyez-le nous et nous le transformons en livret digital complet.')}
                  </p>
                  <Link href="/contact">
                    <button className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                      {t('home.migration.cta', 'Nous contacter')}
                    </button>
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

      {/* ══════════════════════════════════════════════ */}
      {/* TESTIMONIALS SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
              <span className="text-amber-400 text-sm font-medium">⭐ Témoignages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t('home.testimonials.title', 'Ce que nos clients disent')}
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white/40 text-sm">{t('home.testimonials.rating', '5/5 basé sur nos retours clients')}</span>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                initials: 'SM',
                name: t('home.testimonials.testimonial1.name', 'Sophie M.'),
                role: t('home.testimonials.testimonial1.role', 'Gîte rural — Dinant'),
                text: t('home.testimonials.testimonial1.text', 'La création de nos livrets digitaux a transformé notre façon de communiquer avec nos hôtes. Plus besoin d\'imprimer à chaque changement, et nos clients accèdent à toutes les infos via leur smartphone.'),
                gradient: 'from-primary to-pink-500',
              },
              {
                initials: 'PL',
                name: t('home.testimonials.testimonial2.name', 'Pierre L.'),
                role: t('home.testimonials.testimonial2.role', 'Hôtel 4★ — Bruges'),
                text: t('home.testimonials.testimonial2.text', 'L\'assistant MGD intégré répond aux questions de nos clients même la nuit. Plus besoin d\'avoir quelqu\'un à la réception 24/7. Un vrai gain de temps.'),
                gradient: 'from-violet-500 to-purple-500',
              },
              {
                initials: 'MD',
                name: t('home.testimonials.testimonial3.name', 'Marie D.'),
                role: t('home.testimonials.testimonial3.role', 'Chambres d\'hôtes — Namur'),
                text: t('home.testimonials.testimonial3.text', 'La personnalisation nous permet de créer des livrets qui correspondent parfaitement à notre identité. Nos clients adorent l\'interface moderne et le QR code.'),
                gradient: 'from-pink-500 to-rose-500',
              },
              {
                initials: 'JT',
                name: t('home.testimonials.testimonial4.name', 'Jean T.'),
                role: t('home.testimonials.testimonial4.role', 'Résidence de vacances — Liège'),
                text: t('home.testimonials.testimonial4.text', 'Les statistiques nous donnent une vision claire de ce que nos clients recherchent. On peut adapter nos livrets en fonction des modules les plus consultés.'),
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((t, idx) => (
              <div key={idx} className="group relative" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${t.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500`}></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-r ${t.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <span className="text-white font-bold text-sm">{t.initials}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{t.name}</h3>
                      <p className="text-xs text-white/40">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed flex-1">
                    &quot;{t.text}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* FAQ SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section id="faq" className="py-24 sm:py-28 relative scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-4">
              <span className="text-cyan-400 text-sm font-medium">❓ FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              {t('home.faq.title', 'Questions fréquentes')}
            </h2>
            <p className="text-white/40 text-lg">
              {t('home.faq.subtitle', 'Tout ce que vous devez savoir sur My Guide Digital')}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                question: t('home.faq.q1', "Qu'est-ce que My Guide Digital ?"),
                answer: t('home.faq.a1', "My Guide Digital est un livret d'accueil numérique alimenté par l'IA qui permet de centraliser toutes les informations utiles pour vos voyageurs et de les rendre autonomes pendant leur séjour.")
              },
              {
                question: t('home.faq.q2', "À qui s'adresse la solution My Guide Digital ?"),
                answer: t('home.faq.a2', "My Guide Digital s'adresse aux hôtes AirBnB, gestionnaires de conciergerie et professionnels du voyage qui souhaitent digitaliser leur accueil.")
              },
              {
                question: t('home.faq.q3', "Quels sont les principaux bénéfices pour un hôte AirBnB ?"),
                answer: t('home.faq.a3', "Un hôte AirBnB peut créer un livret professionnel en quelques minutes, réduire les questions répétitives, gagner plusieurs heures par semaine et augmenter ses avis 5 étoiles.")
              },
              {
                question: t('home.faq.q4', "Comment l'IA de My Guide Digital m'aide‑t‑elle au quotidien ?"),
                answer: t('home.faq.a4', "L'IA répond automatiquement aux questions fréquentes, guide vos voyageurs dans l'utilisation du logement et vous évite d'être sollicité en permanence.")
              },
              {
                question: t('home.faq.q5', "Puis‑je tester My Guide Digital gratuitement ?"),
                answer: t('home.faq.a5', "Oui, vous pouvez tester la solution gratuitement pendant 14 jours grâce au bouton « Testez gratuitement » présent à plusieurs endroits sur le site.")
              },
              {
                question: t('home.faq.q6', "En quoi My Guide Digital améliore‑t‑il l'expérience client ?"),
                answer: t('home.faq.a6', "En donnant un accès clair et instantané à toutes les informations, My Guide Digital améliore le confort des voyageurs, réduit les frictions et vous aide à obtenir davantage d'avis positifs.")
              },
              {
                question: t('home.faq.q7', "La solution convient‑elle aux conciergeries avec plusieurs biens ?"),
                answer: t('home.faq.a7', "Oui, My Guide Digital permet aux gestionnaires de conciergerie d'automatiser la communication pour plusieurs logements et de standardiser la qualité d'accueil.")
              },
              {
                question: t('home.faq.q8', "My Guide Digital permet‑il de réduire mes coûts opérationnels ?"),
                answer: t('home.faq.a8', "En automatisant les réponses et en digitalisant le livret d'accueil, My Guide Digital réduit le temps passé sur le support aux voyageurs et donc vos coûts opérationnels.")
              },
              {
                question: t('home.faq.q9', "Existe‑t‑il un programme d'affiliation ou de parrainage ?"),
                answer: t('home.faq.a9', "Oui, vous pouvez proposer un code promo à votre communauté pour leur faire bénéficier de 15% de réduction sur l'abonnement.")
              },
              {
                question: t('home.faq.q10', "Où puis‑je trouver les tarifs et les conditions d'utilisation ?"),
                answer: t('home.faq.a10', "Les tarifs sont accessibles via la page « Nos tarifs » et les informations légales via les pages « Mentions légales » et « Conditions Générales » en bas du site.")
              }
            ].map((faq, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.05] transition-all">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <h3 className="text-base font-medium text-white/80 pr-4">
                      {faq.question}
                    </h3>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      openFaqIndex === index 
                        ? 'bg-gradient-to-r from-primary to-pink-500 rotate-180' 
                        : 'bg-white/5'
                    }`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-white/40 leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* CTA FINAL SECTION */}
      {/* ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-28 relative overflow-hidden">
        {/* Background premium */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/15 rounded-full -translate-y-1/2 -translate-x-1/3 blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/15 rounded-full translate-y-1/2 translate-x-1/3 blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px]"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white/60 text-sm font-medium">Prêt à commencer ?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            {t('home.cta.title', 'Prêt à transformer l\'expérience de vos voyageurs ?')}
          </h2>
          <p className="text-xl sm:text-2xl mb-10 text-white/50">
            Rejoignez des dizaines d&apos;établissements qui font confiance à notre plateforme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="relative group px-8 py-4 rounded-full font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative">{t('home.cta.cta', 'Testez gratuitement — 14 jours')}</span>
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 rounded-full font-semibold text-lg text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                {t('home.cta.login', 'J\'ai déjà un compte')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════════════ */}
      <footer className="relative bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                My Guide Digital
              </h3>
              <p className="text-white/30 mb-6 leading-relaxed max-w-md">
                {t('home.footer.description', 'La solution moderne pour créer et partager vos livrets d\'accueil digitaux. Simplifiez l\'expérience de vos voyageurs.')}
              </p>
              {/* Social icons placeholder */}
              <div className="flex gap-3">
                {['facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
                    <span className="text-white/40 text-xs">{social.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white text-sm uppercase tracking-wider">{t('home.footer.navigation', 'Navigation')}</h4>
              <ul className="space-y-3 text-white/30">
                <li><Link href="/" className="hover:text-white/70 transition-colors text-sm">{t('nav.home', 'Accueil')}</Link></li>
                <li><Link href="/hote-airbnb" className="hover:text-white/70 transition-colors text-sm">{t('nav.services', 'Nos services')}</Link></li>
                <li><Link href="/tarifs" className="hover:text-white/70 transition-colors text-sm">{t('nav.pricing', 'Nos tarifs')}</Link></li>
                <li><Link href="/blog" className="hover:text-white/70 transition-colors text-sm">{t('nav.blog', 'Blog')}</Link></li>
                <li><Link href="/login" className="hover:text-white/70 transition-colors text-sm">{t('nav.login', 'Connexion')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white text-sm uppercase tracking-wider">{t('home.footer.support', 'Support')}</h4>
              <ul className="space-y-3 text-white/30">
                <li><a href="#" className="hover:text-white/70 transition-colors text-sm">{t('home.footer.documentation', 'Documentation')}</a></li>
                <li><Link href="/contact" className="hover:text-white/70 transition-colors text-sm">{t('home.footer.contact', 'Contact')}</Link></li>
                <li><Link href="#faq" className="hover:text-white/70 transition-colors text-sm">FAQ</Link></li>
                <li><Link href="/affiliation" className="hover:text-white/70 transition-colors text-sm">Programme d&apos;affiliation</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center text-white/20 text-sm">
            <p>{t('home.footer.copyright', '© 2026 My Guide Digital. Tous droits réservés.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
