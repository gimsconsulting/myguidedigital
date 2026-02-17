'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { invoicesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  subscription?: {
    plan?: string;
  };
}

export default function InvoicesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadInvoices();
  }, [isAuthenticated, router]);

  const loadInvoices = async () => {
    try {
      const response = await invoicesApi.getAll();
      setInvoices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des factures');
    } finally {
      setIsLoading(false);
    }
  };

  // Stats calculées
  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === 'PAID').length;
    const pending = invoices.filter(i => i.status === 'PENDING').length;
    const totalAmount = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    return { total, paid, pending, totalAmount };
  }, [invoices]);

  // Filtrage
  const filteredInvoices = useMemo(() => {
    if (filterStatus === 'all') return invoices;
    return invoices.filter(i => i.status === filterStatus);
  }, [invoices, filterStatus]);

  const handleDownloadPDF = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    try {
      const token = localStorage.getItem('token');
      let apiBase = '';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          apiBase = 'http://localhost:3001';
        } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
          apiBase = `${protocol}//${hostname}:3001`;
        } else {
          apiBase = `${protocol}//${hostname}`;
        }
      }
      const url = `${apiBase}/api/invoices/${invoiceId}/pdf`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `facture-${invoiceId.substring(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      alert('Erreur lors du téléchargement du PDF');
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; gradient: string; bg: string; icon: string }> = {
      PAID: { text: 'Payée', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '✅' },
      PENDING: { text: 'En attente', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: '⏳' },
      FAILED: { text: 'Échouée', gradient: 'from-red-400 to-rose-500', bg: 'bg-red-500/10 border-red-500/20', icon: '❌' },
    };
    return statusMap[status] || { text: status, gradient: 'from-gray-400 to-gray-500', bg: 'bg-gray-500/10 border-gray-500/20', icon: '📄' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 animate-pulse"></div>
            </div>
            <p className="mt-6 text-white/60 font-medium">{t('common.loading', 'Chargement...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════ */}
        {/* HEADER PREMIUM SOMBRE */}
        {/* ══════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative px-6 sm:px-8 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center text-2xl">
                    🧾
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {t('invoices.title', 'Mes Factures')}
                    </h1>
                    <p className="text-white/50 text-sm mt-0.5">
                      {t('invoices.subtitle', 'Retrouvez et téléchargez toutes vos factures')}
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm font-medium"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('invoices.backToDashboard', 'Retour au dashboard')}
              </Link>
            </div>

            {/* Stats KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
              {[
                { label: 'Total factures', value: stats.total, icon: '📄', gradient: 'from-primary to-pink-500' },
                { label: 'Payées', value: stats.paid, icon: '✅', gradient: 'from-emerald-400 to-teal-500' },
                { label: 'En attente', value: stats.pending, icon: '⏳', gradient: 'from-amber-400 to-orange-500' },
                { label: 'Montant total', value: `${stats.totalAmount.toFixed(2)}€`, icon: '💰', gradient: 'from-violet-400 to-purple-500' },
              ].map((stat, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-xl opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500`}></div>
                  <div className="relative bg-white/[0.05] border border-white/[0.08] rounded-xl p-4 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* ERREUR */}
        {/* ══════════════════════════════════════ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* FILTRES */}
        {/* ══════════════════════════════════════ */}
        {invoices.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Toutes', icon: '📋', count: stats.total },
              { key: 'PAID', label: 'Payées', icon: '✅', count: stats.paid },
              { key: 'PENDING', label: 'En attente', icon: '⏳', count: stats.pending },
              { key: 'FAILED', label: 'Échouées', icon: '❌', count: invoices.filter(i => i.status === 'FAILED').length },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterStatus === filter.key
                    ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/20'
                    : 'bg-white/10 border border-white/10 text-white/70 hover:border-primary/30 hover:bg-white/15 hover:shadow-md'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filterStatus === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* ÉTAT VIDE */}
        {/* ══════════════════════════════════════ */}
        {invoices.length === 0 ? (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white/95 rounded-2xl shadow-lg shadow-black/10 border border-white/20 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/10 flex items-center justify-center">
                <span className="text-4xl">🧾</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune facture</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                Vos factures apparaîtront ici une fois que vous aurez souscrit à un abonnement.
              </p>
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>✨</span>
                <span>{t('invoices.seeSubscriptions', 'Voir les abonnements')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════ */}
            {/* LISTE DES FACTURES — VERSION CARDS MOBILE + TABLE DESKTOP */}
            {/* ══════════════════════════════════════ */}

            {/* Version Desktop (table) */}
            <div className="hidden md:block">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative bg-white/95 rounded-2xl shadow-lg shadow-black/10 border border-white/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Numéro</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">HT</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">TVA (21%)</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">TTC</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredInvoices.map((invoice, idx) => {
                          const statusInfo = getStatusInfo(invoice.status);
                          const ht = invoice.amount / 1.21;
                          const tva = invoice.amount - ht;
                          return (
                            <tr key={invoice.id} className="group/row hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/10 flex items-center justify-center text-sm">
                                    📄
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {invoice.invoiceNumber || `#${invoice.id.substring(0, 8)}`}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">
                                  {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">{ht.toFixed(2)} €</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">{tva.toFixed(2)} €</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                                  {invoice.amount.toFixed(2)} €
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg}`}>
                                  <span>{statusInfo.icon}</span>
                                  <span className={`bg-gradient-to-r ${statusInfo.gradient} bg-clip-text text-transparent`}>{statusInfo.text}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                  onClick={() => handleDownloadPDF(invoice.id)}
                                  disabled={downloadingId === invoice.id}
                                  className="group/btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/5 to-pink-500/5 border border-primary/10 text-primary hover:from-primary hover:to-pink-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {downloadingId === invoice.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                                      <span>Téléchargement...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span>PDF</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Version Mobile (cards) */}
            <div className="md:hidden space-y-4">
              {filteredInvoices.map((invoice) => {
                const statusInfo = getStatusInfo(invoice.status);
                const ht = invoice.amount / 1.21;
                const tva = invoice.amount - ht;
                return (
                  <div key={invoice.id} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-white/95 rounded-2xl shadow-lg shadow-black/10 border border-white/20 p-5 hover:shadow-xl transition-all duration-300">
                      {/* Header de la card */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-pink-500/10 border border-primary/10 flex items-center justify-center text-lg">
                            📄
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {invoice.invoiceNumber || `#${invoice.id.substring(0, 8)}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg}`}>
                          <span>{statusInfo.icon}</span>
                          <span className={`bg-gradient-to-r ${statusInfo.gradient} bg-clip-text text-transparent`}>{statusInfo.text}</span>
                        </span>
                      </div>

                      {/* Montants */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">HT</p>
                          <p className="text-sm font-semibold text-gray-700">{ht.toFixed(2)}€</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">TVA 21%</p>
                          <p className="text-sm font-semibold text-gray-700">{tva.toFixed(2)}€</p>
                        </div>
                        <div className="bg-gradient-to-br from-primary/5 to-pink-500/5 border border-primary/10 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-primary/60 uppercase tracking-wider font-medium">TTC</p>
                          <p className="text-sm font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">{invoice.amount.toFixed(2)}€</p>
                        </div>
                      </div>

                      {/* Bouton télécharger */}
                      <button
                        onClick={() => handleDownloadPDF(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-pink-500 text-white font-medium text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === invoice.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Téléchargement...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Télécharger le PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Résumé en bas */}
            {filteredInvoices.length > 0 && (
              <div className="mt-6">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative bg-white/95 rounded-2xl shadow-lg shadow-black/10 border border-white/20 p-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/10 flex items-center justify-center">
                          <span className="text-lg">📊</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Récapitulatif</p>
                          <p className="text-xs text-gray-400">{filteredInvoices.length} facture(s) affichée(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase tracking-wider">Total HT</p>
                          <p className="text-lg font-bold text-gray-700">
                            {filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount / 1.21, 0).toFixed(2)}€
                          </p>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase tracking-wider">TVA</p>
                          <p className="text-lg font-bold text-gray-700">
                            {filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.amount - i.amount / 1.21), 0).toFixed(2)}€
                          </p>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div className="text-center">
                          <p className="text-xs text-primary/60 uppercase tracking-wider font-medium">Total TTC</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                            {filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
