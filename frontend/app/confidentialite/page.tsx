'use client';

import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
            My Guide Digital
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link href="/" className="text-white/60 hover:text-white transition text-sm">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/8 via-pink-500/8 to-purple-500/8 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6">
            <span>🔐</span>
            <span className="text-white/60 text-sm font-medium">RGPD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Politique de{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Confidentialité
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
            My Guide Digital
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">Version : v1.4 — Dernière mise à jour : 16/02/2026</span>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* 1. Responsable du traitement */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Responsable du traitement
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>Le responsable du traitement est :</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <p className="text-white/80 font-semibold">Gims Consulting SRL</p>
                    <p>Avenue Louise 143/4, 1050 Bruxelles, Belgique — <strong className="text-white/80">BE0848903319</strong></p>
                    <p>Email : <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a></p>
                  </div>
                  <p className="text-white/40 text-xs italic">
                    Aucun délégué à la protection des données (DPO) n&apos;est spécifiquement désigné à ce jour.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Données personnelles traitées */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Données personnelles traitées
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>Selon ton usage du Service, nous pouvons traiter :</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: '👤',
                        title: 'Données d\'identité et de contact',
                        desc: 'Nom, prénom, email, téléphone, adresse, société, informations nécessaires à la gestion de compte',
                        gradient: 'from-primary/20 to-pink-500/20',
                      },
                      {
                        icon: '📋',
                        title: 'Données de compte et d\'usage (logs)',
                        desc: 'Identifiants de compte, journaux techniques (logs), adresse IP, informations de session, navigateur/appareil, évènements techniques liés à la sécurité',
                        gradient: 'from-blue-500/20 to-indigo-500/20',
                      },
                      {
                        icon: '💳',
                        title: 'Données de facturation et paiement',
                        desc: 'Informations de facturation (raison sociale, adresse, TVA, historique). Données de paiement traitées par Stripe / Bancontact. Nous ne stockons pas les données de carte.',
                        gradient: 'from-emerald-500/20 to-teal-500/20',
                      },
                      {
                        icon: '📍',
                        title: 'Localisation',
                        desc: 'Données de localisation (si fournies par l\'utilisateur ou l\'appareil selon paramètres)',
                        gradient: 'from-amber-500/20 to-orange-500/20',
                      },
                      {
                        icon: '📝',
                        title: 'Contenus',
                        desc: 'Contenus saisis/importés (textes, images, documents), avis/UGC (si activé)',
                        gradient: 'from-violet-500/20 to-purple-500/20',
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} border border-white/10 flex items-center justify-center`}>
                            <span className="text-sm">{item.icon}</span>
                          </div>
                          <p className="text-white/80 text-xs font-semibold">{item.title}</p>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Finalités des traitements */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Finalités des traitements
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">Nous traitons ces données pour :</p>
                  <ul className="space-y-2.5">
                    {[
                      'Créer et gérer le compte Client et les accès Utilisateurs',
                      'Fournir le Service et ses fonctionnalités',
                      'Assurer le support et la relation client',
                      'Exécuter la facturation, gérer les abonnements et obligations comptables',
                      'Garantir la sécurité, prévenir la fraude et gérer les incidents',
                      'Communiquer (emails de service) et, si applicable, envoyer des communications marketing/newsletter',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Bases légales */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">4️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Bases légales
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { title: 'Exécution du contrat', desc: 'Fourniture du Service, gestion du compte, support, facturation', color: 'from-primary to-pink-500' },
                      { title: 'Obligation légale', desc: 'Obligations comptables/fiscales', color: 'from-emerald-500 to-teal-500' },
                      { title: 'Intérêt légitime', desc: 'Sécurité, prévention fraude, amélioration du Service, et marketing direct B2B avec droit d\'opposition', color: 'from-blue-500 to-indigo-500' },
                      { title: 'Consentement', desc: 'Lorsque requis (ex. inscription à la newsletter, ou autres traitements spécifiques)', color: 'from-amber-500 to-orange-500' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`}></div>
                          <p className="text-white/80 text-xs font-semibold">{item.title}</p>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Destinataires et sous-traitants */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">5️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Destinataires et sous-traitants
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">Les données peuvent être accessibles :</p>
                  <ul className="space-y-2.5">
                    {[
                      'Aux personnes habilitées chez Gims Consulting SRL',
                      'À nos sous-traitants techniques nécessaires (hébergement, infrastructure)',
                      'Aux prestataires de paiement (Stripe / Bancontact)',
                      'Aux autorités compétentes si la loi l\'exige ou pour la défense de nos droits',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-amber-400 mt-0.5">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 6. Transferts hors UE */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">6️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Transferts hors Union européenne
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Nous n&apos;organisons pas de transferts hors Union européenne dans le cadre normal du Service, 
                    sur la base des informations communiquées.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Durées de conservation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">7️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Durées de conservation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-4">Nous conservons les données uniquement le temps nécessaire :</p>
                  <div className="space-y-3">
                    {[
                      { icon: '👤', label: 'Données de compte', value: 'Durée de la relation contractuelle, puis 3 mois après la résiliation (sauf obligation légale contraire ou nécessité de preuve/gestion litige)' },
                      { icon: '📋', label: 'Logs techniques / sécurité', value: '12 mois' },
                      { icon: '📧', label: 'Newsletter', value: 'Jusqu\'à désinscription' },
                      { icon: '🧾', label: 'Facturation / comptabilité', value: 'Durée imposée par la législation applicable (comptable/fiscale)' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <span className="text-base mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-white/80 text-xs font-semibold">{item.label}</p>
                          <p className="text-white/40 text-xs mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Sécurité */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">8️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Sécurité
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les 
                    données (contrôle d&apos;accès, mesures de sécurité adaptées, sauvegardes, prévention des accès non autorisés).
                  </p>
                </div>
              </div>
            </div>

            {/* 9. Droits des personnes */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">9️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Droits des personnes
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>Tu disposes, dans les conditions prévues par le RGPD, des droits suivants :</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: '👁️', title: 'Accès', desc: 'Accéder aux données que nous détenons sur toi' },
                      { icon: '✏️', title: 'Rectification', desc: 'Corriger tes données inexactes ou incomplètes' },
                      { icon: '🗑️', title: 'Effacement', desc: 'Demander la suppression de tes données' },
                      { icon: '⏸️', title: 'Limitation', desc: 'Restreindre le traitement de tes données' },
                      { icon: '✋', title: 'Opposition', desc: 'T\'opposer au traitement (notamment marketing direct)' },
                      { icon: '📤', title: 'Portabilité', desc: 'Récupérer tes données dans un format structuré (dans certains cas)' },
                      { icon: '🔄', title: 'Retrait du consentement', desc: 'Lorsque le traitement est basé sur le consentement' },
                    ].map((right, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{right.icon}</span>
                          <p className="text-white/80 text-xs font-semibold">{right.title}</p>
                        </div>
                        <p className="text-white/40 text-xs">{right.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3">
                    Exercice des droits : par email à{' '}
                    <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors font-medium">
                      info@gims-consulting.be
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* 10. Réclamation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔟</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Réclamation (Belgique)
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>Tu peux introduire une réclamation auprès de l&apos;Autorité de protection des données (APD) :</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>Rue de la Presse 35, 1000 Bruxelles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <a href="mailto:contact@apd-gba.be" className="text-pink-400 hover:text-pink-300 transition-colors">
                        contact@apd-gba.be
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 11. Newsletter */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📬</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Newsletter / prospection (simple opt-in)
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Si tu t&apos;inscris à notre newsletter, ton inscription est effective dès la demande (simple opt-in).
                  </p>
                  <p>
                    Tu peux te désinscrire à tout moment via le lien de désinscription présent dans nos emails ou en 
                    écrivant à{' '}
                    <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">
                      info@gims-consulting.be
                    </a>.
                  </p>
                </div>
              </div>
            </div>

            {/* 12. Mise à jour */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔄</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Mise à jour
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Nous pouvons modifier cette politique pour refléter les évolutions du Service, de nos prestataires 
                    ou du cadre légal. La date de mise à jour figure en tête du document.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Liens vers les autres pages légales */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/mentions-legales" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                ⚖️ Mentions légales →
              </span>
            </Link>
            <Link href="/cgvu" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                📜 CGVU →
              </span>
            </Link>
            <Link href="/cookies" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🍪 Politique Cookies →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-sm">
            © {new Date().getFullYear()} My Guide Digital — Gims Consulting SRL — Avenue Louise 143/4, 1050 Bruxelles
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors">Accueil</Link>
            <span className="text-white/20">|</span>
            <Link href="/mentions-legales" className="text-white/40 hover:text-white/70 text-xs transition-colors">Mentions légales</Link>
            <span className="text-white/20">|</span>
            <Link href="/confidentialite" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">Confidentialité</Link>
            <span className="text-white/20">|</span>
            <Link href="/cgvu" className="text-white/40 hover:text-white/70 text-xs transition-colors">CGVU</Link>
            <span className="text-white/20">|</span>
            <Link href="/cookies" className="text-white/40 hover:text-white/70 text-xs transition-colors">Cookies</Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="text-white/40 hover:text-white/70 text-xs transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
