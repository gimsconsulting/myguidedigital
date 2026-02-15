'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { affiliatesApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

interface AffiliateData {
  id: string;
  affiliateCode: string;
  companyName: string;
  vatNumber: string;
  contactName: string;
  email: string;
  commissionRate: number;
  status: string;
  totalEarnings: number;
  totalPaid: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  affiliateLink: string;
  referrals: any[];
}

export default function AffiliationDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notAffiliate, setNotAffiliate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meRes, statsRes] = await Promise.allSettled([
        affiliatesApi.getMe(),
        affiliatesApi.getStats(),
      ]);
      if (meRes.status === 'fulfilled') {
        setAffiliate(meRes.value.data);
      } else {
        setNotAffiliate(true);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
    } catch (err: any) {
      if (err.response?.status === 404) setNotAffiliate(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (affiliate?.affiliateLink) {
      navigator.clipboard.writeText(affiliate.affiliateLink);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approuvé', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' };
      case 'PENDING':
        return { label: 'En attente', bg: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' };
      case 'REJECTED':
        return { label: 'Rejeté', bg: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' };
      case 'SUSPENDED':
        return { label: 'Suspendu', bg: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-500' };
      default:
        return { label: status, bg: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (notAffiliate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <span className="text-4xl">🤝</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Programme d&apos;affiliation</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Vous n&apos;êtes pas encore affilié. Rejoignez notre programme et gagnez 30% de commission sur chaque vente !
              </p>
              <Link href="/affiliation">
                <button className="relative group/btn px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"></div>
                  <span className="relative">Découvrir le programme →</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!affiliate) return null;

  const statusBadge = getStatusBadge(affiliate.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER PREMIUM */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>

          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-white/60 text-xs font-medium">Programme d&apos;Affiliation</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Mon espace <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">affilié</span>
                </h1>
                <p className="text-white/40 mt-1 text-sm">{affiliate.companyName} — {affiliate.vatNumber}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot} ${affiliate.status === 'APPROVED' ? 'animate-pulse' : ''}`}></span>
                {statusBadge.label}
              </div>
            </div>
          </div>
        </div>

        {/* LIEN D'AFFILIATION */}
        {affiliate.status === 'APPROVED' && (
          <div className="mb-8 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg flex-shrink-0">
                    🔗
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Votre lien d&apos;affiliation</p>
                    <p className="text-gray-900 font-mono text-sm truncate">{affiliate.affiliateLink}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    copied 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/20'
                  }`}
                >
                  {copied ? '✅ Copié !' : '📋 Copier le lien'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { emoji: '💰', label: 'Total gagné', value: `${affiliate.totalEarnings.toFixed(2)}€`, gradient: 'from-amber-400 to-orange-500', bgLight: 'from-amber-50 to-orange-50', labelColor: 'text-amber-600' },
            { emoji: '⏳', label: 'En attente', value: `${affiliate.pendingEarnings.toFixed(2)}€`, gradient: 'from-primary to-purple-600', bgLight: 'from-primary/5 to-purple-50', labelColor: 'text-primary' },
            { emoji: '✅', label: 'Déjà payé', value: `${affiliate.totalPaid.toFixed(2)}€`, gradient: 'from-emerald-400 to-teal-500', bgLight: 'from-emerald-50 to-teal-50', labelColor: 'text-emerald-600' },
            { emoji: '👥', label: 'Filleuls', value: `${affiliate.referrals?.length || 0}`, gradient: 'from-pink-500 to-rose-500', bgLight: 'from-pink-50 to-rose-50', labelColor: 'text-pink-600' },
          ].map((card, idx) => (
            <div key={idx} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`}></div>
              <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bgLight} flex items-center justify-center`}>
                    <span className="text-lg">{card.emoji}</span>
                  </div>
                  <span className={`text-xs font-semibold ${card.labelColor} uppercase tracking-wider`}>{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CE MOIS-CI */}
        {stats?.monthlyStats?.[0] && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></span>
              Ce mois-ci — {stats.monthlyStats[0].label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-400 mb-1">Ventes réalisées</p>
                <p className="text-3xl font-bold text-gray-900">{stats.monthlyStats[0].referralCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-400 mb-1">Chiffre d&apos;affaires généré</p>
                <p className="text-3xl font-bold text-gray-900">{stats.monthlyStats[0].totalSales.toFixed(2)}€</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-400 mb-1">Commissions (30%)</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{stats.monthlyStats[0].totalCommission.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIQUE */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-primary to-pink-500 rounded-full"></span>
            Historique des filleuls
          </h2>
          
          {affiliate.referrals && affiliate.referrals.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Filleul</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vente HT</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Commission</th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliate.referrals.map((ref: any) => (
                      <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {ref.referredUser?.firstName || ''} {ref.referredUser?.lastName || ''}
                          </p>
                          <p className="text-xs text-gray-400">{ref.referredUser?.email || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(ref.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-5 py-4 text-sm text-right font-medium text-gray-900">
                          {ref.saleAmount.toFixed(2)}€
                        </td>
                        <td className="px-5 py-4 text-sm text-right font-bold text-amber-600">
                          {ref.commissionAmount.toFixed(2)}€
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            ref.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                            ref.status === 'VALIDATED' ? 'bg-blue-50 text-blue-600' :
                            ref.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {ref.status === 'PAID' ? 'Payé' : ref.status === 'VALIDATED' ? 'Validé' : ref.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-gray-500 mb-2">Aucun filleul pour le moment</p>
              <p className="text-gray-400 text-sm">Partagez votre lien d&apos;affiliation pour commencer à gagner des commissions !</p>
            </div>
          )}
        </div>

        {/* INFOS FACTURATION */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-15 transition duration-500"></div>
          <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">🧾</span> Informations de facturation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Clôture des commissions</p>
                <p className="text-gray-900 font-medium">Fin de chaque mois</p>
              </div>
              <div>
                <p className="text-gray-400">Délai de paiement</p>
                <p className="text-gray-900 font-medium">7 jours ouvrables max. après réception de votre facture</p>
              </div>
              <div>
                <p className="text-gray-400">Email pour envoyer votre facture</p>
                <p className="text-primary font-medium">info@gims-consulting.be</p>
              </div>
              <div>
                <p className="text-gray-400">Taux de commission</p>
                <p className="text-amber-600 font-bold text-lg">{affiliate.commissionRate}%</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
