'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { blogApi } from '@/lib/api';

const categories = [
  { id: 'all', label: 'Tous les articles', emoji: '📰' },
  { id: 'conseils', label: 'Conseils', emoji: '💡' },
  { id: 'avantages', label: 'Avantages', emoji: '🚀' },
  { id: 'technologie', label: 'Technologie', emoji: '🤖' },
  { id: 'temoignages', label: 'Témoignages', emoji: '⭐' },
  { id: 'actualites', label: 'Actualités', emoji: '📢' },
];

const categoryGradients: Record<string, string> = {
  conseils: 'from-amber-500 to-orange-500',
  avantages: 'from-emerald-500 to-teal-500',
  technologie: 'from-violet-500 to-purple-500',
  temoignages: 'from-pink-500 to-rose-500',
  actualites: 'from-primary to-blue-500',
};

const categoryLabels: Record<string, string> = {
  conseils: 'Conseils',
  avantages: 'Avantages',
  technologie: 'Technologie',
  temoignages: 'Témoignages',
  actualites: 'Actualités',
};

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  category: string;
  tags: string | null;
  featured: boolean;
  readTime: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; profilePhoto: string | null };
}

function getImageUrl(path: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d/.test(hostname)) {
      return `http://${hostname}:3001${path}`;
    }
    return `/api${path}`;
  }
  return path;
}

export default function BlogPage() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  async function loadArticles() {
    try {
      const res = await blogApi.getArticles({ limit: 50 });
      setArticles(res.data.articles || []);
    } catch (error) {
      console.error('Erreur chargement articles:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  const featuredArticles = articles.filter(a => a.featured).slice(0, 3);

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
            <div className="md:hidden flex items-center gap-3">
              <LanguageSelector />
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
      {featuredArticles.length > 0 && (
      <section className="pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-pink-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">À la une</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => {
              const gradient = categoryGradients[article.category] || 'from-primary to-pink-500';
              return (
              <Link
                href={`/blog/${article.slug}`}
                key={article.id}
                className={`group relative ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-md`}></div>
                <div className={`relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col overflow-hidden`}>
                  {/* Thumbnail */}
                  {article.thumbnail ? (
                    <div className={`w-full ${index === 0 ? 'h-64' : 'h-40'} overflow-hidden`}>
                      <img src={article.thumbnail.startsWith('http') ? article.thumbnail : getImageUrl(article.thumbnail)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className={`w-full ${index === 0 ? 'h-32' : 'h-20'} bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                      <span className="text-4xl">{categories.find(c => c.id === article.category)?.emoji || '📝'}</span>
                    </div>
                  )}

                  <div className={`${index === 0 ? 'p-8' : 'p-6'} flex flex-col flex-grow`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 bg-gradient-to-r ${gradient} rounded-full text-white text-xs font-semibold`}>
                        {categoryLabels[article.category] || article.category}
                      </span>
                      <span className="text-white/30 text-xs">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</span>
                      {article.readTime && (
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {article.readTime}
                        </span>
                      )}
                    </div>

                    <h3 className={`font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight ${index === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
                      {article.title}
                    </h3>
                    <p className={`text-white/40 leading-relaxed flex-grow ${index === 0 ? 'text-base' : 'text-sm'} line-clamp-3`}>
                      {article.excerpt}
                    </p>

                    <div className="mt-5">
                      <span className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-sm font-semibold group/link">
                        {t('blog.readMore', 'Lire la suite')}
                        <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>
      )}

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

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <p className="text-white/40 mt-4">Chargement des articles...</p>
            </div>
          )}

          {/* Grille d'articles */}
          {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const gradient = categoryGradients[article.category] || 'from-primary to-pink-500';
              return (
              <Link
                href={`/blog/${article.slug}`}
                key={article.id}
                className="group relative"
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-md`}></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 h-full flex flex-col overflow-hidden">
                  {/* Thumbnail */}
                  {article.thumbnail ? (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={article.thumbnail.startsWith('http') ? article.thumbnail : getImageUrl(article.thumbnail)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className={`w-full h-2 bg-gradient-to-r ${gradient}`}></div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 bg-gradient-to-r ${gradient} rounded-full text-white text-xs font-semibold`}>
                        {categoryLabels[article.category] || article.category}
                      </span>
                      <span className="text-white/30 text-xs">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed flex-grow line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                      <span className="text-white/30 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {article.readTime || '3 min'}
                      </span>
                      {article.author && (
                        <span className="text-white/20 text-xs">✍️ {article.author.firstName || 'Admin'}</span>
                      )}
                      <span className="inline-flex items-center text-primary hover:text-pink-400 transition-colors text-sm font-semibold group/link">
                        Lire
                        <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
          )}

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
              <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-relaxed max-w-md">
                La solution moderne pour créer et partager vos livrets d&apos;accueil digitaux.
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
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">Navigation</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Accueil</Link></li>
                <li><Link href="/hote-airbnb" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Nos services</Link></li>
                <li><Link href="/tarifs" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Nos tarifs</Link></li>
                <li><Link href="/blog" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Blog</Link></li>
                <li><Link href="/login" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Contact</Link></li>
                <li><Link href="/#faq" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">FAQ</Link></li>
                <li><Link href="/affiliation" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Programme d&apos;affiliation</Link></li>
                <li><Link href="/mentions-legales" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Mentions légales</Link></li>
                <li><Link href="/confidentialite" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Confidentialité</Link></li>
                <li><Link href="/cgvu" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">CGVU</Link></li>
                <li><Link href="/cookies" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Politique de cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center">
            <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-sm">
              © {new Date().getFullYear()} My Guide Digital. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
