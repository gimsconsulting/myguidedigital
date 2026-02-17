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
import AppChatWidget from './AppChatWidget';

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

  // Navigation items — Profil en premier
  const navItems = [
    { href: '/profile', label: t('profile.title', 'Profil'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    )},
    { href: '/dashboard', label: t('dashboard.title', 'Tableau de bord'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { href: '/subscription', label: t('subscription.title', 'Abonnement'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    )},
    { href: '/invoices', label: t('invoices.title', 'Factures'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
    { href: '/dashboard/affiliation', label: t('nav.affiliation', 'Affiliation'), icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ), special: 'affiliation' as const },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href) || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Popup blocage trial expiré */}
      <TrialExpiredModal isOpen={showTrialExpiredModal} />

      {/* ══════════ NAVBAR PREMIUM ══════════ */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 shadow-xl shadow-purple-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo MY GUIDE DIGITAL */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
                  MY GUIDE
                </span>
                <span className="text-base font-bold bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent tracking-tight ml-1">
                  DIGITAL
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                if (item.special === 'affiliation') {
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'text-amber-400/70 hover:text-amber-300 hover:bg-white/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                }
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-white/15 text-white shadow-inner'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Admin */}
              {user?.role === 'ADMIN' && (
                <Link href="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname?.startsWith('/admin')
                      ? 'bg-red-500/20 text-red-300'
                      : 'text-red-400/70 hover:text-red-300 hover:bg-white/5'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span>Admin</span>
                </Link>
              )}
            </div>

            {/* Right section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* User info */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-white/70 font-medium max-w-[120px] truncate">
                    {user.firstName} {user.lastName?.[0]}.
                  </span>
                </div>
              )}
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200"
                title={t('nav.logout', 'Déconnexion')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
              {/* Language selector */}
              <LanguageSelector />
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
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

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 py-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-white/10 text-white'
                        : item.special === 'affiliation'
                          ? 'text-amber-400/80 hover:bg-white/5 hover:text-amber-300'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              {user?.role === 'ADMIN' && (
                <Link href="/admin/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    pathname?.startsWith('/admin') ? 'bg-red-500/20 text-red-300' : 'text-red-400/70 hover:bg-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span>Admin</span>
                </Link>
              )}
              {/* User + logout mobile */}
              <div className="border-t border-white/10 mt-2 pt-3 px-4">
                {user && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-white/70 font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  {t('nav.logout', 'Déconnexion')}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Chatbot de l'application */}
      <AppChatWidget />
    </div>
  );
}
