'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { blogApi } from '@/lib/api';

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

// Simple Markdown to HTML (headings, bold, italic, images, links, lists, blockquotes)
function renderMarkdown(text: string): string {
  if (!text) return '';
  let html = text
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const imgUrl = src.startsWith('http') ? src : getImageUrl(src);
      return `<figure class="my-8"><img src="${imgUrl}" alt="${alt}" class="w-full rounded-xl shadow-lg" />${alt ? `<figcaption class="text-center text-white/30 text-sm mt-2">${alt}</figcaption>` : ''}</figure>`;
    })
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white mt-8 mb-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-5 pb-2 border-b border-white/[0.06]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-10 mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic text-white/70">$1</em>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-white/[0.02] rounded-r-lg"><p class="text-white/60 italic">$1</p></blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="text-white/50 ml-4 list-disc mb-1">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-pink-400 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-white/50 leading-relaxed mb-4">')
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap list items
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="my-4 space-y-1">$1</ul>');

  return `<p class="text-white/50 leading-relaxed mb-4">${html}</p>`;
}

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string | null;
  category: string;
  tags: string | null;
  featured: boolean;
  readTime: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  publishedAt: string | null;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; profilePhoto: string | null };
}

export default function BlogArticlePage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) loadArticle();
  }, [slug]);

  async function loadArticle() {
    try {
      const res = await blogApi.getArticle(slug as string);
      setArticle(res.data);
    } catch (err: any) {
      setError('Article non trouvé');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4">Chargement de l&apos;article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📭</p>
          <h1 className="text-2xl font-bold text-white mb-2">Article non trouvé</h1>
          <p className="text-white/40 mb-6">Cet article n&apos;existe pas ou a été supprimé.</p>
          <Link href="/blog" className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all">
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const gradient = categoryGradients[article.category] || 'from-primary to-pink-500';
  const tags = article.tags ? JSON.parse(article.tags) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">{t('nav.home', 'Accueil')}</Link>
              <Link href="/hote-airbnb" className="text-white/80 hover:text-white transition-colors text-sm font-medium">{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="text-white/80 hover:text-white transition-colors text-sm font-medium">{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="text-white font-semibold text-sm border-b-2 border-primary pb-0.5">{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">{t('nav.contact', 'Contact')}</Link>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
        {article.thumbnail && (
          <div className="absolute inset-0 z-0">
            <img src={article.thumbnail.startsWith('http') ? article.thumbnail : getImageUrl(article.thumbnail)} alt="" className="w-full h-full object-cover opacity-10 blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-[#0c0a1d]/95 to-[#0c0a1d]"></div>
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Link href="/blog" className="text-white/40 hover:text-primary transition-colors">Blog</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60">{categoryLabels[article.category] || article.category}</span>
          </div>

          {/* Category + meta */}
          <div className="flex items-center gap-3 mb-5">
            <span className={`px-3 py-1 bg-gradient-to-r ${gradient} rounded-full text-white text-xs font-semibold`}>
              {categoryLabels[article.category] || article.category}
            </span>
            {article.publishedAt && (
              <span className="text-white/30 text-sm">
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {article.readTime && (
              <span className="text-white/30 text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {article.readTime}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-3xl">
            {article.excerpt}
          </p>

          {/* Author */}
          {article.author && (
            <div className="flex items-center gap-3 pb-8 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {(article.author.firstName?.[0] || 'A').toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{article.author.firstName} {article.author.lastName}</p>
                <p className="text-white/30 text-xs">Auteur</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Thumbnail */}
      {article.thumbnail && (
        <section className="pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              <img
                src={article.thumbnail.startsWith('http') ? article.thumbnail : getImageUrl(article.thumbnail)}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-invert max-w-none text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/[0.06]">
              <p className="text-white/40 text-sm mb-3">Tags :</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/50 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to blog */}
          <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Retour au blog
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">Navigation</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Accueil</Link></li>
                <li><Link href="/blog" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Blog</Link></li>
                <li><Link href="/tarifs" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Nos tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">Contact</Link></li>
                <li><Link href="/#faq" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">FAQ</Link></li>
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
