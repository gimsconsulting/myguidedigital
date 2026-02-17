'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { livretsApi, subscriptionsApi, invoicesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import DuplicateModal from '@/components/DuplicateModal';
import SeasonalPaymentModal from '@/components/SeasonalPaymentModal';
import CountryModal from '@/components/CountryModal';

interface Livret {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  qrCode?: string;
  createdAt: string;
  modules: any[];
  languages?: string[];
  type?: string; // TRIAL, ANNUAL, SEASONAL
  seasonalEndDate?: string;
}

interface SlotsInfo {
  plan: string;
  isTrial: boolean;
  hasPaidSubscription: boolean;
  total: { used: number; max: number };
  annual: { used: number; max: number; available: number };
  seasonal: { used: number };
  trial: { used: number };
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [livrets, setLivrets] = useState<Livret[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [slotsInfo, setSlotsInfo] = useState<SlotsInfo | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; livretId: string | null }>({
    isOpen: false,
    livretId: null,
  });
  const [duplicateModal, setDuplicateModal] = useState<{ isOpen: boolean; livretId: string; livretName: string }>({
    isOpen: false,
    livretId: '',
    livretName: '',
  });
  const [seasonalModal, setSeasonalModal] = useState<{ isOpen: boolean; livretId: string }>({
    isOpen: false,
    livretId: '',
  });
  const [countryModal, setCountryModal] = useState(false);
  const [pendingDuplicateLivretId, setPendingDuplicateLivretId] = useState<string | null>(null);

  // Actions dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Stats calculées
  const stats = useMemo(() => {
    const total = livrets.length;
    const active = livrets.filter(l => l.isActive).length;
    const inactive = total - active;
    const totalModules = livrets.reduce((sum, l) => sum + (l.modules?.length || 0), 0);
    return { total, active, inactive, totalModules };
  }, [livrets]);

  // Infos abonnement
  const subscriptionInfo = useMemo(() => {
    const sub = user?.subscription;
    if (!sub) return null;
    const plan = sub.plan || 'TRIAL';
    const daysLeft = sub.trialDaysLeft || 0;
    const status = sub.status || 'ACTIVE';
    return { plan, daysLeft, status };
  }, [user]);

  // Filtrage + tri
  const filteredLivrets = useMemo(() => {
    let result = livrets;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q) ||
        l.qrCode?.toLowerCase().includes(q)
      );
    }
    // Tri
    result = [...result].sort((a, b) => {
      let valA: any, valB: any;
      if (sortField === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
      else if (sortField === 'modules') { valA = a.modules?.length || 0; valB = b.modules?.length || 0; }
      else if (sortField === 'languages') {
        valA = (Array.isArray(a.languages) ? a.languages.length : 0);
        valB = (Array.isArray(b.languages) ? b.languages.length : 0);
      }
      else if (sortField === 'type') { valA = a.type || 'TRIAL'; valB = b.type || 'TRIAL'; }
      else { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [livrets, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredLivrets.length / itemsPerPage);
  const paginatedLivrets = filteredLivrets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const hasAuthData = parsed.state?.isAuthenticated && parsed.state?.token && parsed.state?.user;
          if (hasAuthData) { loadData(); return; }
        } catch (e) { /* */ }
      }
    }
    const storeState = useAuthStore.getState();
    if (!storeState.hasHydrated) {
      const checkInterval = setInterval(() => {
        const currentState = useAuthStore.getState();
        if (currentState.hasHydrated) {
          clearInterval(checkInterval);
          if (currentState.isAuthenticated || (currentState.token && currentState.user)) {
            loadData();
          } else {
            router.push('/login');
          }
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 3000);
      return;
    }
    if (storeState.isAuthenticated || (storeState.token && storeState.user)) {
      loadData();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [livretsRes, invoicesRes, slotsRes] = await Promise.allSettled([
        livretsApi.getAll(),
        invoicesApi.getAll(),
        livretsApi.getSlots(),
      ]);
      if (livretsRes.status === 'fulfilled') setLivrets(livretsRes.value.data);
      if (invoicesRes.status === 'fulfilled') setInvoiceCount(invoicesRes.value.data?.length || 0);
      if (slotsRes.status === 'fulfilled') setSlotsInfo(slotsRes.value.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLivret = () => router.push('/dashboard/livrets/new');

  const handleDelete = (id: string) => {
    setOpenDropdown(null);
    setDeleteConfirm({ isOpen: true, livretId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.livretId) return;
    try {
      await livretsApi.delete(deleteConfirm.livretId);
      toast.success('Livret supprimé avec succès');
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression du livret');
    } finally {
      setDeleteConfirm({ isOpen: false, livretId: null });
    }
  };

  const handleDuplicate = (livret: Livret) => {
    setOpenDropdown(null);
    // Vérifier si le pays est renseigné
    if (!user?.country) {
      setPendingDuplicateLivretId(livret.id);
      setCountryModal(true);
      return;
    }
    setDuplicateModal({ isOpen: true, livretId: livret.id, livretName: livret.name });
  };

  const handleCountrySet = () => {
    if (pendingDuplicateLivretId) {
      const livret = livrets.find(l => l.id === pendingDuplicateLivretId);
      if (livret) {
        setDuplicateModal({ isOpen: true, livretId: livret.id, livretName: livret.name });
      }
      setPendingDuplicateLivretId(null);
    }
  };

  const handleCopyLink = (livret: Livret) => {
    setOpenDropdown(null);
    if (livret.qrCode) {
      navigator.clipboard.writeText(livret.qrCode);
      toast.success('Lien copié dans le presse-papier !');
    }
  };

  const handleShare = (livret: Livret) => {
    setOpenDropdown(null);
    if (navigator.share && livret.qrCode) {
      navigator.share({ title: livret.name, url: livret.qrCode });
    } else if (livret.qrCode) {
      navigator.clipboard.writeText(livret.qrCode);
      toast.success('Lien copié !');
    }
  };

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Plan helpers
  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      TRIAL: 'Essai gratuit', HOTES_ANNUEL: 'Hôtes — Annuel', HOTES_SAISON_1: 'Hôtes — 1 Mois',
      HOTES_SAISON_2: 'Hôtes — 2 Mois', HOTES_SAISON_3: 'Hôtes — 3 Mois', HOTEL_ANNUEL: 'Hôtel — Annuel',
      CAMPING_ANNUEL: 'Camping — Annuel', MONTHLY: 'Mensuel', YEARLY: 'Annuel',
    };
    return labels[plan] || plan;
  };

  const getPlanColor = (plan: string) => {
    if (plan === 'TRIAL') return 'from-amber-400 to-orange-500';
    if (plan.startsWith('HOTES')) return 'from-primary to-pink-500';
    if (plan.startsWith('HOTEL')) return 'from-violet-500 to-purple-600';
    if (plan.startsWith('CAMPING')) return 'from-emerald-500 to-teal-600';
    return 'from-primary to-pink-500';
  };

  const getPlanEmoji = (plan: string) => {
    if (plan === 'TRIAL') return '⏱️';
    if (plan.startsWith('HOTES')) return '🏡';
    if (plan.startsWith('HOTEL')) return '🏨';
    if (plan.startsWith('CAMPING')) return '⛺';
    return '✨';
  };

  // Type badge component
  const TypeBadge = ({ type }: { type?: string }) => {
    const t = type || 'TRIAL';
    if (t === 'ANNUAL') return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
        Annuel
      </span>
    );
    if (t === 'SEASONAL') return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
        Saisonnier
      </span>
    );
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
        Essai
      </span>
    );
  };

  // Langue flags (supporte minuscules et majuscules)
  const languageFlags: Record<string, string> = {
    fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪', it: '🇮🇹', es: '🇪🇸', pt: '🇵🇹', zh: '🇨🇳', ru: '🇷🇺', nl: '🇳🇱',
    FR: '🇫🇷', EN: '🇬🇧', GB: '🇬🇧', DE: '🇩🇪', IT: '🇮🇹', ES: '🇪🇸', PT: '🇵🇹', ZH: '🇨🇳', CN: '🇨🇳', RU: '🇷🇺', NL: '🇳🇱',
  };
  const getFlag = (lang: string) => languageFlags[lang] || languageFlags[lang.toLowerCase()] || lang;

  // Sort icon
  const SortIcon = ({ field }: { field: string }) => (
    <span className="inline-flex flex-col ml-1 cursor-pointer opacity-60 hover:opacity-100">
      <svg className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-primary' : 'text-gray-300'}`} viewBox="0 0 10 5"><path d="M0 5l5-5 5 5z" fill="currentColor" /></svg>
      <svg className={`w-3 h-3 ${sortField === field && sortDirection === 'desc' ? 'text-primary' : 'text-gray-300'}`} viewBox="0 0 10 5"><path d="M0 0l5 5 5-5z" fill="currentColor" /></svg>
    </span>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-500 font-medium">{t('common.loading', 'Chargement...')}</p>
          </div>
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════ */}
        {/* HEADER PREMIUM SOMBRE */}
        {/* ══════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-white/60 text-xs font-medium">Tableau de bord</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {greeting()}, <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">{user?.firstName || 'Utilisateur'}</span> 👋
                </h1>
                <p className="text-white/40 mt-2 text-sm">Bienvenue sur votre espace My Guide Digital</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateLivret}
                  className="relative group px-6 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Créer un livret
                  </span>
                </button>
                <Link href="/profile" className="px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 text-sm font-medium border border-white/10 hover:border-white/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profil
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* BANDEAU ABONNEMENT */}
        {/* ══════════════════════════════════════ */}
        {subscriptionInfo && (
          <div className="mb-8 relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${getPlanColor(subscriptionInfo.plan)} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${getPlanColor(subscriptionInfo.plan)}`}></div>
              <div className="p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(subscriptionInfo.plan)} flex items-center justify-center text-white text-xl shadow-lg`}>
                      {getPlanEmoji(subscriptionInfo.plan)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{getPlanLabel(subscriptionInfo.plan)}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${subscriptionInfo.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : subscriptionInfo.status === 'EXPIRED' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${subscriptionInfo.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : subscriptionInfo.status === 'EXPIRED' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                          {subscriptionInfo.status === 'ACTIVE' ? 'Actif' : subscriptionInfo.status === 'EXPIRED' ? 'Expiré' : subscriptionInfo.status}
                        </span>
                      </div>
                      {subscriptionInfo.plan === 'TRIAL' && subscriptionInfo.daysLeft > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                          <span>{subscriptionInfo.daysLeft} jour{subscriptionInfo.daysLeft > 1 ? 's' : ''} restant{subscriptionInfo.daysLeft > 1 ? 's' : ''}</span>
                          <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${(subscriptionInfo.daysLeft / 14) * 100}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href="/subscription">
                    <button className="relative group/btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500"></div>
                      <span className="relative">{subscriptionInfo.plan === 'TRIAL' ? 'Choisir un abonnement →' : 'Gérer mon abonnement →'}</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* VOS LIVRETS — Compteurs en haut */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></span>
            Vos livrets
          </h2>

          {/* Compteurs */}
          <div className="flex flex-wrap gap-3 mb-5">
            {/* Total */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-2xl font-bold text-gray-900">{slotsInfo?.total.used ?? stats.total}</span>
              <span className="text-gray-400 text-lg font-light">/</span>
              <span className="text-lg text-gray-400">{slotsInfo?.total.max ?? stats.total}</span>
              <span className="text-gray-500 text-sm font-medium ml-1">Livret(s)</span>
            </div>
            {/* Annuel */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border-2 border-violet-200 shadow-sm">
              <span className="text-2xl font-bold text-violet-600">{slotsInfo?.annual.used ?? 0}</span>
              <span className="text-violet-300 text-lg font-light">/</span>
              <span className="text-lg text-violet-400">{slotsInfo?.annual.max ?? 0}</span>
              <span className="text-violet-600 text-sm font-medium ml-1">Annuel(s)</span>
            </div>
            {/* Saisonnier */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border-2 border-amber-200 shadow-sm">
              <span className="text-2xl font-bold text-amber-600">{slotsInfo?.seasonal.used ?? 0}</span>
              <span className="text-amber-300 text-lg font-light">/</span>
              <span className="text-lg text-amber-400">{slotsInfo?.seasonal.used ?? 0}</span>
              <span className="text-amber-600 text-sm font-medium ml-1">Saisonnier(s)</span>
            </div>
          </div>

          {/* Barre de recherche + actions groupées */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Rechercher un livret"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Bouton créer */}
            <button
              onClick={handleCreateLivret}
              className="relative group px-4 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500"></div>
              <span className="relative flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nouveau livret
              </span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* TABLEAU DES LIVRETS */}
        {/* ══════════════════════════════════════ */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {livrets.length === 0 ? (
          /* État vide */
          <div className="relative group overflow-hidden rounded-2xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white shadow-sm border border-gray-100 rounded-2xl">
              <div className="text-center py-16 px-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-50 flex items-center justify-center shadow-lg shadow-primary/10">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Créez votre premier livret !</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Commencez à offrir une expérience unique à vos voyageurs avec un livret d&apos;accueil digital personnalisé.
                </p>
                <button
                  onClick={handleCreateLivret}
                  className="relative group/btn px-8 py-3 rounded-xl font-semibold text-base text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Créer mon premier livret
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* ── Desktop Table ── */}
            <div className="hidden lg:block overflow-x-auto" ref={dropdownRef}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4">
                      <button onClick={() => handleToggleSort('name')} className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition">
                        <SortIcon field="name" /> Nom du livret
                      </button>
                    </th>
                    <th className="text-left px-4 py-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Référence</span>
                    </th>
                    <th className="text-center px-4 py-4">
                      <button onClick={() => handleToggleSort('modules')} className="flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition mx-auto">
                        <SortIcon field="modules" /> Nb. Modules
                      </button>
                    </th>
                    <th className="text-center px-4 py-4">
                      <button onClick={() => handleToggleSort('languages')} className="flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition mx-auto">
                        <SortIcon field="languages" /> Langues
                      </button>
                    </th>
                    <th className="text-center px-4 py-4">
                      <button onClick={() => handleToggleSort('type')} className="flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition mx-auto">
                        <SortIcon field="type" /> Type
                      </button>
                    </th>
                    <th className="text-right px-6 py-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLivrets.map((livret) => {
                    const isTrial = (livret.type || 'TRIAL') === 'TRIAL';
                    const langs = Array.isArray(livret.languages) ? livret.languages : ['fr'];
                    const refId = livret.qrCode?.split('/').pop()?.substring(0, 16) || livret.id.substring(0, 8);
                    return (
                      <tr key={livret.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition group/row">
                        {/* Nom + adresse + image */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-pink-50 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-gray-100 overflow-hidden">
                              {livret.modules?.find((m: any) => m.type === 'welcome')?.content ? (
                                <span className="text-lg">🏠</span>
                              ) : (
                                <span className="text-lg">📖</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/dashboard/livrets/${livret.id}`} className="font-bold text-gray-900 hover:text-primary transition truncate block">
                                {livret.name}
                              </Link>
                              {livret.address && (
                                <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                                  <span>📍</span> {livret.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Référence */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-500 font-mono">{refId}</span>
                        </td>
                        {/* Modules */}
                        <td className="px-4 py-4 text-center">
                          <span className="text-2xl font-bold text-gray-900">{livret.modules?.length || 0}</span>
                        </td>
                        {/* Langues */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-0.5">
                            {langs.map(lang => (
                              <span key={lang} className="text-lg" title={lang}>{getFlag(lang)}</span>
                            ))}
                          </div>
                        </td>
                        {/* Type badge */}
                        <td className="px-4 py-4 text-center">
                          <TypeBadge type={livret.type} />
                          {isTrial && (
                            <Link href="/subscription" className="block text-xs text-primary hover:text-pink-500 mt-1 font-medium transition">
                              Passer premium
                            </Link>
                          )}
                        </td>
                        {/* Actions — ligne horizontale d'icônes */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* Modifier */}
                            <Link href={`/dashboard/livrets/${livret.id}`} title="Modifier" className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Link>
                            {/* Paramètres */}
                            <Link href={`/dashboard/livrets/${livret.id}`} title="Paramètres" className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </Link>
                            {/* Dupliquer (pas pour Essai) */}
                            {!isTrial && (
                              <button onClick={() => handleDuplicate(livret)} title="Dupliquer" className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                              </button>
                            )}
                            {/* Consulter */}
                            {livret.qrCode && (
                              <a href={livret.qrCode} target="_blank" rel="noopener noreferrer" title="Consulter" className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </a>
                            )}
                            {/* Copier le lien */}
                            <button onClick={() => handleCopyLink(livret)} title="Copier le lien" className="p-2 rounded-lg text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            </button>
                            {/* Partager */}
                            <button onClick={() => handleShare(livret)} title="Partager" className="p-2 rounded-lg text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                            {/* Supprimer */}
                            <button onClick={() => handleDelete(livret.id)} title="Supprimer" className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="lg:hidden divide-y divide-gray-50">
              {paginatedLivrets.map((livret) => {
                const isTrial = (livret.type || 'TRIAL') === 'TRIAL';
                const langs = Array.isArray(livret.languages) ? livret.languages : ['fr'];
                return (
                  <div key={livret.id} className="p-5">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-pink-50 flex items-center justify-center text-xl flex-shrink-0 border-2 border-gray-100">
                        📖
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/dashboard/livrets/${livret.id}`} className="font-bold text-gray-900 hover:text-primary transition">
                          {livret.name}
                        </Link>
                        {livret.address && <p className="text-xs text-gray-400 truncate mt-0.5">📍 {livret.address}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <TypeBadge type={livret.type} />
                          <span className="text-sm text-gray-500">{livret.modules?.length || 0} modules</span>
                        </div>
                        {isTrial && (
                          <Link href="/subscription" className="text-xs text-primary hover:text-pink-500 font-medium mt-1 inline-block">Passer premium</Link>
                        )}
                      </div>
                    </div>
                    {/* Langues */}
                    <div className="flex items-center gap-1 mb-3">
                      {langs.map(lang => <span key={lang} className="text-lg">{getFlag(lang)}</span>)}
                    </div>
                    {/* Actions mobile */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/dashboard/livrets/${livret.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary">Modifier</Link>
                      {!isTrial && (
                        <button onClick={() => handleDuplicate(livret)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600">Dupliquer</button>
                      )}
                      <button onClick={() => handleCopyLink(livret)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-600">Copier le lien</button>
                      <button onClick={() => handleShare(livret)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-50 text-pink-600">Partager</button>
                      <button onClick={() => handleDelete(livret.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600">Supprimer</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-3">
              <div className="flex items-center gap-2">
                {[10, 20, 50].map(n => (
                  <button
                    key={n}
                    onClick={() => { setItemsPerPage(n); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${itemsPerPage === n ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {n}
                  </button>
                ))}
                <span className="text-xs text-gray-400 ml-2">Éléments par page</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{currentPage} sur {totalPages || 1}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* ACTIONS RAPIDES */}
        {/* ══════════════════════════════════════ */}
        <div className="mt-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: handleCreateLivret, emoji: '✏️', gradient: 'from-primary to-purple-600', title: 'Créer un livret', desc: 'Nouveau livret d\'accueil', hoverBorder: 'hover:border-primary/30' },
              { href: '/subscription', emoji: '💎', gradient: 'from-pink-500 to-rose-500', title: 'Abonnement', desc: 'Gérer ou upgrader', hoverBorder: 'hover:border-pink-300' },
              { href: '/invoices', emoji: '🧾', gradient: 'from-violet-500 to-indigo-600', title: 'Factures', desc: 'Historique et PDF', hoverBorder: 'hover:border-violet-300' },
              { href: '/profile', emoji: '⚙️', gradient: 'from-emerald-500 to-teal-600', title: 'Mon profil', desc: 'Infos et paramètres', hoverBorder: 'hover:border-emerald-300' },
            ].map((item, idx) => {
              const content = (
                <div className={`group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md ${item.hoverBorder} transition-all duration-300 text-left h-full`}>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-lg mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>{item.emoji}</div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              );
              if (item.href) return <Link key={idx} href={item.href}>{content}</Link>;
              return <button key={idx} onClick={item.action} className="text-left">{content}</button>;
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* FOOTER AIDE */}
        {/* ══════════════════════════════════════ */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-500"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400 text-sm">
              Besoin d&apos;aide ou d&apos;une démonstration personnalisée ?{' '}
              <Link href="/contact" className="text-primary hover:text-pink-500 font-semibold transition-colors">
                Contactez-nous →
              </Link>
            </p>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════ */}
      {/* MODALS */}
      {/* ══════════════════════════════════════ */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Supprimer le livret"
        message="Êtes-vous sûr de vouloir supprimer ce livret ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, livretId: null })}
      />

      <DuplicateModal
        isOpen={duplicateModal.isOpen}
        livretId={duplicateModal.livretId}
        livretName={duplicateModal.livretName}
        slotsInfo={slotsInfo}
        onClose={() => setDuplicateModal({ isOpen: false, livretId: '', livretName: '' })}
        onDuplicated={loadData}
        onSeasonalPayment={() => {
          setSeasonalModal({ isOpen: true, livretId: duplicateModal.livretId });
        }}
      />

      <SeasonalPaymentModal
        isOpen={seasonalModal.isOpen}
        livretId={seasonalModal.livretId}
        onClose={() => setSeasonalModal({ isOpen: false, livretId: '' })}
      />

      <CountryModal
        isOpen={countryModal}
        onClose={() => { setCountryModal(false); setPendingDuplicateLivretId(null); }}
        onCountrySet={handleCountrySet}
      />
    </div>
  );
}
