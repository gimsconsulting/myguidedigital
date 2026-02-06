'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadSubscriptions();
  }, [isAuthenticated, user, router, page]);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getSubscriptions({ page, limit: 20 });
      setSubscriptions(response.data.subscriptions);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error('Erreur chargement abonnements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">← {t('admin.subscriptions.backToDashboard')}</Link>
          <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-teal-500">
            {t('admin.subscriptions.title')}
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <>
            {/* Tableau avec dégradé TURQUOISE/CYAN */}
            <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white/50 backdrop-blur-sm shadow-lg">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-cyan-50 to-teal-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.subscriptions.user')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.subscriptions.plan')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.subscriptions.statusLabel')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.subscriptions.startDate')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.subscriptions.endDate')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub, index) => (
                      <tr 
                        key={sub.id} 
                        className="hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-all duration-200"
                        style={{
                          background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(236, 254, 255, 0.3)'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {sub.user?.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.plan}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            sub.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t(`admin.subscriptions.status.${sub.status.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(sub.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : t('admin.subscriptions.na')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border-2 border-cyan-200 bg-white/50 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{t('admin.subscriptions.pageInfo', { page, totalPages })}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1} 
                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-500 text-white rounded-md hover:from-cyan-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {t('common.previous')}
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages} 
                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-500 text-white rounded-md hover:from-cyan-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
