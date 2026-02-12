'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adminApi, getCsrfToken } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: string;
  role?: string;
  createdAt: string;
  subscription?: any;
  livretsCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string | null; userEmail: string }>({
    isOpen: false,
    userId: null,
    userEmail: ''
  });
  const [roleConfirm, setRoleConfirm] = useState<{ isOpen: boolean; userId: string | null; userEmail: string; newRole: 'USER' | 'ADMIN' | null }>({
    isOpen: false,
    userId: null,
    userEmail: '',
    newRole: null
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadUsers();
  }, [isAuthenticated, user, router, page, search, planFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (planFilter) params.plan = planFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await adminApi.getUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPlanName = (plan: string) => {
    return t(`admin.users.plans.${plan.toLowerCase()}`) || plan;
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteClick = (userId: string, userEmail: string) => {
    setDeleteConfirm({ isOpen: true, userId, userEmail });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.userId) return;

    try {
      // Récupérer le token CSRF avant de supprimer
      await getCsrfToken();
      
      await adminApi.deleteUser(deleteConfirm.userId);
      toast.success(t('admin.users.deleteSuccess', 'Utilisateur supprimé avec succès'));
      loadUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('admin.users.deleteError', 'Erreur lors de la suppression');
      toast.error(errorMessage);
    } finally {
      setDeleteConfirm({ isOpen: false, userId: null, userEmail: '' });
    }
  };

  const handleRoleChange = (userId: string, userEmail: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setRoleConfirm({ isOpen: true, userId, userEmail, newRole });
  };

  const confirmRoleChange = async () => {
    if (!roleConfirm.userId || !roleConfirm.newRole) return;

    try {
      await adminApi.updateUserRole(roleConfirm.userId, roleConfirm.newRole);
      toast.success(
        roleConfirm.newRole === 'ADMIN' 
          ? t('admin.users.promoteSuccess', 'Utilisateur promu administrateur avec succès')
          : t('admin.users.demoteSuccess', 'Utilisateur rétrogradé avec succès')
      );
      loadUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('admin.users.roleChangeError', 'Erreur lors de la modification du rôle');
      toast.error(errorMessage);
    } finally {
      setRoleConfirm({ isOpen: false, userId: null, userEmail: '', newRole: null });
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">← {t('admin.users.backToDashboard')}</Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.title')}</h1>
        <p className="text-gray-600 mt-2">{t('admin.users.subtitle')}</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t('admin.users.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-2"
          />
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">{t('admin.users.allPlans')}</option>
            <option value="TRIAL">{t('admin.users.plans.trial')}</option>
            <option value="MONTHLY">{t('admin.users.plans.monthly')}</option>
            <option value="YEARLY">{t('admin.users.plans.yearly')}</option>
            <option value="LIFETIME">{t('admin.users.plans.lifetime')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-4 py-2"
          >
            <option value="">{t('admin.users.allStatuses')}</option>
            <option value="ACTIVE">{t('admin.users.statuses.active')}</option>
            <option value="EXPIRED">{t('admin.users.statuses.expired')}</option>
            <option value="CANCELLED">{t('admin.users.statuses.cancelled')}</option>
          </select>
          <Link href="/admin/dashboard" className="bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-md px-4 py-2 text-center hover:from-purple-600 hover:to-violet-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
            {t('admin.users.back')}
          </Link>
        </div>
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="text-center py-8">{t('common.loading')}</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.user')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.plan')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.livrets')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.registration')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.users.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : t('admin.users.na')}
                      </div>
                      {u.role === 'ADMIN' && (
                        <span className="text-xs text-primary font-semibold">{t('admin.users.admin')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {u.subscription ? getPlanName(u.subscription.plan) : t('admin.users.na')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.subscription ? (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(u.subscription.status)}`}>
                          {t(`admin.users.statuses.${u.subscription.status.toLowerCase()}`)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">{t('admin.users.na')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {u.livretsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRoleChange(u.id, u.email, u.role || 'USER')}
                          className={`${
                            u.role === 'ADMIN' 
                              ? 'text-orange-600 hover:text-orange-800' 
                              : 'text-blue-600 hover:text-blue-800'
                          } hover:underline flex items-center gap-1`}
                          title={u.role === 'ADMIN' ? t('admin.users.demote', 'Rétrograder') : t('admin.users.promote', 'Promouvoir admin')}
                        >
                          {u.role === 'ADMIN' ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              {t('admin.users.demote', 'Rétrograder')}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              {t('admin.users.promote', 'Promouvoir admin')}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(u.id, u.email)}
                          className="text-red-600 hover:text-red-800 hover:underline flex items-center gap-1"
                          title={t('admin.users.delete', 'Supprimer')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t('admin.users.delete', 'Supprimer')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('admin.users.pageInfo', { page, totalPages })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, userId: null, userEmail: '' })}
        onConfirm={confirmDelete}
        title={t('admin.users.deleteConfirmTitle', 'Supprimer l\'utilisateur')}
        message={t('admin.users.deleteConfirmMessage', 'Êtes-vous sûr de vouloir supprimer l\'utilisateur {{email}} ? Cette action est irréversible.', { email: deleteConfirm.userEmail })}
        confirmText={t('admin.users.delete', 'Supprimer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="danger"
      />

      {/* Dialog de confirmation de changement de rôle */}
      <ConfirmDialog
        isOpen={roleConfirm.isOpen}
        onCancel={() => setRoleConfirm({ isOpen: false, userId: null, userEmail: '', newRole: null })}
        onConfirm={confirmRoleChange}
        title={
          roleConfirm.newRole === 'ADMIN' 
            ? t('admin.users.promoteConfirmTitle', 'Promouvoir en administrateur')
            : t('admin.users.demoteConfirmTitle', 'Rétrograder l\'utilisateur')
        }
        message={
          roleConfirm.newRole === 'ADMIN'
            ? t('admin.users.promoteConfirmMessage', 'Êtes-vous sûr de vouloir promouvoir {{email}} en administrateur ? Il aura accès au dashboard admin.', { email: roleConfirm.userEmail })
            : t('admin.users.demoteConfirmMessage', 'Êtes-vous sûr de vouloir rétrograder {{email}} ? Il perdra l\'accès au dashboard admin.', { email: roleConfirm.userEmail })
        }
        confirmText={roleConfirm.newRole === 'ADMIN' ? t('admin.users.promote', 'Promouvoir') : t('admin.users.demote', 'Rétrograder')}
        cancelText={t('common.cancel', 'Annuler')}
        variant={roleConfirm.newRole === 'ADMIN' ? 'info' : 'warning'}
      />
      </div>
    </div>
  );
}
