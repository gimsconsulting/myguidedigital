'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { livretsApi, subscriptionsApi, invoicesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Livret {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  qrCode?: string;
  createdAt: string;
  modules: any[];
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [livrets, setLivrets] = useState<Livret[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; livretId: string | null }>({
    isOpen: false,
    livretId: null,
  });

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const hasAuthData = parsed.state?.isAuthenticated && 
                             parsed.state?.token && 
                             parsed.state?.user;
          if (hasAuthData) {
            loadData();
            return;
          }
        } catch (e) {
          console.error('Error parsing auth-storage', e);
        }
      }
    }
    
    const storeState = useAuthStore.getState();
    if (!storeState.hasHydrated) {
      const checkInterval = setInterval(() => {
        const currentState = useAuthStore.getState();
        if (currentState.hasHydrated) {
          clearInterval(checkInterval);
          const finalState = useAuthStore.getState();
          if (finalState.isAuthenticated || (finalState.token && finalState.user)) {
            loadData();
          } else {
            router.push('/login');
          }
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 3000);
      return;
    }

    const finalIsAuthenticated = storeState.isAuthenticated || 
                                 (storeState.token && storeState.user);
    if (finalIsAuthenticated) {
      loadData();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      const [livretsRes, invoicesRes] = await Promise.allSettled([
        livretsApi.getAll(),
        invoicesApi.getAll(),
      ]);
      if (livretsRes.status === 'fulfilled') setLivrets(livretsRes.value.data);
      if (invoicesRes.status === 'fulfilled') setInvoiceCount(invoicesRes.value.data?.length || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLivret = () => router.push('/dashboard/livrets/new');

  const handleDelete = (id: string) => setDeleteConfirm({ isOpen: true, livretId: id });

  const confirmDelete = async () => {
    if (!deleteConfirm.livretId) return;
    try {
      await livretsApi.delete(deleteConfirm.livretId);
      toast.success(t('dashboard.bookletDeleted', 'Livret supprimé avec succès'));
      loadData();
    } catch (err: any) {
      toast.error(t('dashboard.deleteError', 'Erreur lors de la suppression du livret'));
    } finally {
      setDeleteConfirm({ isOpen: false, livretId: null });
    }
  };

  const handleToggleActive = async (livret: Livret) => {
    try {
      await livretsApi.update(livret.id, { isActive: !livret.isActive });
      toast.success(livret.isActive 
        ? t('dashboard.bookletDeactivated', 'Livret désactivé')
        : t('dashboard.bookletActivated', 'Livret activé'));
      loadData();
    } catch (err: any) {
      toast.error(t('dashboard.updateError', 'Erreur lors de la mise à jour'));
    }
  };

  // Plan label
  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      TRIAL: 'Essai gratuit',
      HOTES_ANNUEL: 'Hôtes — Annuel',
      HOTES_SAISON_1: 'Hôtes — 1 Mois',
      HOTES_SAISON_2: 'Hôtes — 2 Mois',
      HOTES_SAISON_3: 'Hôtes — 3 Mois',
      HOTEL_ANNUEL: 'Hôtel — Annuel',
      CAMPING_ANNUEL: 'Camping — Annuel',
      MONTHLY: 'Mensuel',
      YEARLY: 'Annuel',
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 animate-pulse"></div>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl"></div>

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
                <p className="text-white/40 mt-2 text-sm md:text-base">
                  Bienvenue sur votre espace My Guide Digital
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleCreateLivret}
                  className="relative group px-6 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('dashboard.createBooklet', 'Créer un livret')}
                  </span>
                </button>
                <Link
                  href="/profile"
                  className="px-4 py-2.5 bg-white/5 backdrop-blur-sm text-white rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2 text-sm font-medium border border-white/10 hover:border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t('profile.title', 'Profil')}
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
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          subscriptionInfo.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          subscriptionInfo.status === 'EXPIRED' ? 'bg-red-50 text-red-600 border border-red-200' :
                          'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            subscriptionInfo.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                            subscriptionInfo.status === 'EXPIRED' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></span>
                          {subscriptionInfo.status === 'ACTIVE' ? 'Actif' : subscriptionInfo.status === 'EXPIRED' ? 'Expiré' : subscriptionInfo.status}
                        </span>
                      </div>
                      {subscriptionInfo.plan === 'TRIAL' && subscriptionInfo.daysLeft > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{subscriptionInfo.daysLeft} jour{subscriptionInfo.daysLeft > 1 ? 's' : ''} restant{subscriptionInfo.daysLeft > 1 ? 's' : ''}</span>
                          </div>
                          <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${(subscriptionInfo.daysLeft / 14) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href="/subscription">
                    <button className="relative group/btn px-5 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 blur-lg opacity-0 group-hover/btn:opacity-50 transition-opacity"></div>
                      <span className="relative">
                        {subscriptionInfo.plan === 'TRIAL' ? 'Choisir un abonnement →' : 'Gérer mon abonnement →'}
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* STATISTIQUES RAPIDES */}
        {/* ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              emoji: '📚',
              label: 'Total',
              sublabel: 'Livrets créés',
              value: stats.total,
              gradient: 'from-primary to-purple-600',
              bgLight: 'from-primary/5 to-purple-50',
              labelColor: 'text-primary',
            },
            {
              emoji: '✅',
              label: 'Actifs',
              sublabel: 'Livrets en ligne',
              value: stats.active,
              gradient: 'from-emerald-400 to-teal-500',
              bgLight: 'from-emerald-50 to-teal-50',
              labelColor: 'text-emerald-600',
              showBar: true,
            },
            {
              emoji: '🧩',
              label: 'Modules',
              sublabel: 'Modules configurés',
              value: stats.totalModules,
              gradient: 'from-pink-500 to-rose-500',
              bgLight: 'from-pink-50 to-rose-50',
              labelColor: 'text-pink-600',
            },
            {
              emoji: '🧾',
              label: 'Factures',
              sublabel: '',
              value: invoiceCount,
              gradient: 'from-violet-500 to-indigo-500',
              bgLight: 'from-violet-50 to-indigo-50',
              labelColor: 'text-violet-600',
              link: '/invoices',
            },
          ].map((card, idx) => (
            <div key={idx} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`}></div>
              <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bgLight} flex items-center justify-center`}>
                    <span className="text-lg">{card.emoji}</span>
                  </div>
                  <span className={`text-xs font-semibold ${card.labelColor} uppercase tracking-wider`}>{card.label}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                {card.link ? (
                  <p className="text-sm mt-1">
                    <Link href={card.link} className="text-primary hover:text-pink-500 transition-colors font-medium">Voir mes factures →</Link>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">{card.sublabel}</p>
                )}
                {card.showBar && stats.total > 0 && (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-700`} style={{ width: `${(stats.active / stats.total) * 100}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════ */}
        {/* ACTIONS RAPIDES */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                action: handleCreateLivret,
                emoji: '✏️',
                gradient: 'from-primary to-purple-600',
                title: 'Créer un livret',
                desc: 'Nouveau livret d\'accueil',
                hoverBorder: 'hover:border-primary/30',
              },
              {
                href: '/subscription',
                emoji: '💎',
                gradient: 'from-pink-500 to-rose-500',
                title: 'Abonnement',
                desc: 'Gérer ou upgrader',
                hoverBorder: 'hover:border-pink-300',
              },
              {
                href: '/invoices',
                emoji: '🧾',
                gradient: 'from-violet-500 to-indigo-600',
                title: 'Factures',
                desc: 'Historique et PDF',
                hoverBorder: 'hover:border-violet-300',
              },
              {
                href: '/profile',
                emoji: '⚙️',
                gradient: 'from-emerald-500 to-teal-600',
                title: 'Mon profil',
                desc: 'Infos et paramètres',
                hoverBorder: 'hover:border-emerald-300',
              },
            ].map((item, idx) => {
              const content = (
                <div className={`group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md ${item.hoverBorder} transition-all duration-300 text-left h-full`}>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-lg mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {item.emoji}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              );
              if (item.href) {
                return <Link key={idx} href={item.href}>{content}</Link>;
              }
              return <button key={idx} onClick={item.action} className="text-left">{content}</button>;
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* GRAPHIQUE D'ACTIVITÉ */}
        {/* ══════════════════════════════════════ */}
        {stats.total > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full"></span>
              Vue d&apos;ensemble
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Répartition Actif/Inactif */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Statut des livrets</h3>
                  <div className="flex items-center gap-6">
                    {/* Donut chart SVG */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                        <circle 
                          cx="60" cy="60" r="50" fill="none" 
                          stroke="url(#gradient-active-dash)" 
                          strokeWidth="10" 
                          strokeDasharray={`${(stats.active / Math.max(stats.total, 1)) * 314} 314`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient-active-dash" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                          <span className="text-sm text-gray-600">Actifs</span>
                        </div>
                        <span className="font-bold text-gray-900">{stats.active}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                          <span className="text-sm text-gray-600">Inactifs</span>
                        </div>
                        <span className="font-bold text-gray-900">{stats.inactive}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barres de progression — Modules par livret */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Modules par livret</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {livrets.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Aucun livret</p>
                    ) : (
                      livrets.slice(0, 6).map((livret) => {
                        const moduleCount = livret.modules?.length || 0;
                        const maxModules = Math.max(...livrets.map(l => l.modules?.length || 0), 1);
                        return (
                          <div key={livret.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 font-medium truncate max-w-[70%]">{livret.name}</span>
                              <span className="text-gray-400">{moduleCount} modules</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-primary to-pink-500 transition-all duration-700"
                                style={{ width: `${(moduleCount / maxModules) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* LISTE DES LIVRETS */}
        {/* ══════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full"></span>
              {t('dashboard.myBooklets', 'Mes livrets')}
              {stats.total > 0 && (
                <span className="ml-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">{stats.total}</span>
              )}
            </h2>
            {stats.total > 0 && (
              <button onClick={handleCreateLivret} className="relative group px-4 py-2 rounded-lg font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500"></div>
                <span className="relative">+ Nouveau livret</span>
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {livrets.length === 0 ? (
            <div className="relative group overflow-hidden rounded-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white shadow-sm border border-gray-100 rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-pink-500/3"></div>
                <div className="relative text-center py-16 px-8">
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
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-40 group-hover/btn:opacity-70 transition-opacity"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Créer mon premier livret
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {livrets.map((livret) => (
                <div key={livret.id} className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${livret.isActive ? 'from-emerald-400 to-teal-500' : 'from-gray-300 to-gray-400'} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`}></div>
                  <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300">
                    {/* Bande de couleur en haut */}
                    <div className={`h-1 ${livret.isActive ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'}`}></div>
                    
                    <div className="p-6">
                      {/* En-tête avec nom + toggle */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{livret.name}</h3>
                          {livret.address && (
                            <p className="text-sm text-gray-400 truncate mt-0.5">{livret.address}</p>
                          )}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={livret.isActive}
                            onChange={() => handleToggleActive(livret)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-400 peer-checked:to-teal-500"></div>
                        </label>
                      </div>

                      {/* Infos */}
                      <div className="flex items-center gap-4 mb-5 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {livret.modules?.length || 0} modules
                        </div>
                        <div className={`flex items-center gap-1.5 ${livret.isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${livret.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`}></div>
                          {livret.isActive ? 'En ligne' : 'Hors ligne'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(livret.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Boutons */}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/livrets/${livret.id}`} className="flex-1">
                          <button className="w-full relative group/edit px-3 py-2 rounded-lg font-medium text-sm text-white overflow-hidden transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600"></div>
                            <span className="relative">✏️ Modifier</span>
                          </button>
                        </Link>
                        <Link href={`/dashboard/livrets/${livret.id}/statistics`}>
                          <button className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-gray-600 transition-all duration-300" title="Statistiques">
                            📊
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(livret.id)}
                          className="px-3 py-2 rounded-lg text-sm border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={t('dashboard.deleteConfirmTitle', 'Supprimer le livret')}
        message={t('dashboard.deleteConfirm', 'Êtes-vous sûr de vouloir supprimer ce livret ? Cette action est irréversible.')}
        confirmText={t('common.delete', 'Supprimer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, livretId: null })}
      />
    </div>
  );
}
