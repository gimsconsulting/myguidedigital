'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import { useAuthCheck } from '@/lib/useAuthCheck';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Log très précoce pour vérifier que le code est chargé
  console.log('🚀 [LAYOUT] Layout component rendered', {
    pathname,
    timestamp: new Date().toISOString()
  });
  
  // Vérifier auth-storage AVANT toute décision de layout
  if (typeof window !== 'undefined' && pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password') {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('🚀 [LAYOUT] Found auth-storage', {
          isAuthenticated: parsed.state?.isAuthenticated,
          hasToken: !!parsed.state?.token,
          hasUser: !!parsed.state?.user
        });
      } catch (e) {
        console.error('🚀 [LAYOUT] Error parsing auth-storage', e);
      }
    } else {
      console.log('🚀 [LAYOUT] No auth-storage found');
    }
  }
  
  // Déterminer si c'est une page d'authentification AVANT d'appeler des hooks
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isPublicRoute = pathname?.startsWith('/guide') || pathname?.startsWith('/business-card');
  const isHomePage = pathname === '/';
  const isPublicPage = pathname === '/hote-airbnb' || pathname === '/blog' || pathname === '/contact';
  
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
  const { isAuthenticated, user, logout, updateUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Utiliser le hook personnalisé pour vérifier l'authentification
  const { isReady, shouldRedirect } = useAuthCheck();
  
  // Log initial pour vérifier que le code est bien chargé
  console.log('🔐 [AUTH] AuthenticatedLayout mounted', {
    pathname,
    isReady,
    shouldRedirect,
    isAuthenticated,
    hasUser: !!user
  });
  
  // Maintenant on peut appeler useTranslation en toute sécurité
  const { t, ready } = useTranslation();
  
  // Rafraîchir les données utilisateur au montage pour avoir le rôle à jour
  useEffect(() => {
    const refreshUserData = async () => {
      if (isAuthenticated && typeof window !== 'undefined' && isReady && !shouldRedirect) {
        try {
          const { authApi } = await import('@/lib/api');
          const response = await authApi.getMe();
          if (response.data?.user) {
            updateUser(response.data.user);
          }
        } catch (error) {
          console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
        }
      }
    };
    
    if (isReady && !shouldRedirect) {
      refreshUserData();
    }
  }, [isAuthenticated, updateUser, isReady, shouldRedirect]);
  
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
  
  // Attendre que la vérification d'authentification soit terminée
  if (!isReady) {
    console.log('[AUTH DEBUG] Waiting for auth check...');
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  // Si la vérification indique qu'on doit rediriger, le faire
  if (shouldRedirect && pathname !== '/login') {
    console.log('[AUTH DEBUG] Should redirect to login', {
      shouldRedirect,
      pathname,
      isReady,
      isAuthenticated,
      hasUser: !!user
    });
    
    // Instrumentation pour envoyer des logs au serveur
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7242/ingest/36c68756-5ba0-48a8-9b2f-5d04f05f23de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Layout.tsx:AuthenticatedLayout',
          message: 'Redirecting to login',
          data: {
            shouldRedirect,
            pathname,
            isReady,
            isAuthenticated,
            hasUser: !!user,
            timestamp: Date.now()
          }
        })
      }).catch(() => {});
    }
    
    router.push('/login');
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Redirection...</p>
        </div>
      </div>
    );
  }
  
  // S'assurer que le composant est monté avant de faire des redirections
  useEffect(() => {
    setMounted(true);
  }, []);

  // Attendre le montage avant de rendre le Layout complet
  if (!mounted) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-sm"
              >
                {t('nav.logout', 'Déconnexion')}
              </Button>
              <LanguageSelector />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/dashboard' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('dashboard.title', 'Dashboard')}
                </Link>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/profile' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('profile.title', 'Profil')}
                </Link>
                <Link
                  href="/subscription"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/subscription' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('subscription.title', 'Abonnement')}
                </Link>
                <Link
                  href="/invoices"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/invoices' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('invoices.title', 'Factures')}
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname?.startsWith('/admin') ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                {user && (
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {user.firstName} {user.lastName}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mt-2"
                >
                  {t('nav.logout', 'Déconnexion')}
                </Button>
                <div className="px-3 py-2">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
