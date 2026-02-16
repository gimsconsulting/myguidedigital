'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/lib/store';
import { affiliatesApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

export default function AffiliationPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    vatNumber: '',
    contactName: '',
    email: '',
    address: '',
    country: 'Belgique',
    iban: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.vatNumber || !formData.contactName || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);
    try {
      await affiliatesApi.apply(formData);
      setSubmitted(true);
      toast.success('Votre demande a été soumise avec succès !');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = ['Belgique', 'France', 'Luxembourg', 'Pays-Bas', 'Espagne', 'Portugal', 'Allemagne', 'Suisse'];

  const steps = [
    { emoji: '📝', title: 'Inscrivez-vous', desc: 'Remplissez le formulaire de candidature avec vos informations de société et votre numéro de TVA.' },
    { emoji: '✅', title: 'Validation', desc: 'Notre équipe examine votre candidature et vous envoie votre lien d\'affiliation unique sous 48h.' },
    { emoji: '🔗', title: 'Partagez votre lien', desc: 'Diffusez votre lien d\'affiliation personnalisé auprès de votre réseau de professionnels du tourisme.' },
    { emoji: '💰', title: 'Gagnez des commissions', desc: 'Recevez 30% de commission sur chaque vente réalisée via votre lien. Clôture mensuelle, paiement sous 7 jours.' },
  ];

  const advantages = [
    { emoji: '🏆', title: 'Commission attractive', desc: '30% sur chaque vente, l\'un des taux les plus élevés du marché.', gradient: 'from-amber-400 to-orange-500' },
    { emoji: '🔄', title: 'Revenus récurrents', desc: 'Gagnez sur les renouvellements d\'abonnement annuels de vos filleuls.', gradient: 'from-primary to-purple-600' },
    { emoji: '📊', title: 'Dashboard dédié', desc: 'Suivez vos performances, vos ventes et vos commissions en temps réel.', gradient: 'from-emerald-400 to-teal-500' },
    { emoji: '⚡', title: 'Paiement rapide', desc: 'Clôture mensuelle et paiement dans les 7 jours ouvrables après réception de votre facture.', gradient: 'from-pink-500 to-rose-500' },
    { emoji: '🎯', title: 'Lien unique', desc: 'Un lien d\'affiliation personnalisé pour traquer toutes vos recommandations.', gradient: 'from-violet-500 to-indigo-500' },
    { emoji: '🤝', title: 'Support dédié', desc: 'Un interlocuteur dédié pour répondre à toutes vos questions.', gradient: 'from-cyan-400 to-blue-500' },
  ];

  const faqs = [
    { q: 'Qui peut devenir affilié ?', a: 'Le programme d\'affiliation est réservé aux professionnels disposant d\'un numéro de TVA valide et capables d\'émettre des factures. Cela inclut les sociétés, consultants, agences web, professionnels du tourisme, etc.' },
    { q: 'Comment est calculée ma commission ?', a: 'Vous recevez 30% du montant HT de chaque vente réalisée via votre lien d\'affiliation unique. Par exemple, pour un abonnement Hôtes Annuel à 59€ HT, vous recevez 17,70€ de commission.' },
    { q: 'Quand et comment suis-je payé ?', a: 'Les commissions sont clôturées à chaque fin de mois. Vous envoyez votre facture à info@gims-consulting.be et le paiement est effectué dans les 7 jours ouvrables maximum après réception.' },
    { q: 'Est-ce que je gagne aussi sur les renouvellements ?', a: 'Oui ! Vous continuez à percevoir votre commission de 30% sur chaque renouvellement d\'abonnement de vos filleuls, tant qu\'ils restent clients.' },
    { q: 'Y a-t-il un minimum de paiement ?', a: 'Non, il n\'y a aucun minimum. Chaque euro de commission gagné vous sera versé lors de la clôture mensuelle.' },
    { q: 'Comment puis-je suivre mes performances ?', a: 'Dès votre approbation, vous avez accès à un tableau de bord dédié qui affiche en temps réel vos clics, inscriptions, ventes et commissions.' },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950 text-white">

      {/* ══════════════════════════════════════ */}
      {/* NAVIGATION */}
      {/* ══════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
            My Guide Digital
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-white/50 hover:text-white/80 text-sm transition-colors">Accueil</Link>
            <Link href="/hote-airbnb" className="text-white/50 hover:text-white/80 text-sm transition-colors">Nos services</Link>
            <Link href="/tarifs" className="text-white/50 hover:text-white/80 text-sm transition-colors">Nos tarifs</Link>
            <Link href="/contact" className="text-white/50 hover:text-white/80 text-sm transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/50 hover:text-white/80 text-sm transition-colors">Connexion</Link>
            <Link href="/register">
              <button className="relative group px-4 py-2 rounded-lg font-semibold text-sm text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                <span className="relative">Essai gratuit</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/8 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]"></div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-white/60 text-sm font-medium">Programme d&apos;Affiliation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Gagnez <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">30% de commission</span><br />
            sur chaque vente
          </h1>
          <p className="text-lg sm:text-xl text-white/40 mb-10 max-w-3xl mx-auto leading-relaxed">
            Rejoignez le programme d&apos;affiliation My Guide Digital et transformez votre réseau en revenus récurrents.
            Recommandez notre solution de livrets d&apos;accueil digitaux et recevez une commission attractive sur chaque abonnement souscrit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setShowForm(true);
                  document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="relative group px-8 py-4 rounded-full font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <span className="relative">Devenir affilié →</span>
            </button>
            <a href="#how-it-works" className="px-8 py-4 rounded-full font-semibold text-lg text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
              Comment ça marche ?
            </a>
          </div>

          {/* Stats rapides */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: '30%', label: 'Commission' },
              { value: '7j', label: 'Délai de paiement' },
              { value: '∞', label: 'Revenus récurrents' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-white/40 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* COMMENT ÇA MARCHE */}
      {/* ══════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-4">
              <span className="text-white/60 text-sm font-medium">4 étapes simples</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">Comment ça <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">marche</span> ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500"></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center text-2xl">
                      {step.emoji}
                    </div>
                    <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Étape {idx + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-white/20 text-2xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* AVANTAGES */}
      {/* ══════════════════════════════════════ */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-4">
              <span className="text-white/60 text-sm font-medium">Pourquoi nous rejoindre</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">Les avantages du <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">programme</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((adv, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${adv.gradient} rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500`}></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${adv.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                    {adv.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{adv.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* SIMULATION DE GAINS */}
      {/* ══════════════════════════════════════ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-4">
              <span className="text-white/60 text-sm font-medium">💰 Simulez vos gains</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">Combien pouvez-vous <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">gagner</span> ?</h2>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Hôtes */}
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center text-3xl mb-3">🏡</div>
                  <h4 className="font-bold text-white mb-1">Hôtes & Locations</h4>
                  <p className="text-white/40 text-sm mb-3">Abonnement à 59€ HT/an</p>
                  <div className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">17,70€</p>
                    <p className="text-white/40 text-xs mt-1">par vente</p>
                  </div>
                  <p className="text-white/30 text-xs mt-2">10 ventes = 177€ / mois</p>
                </div>

                {/* Hôtels */}
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center text-3xl mb-3">🏨</div>
                  <h4 className="font-bold text-white mb-1">Hôtels</h4>
                  <p className="text-white/40 text-sm mb-3">Ex: 50 chambres = 550€ HT/an</p>
                  <div className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">165€</p>
                    <p className="text-white/40 text-xs mt-1">par vente</p>
                  </div>
                  <p className="text-white/30 text-xs mt-2">5 hôtels = 825€ / mois</p>
                </div>

                {/* Campings */}
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-3xl mb-3">⛺</div>
                  <h4 className="font-bold text-white mb-1">Campings</h4>
                  <p className="text-white/40 text-sm mb-3">Ex: 100 emplacements = 1 490€ HT</p>
                  <div className="bg-white/[0.05] rounded-xl p-4 border border-white/10">
                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">447€</p>
                    <p className="text-white/40 text-xs mt-1">par vente</p>
                  </div>
                  <p className="text-white/30 text-xs mt-2">3 campings = 1 341€ / mois</p>
                </div>
              </div>

              <div className="mt-8 text-center border-t border-white/10 pt-6">
                <p className="text-white/30 text-sm mb-2">Potentiel mensuel avec un réseau actif</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                  jusqu&apos;à 2 000€+ / mois
                </p>
                <p className="text-white/30 text-xs mt-1">en revenus récurrents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CONDITIONS */}
      {/* ══════════════════════════════════════ */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-500"></div>
            <div className="relative bg-gradient-to-r from-slate-900 via-purple-900/50 to-slate-900 rounded-2xl p-8 border border-white/[0.06]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                Conditions du programme
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '🏢', text: 'Disposer d\'un numéro de TVA valide' },
                  { icon: '🧾', text: 'Être en mesure d\'émettre des factures' },
                  { icon: '💼', text: 'Être un professionnel (société, consultant, freelance...)' },
                  { icon: '🌐', text: 'Avoir un réseau dans le secteur du tourisme ou de l\'hébergement' },
                  { icon: '📧', text: 'Envoyer la facture mensuelle à info@gims-consulting.be' },
                  { icon: '📅', text: 'Clôture fin de mois, paiement sous 7 jours ouvrables max.' },
                ].map((cond, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                    <span className="text-lg flex-shrink-0">{cond.icon}</span>
                    <p className="text-white/60 text-sm">{cond.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FORMULAIRE DE CANDIDATURE */}
      {/* ══════════════════════════════════════ */}
      <section id="form-section" className="relative py-24">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-4">
              <span className="text-white/60 text-sm font-medium">Candidature</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">Rejoignez le <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">programme</span></h2>
            <p className="text-white/40 mt-3 max-w-xl mx-auto">
              Remplissez le formulaire ci-dessous et notre équipe examinera votre candidature sous 48 heures.
            </p>
          </div>

          {submitted ? (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-30"></div>
              <div className="relative bg-white/[0.03] border border-emerald-500/30 rounded-2xl p-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-4xl">
                  ✅
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Candidature soumise !</h3>
                <p className="text-white/50 mb-6 max-w-md mx-auto">
                  Merci pour votre intérêt ! Notre équipe examinera votre demande et vous contactera sous 48h avec votre lien d&apos;affiliation unique.
                </p>
                <Link href="/">
                  <button className="px-6 py-3 rounded-xl font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    Retour à l&apos;accueil
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
                {!isAuthenticated && (
                  <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <p className="text-amber-300 text-sm">
                      ⚠️ Vous devez être connecté pour soumettre votre candidature.{' '}
                      <Link href="/register" className="underline font-semibold hover:text-amber-200">Créez un compte</Link>{' '}
                      ou{' '}
                      <Link href="/login" className="underline font-semibold hover:text-amber-200">connectez-vous</Link>.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-1.5">
                        Nom de la société <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData(p => ({ ...p, companyName: e.target.value }))}
                        placeholder="Votre société"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-1.5">
                        Numéro de TVA <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.vatNumber}
                        onChange={(e) => setFormData(p => ({ ...p, vatNumber: e.target.value }))}
                        placeholder="BE0123456789"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-1.5">
                        Nom + Prénom du responsable <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData(p => ({ ...p, contactName: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-1.5">
                        Email de facturation <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="facturation@societe.be"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-1.5">Adresse complète</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                      placeholder="Rue, numéro, code postal, ville"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-1.5">Pays</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      >
                        {countries.map(c => (
                          <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm font-medium mb-1.5">IBAN (pour les paiements)</label>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={(e) => setFormData(p => ({ ...p, iban: e.target.value }))}
                        placeholder="BE00 0000 0000 0000"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!isAuthenticated || isSubmitting}
                      className={`w-full relative group/btn py-4 rounded-xl font-semibold text-lg text-white overflow-hidden transition-all duration-300 ${
                        !isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 blur-lg opacity-30 group-hover/btn:opacity-60 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            Envoi en cours...
                          </>
                        ) : (
                          <>Soumettre ma candidature 🚀</>
                        )}
                      </span>
                    </button>
                  </div>

                  <p className="text-white/20 text-xs text-center">
                    En soumettant ce formulaire, vous acceptez les conditions du programme d&apos;affiliation My Guide Digital.
                    Votre candidature sera examinée dans un délai de 48h.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FAQ */}
      {/* ══════════════════════════════════════ */}
      <section className="relative py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mb-4">
              <span className="text-white/60 text-sm font-medium">Questions fréquentes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">FAQ</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-2xl blur transition duration-500 ${openFaq === idx ? 'opacity-15' : 'opacity-0 group-hover:opacity-10'}`}></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <span className="font-semibold text-white text-sm">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      openFaq === idx ? 'bg-gradient-to-r from-primary to-pink-500 rotate-180' : 'bg-white/5'
                    }`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5">
                      <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CTA FINAL */}
      {/* ══════════════════════════════════════ */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-gradient-to-r from-slate-900 via-purple-900/50 to-slate-900 rounded-3xl p-12 border border-white/[0.06]">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Prêt à <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">monétiser</span> votre réseau ?
              </h2>
              <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto">
                Rejoignez le programme d&apos;affiliation My Guide Digital et commencez à générer des revenus dès aujourd&apos;hui.
              </p>
              <button
                onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative group/btn px-8 py-4 rounded-full font-semibold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 blur-xl opacity-50 group-hover/btn:opacity-80 transition-opacity"></div>
                <span className="relative">Devenir affilié maintenant →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════ */}
      <footer className="relative bg-slate-950 border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                My Guide Digital
              </h3>
              <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-relaxed max-w-md">
                {t('home.footer.description', 'La solution moderne pour créer et partager vos livrets d\'accueil digitaux.')}
              </p>
              <div className="flex gap-3 mb-5">
                <a href="#" className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300" title="Facebook">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300" title="Instagram">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-black flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all duration-300" title="TikTok">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.34 6.34 0 001.88-4.5V8.73a8.19 8.19 0 004.7 1.49V6.77a4.83 4.83 0 01-1-.08z"/></svg>
                </a>
              </div>
              <a href="https://wa.me/32476342364" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.06] transition-all duration-300 group">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent font-semibold text-sm">WhatsApp</p>
                  <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-xs">+32 476 34 23 64</p>
                </div>
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">{t('home.footer.navigation', 'Navigation')}</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.home', 'Accueil')}</Link></li>
                <li><Link href="/hote-airbnb" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.services', 'Nos services')}</Link></li>
                <li><Link href="/tarifs" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.pricing', 'Nos tarifs')}</Link></li>
                <li><Link href="/blog" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.blog', 'Blog')}</Link></li>
                <li><Link href="/login" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.login', 'Connexion')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">{t('home.footer.support', 'Support')}</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('nav.contact', 'Contact')}</Link></li>
                <li><Link href="/#faq" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">FAQ</Link></li>
                <li><Link href="/affiliation" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.affiliation', 'Programme d\'affiliation')}</Link></li>
                <li><Link href="/mentions-legales" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.legal', 'Mentions légales')}</Link></li>
                <li><Link href="/confidentialite" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.privacy', 'Confidentialité')}</Link></li>
                <li><Link href="/cgvu" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.cgvu', 'CGVU')}</Link></li>
                <li><Link href="/cookies" className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-primary hover:via-pink-300 hover:to-purple-300 transition-all text-sm">{t('home.footer.cookies', 'Politique de cookies')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center">
            <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-sm">
              © {new Date().getFullYear()} My Guide Digital. {t('home.footer.copyright', 'Tous droits réservés.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
