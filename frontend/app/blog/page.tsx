'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';

const categories = [
  { id: 'all', label: 'Tous les articles', emoji: '📰' },
  { id: 'conseils', label: 'Conseils', emoji: '💡' },
  { id: 'avantages', label: 'Avantages', emoji: '🚀' },
  { id: 'technologie', label: 'Technologie', emoji: '🤖' },
  { id: 'temoignages', label: 'Témoignages', emoji: '⭐' },
  { id: 'actualites', label: 'Actualités', emoji: '📢' },
];

const articles = [
  {
    id: 1,
    title: 'Comment créer un guide d\'accueil digital efficace pour votre location Airbnb',
    excerpt: 'Découvrez les meilleures pratiques pour créer un guide d\'accueil qui impressionnera vos voyageurs et facilitera leur séjour. Un livret bien structuré peut significativement améliorer vos avis et votre taux de retour.',
    date: '15 Janvier 2026',
    category: 'conseils',
    categoryLabel: 'Conseils',
    readTime: '5 min',
    gradient: 'from-primary to-pink-500',
    featured: true,
  },
  {
    id: 2,
    title: '5 avantages des guides digitaux pour les hôtes Airbnb',
    excerpt: 'Les guides d\'accueil digitaux transforment la façon dont les hôtes communiquent avec leurs invités. Voici pourquoi vous devriez en adopter un dès maintenant.',
    date: '10 Janvier 2026',
    category: 'avantages',
    categoryLabel: 'Avantages',
    readTime: '4 min',
    gradient: 'from-emerald-500 to-teal-500',
    featured: true,
  },
  {
    id: 3,
    title: 'L\'IA au service de l\'hospitalité : comment MGD améliore l\'expérience voyageur',
    excerpt: 'Explorez comment l\'intelligence artificielle révolutionne l\'accueil dans le secteur de l\'hospitalité avec des chatbots intelligents et la traduction automatique.',
    date: '5 Janvier 2026',
    category: 'technologie',
    categoryLabel: 'Technologie',
    readTime: '6 min',
    gradient: 'from-violet-500 to-purple-500',
    featured: true,
  },
  {
    id: 4,
    title: 'Pourquoi digitaliser son livret d\'accueil en 2026 ?',
    excerpt: 'Le papier c\'est fini ! Découvrez pourquoi de plus en plus d\'hébergeurs passent au digital pour leur livret d\'accueil et les bénéfices concrets qu\'ils en tirent.',
    date: '28 Décembre 2025',
    category: 'avantages',
    categoryLabel: 'Avantages',
    readTime: '3 min',
    gradient: 'from-amber-500 to-orange-500',
    featured: false,
  },
  {
    id: 5,
    title: 'Comment améliorer vos avis Airbnb grâce à un accueil digital',
    excerpt: 'Vos avis clients sont votre meilleur atout. Un livret digital bien pensé peut transformer l\'expérience de vos voyageurs et booster significativement vos notes.',
    date: '20 Décembre 2025',
    category: 'conseils',
    categoryLabel: 'Conseils',
    readTime: '4 min',
    gradient: 'from-pink-500 to-rose-500',
    featured: false,
  },
  {
    id: 6,
    title: 'La traduction multilingue : un atout majeur pour l\'accueil international',
    excerpt: 'Accueillir des voyageurs du monde entier demande une communication adaptée. Découvrez comment la traduction automatique facilite l\'accueil de vos hôtes internationaux.',
    date: '15 Décembre 2025',
    category: 'technologie',
    categoryLabel: 'Technologie',
    readTime: '5 min',
    gradient: 'from-blue-500 to-cyan-500',
    featured: false,
  },
];

export default function BlogPage() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const featuredArticles = articles.filter(a => a.featured);

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
              <Link href="/hote-airbnb" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.services', 'Nos services')}
              </Link>
              <Link href="/tarifs" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.pricing', 'Nos tarifs')}
              </Link>
              <Link href="/blog" className="text-white font-semibold text-sm border-b-2 border-primary pb-0.5">
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
              <Link href="/hote-airbnb" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="block text-white font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
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
      {/* HERO */}
      {/* ══════════════════════════════════════ */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-pink-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <span className="text-white/70 text-sm font-medium">📝 Ressources & Actualités</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('blog.title', 'Blog My Guide Digital')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/50 max-w-3xl mx-auto">
              {t('blog.subtitle', 'Conseils, astuces et actualités pour optimiser votre activité d\'hôte')}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* ARTICLES À LA UNE */}
      {/* ══════════════════════════════════════ */}
      <section className="pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">À la une</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => (
              <div
                key={article.id}
                className={`group relative ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${article.gradient} rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-md`}></div>
                <div className={`relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col overflow-hidden ${index === 0 ? 'p-8' : 'p-6'}`}>
                  {/* Decorative gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${article.gradient}`}></div>

                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <span className={`px-3 py-1 bg-gradient-to-r ${article.gradient} rounded-full text-white text-xs font-semibold`}>
                      {article.categoryLabel}
                    </span>
                    <span className="text-white/30 text-xs">{article.date}</span>
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className={`font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight ${index === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                    {article.title}
                  </h3>
                  <p className={`text-white/40 leading-relaxed flex-grow ${index === 0 ? 'text-base' : 'text-sm'}`}>
                    {article.excerpt}
                  </p>

                  <div className="mt-5">
                    <span className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-sm font-semibold group/link cursor-pointer">
                      {t('blog.readMore', 'Lire la suite')}
                      <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FILTRE PAR CATÉGORIE + TOUS LES ARTICLES */}
      {/* ══════════════════════════════════════ */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/20'
                    : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:border-white/[0.15] hover:text-white/80'
                }`}
              >
                <span className="mr-1.5">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grille d'articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group relative"
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${article.gradient} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-md`}></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col overflow-hidden">
                  {/* Decorative gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${article.gradient}`}></div>

                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <span className={`px-3 py-1 bg-gradient-to-r ${article.gradient} rounded-full text-white text-xs font-semibold`}>
                      {article.categoryLabel}
                    </span>
                    <span className="text-white/30 text-xs">{article.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed flex-grow">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {article.readTime}
                    </span>
                    <span className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-sm font-semibold group/link cursor-pointer">
                      Lire
                      <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Empty state */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-white/40 text-lg">Aucun article dans cette catégorie pour le moment.</p>
              <button
                onClick={() => setActiveCategory('all')}
                className="mt-4 text-primary hover:text-pink-400 transition-colors font-semibold"
              >
                Voir tous les articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* NEWSLETTER / CTA */}
      {/* ══════════════════════════════════════ */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="group relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-pink-500 to-purple-500 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            <div className="relative rounded-2xl p-10 sm:p-14 overflow-hidden bg-gradient-to-br from-primary/15 via-pink-500/15 to-purple-500/15 backdrop-blur-sm border border-white/10">
              <div className="absolute top-0 right-0 w-60 h-60 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

              <div className="relative text-center">
                <div className="text-5xl mb-5">📬</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                  Restez informé des dernières actualités
                </h2>
                <p className="text-white/50 mb-8 max-w-xl mx-auto leading-relaxed">
                  Recevez nos conseils, astuces et actualités directement dans votre boîte mail. Rejoignez la communauté My Guide Digital.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="flex-1 px-5 py-3 rounded-full bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all text-sm"
                  />
                  <button className="relative group/btn px-6 py-3 rounded-full font-bold text-white overflow-hidden transition-all duration-300 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-50 group-hover/btn:opacity-80 transition-opacity"></div>
                    <span className="relative text-sm">S&apos;abonner</span>
                  </button>
                </div>
                <p className="text-white/20 text-xs mt-4">Pas de spam, désinscription en un clic.</p>
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
            Prêt à créer votre livret d&apos;accueil ?
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/60">
            Testez gratuitement pendant 14 jours et offrez une expérience mémorable à vos voyageurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative">Créer mon livret gratuitement</span>
              </button>
            </Link>
            <Link href="/tarifs">
              <button className="px-8 py-4 rounded-full font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-lg">
                Découvrir nos tarifs
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
