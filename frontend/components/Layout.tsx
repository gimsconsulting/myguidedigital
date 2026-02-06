'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Déterminer si c'est une page d'authentification AVANT d'appeler des hooks
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isPublicRoute = pathname?.startsWith('/guide') || pathname?.startsWith('/business-card');
  const isHomePage = pathname === '/';
  const isPublicPage = pathname === '/hote-airbnb' || pathname === '/blog';
  
  // Pour les pages publiques et d'authentification, utiliser un Layout simplifié SANS i18n
  if (isAuthPage || isPublicRoute || isHomePage || isPublicPage) {
    return <AuthLayout>{children}</AuthLayout>;
  }
  
  // Pour les autres pages, utiliser le Layout complet avec i18n
  return <AuthenticatedLayout router={router} pathname={pathname}>{children}</AuthenticatedLayout>;
}

// Layout séparé pour les pages authentifiées - avec i18n
function AuthenticatedLayout({ 
  router, 
  pathname, 
  children 
}: { 
  router: ReturnType<typeof useRouter>;
  pathname: string;
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Maintenant on peut appeler useTranslation en toute sécurité
  const { t, ready } = useTranslation();
  
  // Attendre que i18n soit prêt
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // S'assurer que le composant est monté avant de faire des redirections
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Ne pas faire de redirections avant que le composant soit monté
    if (!mounted || typeof window === 'undefined') return;
    
    // Ne rediriger que si nécessaire
    if (!isAuthenticated) {
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated, pathname]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Attendre le montage avant de rendre le Layout complet
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-primary">
                {t('nav.appName', 'Livrets d\'Accueil')}
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('dashboard.title', 'Dashboard')}
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/profile' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('profile.title', 'Profil')}
              </Link>
              <Link
                href="/subscription"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/subscription' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('subscription.title', 'Abonnement')}
              </Link>
              <Link
                href="/invoices"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/invoices' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('invoices.title', 'Factures')}
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname?.startsWith('/admin') ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Admin
                </Link>
              )}
              {user && (
                <span className="text-sm text-gray-600 hidden lg:inline">
                  {user.firstName} {user.lastName}
                </span>
              )}
              <LanguageSelector />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('nav.logout', 'Déconnexion')}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label="Menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/dashboard' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('dashboard.title', 'Dashboard')}
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/profile' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('profile.title', 'Profil')}
              </Link>
              <Link
                href="/subscription"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/subscription' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('subscription.title', 'Abonnement')}
              </Link>
              <Link
                href="/invoices"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/invoices' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t('invoices.title', 'Factures')}
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname?.startsWith('/admin') ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Admin
                </Link>
              )}
              {user && (
                <div className="px-3 py-2 text-sm text-gray-600 border-t border-gray-200 mt-2">
                  {user.firstName} {user.lastName}
                </div>
              )}
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>
              <div className="px-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  {t('nav.logout', 'Déconnexion')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
