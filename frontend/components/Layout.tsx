'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';
import TrialExpiredModal from './TrialExpiredModal';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // TOUS les hooks doivent être appelés AVANT toute condition
  const router = useRouter();
  const pathname = usePathname();
  
  // Déterminer si c'est une page d'authentification
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isPublicRoute = pathname?.startsWith('/guide') || pathname?.startsWith('/business-card');
  const isHomePage = pathname === '/';
  const isPublicPage = pathname === '/hote-airbnb' || pathname === '/blog' || pathname?.startsWith('/blog/') || pathname === '/contact' || pathname === '/tarifs' || pathname?.startsWith('/tarifs/') || pathname === '/affiliation' || pathname === '/mentions-legales' || pathname === '/confidentialite' || pathname === '/cgvu' || pathname === '/cookies';
  
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
  const refreshedRef = useRef(false);
  
  const { t, ready } = useTranslation();
  
  // Rafraîchir les données utilisateur UNE SEULE FOIS au montage
  useEffect(() => {
    if (refreshedRef.current) return;
    if (!hasHydrated) return;
    if (!isAuthenticated) return;
    
    refreshedRef.current = true;
    
    const refreshUserData = async () => {
      try {
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
  }, [hasHydrated, isAuthenticated, updateUser]);
  
  // S'assurer que le composant est monté
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirection vers login si nécessaire
  useEffect(() => {
    if (hasHydrated && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, pathname, router]);

  // ===== TOUS LES HOOKS SONT APPELÉS AVANT CE POINT =====

  // Attendre l'hydratation du store
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  // Attendre que i18n soit prêt
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Redirection...</p>
        </div>
      </div>
    );
  }

  // Vérifier si le trial est expiré
  const isTrialExpired = user?.subscription?.plan === 'TRIAL' && user?.subscription?.status === 'EXPIRED';
  // Ne PAS bloquer la page /subscription pour que l'utilisateur puisse souscrire
  const isSubscriptionPage = pathname === '/subscription' || pathname?.startsWith('/subscription/');
  const showTrialExpiredModal = isTrialExpired && !isSubscriptionPage;

  // Attendre le montage côté client
  if (!mounted) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Popup blocage trial expiré */}
      <TrialExpiredModal isOpen={showTrialExpiredModal} />

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
              <Link
                href="/dashboard/affiliation"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard/affiliation' ? 'bg-amber-500 text-white' : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                {t('nav.affiliation', 'Affiliation')}
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
                <Link
                  href="/dashboard/affiliation"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/dashboard/affiliation' ? 'bg-amber-500 text-white' : 'text-amber-600 hover:bg-amber-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.affiliation', 'Affiliation')}
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
