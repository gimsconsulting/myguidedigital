'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

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
      </div>
    </div>
  );
}
