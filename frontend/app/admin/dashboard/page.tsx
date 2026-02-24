'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/lib/store';
import { adminApi, authApi, affiliatesApi, appChatConfigApi, demoBookingsApi } from '@/lib/api';
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
    byCategory: {
      hotes: number;
      hotels: number;
      campings: number;
      legacy: number;
    };
  };
  livrets: {
    total: number;
    active: number;
    inactive: number;
  };
  subscriptions: {
    expiringSoon: number;
    recentlyExpired: number;
    byCategory: {
      trial: number;
      hotes: number;
      hotesAnnuel: number;
      hotesSaison: number;
      hotels: number;
      campings: number;
      legacy: number;
      total: number;
    };
  };
  conversionRate: number;
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    userType: string;
  }>;
}

interface AffiliateOverview {
  totalAffiliates: number;
  approvedAffiliates: number;
  pendingAffiliates: number;
  totalReferrals: number;
  totalSales: number;
  totalCommissions: number;
  totalPaidCommissions: number;
  pendingCommissions: number;
  currentMonth: {
    sales: number;
    commissions: number;
    referrals: number;
  };
  topAffiliates: Array<{
    id: string;
    affiliateCode: string;
    companyName: string;
    totalEarnings: number;
    totalPaid: number;
    status: string;
    user: { firstName: string; lastName: string; email: string };
    _count: { referrals: number };
  }>;
}

interface AffiliateListItem {
  id: string;
  affiliateCode: string;
  companyName: string;
  vatNumber: string;
  contactName: string;
  email: string;
  status: string;
  totalEarnings: number;
  totalPaid: number;
  commissionRate: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  _count: { referrals: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [data, setData] = useState<OverviewData | null>(null);
  const [affiliateData, setAffiliateData] = useState<AffiliateOverview | null>(null);
  const [pendingAffiliates, setPendingAffiliates] = useState<AffiliateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Chatbot config state
  const [chatbotContext, setChatbotContext] = useState('');
  const [chatbotIsActive, setChatbotIsActive] = useState(true);
  const [chatbotSaving, setChatbotSaving] = useState(false);
  const [chatbotLoaded, setChatbotLoaded] = useState(false);
  const [chatbotMessage, setChatbotMessage] = useState('');

  // Demo bookings state
  const [demoBookings, setDemoBookings] = useState<any[]>([]);
  const [demoBookingsLoaded, setDemoBookingsLoaded] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockingDay, setBlockingDay] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;
    if (hasCheckedAuth && isAuthenticated && data) return;
    let isMounted = true;
    const checkAuth = async () => {
      if (isLoading && !data && hasCheckedAuth) return;
      if (!isAuthenticated) { if (isMounted) router.push('/login'); return; }
      try {
        const response = await authApi.getMe();
        if (!isMounted) return;
        const updatedUser = response.data.user;
        useAuthStore.getState().updateUser(updatedUser);
        if (updatedUser.role !== 'ADMIN') { if (isMounted) router.push('/dashboard'); return; }
        if (!data && isMounted) { setHasCheckedAuth(true); loadData(); }
        else if (isMounted) { setHasCheckedAuth(true); }
      } catch (err: any) {
        if (!isMounted) return;
        if (err.response?.status === 401 || err.response?.status === 403) { useAuthStore.getState().logout(); router.push('/login'); return; }
        if (!data) setError(err.response?.data?.message || 'Erreur de vérification');
        setHasCheckedAuth(true);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, hasHydrated, isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [overviewRes, affOverviewRes, affListRes] = await Promise.allSettled([
        adminApi.getOverview(),
        affiliatesApi.adminOverview(),
        affiliatesApi.adminList({ status: 'PENDING', limit: 10 }),
      ]);
      if (overviewRes.status === 'fulfilled') setData(overviewRes.value.data);
      if (affOverviewRes.status === 'fulfilled') setAffiliateData(affOverviewRes.value.data);
      if (affListRes.status === 'fulfilled') setPendingAffiliates(affListRes.value.data.affiliates || []);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) { useAuthStore.getState().logout(); router.push('/login'); return; }
      if (!data) setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAffiliateAction = async (affiliateId: string, status: string) => {
    try {
      await affiliatesApi.adminUpdateStatus(affiliateId, status);
      loadData();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut affilié:', err);
    }
  };

  // Charger la config du chatbot
  const loadChatbotConfig = async () => {
    try {
      const res = await appChatConfigApi.get();
      if (res.data.config) {
        setChatbotContext(res.data.config.context || '');
        setChatbotIsActive(res.data.config.isActive);
      }
      setChatbotLoaded(true);
    } catch (err) {
      console.error('Erreur chargement config chatbot:', err);
      setChatbotLoaded(true);
    }
  };

  // Sauvegarder la config du chatbot
  const saveChatbotConfig = async () => {
    setChatbotSaving(true);
    setChatbotMessage('');
    try {
      await appChatConfigApi.update({ context: chatbotContext, isActive: chatbotIsActive });
      setChatbotMessage('✅ Configuration du chatbot sauvegardée !');
      setTimeout(() => setChatbotMessage(''), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde config chatbot:', err);
      setChatbotMessage('❌ Erreur lors de la sauvegarde');
      setTimeout(() => setChatbotMessage(''), 3000);
    } finally {
      setChatbotSaving(false);
    }
  };

  // Charger les démos
  const loadDemoBookings = async () => {
    try {
      const res = await demoBookingsApi.adminGetAll();
      setDemoBookings(res.data || []);
      setDemoBookingsLoaded(true);
    } catch (err) {
      console.error('Erreur chargement démos:', err);
      setDemoBookingsLoaded(true);
    }
  };

  const loadBlockedSlots = async () => {
    try {
      const res = await demoBookingsApi.adminGetBlockedSlots();
      setBlockedSlots(res.data || []);
    } catch (err) {
      console.error('Erreur chargement créneaux bloqués:', err);
    }
  };

  const handleBlockDay = async () => {
    if (!blockDate) return;
    setBlockingDay(true);
    try {
      await demoBookingsApi.adminBlockDay({ date: blockDate, reason: blockReason || 'Indisponible' });
      setDemoMessage('✅ Journée bloquée !');
      setBlockDate('');
      setBlockReason('');
      loadBlockedSlots();
      setTimeout(() => setDemoMessage(''), 3000);
    } catch (err: any) {
      setDemoMessage('❌ Erreur');
      setTimeout(() => setDemoMessage(''), 3000);
    } finally {
      setBlockingDay(false);
    }
  };

  const handleUnblockSlot = async (id: string) => {
    try {
      await demoBookingsApi.adminUnblockSlot(id);
      loadBlockedSlots();
    } catch (err) {
      console.error('Erreur déblocage:', err);
    }
  };

  const handleDemoStatusUpdate = async (id: string, status: string) => {
    try {
      await demoBookingsApi.adminUpdateStatus(id, { status });
      loadDemoBookings();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  };

  // Charger la config du chatbot + démos au montage
  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated && user?.role === 'ADMIN' && !chatbotLoaded) {
      loadChatbotConfig();
    }
    if (hasCheckedAuth && isAuthenticated && user?.role === 'ADMIN' && !demoBookingsLoaded) {
      loadDemoBookings();
      loadBlockedSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedAuth, isAuthenticated, user?.role]);

  if (!mounted || !hasHydrated) return null;
  if (!isAuthenticated) return null;
  if (user?.role !== 'ADMIN') return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="mt-6 text-gray-400 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4"><span className="text-3xl">⚠️</span></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => { setError(''); loadData(); }} className="px-6 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculs
  const totalRevenue = data.revenue.total;
  const livretPercent = data.livrets.total > 0 ? Math.round((data.livrets.active / data.livrets.total) * 100) : 0;
  const activePercent = data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0;

  const revCat = data.revenue.byCategory || { hotes: 0, hotels: 0, campings: 0, legacy: 0 };
  const subCat = data.subscriptions.byCategory || { trial: 0, hotes: 0, hotesAnnuel: 0, hotesSaison: 0, hotels: 0, campings: 0, legacy: 0, total: 0 };

  const maxRevCat = Math.max(revCat.hotes, revCat.hotels, revCat.campings, revCat.legacy, 1);

  const categoryCards = [
    { emoji: '🏠', label: 'Hôtes & Locations', subs: subCat.hotes, revenue: revCat.hotes, gradient: 'from-primary to-purple-600', shadow: 'shadow-primary/20', bg: 'bg-primary/5' },
    { emoji: '🏨', label: 'Hôtels', subs: subCat.hotels, revenue: revCat.hotels, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200', bg: 'bg-pink-50' },
    { emoji: '🏕️', label: 'Campings', subs: subCat.campings, revenue: revCat.campings, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200', bg: 'bg-emerald-50' },
  ];

  // Donut segments
  const donutTotal = Math.max(subCat.trial + subCat.hotes + subCat.hotels + subCat.campings + subCat.legacy, 1);
  const donutSegments = [
    { label: 'Essai gratuit', value: subCat.trial, color: '#f59e0b', bgClass: 'bg-amber-400' },
    { label: 'Hôtes & Locations', value: subCat.hotes, color: '#8b5cf6', bgClass: 'bg-violet-500' },
    { label: 'Hôtels', value: subCat.hotels, color: '#ec4899', bgClass: 'bg-pink-500' },
    { label: 'Campings', value: subCat.campings, color: '#10b981', bgClass: 'bg-emerald-500' },
    { label: 'Anciens plans', value: subCat.legacy, color: '#6b7280', bgClass: 'bg-gray-500' },
  ].filter(s => s.value > 0);

  // Donut offsets
  let cumulativeOffset = 0;
  const donutArcs = donutSegments.map(seg => {
    const arc = {
      ...seg,
      dashArray: `${(seg.value / donutTotal) * 301.6} 301.6`,
      offset: -cumulativeOffset,
    };
    cumulativeOffset += (seg.value / donutTotal) * 301.6;
    return arc;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ═══════════════════════════════════════ */}
        {/* HEADER ADMIN PREMIUM */}
        {/* ═══════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-white/60 text-xs font-medium">Tableau de bord en direct</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="text-white text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      Dashboard Admin
                    </h1>
                    <p className="text-white/40 text-sm">
                      Vue d&apos;ensemble • My Guide Digital
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={loadData}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-sm font-medium border border-white/10 flex items-center gap-2 group"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser les données
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* ALERTES */}
        {/* ═══════════════════════════════════════ */}
        {(data.subscriptions.expiringSoon > 0 || (data.subscriptions.recentlyExpired || 0) > 0) && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.subscriptions.expiringSoon > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-lg shadow-black/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-200">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">
                      {data.subscriptions.expiringSoon} abonnement{data.subscriptions.expiringSoon > 1 ? 's' : ''} expire{data.subscriptions.expiringSoon > 1 ? 'nt' : ''}
                    </p>
                    <p className="text-xs text-gray-500">Dans les 7 prochains jours</p>
                  </div>
                  <Link href="/admin/subscriptions" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs font-bold flex-shrink-0">
                    Voir →
                  </Link>
                </div>
              </div>
            )}
            {(data.subscriptions.recentlyExpired || 0) > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-5 shadow-lg shadow-black/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-red-200">
                    <span className="text-xl">🔴</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">
                      {data.subscriptions.recentlyExpired} abonnement{(data.subscriptions.recentlyExpired || 0) > 1 ? 's' : ''} expiré{(data.subscriptions.recentlyExpired || 0) > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">Au cours des 30 derniers jours</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* KPIs PRINCIPAUX */}
        {/* ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '👥', label: 'Utilisateurs', value: data.users.total, sub: `${data.users.active} actifs`, tag: 'USERS', gradient: 'from-primary to-purple-600', shadow: 'shadow-primary/20', tagBg: 'bg-primary/10 text-primary' },
            { icon: '💰', label: 'Revenus HT', value: `${totalRevenue.toFixed(2)}€`, sub: `${data.revenue.monthly.toFixed(2)}€ ce mois`, tag: 'REVENUS', gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200', tagBg: 'bg-pink-50 text-pink-600' },
            { icon: '📚', label: 'Livrets', value: data.livrets.total, sub: `${data.livrets.active} actifs (${livretPercent}%)`, tag: 'LIVRETS', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200', tagBg: 'bg-emerald-50 text-emerald-600' },
            { icon: '🔄', label: 'Conversion', value: `${data.conversionRate}%`, sub: 'Essai → Payant', tag: 'TAUX', gradient: 'from-violet-500 to-indigo-500', shadow: 'shadow-violet-200', tagBg: 'bg-violet-50 text-violet-600' },
          ].map((kpi, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${kpi.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-white rounded-2xl p-5 shadow-lg shadow-black/10 border border-white/20 h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg ${kpi.shadow}`}>
                    <span className="text-white text-lg">{kpi.icon}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.tagBg}`}>{kpi.tag}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* NAVIGATION RAPIDE */}
        {/* ═══════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Navigation rapide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { href: '/admin/users', icon: '👥', label: 'Utilisateurs', gradient: 'from-primary to-purple-600', shadow: 'shadow-primary/20' },
              { href: '/admin/revenue', icon: '💰', label: 'Revenus', gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200' },
              { href: '/admin/subscriptions', icon: '💎', label: 'Abonnements', gradient: 'from-violet-500 to-indigo-500', shadow: 'shadow-violet-200' },
              { href: '/admin/livrets', icon: '📚', label: 'Livrets', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
              { href: '/admin/invoices', icon: '🧾', label: 'Factures', gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
              { href: '/admin/blog', icon: '📝', label: 'Blog', gradient: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-200' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="group relative overflow-hidden bg-white/95 rounded-xl p-4 shadow-lg shadow-black/10 border border-white/20 hover:shadow-xl hover:bg-white transition-all duration-300 text-center">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg ${item.shadow}`}>
                  {item.icon}
                </div>
                <p className="font-semibold text-gray-900 text-xs">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* ABONNEMENTS PAR CATÉGORIE — LE CŒUR   */}
        {/* ═══════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Abonnements par catégorie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryCards.map((cat, i) => (
              <div key={i} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${cat.gradient} rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-300`}></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 border border-white/20 h-full">
                  <div className={`h-1.5 bg-gradient-to-r ${cat.gradient}`}></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white text-xl shadow-lg ${cat.shadow}`}>
                        {cat.emoji}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{cat.label}</p>
                        <p className="text-xs text-gray-400">Abonnements actifs</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`${cat.bg} rounded-xl p-3 text-center`}>
                        <p className="text-2xl font-bold text-gray-900">{cat.subs}</p>
                        <p className="text-[10px] text-gray-500 font-medium">ABONNÉS</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-gray-900">{cat.revenue.toFixed(2)}€</p>
                        <p className="text-[10px] text-gray-500 font-medium">REVENUS HT</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sous-détail Hôtes */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/10 border border-white/20">
              <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[10px] text-white">🏠</span>
                Détail Hôtes & Locations
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                  <p className="text-xl font-bold text-gray-900">{subCat.hotesAnnuel || 0}</p>
                  <p className="text-[10px] text-gray-500 font-medium">ANNUELS</p>
                </div>
                <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-100">
                  <p className="text-xl font-bold text-gray-900">{subCat.hotesSaison || 0}</p>
                  <p className="text-[10px] text-gray-500 font-medium">SAISONNIERS</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/10 border border-white/20">
              <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] text-white">📊</span>
                Répartition globale
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                  <p className="text-xl font-bold text-gray-900">{subCat.trial}</p>
                  <p className="text-[10px] text-gray-500 font-medium">ESSAI</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                  <p className="text-xl font-bold text-gray-900">{subCat.hotes + subCat.hotels + subCat.campings}</p>
                  <p className="text-[10px] text-gray-500 font-medium">PAYANTS</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-xl font-bold text-gray-900">{subCat.total}</p>
                  <p className="text-[10px] text-gray-500 font-medium">TOTAL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* GRAPHIQUES — DONUT + REVENUS */}
        {/* ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* — Donut répartition abonnements — */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm">💎</span>
                </div>
                Répartition des abonnements
              </h3>
              <Link href="/admin/subscriptions" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Détails →
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                  {donutArcs.map((arc, i) => (
                    <circle
                      key={i}
                      cx="60" cy="60" r="48" fill="none"
                      stroke={arc.color}
                      strokeWidth="12"
                      strokeDasharray={arc.dashArray}
                      strokeDashoffset={arc.offset}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{subCat.total}</span>
                  <span className="text-[10px] text-gray-400">abonnements</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
                {donutSegments.map((seg, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${seg.bgClass}`}></div>
                      <span className="text-xs text-gray-600">{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{seg.value}</span>
                      <span className="text-[10px] text-gray-400">
                        ({Math.round((seg.value / donutTotal) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* — Revenus par catégorie — */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
                Revenus par catégorie
              </h3>
              <Link href="/admin/revenue" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Détails →
              </Link>
            </div>

            {/* Barre totale */}
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-purple-900 rounded-xl text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/60">Revenu total HT</span>
                <span className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Ce mois-ci</span>
                <span className="text-sm font-semibold text-amber-400">{data.revenue.monthly.toFixed(2)}€</span>
              </div>
            </div>

            {/* Barres */}
            <div className="space-y-4">
              {[
                { label: '🏠 Hôtes & Locations', value: revCat.hotes, color: 'from-primary to-purple-600' },
                { label: '🏨 Hôtels', value: revCat.hotels, color: 'from-pink-500 to-rose-500' },
                { label: '🏕️ Campings', value: revCat.campings, color: 'from-emerald-400 to-teal-500' },
                ...(revCat.legacy > 0 ? [{ label: '📦 Anciens plans', value: revCat.legacy, color: 'from-gray-400 to-gray-500' }] : []),
              ].map((part, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600 font-medium">{part.label}</span>
                    <span className="text-sm font-bold text-gray-900">{part.value.toFixed(2)}€</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${part.color} transition-all duration-700`}
                      style={{ width: `${maxRevCat > 0 ? Math.max((part.value / maxRevCat) * 100, part.value > 0 ? 5 : 0) : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* GRAPHIQUES — LIVRETS + PERFORMANCE     */}
        {/* ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* — Livrets — */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-sm">📚</span>
                </div>
                Livrets d&apos;accueil
              </h3>
              <Link href="/admin/livrets" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Voir tout →
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="url(#grad-livrets-admin)" strokeWidth="14" strokeDasharray={`${(livretPercent / 100) * 301.6} 301.6`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="grad-livrets-admin" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{livretPercent}%</span>
                  <span className="text-[10px] text-gray-400">actifs</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-gray-700 font-medium">En ligne</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{data.livrets.active}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    <span className="text-xs text-gray-700 font-medium">Hors ligne</span>
                  </div>
                  <span className="text-lg font-bold text-gray-600">{data.livrets.inactive}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    <span className="text-xs font-bold text-gray-700">Total</span>
                  </div>
                  <span className="text-lg font-bold text-primary">{data.livrets.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* — Performance — */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10 border border-white/20">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              Indicateurs de performance
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Taux de conversion', value: data.conversionRate, desc: 'Essai gratuit → Abonnement payant', gradient: 'from-violet-500 to-indigo-500' },
                { label: 'Utilisateurs actifs', value: activePercent, desc: `${data.users.active} sur ${data.users.total} utilisateurs`, gradient: 'from-emerald-400 to-teal-500' },
                { label: 'Livrets en ligne', value: livretPercent, desc: `${data.livrets.active} sur ${data.livrets.total} livrets`, gradient: 'from-primary to-pink-500' },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600 font-medium">{metric.label}</span>
                    <span className="text-sm font-bold text-gray-900">{metric.value}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${metric.gradient} transition-all duration-700`} style={{ width: `${Math.min(metric.value, 100)}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{metric.desc}</p>
                </div>
              ))}

              {/* Revenu mensuel */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-pink-500/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Revenu ce mois</p>
                    <p className="text-[10px] text-gray-400">Factures payées</p>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                    {data.revenue.monthly.toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* DERNIÈRES INSCRIPTIONS */}
        {/* ═══════════════════════════════════════ */}
        {data.recentUsers && data.recentUsers.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-black/10 border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm">🆕</span>
                </div>
                Dernières inscriptions
              </h3>
              <Link href="/admin/users" className="text-xs font-medium text-primary hover:text-pink-500 transition-colors">
                Voir tous →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data.recentUsers.map((u, i) => (
                <div key={u.id} className="px-6 py-3 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                    i === 0 ? 'bg-gradient-to-br from-primary to-purple-600' :
                    i === 1 ? 'bg-gradient-to-br from-pink-500 to-rose-500' :
                    i === 2 ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                    i === 3 ? 'bg-gradient-to-br from-violet-500 to-indigo-500' :
                    'bg-gradient-to-br from-amber-400 to-orange-500'
                  }`}>
                    {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</p>
                    {u.userType && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.userType === 'SOCIETE' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.userType === 'SOCIETE' ? 'Société' : 'Particulier'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* PROGRAMME D'AFFILIATION */}
        {/* ═══════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
            Programme d&apos;affiliation
          </h2>

          {/* KPIs Affiliation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { emoji: '🤝', label: 'Affiliés approuvés', value: affiliateData?.approvedAffiliates || 0, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200', tagBg: 'bg-amber-50 text-amber-600' },
              { emoji: '👥', label: 'Filleuls total', value: affiliateData?.totalReferrals || 0, gradient: 'from-primary to-purple-600', shadow: 'shadow-primary/20', tagBg: 'bg-primary/10 text-primary' },
              { emoji: '💰', label: 'Commissions totales', value: `${(affiliateData?.totalCommissions || 0).toFixed(2)}€`, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-200', tagBg: 'bg-pink-50 text-pink-600' },
              { emoji: '⏳', label: 'À payer', value: `${(affiliateData?.pendingCommissions || 0).toFixed(2)}€`, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200', tagBg: 'bg-emerald-50 text-emerald-600' },
            ].map((kpi, i) => (
              <div key={i} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${kpi.gradient} rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-300`}></div>
                <div className="relative bg-white rounded-2xl p-4 shadow-lg shadow-black/10 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg ${kpi.shadow}`}>
                      <span className="text-white text-sm">{kpi.emoji}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Mois en cours */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-300"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 border border-white/20 h-full">
                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <span className="text-white text-sm">📅</span>
                      </div>
                      Ce mois-ci
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                      {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                      <p className="text-2xl font-bold text-gray-900">{affiliateData?.currentMonth?.referrals || 0}</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">VENTES</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
                      <p className="text-2xl font-bold text-gray-900">{(affiliateData?.currentMonth?.sales || 0).toFixed(2)}€</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">CA GÉNÉRÉ</p>
                    </div>
                    <div className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100">
                      <p className="text-2xl font-bold text-gray-900">{(affiliateData?.currentMonth?.commissions || 0).toFixed(2)}€</p>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">COMMISSIONS</p>
                    </div>
                  </div>

                  {/* Résumé paiements */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-900 to-purple-900 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/50">Total payé aux affiliés</p>
                        <p className="text-xl font-bold">{(affiliateData?.totalPaidCommissions || 0).toFixed(2)}€</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/50">Restant à payer</p>
                        <p className="text-xl font-bold text-amber-400">{(affiliateData?.pendingCommissions || 0).toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top affiliés */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-black/10 border border-white/20 h-full">
              <div className="h-1.5 bg-gradient-to-r from-primary to-purple-600"></div>
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">🏆</span>
                  </div>
                  Top affiliés
                </h3>

                {affiliateData?.topAffiliates && affiliateData.topAffiliates.length > 0 ? (
                  <div className="space-y-3">
                    {affiliateData.topAffiliates.map((aff, i) => (
                      <div key={aff.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
                          i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                          i === 1 ? 'bg-gradient-to-br from-primary to-purple-600' :
                          i === 2 ? 'bg-gradient-to-br from-pink-500 to-rose-500' :
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{aff.companyName}</p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {aff.user?.firstName} {aff.user?.lastName} • {aff._count?.referrals || 0} filleul{(aff._count?.referrals || 0) > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-amber-600">{aff.totalEarnings.toFixed(2)}€</p>
                          <p className="text-[10px] text-gray-400">gagnés</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <p className="text-gray-400 text-sm">Aucun affilié pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demandes en attente */}
          {pendingAffiliates.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl shadow-lg shadow-black/10 border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                  Demandes d&apos;affiliation en attente
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                    {pendingAffiliates.length}
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {pendingAffiliates.map((aff) => (
                  <div key={aff.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {aff.companyName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{aff.companyName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{aff.contactName} • {aff.email}</p>
                        <p className="text-[10px] text-gray-300">TVA: {aff.vatNumber} • {new Date(aff.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAffiliateAction(aff.id, 'APPROVED')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all"
                      >
                        ✅ Approuver
                      </button>
                      <button
                        onClick={() => handleAffiliateAction(aff.id, 'REJECTED')}
                        className="px-4 py-2 bg-white border border-red-200 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-all"
                      >
                        ❌ Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* RÉCAP COLORÉ */}
        {/* ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-200">
            <p className="text-white/70 text-xs mb-1">En essai</p>
            <p className="text-3xl font-bold">{subCat.trial}</p>
            <p className="text-white/50 text-[10px] mt-2">utilisateurs</p>
          </div>
          <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-primary/20">
            <p className="text-white/70 text-xs mb-1">Hôtes payants</p>
            <p className="text-3xl font-bold">{subCat.hotes}</p>
            <p className="text-white/50 text-[10px] mt-2">abonnés</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-pink-200">
            <p className="text-white/70 text-xs mb-1">Hôtels</p>
            <p className="text-3xl font-bold">{subCat.hotels}</p>
            <p className="text-white/50 text-[10px] mt-2">abonnés</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
            <p className="text-white/70 text-xs mb-1">Campings</p>
            <p className="text-3xl font-bold">{subCat.campings}</p>
            <p className="text-white/50 text-[10px] mt-2">abonnés</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* CHATBOT APPLICATION — Configuration */}
        {/* ═══════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Chatbot de l&apos;application
          </h2>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-lg shadow-black/10 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Contexte du Chatbot</h3>
                    <p className="text-xs text-gray-400">Ce texte sera utilisé par ChatGPT pour répondre aux prospects</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-xs font-semibold ${chatbotIsActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {chatbotIsActive ? 'Actif' : 'Inactif'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChatbotIsActive(!chatbotIsActive)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        chatbotIsActive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          chatbotIsActive ? 'translate-x-5' : ''
                        }`}
                      ></span>
                    </button>
                  </label>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-pink-500/5 rounded-xl p-4 mb-4 border border-primary/10">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-primary">💡 Comment ça marche :</span> Écrivez ci-dessous toutes les informations sur My Guide Digital que le chatbot doit connaître (fonctionnalités, prix, avantages, comment demander une démo, contact, etc.). Le chatbot utilisera ces informations pour répondre aux prospects. Une question principale est affichée au départ : <span className="font-semibold">&quot;Demander une démo de l&apos;application&quot;</span>.
                </p>
              </div>

              <textarea
                value={chatbotContext}
                onChange={(e) => setChatbotContext(e.target.value)}
                placeholder="Exemple : My Guide Digital est une plateforme de création de livrets d'accueil digitaux pour les professionnels du tourisme...&#10;&#10;Nos offres :&#10;- Hôtes & locations : 59€ HT/an (illimité)&#10;- Offres courtes durées : à partir de 9,90€ HT&#10;- Hôtels : à partir de 5€ HT/chambre/an&#10;- Campings : à partir de 10€ HT/emplacement/an&#10;&#10;Pour demander une démo, contactez-nous à info@gims-consulting.be ou visitez myguidedigital.com"
                rows={12}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-y text-sm leading-relaxed"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-400">
                  {chatbotContext.length > 0 ? `${chatbotContext.length} caractères` : 'Aucun contenu'}
                </div>
                <div className="flex items-center gap-3">
                  {chatbotMessage && (
                    <span className={`text-sm font-medium ${chatbotMessage.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {chatbotMessage}
                    </span>
                  )}
                  <button
                    onClick={saveChatbotConfig}
                    disabled={chatbotSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {chatbotSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* GESTION DES DÉMOS */}
        {/* ═══════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎥</span>
                <div>
                  <h3 className="font-bold text-gray-900">Gestion des démos</h3>
                  <p className="text-xs text-gray-500">Réservations, créneaux bloqués, calendrier</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                {demoBookings.filter(b => b.status === 'CONFIRMED').length} à venir
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Bloquer une journée */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 text-sm mb-3">🚫 Bloquer une journée</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Raison (ex: Congé, Réunion...)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleBlockDay}
                  disabled={!blockDate || blockingDay}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {blockingDay ? '...' : 'Bloquer'}
                </button>
              </div>
              {demoMessage && (
                <p className={`text-sm mt-2 ${demoMessage.startsWith('✅') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {demoMessage}
                </p>
              )}
            </div>

            {/* Journées bloquées */}
            {blockedSlots.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 text-sm mb-3">📅 Créneaux bloqués</h4>
                <div className="flex flex-wrap gap-2">
                  {/* Grouper par date */}
                  {Array.from(new Set(blockedSlots.map(s => new Date(s.date).toISOString().split('T')[0]))).map(dateStr => {
                    const slotsForDate = blockedSlots.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr);
                    const reason = slotsForDate[0]?.reason || '';
                    return (
                      <div key={dateStr} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm">
                        <span className="text-gray-700 font-medium">
                          {new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        {reason && <span className="text-gray-400 text-xs">({reason})</span>}
                        <span className="text-gray-400 text-xs">{slotsForDate.length} créneaux</span>
                        <button
                          onClick={() => slotsForDate.forEach(s => handleUnblockSlot(s.id))}
                          className="text-red-400 hover:text-red-600 text-xs font-bold"
                          title="Débloquer"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Liste des réservations */}
            <h4 className="font-semibold text-gray-800 text-sm mb-3">📋 Réservations de démo</h4>
            {demoBookings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Aucune réservation pour le moment</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Heure</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Prospect</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Type</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Statut</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoBookings.map((booking) => {
                      const statusColors: Record<string, string> = {
                        CONFIRMED: 'bg-green-100 text-green-700',
                        CANCELLED: 'bg-red-100 text-red-700',
                        COMPLETED: 'bg-blue-100 text-blue-700',
                        NO_SHOW: 'bg-yellow-100 text-yellow-700',
                      };
                      const statusLabels: Record<string, string> = {
                        CONFIRMED: 'Confirmée',
                        CANCELLED: 'Annulée',
                        COMPLETED: 'Terminée',
                        NO_SHOW: 'Absent',
                      };
                      const accomLabels: Record<string, string> = {
                        hote: '🏠 Hôte',
                        hotel: '🏨 Hôtel',
                        camping: '⛺ Camping',
                      };

                      return (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-700 font-medium whitespace-nowrap">
                            {new Date(booking.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td className="py-2.5 px-3 text-gray-800 font-medium">
                            {booking.firstName} {booking.lastName}
                            {booking.companyName && <span className="text-gray-400 text-xs block">{booking.companyName}</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <a href={`mailto:${booking.email}`} className="text-primary hover:underline text-xs">{booking.email}</a>
                            {booking.phone && <span className="text-gray-400 text-xs block">{booking.phone}</span>}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-xs">
                            {accomLabels[booking.accommodationType] || '-'}
                            {booking.numberOfUnits && <span className="block text-gray-400">{booking.numberOfUnits} unités</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                              {statusLabels[booking.status] || booking.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {booking.status === 'CONFIRMED' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDemoStatusUpdate(booking.id, 'COMPLETED')}
                                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
                                  title="Marquer comme terminée"
                                >
                                  ✅
                                </button>
                                <button
                                  onClick={() => handleDemoStatusUpdate(booking.id, 'NO_SHOW')}
                                  className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded text-xs hover:bg-yellow-100"
                                  title="Marquer comme absent"
                                >
                                  ❌
                                </button>
                                <button
                                  onClick={() => handleDemoStatusUpdate(booking.id, 'CANCELLED')}
                                  className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100"
                                  title="Annuler"
                                >
                                  🚫
                                </button>
                                <a
                                  href={booking.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100"
                                  title="Lien Meet"
                                >
                                  🎥
                                </a>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* FOOTER ADMIN */}
        {/* ═══════════════════════════════════════ */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-xs">
            My Guide Digital — Administration • Données actualisées en temps réel
          </p>
        </div>

      </div>
    </div>
  );
}
