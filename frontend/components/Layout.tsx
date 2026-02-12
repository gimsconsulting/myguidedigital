'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // TOUS les hooks doivent être appelés AVANT toute condition
  const router = useRouter();
  const pathname = usePathname();
  
  // Log très précoce pour vérifier que le code est chargé
  console.log('🚀 [LAYOUT] Layout component rendered', {
    pathname,
    timestamp: new Date().toISOString()
  });
  
  // Déterminer si c'est une page d'authentification
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isPublicRoute = pathname?.startsWith('/guide') || pathname?.startsWith('/business-card');
  const isHomePage = pathname === '/';
  const isPublicPage = pathname === '/hote-airbnb' || pathname === '/blog' || pathname === '/contact';
  
  // Vérifier auth-storage APRÈS avoir appelé tous les hooks
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthPage && !isPublicRoute && !isHomePage && !isPublicPage) {
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
  }, [pathname, isAuthPage, isPublicRoute, isHomePage, isPublicPage]);
  
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
  const { isAuthenticated, user, logout, updateUser, hasHydrated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const authCheckedRef = useRef(false);
  const refreshedRef = useRef(false);
  
  // Vérifier l'authentification — utiliser useRef pour éviter la boucle infinie
  // NE PAS mettre isAuthenticated ou user dans les dépendances car setAuth les modifie
  useEffect(() => {
    // Si déjà vérifié, ne rien faire
    if (authCheckedRef.current) return;
    
    let timeoutId: NodeJS.Timeout | null = null;
    let checkInterval: NodeJS.Timeout | null = null;
    
    // Vérifier DIRECTEMENT dans auth-storage
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const hasAuthData = parsed.state?.isAuthenticated && 
                             parsed.state?.token && 
                             parsed.state?.user;
          if (hasAuthData) {
            // Seulement mettre à jour le store si nécessaire
            const currentState = useAuthStore.getState();
            if (!currentState.isAuthenticated || !currentState.token) {
              useAuthStore.getState().setAuth(parsed.state.token, parsed.state.user);
            }
            authCheckedRef.current = true;
            setIsReady(true);
            setShouldRedirect(false);
            return () => {};
          }
        } catch (e) {
          // Ignore
        }
      }
    }
    
    // Vérifier depuis le store si hydraté
    const storeState = useAuthStore.getState();
    if (storeState.hasHydrated || hasHydrated) {
      const finalIsAuthenticated = storeState.isAuthenticated || (storeState.token && storeState.user);
      authCheckedRef.current = true;
      setIsReady(true);
      setShouldRedirect(!finalIsAuthenticated);
    } else {
      // Attendre l'hydratation
      checkInterval = setInterval(() => {
        const state = useAuthStore.getState();
        if (state.hasHydrated) {
          if (checkInterval) clearInterval(checkInterval);
          const finalIsAuthenticated = state.isAuthenticated || (state.token && state.user);
          authCheckedRef.current = true;
          setIsReady(true);
          setShouldRedirect(!finalIsAuthenticated);
        }
      }, 50);
      
      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        authCheckedRef.current = true;
        setIsReady(true);
        setShouldRedirect(true);
      }, 2000);
    }
    
    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
      if (checkInterval !== null) clearInterval(checkInterval);
    };
  }, [hasHydrated]); // Seulement hasHydrated — PAS isAuthenticated ni user
  
  const { t, ready } = useTranslation();
  
  // Rafraîchir les données utilisateur UNE SEULE FOIS au montage
  useEffect(() => {
    if (!isReady || shouldRedirect || refreshedRef.current) return;
    refreshedRef.current = true;
    
    const refreshUserData = async () => {
      try {
        const currentState = useAuthStore.getState();
        if (!currentState.isAuthenticated) return;
        
        const { authApi } = await import('@/lib/api');
        const response = await authApi.getMe();
        if (response.data?.user) {
          updateUser(response.data.user);
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      }
    };
    
    refreshUserData();
  }, [isReady, shouldRedirect, updateUser]);
  
  // S'assurer que le composant est monté
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirection vers login si nécessaire
  useEffect(() => {
    if (shouldRedirect && pathname !== '/login' && isReady) {
      router.push('/login');
    }
  }, [shouldRedirect, pathname, isReady, router]);

  // ===== TOUS LES HOOKS SONT APPELÉS AVANT CE POINT =====
  // ===== Les returns conditionnels peuvent maintenant être utilisés =====

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  // Si la vérification indique qu'on doit rediriger
  if (shouldRedirect && pathname !== '/login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Redirection...</p>
        </div>
      </div>
    );
  }

  // Attendre le montage
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
