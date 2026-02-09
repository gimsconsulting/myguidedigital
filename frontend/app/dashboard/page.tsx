'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { livretsApi, subscriptionsApi } from '@/lib/api';
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
  const { user, isAuthenticated } = useAuthStore();
  const [livrets, setLivrets] = useState<Livret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; livretId: string | null }>({
    isOpen: false,
    livretId: null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadLivrets();
  }, [isAuthenticated, router]);

  const loadLivrets = async () => {
    try {
      const response = await livretsApi.getAll();
      setLivrets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des livrets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLivret = () => {
    router.push('/dashboard/livrets/new');
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, livretId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.livretId) return;

    try {
      await livretsApi.delete(deleteConfirm.livretId);
      toast.success(t('dashboard.bookletDeleted', 'Livret supprimé avec succès'));
      loadLivrets();
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
        ? t('dashboard.bookletDeactivated', 'Livret désactivé avec succès')
        : t('dashboard.bookletActivated', 'Livret activé avec succès'));
      loadLivrets();
    } catch (err: any) {
      toast.error(t('dashboard.updateError', 'Erreur lors de la mise à jour'));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading', 'Chargement...')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.myBooklets', 'Mes Livrets')}</h1>
              <Link
                href="/profile"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('profile.title', 'Mon Profil')}
              </Link>
            </div>
            <p className="mt-2 text-gray-600 text-sm sm:text-base">
              {t('dashboard.myBookletsDescription', 'Gérez vos livrets d\'accueil digitaux')}
            </p>
          </div>
          <Button onClick={handleCreateLivret} variant="primary" className="w-full sm:w-auto">
            {t('dashboard.createBooklet', '+ Créer un livret')}
          </Button>
        </div>
      </div>

      {user?.subscription?.plan === 'TRIAL' && (
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-primary font-medium">
            {t('dashboard.trialMessage', 'Vous bénéficiez actuellement de la période d\'essai gratuite.')}
            {user.subscription.trialDaysLeft && (
              <span className="ml-2">
                {t('dashboard.trialDaysLeft', 'Nombre de jours restants :')} {user.subscription.trialDaysLeft}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Section Upgrade */}
      {user?.subscription?.plan && ['MONTHLY', 'YEARLY'].includes(user.subscription.plan) && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {t('dashboard.upgrade.title', 'Améliorez votre abonnement')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('dashboard.upgrade.description', 'Passez à un plan supérieur et économisez encore plus !')}
          </p>
          <div className="flex flex-wrap gap-3">
            {user.subscription.plan === 'MONTHLY' && (
              <>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      const response = await subscriptionsApi.upgrade({ targetPlanId: 'yearly' });
                      if (response.data.url) {
                        window.location.href = response.data.url;
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || t('dashboard.upgrade.error', 'Erreur lors de l\'upgrade'));
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                >
                  {t('dashboard.upgrade.toYearly', 'Passer à Annuel (99€/an)')}
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      const response = await subscriptionsApi.upgrade({ targetPlanId: 'lifetime' });
                      if (response.data.url) {
                        window.location.href = response.data.url;
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || t('dashboard.upgrade.error', 'Erreur lors de l\'upgrade'));
                    }
                  }}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  {t('dashboard.upgrade.toLifetime', 'Passer à À vie (199€)')}
                </Button>
              </>
            )}
            {user.subscription.plan === 'YEARLY' && (
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    const response = await subscriptionsApi.upgrade({ targetPlanId: 'lifetime' });
                    if (response.data.url) {
                      window.location.href = response.data.url;
                    }
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || t('dashboard.upgrade.error', 'Erreur lors de l\'upgrade'));
                  }
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {t('dashboard.upgrade.toLifetime', 'Passer à À vie (199€)')}
              </Button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {livrets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">{t('dashboard.noBooklets', 'Aucun livret créé pour le moment')}</p>
          <Button onClick={handleCreateLivret} variant="primary">
            {t('dashboard.createBooklet', '+ Créer un livret')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livrets.map((livret) => (
            <div key={livret.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{livret.name}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={livret.isActive}
                      onChange={() => handleToggleActive(livret)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {livret.address && (
                  <p className="text-sm text-gray-600 mb-4">{livret.address}</p>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{livret.modules?.length || 0} {t('modules.activeModules', 'modules actifs')}</span>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/dashboard/livrets/${livret.id}`}>
                    <Button variant="primary" size="sm" className="flex-1">
                      {t('common.edit', 'Modifier')}
                    </Button>
                  </Link>
                  <Link href={`/dashboard/livrets/${livret.id}/statistics`}>
                    <Button variant="outline" size="sm" title={t('livret.statistics', 'Statistiques')}>
                      📊
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(livret.id)}
                  >
                    {t('common.delete', 'Supprimer')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
