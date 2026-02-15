'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api';

export default function AdminLivretsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [hasHydrated, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getLivrets();
      setData(response.data);
    } catch (err: any) {
      console.error('Erreur chargement livrets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  const StatCard = ({ title, value, gradientClass, image }: any) => (
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-primary hover:underline mb-4 inline-block">← {t('admin.livrets.backToDashboard')}</Link>
          <h1 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-violet-500">
            {t('admin.livrets.title')}
          </h1>
        </div>

        {/* Statistiques - Dégradé VIOLET/PURPLE */}
        <div className="mb-12 p-6 rounded-xl border-2 border-violet-200 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-violet-600">📚</span>
            {t('admin.livrets.total')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title={t('admin.livrets.total')}
              value={data.total}
              gradientClass="from-violet-50 to-violet-200"
              image="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80"
            />
            <StatCard
              title={t('admin.livrets.active')}
              value={data.active}
              gradientClass="from-violet-200 to-violet-400"
              image="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
            />
            <StatCard
              title={t('admin.livrets.inactive')}
              value={data.inactive}
              gradientClass="from-violet-300 to-violet-500"
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
            />
          </div>
        </div>

        {/* Top Livrets - Dégradé VIOLET/PURPLE */}
        <div className="mb-12 p-6 rounded-xl border-2 border-violet-200 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-violet-600">⭐</span>
            {t('admin.livrets.topLivrets')}
          </h2>
          <div className="space-y-3">
            {data.topLivrets.map((livret: any, index: number) => (
              <div 
                key={livret.id} 
                className="relative rounded-lg overflow-hidden group hover:shadow-md transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${index % 2 === 0 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.1)'}, rgba(255, 255, 255, 0.5))`
                }}
              >
                <div className="flex items-center justify-between p-4">
                  <div>
                    <span className="font-semibold text-gray-900 text-lg">{index + 1}. {livret.name}</span>
                    <p className="text-sm text-gray-600 mt-1">{livret.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{livret.viewsCount} {t('admin.livrets.views')}</p>
                    <p className="text-xs text-gray-600">{livret.modulesCount} {t('admin.livrets.modules')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Types de modules - Dégradé VIOLET/PURPLE */}
        <div className="p-6 rounded-xl border-2 border-violet-200 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3 text-violet-600">📋</span>
            {t('admin.livrets.moduleTypes')}
          </h2>
          <div className="space-y-3">
            {Object.entries(data.moduleTypes).map(([type, count]: [string, any], index) => (
              <div 
                key={type} 
                className="relative rounded-lg overflow-hidden group hover:shadow-md transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${index % 2 === 0 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.1)'}, rgba(255, 255, 255, 0.5))`
                }}
              >
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
