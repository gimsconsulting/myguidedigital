'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

export default function AdminInvoicesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
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

    loadInvoices();
  }, [isAuthenticated, user, router, page]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getInvoices({ page, limit: 20 });
      setInvoices(response.data.invoices);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      console.error('Erreur chargement factures:', err);
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
          <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">← {t('admin.invoices.backToDashboard')}</Link>
          <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
            {t('admin.invoices.title')}
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <>
            {/* Tableau avec dégradé ORANGE/AMBER */}
            <div className="p-6 rounded-xl border-2 border-amber-200 bg-white/50 backdrop-blur-sm shadow-lg">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.invoices.user')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.invoices.amount')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.invoices.plan')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.invoices.statusLabel')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('admin.invoices.date')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((inv, index) => (
                      <tr 
                        key={inv.id} 
                        className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all duration-200"
                        style={{
                          background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 251, 235, 0.3)'
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {inv.user?.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {inv.amount.toFixed(2)} {inv.currency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inv.subscription?.plan || t('admin.invoices.na')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {t(`admin.invoices.status.${inv.status.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl border-2 border-amber-200 bg-white/50 backdrop-blur-sm shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{t('admin.invoices.pageInfo', { page, totalPages })}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1} 
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-md hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    {t('common.previous')}
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages} 
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-md hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
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
