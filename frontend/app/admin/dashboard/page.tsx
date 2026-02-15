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
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (hasCheckedAuth && isAuthenticated && data) return;

    let isMounted = true;

    const checkAuth = async () => {
      if (isLoading && !data && hasCheckedAuth) return;
      if (!isAuthenticated) {
        if (isMounted) router.push('/login');
        return;
      }

      try {
        const response = await authApi.getMe();
        if (!isMounted) return;
        const updatedUser = response.data.user;
        useAuthStore.getState().updateUser(updatedUser);

        if (updatedUser.role !== 'ADMIN') {
          if (isMounted) router.push('/dashboard');
          return;
        }

        if (!data && isMounted) {
          setHasCheckedAuth(true);
          loadData();
        } else if (isMounted) {
          setHasCheckedAuth(true);
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          useAuthStore.getState().logout();
          router.push('/login');
          return;
        }
        if (!data) {
          setError(err.response?.data?.message || 'Erreur de vérification');
        }
        setHasCheckedAuth(true);
      }
    };

    checkAuth();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await adminApi.getOverview();
      setData(response.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        useAuthStore.getState().logout();
        router.push('/login');
        return;
      }
      if (!data) setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) return null;
  if (user?.role !== 'ADMIN') return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-500 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => { setError(''); loadData(); }}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculs pour les graphiques
  const totalRevenue = data.revenue.total;
  const revenueParts = [
    { label: 'Abonnements', value: data.revenue.byPlan.yearly, color: 'from-primary to-purple-600' },
    { label: 'Saisonniers', value: data.revenue.byPlan.monthly, color: 'from-pink-500 to-rose-500' },
    { label: 'Autres', value: data.revenue.byPlan.lifetime, color: 'from-amber-400 to-orange-500' },
  ];
  const maxRevenuePart = Math.max(...revenueParts.map(r => r.value), 1);

  const userParts = [
    { label: 'Essai gratuit', value: data.users.trial, color: '#f59e0b', bgColor: 'bg-amber-400' },
    { label: 'Payants', value: data.users.paid, color: '#8b5cf6', bgColor: 'bg-violet-500' },
    { label: 'Actifs', value: data.users.active, color: '#10b981', bgColor: 'bg-emerald-500' },
  ];

  const livretPercent = data.livrets.total > 0 ? Math.round((data.livrets.active / data.livrets.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════ */}
        {/* HEADER ADMIN */}
        {/* ══════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                  <span className="text-white text-lg">🛡️</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Dashboard Administrateur
                </h1>
              </div>
              <p className="text-white/60 text-sm md:text-base">
                Vue d&apos;ensemble de votre plateforme My Guide Digital
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-medium border border-white/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* ALERTES */}
        {/* ══════════════════════════════════════ */}
        {data.subscriptions.expiringSoon > 0 && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-200">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {data.subscriptions.expiringSoon} abonnement{data.subscriptions.expiringSoon > 1 ? 's' : ''} expire{data.subscriptions.expiringSoon > 1 ? 'nt' : ''} bientôt
                </p>
                <p className="text-sm text-gray-600">Dans les 7 prochains jours — action recommandée</p>
              </div>
              <Link
                href="/admin/subscriptions"
                className="ml-auto px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-semibold flex-shrink-0"
              >
                Voir →
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* KPIs — CHIFFRES CLÉS */}
        {/* ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Utilisateurs */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white text-lg">👥</span>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">USERS</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{data.users.total}</p>
              <p className="text-sm text-gray-500 mt-1">Utilisateurs inscrits</p>
            </div>
          </div>

          {/* Revenus totaux */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200">
                  <span className="text-white text-lg">💰</span>
                </div>
                <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">REVENUS</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{data.revenue.total.toFixed(0)}€</p>
              <p className="text-sm text-gray-500 mt-1">Chiffre d&apos;affaires total</p>
            </div>
          </div>

          {/* Livrets */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                  <span className="text-white text-lg">📚</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">LIVRETS</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{data.livrets.total}</p>
              <p className="text-sm text-gray-500 mt-1">Livrets créés</p>
            </div>
          </div>

          {/* Taux de conversion */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-200">
                  <span className="text-white text-lg">🔄</span>
                </div>
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">CONVERSION</span>
              </div>
              <p className="text-4xl font-bold text-gray-900">{data.conversionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Essai → Payant</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* NAVIGATION RAPIDE */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Navigation rapide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { href: '/admin/users', icon: '👥', label: 'Utilisateurs', gradient: 'from-primary to-purple-600', shadow: 'shadow-primary/20' },
              { href: '/admin/revenue', icon: '💰', label: 'Revenus', gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200' },
              { href: '/admin/subscriptions', icon: '💎', label: 'Abonnements', gradient: 'from-violet-500 to-indigo-500', shadow: 'shadow-violet-200' },
              { href: '/admin/livrets', icon: '📚', label: 'Livrets', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
              { href: '/admin/invoices', icon: '🧾', label: 'Factures', gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="group relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg ${item.shadow}`}>
                  {item.icon}
                </div>
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* GRAPHIQUES — UTILISATEURS + REVENUS */}
        {/* ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* — Répartition Utilisateurs — */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                Utilisateurs
              </h3>
              <Link href="/admin/users" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Voir tout →
              </Link>
            </div>

            <div className="flex items-center gap-8">
              {/* Donut Chart SVG */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                  {/* Segment Essai */}
                  <circle
                    cx="60" cy="60" r="48" fill="none"
                    stroke="#f59e0b"
                    strokeWidth="14"
                    strokeDasharray={`${data.users.total > 0 ? (data.users.trial / data.users.total) * 301.6 : 0} 301.6`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  {/* Segment Payants */}
                  <circle
                    cx="60" cy="60" r="48" fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="14"
                    strokeDasharray={`${data.users.total > 0 ? (data.users.paid / data.users.total) * 301.6 : 0} 301.6`}
                    strokeDashoffset={`${data.users.total > 0 ? -(data.users.trial / data.users.total) * 301.6 : 0}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{data.users.total}</span>
                  <span className="text-xs text-gray-400">total</span>
                </div>
              </div>

              {/* Légende */}
              <div className="flex-1 space-y-4">
                {userParts.map((part, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${part.bgColor}`}></div>
                      <span className="text-sm text-gray-600">{part.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{part.value}</span>
                      <span className="text-xs text-gray-400">
                        ({data.users.total > 0 ? Math.round((part.value / data.users.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* — Revenus par catégorie — */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                Revenus
              </h3>
              <Link href="/admin/revenue" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Détails →
              </Link>
            </div>

            {/* Barre totale */}
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Revenu total</span>
                <span className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Ce mois-ci</span>
                <span className="text-sm font-semibold text-primary">{data.revenue.monthly.toFixed(2)}€</span>
              </div>
            </div>

            {/* Barres de répartition */}
            <div className="space-y-4">
              {revenueParts.map((part, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600">{part.label}</span>
                    <span className="text-sm font-bold text-gray-900">{part.value.toFixed(2)}€</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${part.color} transition-all duration-700`}
                      style={{ width: `${maxRevenuePart > 0 ? (part.value / maxRevenuePart) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* GRAPHIQUES — LIVRETS + PERFORMANCE */}
        {/* ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* — Statut des Livrets — */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-sm">📚</span>
                </div>
                Livrets
              </h3>
              <Link href="/admin/livrets" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Voir tout →
              </Link>
            </div>

            <div className="flex items-center gap-8">
              {/* Donut livrets */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                  <circle
                    cx="60" cy="60" r="48" fill="none"
                    stroke="url(#grad-livrets)"
                    strokeWidth="14"
                    strokeDasharray={`${(livretPercent / 100) * 301.6} 301.6`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad-livrets" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{livretPercent}%</span>
                  <span className="text-xs text-gray-400">actifs</span>
                </div>
              </div>

              {/* Stats livrets */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-gray-700">En ligne</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{data.livrets.active}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-700">Hors ligne</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">{data.livrets.inactive}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-gray-700">Total</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{data.livrets.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* — Indicateurs clés — */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              Performance
            </h3>

            <div className="space-y-5">
              {/* Taux de conversion */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Taux de conversion</span>
                  <span className="text-sm font-bold text-gray-900">{data.conversionRate}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${Math.min(data.conversionRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Essai gratuit → Abonnement payant</p>
              </div>

              {/* Utilisation active */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Utilisateurs actifs</span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                    style={{ width: `${data.users.total > 0 ? (data.users.active / data.users.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{data.users.active} sur {data.users.total} utilisateurs</p>
              </div>

              {/* Engagement livrets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Livrets actifs</span>
                  <span className="text-sm font-bold text-gray-900">{livretPercent}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-700"
                    style={{ width: `${livretPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">{data.livrets.active} sur {data.livrets.total} livrets en ligne</p>
              </div>

              {/* Revenu mensuel */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-pink-500/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Revenu ce mois</p>
                    <p className="text-xs text-gray-400">Factures payées</p>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                    {data.revenue.monthly.toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* RÉCAPITULATIF RAPIDE */}
        {/* ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
            <p className="text-white/70 text-sm mb-1">Essai en cours</p>
            <p className="text-3xl font-bold">{data.users.trial}</p>
            <p className="text-white/60 text-xs mt-2">utilisateurs</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-pink-200">
            <p className="text-white/70 text-sm mb-1">Payants</p>
            <p className="text-3xl font-bold">{data.users.paid}</p>
            <p className="text-white/60 text-xs mt-2">abonnés actifs</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
            <p className="text-white/70 text-sm mb-1">Livrets actifs</p>
            <p className="text-3xl font-bold">{data.livrets.active}</p>
            <p className="text-white/60 text-xs mt-2">en ligne</p>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-200">
            <p className="text-white/70 text-sm mb-1">Expiration</p>
            <p className="text-3xl font-bold">{data.subscriptions.expiringSoon}</p>
            <p className="text-white/60 text-xs mt-2">sous 7 jours</p>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ══════════════════════════════════════ */}
        <div className="text-center py-4">
          <p className="text-gray-400 text-xs">
            My Guide Digital — Panneau d&apos;administration • Données actualisées en temps réel
          </p>
        </div>

      </div>
    </div>
  );
}
