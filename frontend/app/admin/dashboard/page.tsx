'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/lib/store';
import { adminApi, authApi } from '@/lib/api';
import Link from 'next/link';

interface OverviewData {
  users: {
    total: number;
    active: number;
    trial: number;
    paid: number;
  };
  revenue: {
    total: number;
    monthly: number;
    byPlan: {
      monthly: number;
      yearly: number;
      lifetime: number;
    };
  };
  livrets: {
    total: number;
    active: number;
    inactive: number;
  };
  subscriptions: {
    expiringSoon: number;
  };
  conversionRate: number;
}

export default function AdminDashboardPage() {
  console.log('🚀 AdminDashboardPage - Composant chargé');
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  console.log('👤 État auth:', { isAuthenticated, userRole: user?.role, userEmail: user?.email });
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    console.log('📌 useEffect mounted - initialisation');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Ne vérifier l'auth qu'une seule fois au montage, sauf si l'authentification change
    if (hasCheckedAuth && isAuthenticated && data) {
      return; // Déjà vérifié et données chargées, ne pas re-vérifier
    }

    let isMounted = true;

    const checkAuth = async () => {
      // Si on est déjà en train de charger, ne pas relancer
      if (isLoading && !data && hasCheckedAuth) return;
      
      console.log('🔍 Vérification auth admin:', { isAuthenticated, userRole: user?.role, hasCheckedAuth });
      
      if (!isAuthenticated) {
        console.log('❌ Non authentifié, redirection vers login');
        if (isMounted) {
          router.push('/login');
        }
        return;
      }

      // Recharger l'utilisateur depuis l'API pour avoir les données à jour (notamment le rôle)
      try {
        console.log('📡 Chargement utilisateur depuis API...');
        const response = await authApi.getMe();
        
        if (!isMounted) return;
        
        const updatedUser = response.data.user;
        console.log('✅ Utilisateur chargé:', { email: updatedUser.email, role: updatedUser.role });
        
        // Mettre à jour le store avec les données à jour
        useAuthStore.getState().updateUser(updatedUser);

        if (updatedUser.role !== 'ADMIN') {
          console.log('❌ Utilisateur n\'est pas ADMIN, redirection vers dashboard');
          if (isMounted) {
            router.push('/dashboard');
          }
          return;
        }

        console.log('✅ Utilisateur est ADMIN, chargement des données...');
        // Si l'utilisateur est admin, charger les données seulement si on n'a pas déjà de données
        if (!data && isMounted) {
          setHasCheckedAuth(true);
          loadData();
        } else if (isMounted) {
          setHasCheckedAuth(true);
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error('❌ Erreur vérification auth:', err);
        console.error('Détails erreur:', err.response?.data || err.message);
        
        // Si c'est une erreur 401/403, rediriger vers login (géré par l'intercepteur aussi)
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('🔒 Token expiré ou accès refusé, redirection vers login');
          useAuthStore.getState().logout();
          router.push('/login');
          return;
        }
        
        // Pour les autres erreurs, ne pas afficher d'erreur si on a déjà des données
        // (pour éviter d'afficher une erreur après un certain temps)
        if (!data) {
          setError(err.response?.data?.message || t('admin.error.authVerification'));
        }
        setHasCheckedAuth(true);
      }
    };

    checkAuth();

    // Cleanup
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(''); // Réinitialiser l'erreur avant de charger
      console.log('📊 Chargement des données admin...');
      const response = await adminApi.getOverview();
      console.log('✅ Données admin chargées:', response.data);
      setData(response.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Erreur chargement données admin:', err);
      console.error('Détails erreur:', err.response?.data || err.message);
      
      // Si c'est une erreur 401/403, ne pas afficher d'erreur (redirection gérée par l'intercepteur)
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('🔒 Token expiré ou accès refusé lors du chargement des données');
        useAuthStore.getState().logout();
        router.push('/login');
        return;
      }
      
      // Pour les autres erreurs, seulement afficher si on n'a pas déjà de données
      // (pour éviter d'écraser les données existantes avec une erreur)
      if (!data) {
        setError(err.response?.data?.message || t('admin.error.loadingData'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  console.log('🎨 Rendu - État:', { mounted, isAuthenticated, userRole: user?.role, isLoading, hasData: !!data, error });

  if (!mounted) {
    console.log('⏳ Pas encore monté, affichage du loader');
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  // Attendre que l'utilisateur soit vérifié avant d'afficher
  if (!isAuthenticated) {
    console.log('❌ Non authentifié, retour null');
    return null;
  }

  // Si l'utilisateur n'est pas admin, ne rien afficher (la redirection est gérée dans useEffect)
  if (user?.role !== 'ADMIN') {
    console.log('❌ Utilisateur n\'est pas ADMIN, retour null');
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('admin.loading')}</p>
          {error && <p className="text-red-500 mt-2 text-sm">{t('common.error')}: {error}</p>}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">{t('common.error')}</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setError('');
              loadData();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('admin.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const StatCard = ({ title, value, subtitle, icon, gradientClass, image }: any) => (
    <div className="relative rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white">
      {/* Image de fond avec overlay subtil */}
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-300"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
      </div>
      
      {/* Contenu */}
      <div className="relative p-6 z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-600 mt-2">{subtitle}</p>}
          </div>
          {icon && (
            <div className="ml-4">
              <div className="w-14 h-14 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center text-2xl shadow-sm">
                {icon}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.dashboard.subtitle')}</p>
        </div>

      {/* Navigation rapide */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Link href="/admin/users" className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold text-white">{t('admin.nav.users')}</div>
        </Link>
        <Link href="/admin/revenue" className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold text-white">{t('admin.nav.revenue')}</div>
        </Link>
        <Link href="/admin/subscriptions" className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-2xl mb-2">📋</div>
          <div className="font-semibold text-white">{t('admin.nav.subscriptions')}</div>
        </Link>
        <Link href="/admin/livrets" className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold text-white">{t('admin.nav.livrets')}</div>
        </Link>
        <Link href="/admin/invoices" className="bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-2xl mb-2">🧾</div>
          <div className="font-semibold text-white">{t('admin.nav.invoices')}</div>
        </Link>
      </div>

      {/* KPIs Utilisateurs - Couleur principale : Violet/Purple */}
      <div className="mb-12 p-6 rounded-xl border-2 border-purple-200 bg-white/50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">👥</span>
          {t('admin.sections.users')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={t('admin.users.total')}
            value={data.users.total}
            gradientClass="from-purple-50 to-purple-200"
            icon="👥"
            image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
          />
          <StatCard
            title={t('admin.users.active')}
            value={data.users.active}
            gradientClass="from-purple-100 to-purple-300"
            icon="✅"
            image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
          />
          <StatCard
            title={t('admin.users.trial')}
            value={data.users.trial}
            gradientClass="from-purple-200 to-purple-400"
            icon="⏱️"
            image="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"
          />
          <StatCard
            title={t('admin.users.paid')}
            value={data.users.paid}
            gradientClass="from-purple-300 to-purple-500"
            icon="💳"
            image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
          />
        </div>
      </div>

      {/* KPIs Revenus - Couleur principale : Rose/Pink */}
      <div className="mb-12 p-6 rounded-xl border-2 border-pink-200 bg-white/50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">💰</span>
          {t('admin.sections.revenue')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={t('admin.revenue.total')}
            value={`${data.revenue.total.toFixed(2)} €`}
            gradientClass="from-pink-50 to-pink-200"
            icon="💰"
            image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
          />
          <StatCard
            title={t('admin.revenue.monthly')}
            value={`${data.revenue.monthly.toFixed(2)} €`}
            gradientClass="from-pink-100 to-pink-300"
            icon="📅"
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
          />
          <StatCard
            title={t('admin.revenue.planMonthly')}
            value={`${data.revenue.byPlan.monthly.toFixed(2)} €`}
            subtitle={t('admin.revenue.planMonthlySubtitle')}
            gradientClass="from-pink-200 to-pink-400"
            icon="📊"
            image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
          />
          <StatCard
            title={t('admin.revenue.planYearly')}
            value={`${data.revenue.byPlan.yearly.toFixed(2)} €`}
            subtitle={t('admin.revenue.planYearlySubtitle')}
            gradientClass="from-pink-300 to-pink-500"
            icon="📈"
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <StatCard
            title={t('admin.revenue.planLifetime')}
            value={`${data.revenue.byPlan.lifetime.toFixed(2)} €`}
            subtitle={t('admin.revenue.planLifetimeSubtitle')}
            gradientClass="from-pink-400 to-pink-600"
            icon="⭐"
            image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
          />
          <StatCard
            title={t('admin.revenue.conversionRate')}
            value={`${data.conversionRate}%`}
            subtitle={t('admin.revenue.conversionRateSubtitle')}
            gradientClass="from-pink-500 to-pink-700"
            icon="🔄"
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
          />
        </div>
      </div>

      {/* KPIs Livrets - Couleur principale : Violet foncé */}
      <div className="mb-12 p-6 rounded-xl border-2 border-violet-200 bg-white/50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">📚</span>
          {t('admin.sections.livrets')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={t('admin.livrets.total')}
            value={data.livrets.total}
            gradientClass="from-violet-50 to-violet-200"
            icon="📚"
            image="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80"
          />
          <StatCard
            title={t('admin.livrets.active')}
            value={data.livrets.active}
            gradientClass="from-violet-200 to-violet-400"
            icon="✅"
            image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
          />
          <StatCard
            title={t('admin.livrets.inactive')}
            value={data.livrets.inactive}
            gradientClass="from-violet-300 to-violet-500"
            icon="❌"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
          />
        </div>
      </div>

      {/* Alertes */}
      {data.subscriptions.expiringSoon > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-800">
                <strong>{data.subscriptions.expiringSoon}</strong> {data.subscriptions.expiringSoon > 1 ? t('admin.alerts.expiringSoonPlural') : t('admin.alerts.expiringSoon')}
              </p>
              <p className="text-sm text-gray-600 mt-1">{t('admin.alerts.actionRequired')}</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
