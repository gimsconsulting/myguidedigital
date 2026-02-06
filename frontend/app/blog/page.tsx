'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

export default function BlogPage() {
  const { t } = useTranslation();
  const articles = [
    {
      id: 1,
      title: 'Comment créer un guide d\'accueil digital efficace pour votre location Airbnb',
      excerpt: 'Découvrez les meilleures pratiques pour créer un guide d\'accueil qui impressionnera vos voyageurs et facilitera leur séjour.',
      date: '15 Janvier 2026',
      category: 'Conseils'
    },
    {
      id: 2,
      title: '5 avantages des guides digitaux pour les hôtes Airbnb',
      excerpt: 'Les guides d\'accueil digitaux transforment la façon dont les hôtes communiquent avec leurs invités. Voici pourquoi.',
      date: '10 Janvier 2026',
      category: 'Avantages'
    },
    {
      id: 3,
      title: 'L\'IA au service de l\'hospitalité : comment MGD améliore l\'expérience voyageur',
      excerpt: 'Explorez comment l\'intelligence artificielle révolutionne l\'accueil dans le secteur de l\'hospitalité.',
      date: '5 Janvier 2026',
      category: 'Technologie'
    }
  ];

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
              <Link href="/blog" className="text-primary font-semibold">{t('nav.blog', 'Blog')}</Link>
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">
                {t('blog.title', 'Blog My Guide Digital')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
              {t('blog.subtitle', 'Conseils, astuces et actualités pour optimiser votre activité d\'hôte')}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20 bg-dark-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {articles.map((article) => (
              <article key={article.id} className="glass-dark rounded-2xl p-8 hover:glow-purple transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gradient-purple-pink rounded-full text-white text-sm font-medium">
                    {article.category}
                  </span>
                  <span className="text-gray-400 text-sm">{article.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {article.excerpt}
                </p>
                <Link href={`/blog/${article.id}`} className="text-primary hover:text-pink-500 font-medium inline-flex items-center gap-2">
                  {t('blog.readMore', 'Lire la suite')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
