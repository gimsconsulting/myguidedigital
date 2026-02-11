'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { statisticsApi, livretsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

interface ModuleStat {
  moduleType: string;
  totalViews: number;
  uniqueVisitors: number;
}

interface StatisticHistory {
  id: string;
  moduleType: string | null;
  viewedAt: string;
  ipAddress: string;
  userAgent: string;
}

interface Statistics {
  totalOpenings: number;
  moduleStats: ModuleStat[];
  history: StatisticHistory[];
}

interface Livret {
  id: string;
  name: string;
}

const MODULE_ICONS: Record<string, string> = {
  WIFI: '📶',
  ARRIVEE: '📅',
  ACCUEIL: '👋',
  CODES_ENTREE: '🔐',
  NUMEROS_UTILES: '📞',
  DEPART: '✈️',
  PARKING: '🚗',
  RESTAURANTS: '🍽️',
  REGLEMENT: '🚫',
  EQUIPEMENTS: '⚡',
  BARS: '🍸',
  SECURITE: '🏥',
  INVENTAIRE: '📋',
  ACTIVITES: '🏔️',
  POUBELLES: '🗑️',
  AVIS: '⭐',
  EXTRAS: '🎁',
};

const MODULE_NAMES: Record<string, string> = {
  WIFI: 'Wi-fi',
  ARRIVEE: 'Infos arrivée',
  ACCUEIL: 'Mot d\'accueil',
  CODES_ENTREE: 'Codes d\'entrée',
  NUMEROS_UTILES: 'Numéros utiles',
  DEPART: 'Infos départ',
  PARKING: 'Parking',
  RESTAURANTS: 'Restaurants',
  REGLEMENT: 'Règlement',
  EQUIPEMENTS: 'Equipements',
  BARS: 'Bars',
  SECURITE: 'Sécurité et secours',
  INVENTAIRE: 'Inventaire',
  ACTIVITES: 'Activités',
  POUBELLES: 'Poubelles',
  AVIS: 'Avis',
  EXTRAS: 'Extras & Services',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Il y a moins d\'une minute';
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    if (diffDays === 0) {
      return `Aujourd'hui à ${hours}h${minutes}`;
    } else if (diffDays === 1) {
      return `Hier à ${hours}h${minutes}`;
    }
  }
  
  if (diffDays < 7) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return `${dayNames[date.getDay()]} à ${hours}h${minutes}`;
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} à ${hours}h${minutes}`;
}

export default function StatisticsPage() {
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;

  const [livret, setLivret] = useState<Livret | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [livretId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [livretResponse, statsResponse] = await Promise.all([
        livretsApi.getOne(livretId),
        statisticsApi.getByLivret(livretId),
      ]);
      setLivret(livretResponse.data);
      setStatistics(statsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    try {
      setIsResetting(true);
      await statisticsApi.reset(livretId);
      await loadData();
      toast.success('Statistiques réinitialisées avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de la réinitialisation');
      console.error(err);
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error || !statistics || !livret) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{error || 'Erreur lors du chargement'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/livrets/${livretId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Retour à l'édition du livret
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Statistiques du guide {livret.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Retrouvez sur cette page le nombre de fois où votre guide a été ouvert ainsi que le nombre de consultations pour chaque module.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Le nombre affiché sous chaque module correspond au nombre de visiteurs uniques pour celui-ci.
          </p>
          <div className="mt-4">
            <Button
              variant="danger"
              onClick={handleReset}
              isLoading={isResetting}
            >
              Remettre les compteurs à zéro
            </Button>
          </div>

          <ConfirmDialog
            isOpen={showResetConfirm}
            title="Réinitialiser les statistiques"
            message="Êtes-vous sûr de vouloir remettre les compteurs à zéro ? Cette action est irréversible et supprimera toutes les statistiques de ce livret."
            confirmText="Réinitialiser"
            cancelText="Annuler"
            variant="danger"
            onConfirm={confirmReset}
            onCancel={() => setShowResetConfirm(false)}
          />
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Ouvertures du guide</h2>
        <div className="text-4xl font-bold text-primary">
          {statistics.totalOpenings}
        </div>
        <p className="text-gray-600 mt-2">Nombre total d'ouvertures du livret</p>
      </div>

      {/* Statistiques par module */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Consultations par module</h2>
        {statistics.moduleStats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {statistics.moduleStats.map((stat) => (
              <div
                key={stat.moduleType}
                className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
              >
                <div className="text-3xl mb-2">
                  {MODULE_ICONS[stat.moduleType] || '📄'}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {MODULE_NAMES[stat.moduleType] || stat.moduleType}
                </div>
                <div className="bg-primary text-white rounded-lg px-3 py-1 text-lg font-bold">
                  {stat.uniqueVisitors}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {stat.totalViews} consultation{stat.totalViews > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucune consultation de module pour le moment
          </div>
        )}
      </div>

      {/* Historique détaillé */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Historique global détaillé</h2>
        {statistics.history.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {statistics.history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {entry.moduleType
                      ? MODULE_ICONS[entry.moduleType] || '📄'
                      : '📖'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {entry.moduleType
                        ? `${MODULE_NAMES[entry.moduleType] || entry.moduleType} consulté`
                        : 'Guide ouvert'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(entry.viewedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Aucun historique disponible
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Réinitialiser les statistiques"
        message="Êtes-vous sûr de vouloir remettre les compteurs à zéro ? Cette action est irréversible et supprimera toutes les statistiques de ce livret."
        confirmText="Réinitialiser"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
