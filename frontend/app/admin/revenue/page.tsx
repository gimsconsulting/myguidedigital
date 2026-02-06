'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

interface RevenueData {
  monthlyRevenue: { [key: string]: number };
  revenueByPlan: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
  subscriptionsByPlan: {
    monthly: number;
    yearly: number;
    lifetime: number;
    trial: number;
  };
  mrr: number;
  arr: number;
  totalRevenue: number;
}

export default function AdminRevenuePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getRevenue({ period: 12 });
      setData(response.data);
    } catch (err: any) {
      console.error('Erreur chargement revenus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, gradientClass, image }: any) => (
    <div className="relative rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white">
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-300"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
      </div>
      <div className="relative p-6 z-10">
        <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-600 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">← {t('admin.revenue.backToDashboard')}</Link>
          <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-500">
            {t('admin.revenue.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('admin.revenue.subtitle')}</p>
        </div>

        {/* KPIs - Dégradé ROSE/PINK */}
        <div className="mb-12 p-6 rounded-xl border-2 border-pink-200 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-pink-600">💰</span>
            {t('admin.revenue.totalRevenue')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title={t('admin.revenue.totalRevenue')}
              value={`${data.totalRevenue.toFixed(2)} €`}
              gradientClass="from-pink-50 to-pink-200"
              image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
            />
            <StatCard
              title={t('admin.revenue.mrr')}
              value={`${data.mrr.toFixed(2)} €`}
              subtitle={t('admin.revenue.mrrSubtitle')}
              gradientClass="from-pink-100 to-pink-300"
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
            />
            <StatCard
              title={t('admin.revenue.arr')}
              value={`${data.arr.toFixed(2)} €`}
              subtitle={t('admin.revenue.arrSubtitle')}
              gradientClass="from-pink-200 to-pink-400"
              image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
            />
            <StatCard
              title={t('admin.revenue.activeSubscriptions')}
              value={data.subscriptionsByPlan.monthly + data.subscriptionsByPlan.yearly + data.subscriptionsByPlan.lifetime}
              gradientClass="from-pink-300 to-pink-500"
              image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
            />
          </div>
        </div>

        {/* Revenus par plan - Dégradé ROSE/PINK */}
        <div className="mb-12 p-6 rounded-xl border-2 border-pink-200 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-pink-600">📊</span>
            {t('admin.revenue.revenueByPlan')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title={t('admin.revenue.planMonthly')}
              value={`${data.revenueByPlan.monthly.toFixed(2)} €`}
              subtitle={`${data.subscriptionsByPlan.monthly} ${data.subscriptionsByPlan.monthly > 1 ? t('admin.revenue.subscriptionsPlural') : t('admin.revenue.subscription')}`}
              gradientClass="from-pink-50 to-pink-200"
              image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80"
            />
            <StatCard
              title={t('admin.revenue.planYearly')}
              value={`${data.revenueByPlan.yearly.toFixed(2)} €`}
              subtitle={`${data.subscriptionsByPlan.yearly} ${data.subscriptionsByPlan.yearly > 1 ? t('admin.revenue.subscriptionsPlural') : t('admin.revenue.subscription')}`}
              gradientClass="from-pink-100 to-pink-300"
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
            />
            <StatCard
              title={t('admin.revenue.planLifetime')}
              value={`${data.revenueByPlan.lifetime.toFixed(2)} €`}
              subtitle={`${data.subscriptionsByPlan.lifetime} ${data.subscriptionsByPlan.lifetime > 1 ? t('admin.revenue.subscriptionsPlural') : t('admin.revenue.subscription')}`}
              gradientClass="from-pink-200 to-pink-400"
              image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
            />
          </div>
        </div>

        {/* Revenus mensuels - Dégradé ROSE/PINK */}
        <div className="p-6 rounded-xl border-2 border-pink-200 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-pink-600">📅</span>
            {t('admin.revenue.monthlyRevenue')}
          </h2>
          <div className="space-y-3">
            {Object.entries(data.monthlyRevenue)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, revenue], index) => (
                <div 
                  key={month} 
                  className="relative rounded-lg overflow-hidden group hover:shadow-md transition-all duration-300"
                  style={{
                    background: `linear-gradient(to right, ${index % 2 === 0 ? 'rgba(251, 113, 133, 0.1)' : 'rgba(244, 63, 94, 0.1)'}, rgba(255, 255, 255, 0.5))`
                  }}
                >
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{revenue.toFixed(2)} €</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
