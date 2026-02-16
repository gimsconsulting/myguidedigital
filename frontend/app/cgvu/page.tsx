'use client';

import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';

export default function CGVUPage() {
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
            <span>📜</span>
            <span className="text-white/60 text-sm font-medium">Conditions contractuelles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Conditions Générales de{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Vente et d&apos;Utilisation
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
            My Guide Digital
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">Version : v1.2 — Dernière mise à jour : 16/02/2026</span>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* 1. Informations légales */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🏢</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    1. Informations légales – Éditeur
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>Les présentes Conditions Générales de Vente et d&apos;Utilisation (ci-après « CGVU ») sont proposées par :</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2.5">
                    <p className="text-white/80 font-semibold text-base">Gims Consulting SRL</p>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>Avenue Louise 143/4, 1050 Bruxelles, Belgique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏛️</span>
                      <span>BCE / TVA : <strong className="text-white/80">BE0848903319</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      <span>Hébergeur : <strong className="text-white/80">Hostinger France</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Définitions */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📖</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    2. Définitions
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <div className="space-y-3">
                    {[
                      { term: 'Service', def: 'La plateforme My Guide Digital permettant la création, l\'édition et la publication de livrets d\'accueil digitaux (locations meublées, hôtels, campings, etc.).' },
                      { term: 'Client', def: 'Toute personne agissant à des fins professionnelles (B2B) souscrivant au Service.' },
                      { term: 'Utilisateur', def: 'Toute personne utilisant le Service via le compte du Client.' },
                      { term: 'Contenu', def: 'Tout contenu importé, saisi ou publié via le Service (textes, images, documents, avis, etc.).' },
                      { term: 'Abonnement', def: 'Accès payant au Service selon une formule et une période déterminées.' },
                      { term: 'Période d\'essai', def: 'Accès gratuit de 14 jours, sans carte bancaire.' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-pink-500 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <span className="text-white/80 font-semibold">{item.term}</span>
                          <span className="text-white/40"> : </span>
                          <span>{item.def}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Objet */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    3. Objet – Champ d&apos;application (B2B)
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>Les CGVU encadrent :</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>L&apos;accès et l&apos;utilisation du Service (CGU)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>La souscription et l&apos;exécution des Abonnements (CGV)</span>
                    </li>
                  </ul>
                  <p>
                    Le Service est destiné aux professionnels. En utilisant le Service, le Client déclare agir dans le cadre de son activité professionnelle.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Acceptation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    4. Acceptation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Le Client accepte les CGVU lors de la création de compte et/ou lors de la souscription. Les CGVU prévalent sur tout document du Client, sauf dérogation écrite.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Création de compte */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔐</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    5. Création de compte – Sécurité
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Le Client s&apos;engage à fournir des informations exactes et à jour. Il conserve la confidentialité de ses identifiants et demeure responsable des actions réalisées via son compte et celui de ses Utilisateurs.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Description du Service */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">💡</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    6. Description du Service
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Le Service permet notamment la création et la gestion de livrets d&apos;accueil digitaux, la personnalisation, la génération de QR codes, l&apos;activation de fonctionnalités additionnelles selon l&apos;offre, et, le cas échéant, la collecte/affichage d&apos;avis.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Période d'essai */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⏱️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    7. Période d&apos;essai (14 jours)
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Le Client peut bénéficier d&apos;une Période d&apos;essai gratuite de 14 jours. À l&apos;issue de l&apos;essai, la poursuite du Service suppose la souscription d&apos;un Abonnement payant.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Offres – Prix – Paiement – Facturation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    8. Offres – Prix – Paiement – Facturation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-6">

                  {/* 8.1 Prix */}
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-3">8.1. Prix (HT) et unité de facturation</h3>
                    <p className="mb-4">Sauf mention contraire, les prix s&apos;entendent hors TVA (HT). Les prix peuvent évoluer ; le Client est informé avant renouvellement.</p>

                    {/* A) Hôtes */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">🏡</span>
                        <h4 className="text-white/80 font-semibold text-sm">(A) Hôtes &amp; locations meublées</h4>
                        <span className="text-white/30 text-xs">(prix par livret)</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5">
                          <span>Offre annuelle de lancement</span>
                          <span className="text-white/80 font-semibold">59€ HT / an <span className="text-white/40 font-normal text-xs">(livrets illimités)</span></span>
                        </div>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-3 mb-2">Offres saisonnières :</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
                            <p className="text-white/40 text-xs">1 mois</p>
                            <p className="text-white/80 font-semibold text-sm">9,90€ HT</p>
                          </div>
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
                            <p className="text-white/40 text-xs">2 mois</p>
                            <p className="text-white/80 font-semibold text-sm">14,90€ HT</p>
                          </div>
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2.5 text-center">
                            <p className="text-white/40 text-xs">3 mois</p>
                            <p className="text-white/80 font-semibold text-sm">19,90€ HT</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* B) Hôtels */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">🏨</span>
                        <h4 className="text-white/80 font-semibold text-sm">(B) Hôtels</h4>
                        <span className="text-white/30 text-xs">(prix par chambre / an, dégressif)</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/40 uppercase tracking-wider">
                              <th className="text-left py-1.5">Chambres</th>
                              <th className="text-right py-1.5">Prix / chambre / an</th>
                            </tr>
                          </thead>
                          <tbody className="text-white/60">
                            {[
                              ['5–9', '19€ HT'], ['10–19', '17€ HT'], ['20–29', '15€ HT'], ['30–49', '13€ HT'],
                              ['50–74', '11€ HT'], ['75–99', '10€ HT'], ['100–149', '9€ HT'], ['150–199', '8€ HT'],
                              ['200–299', '7€ HT'], ['300–399', '6€ HT'], ['400+', '5€ HT'],
                            ].map(([range, price], idx) => (
                              <tr key={idx} className="border-t border-white/5">
                                <td className="py-1.5 text-white/50">{range}</td>
                                <td className="py-1.5 text-right text-white/80 font-medium">{price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* C) Campings */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">⛺</span>
                        <h4 className="text-white/80 font-semibold text-sm">(C) Campings &amp; plein air</h4>
                        <span className="text-white/30 text-xs">(prix par emplacement / an + frais de mise en place)</span>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3 mb-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/40 uppercase tracking-wider">
                              <th className="text-left py-1.5">Emplacements</th>
                              <th className="text-right py-1.5">Prix / emplacement / an</th>
                            </tr>
                          </thead>
                          <tbody className="text-white/60">
                            {[
                              ['5–9', '39€ HT'], ['10–29', '33€ HT'], ['30–49', '27€ HT'], ['50–74', '22€ HT'],
                              ['75–99', '18€ HT'], ['100–149', '14€ HT'], ['150+', '10€ HT'],
                            ].map(([range, price], idx) => (
                              <tr key={idx} className="border-t border-white/5">
                                <td className="py-1.5 text-white/50">{range}</td>
                                <td className="py-1.5 text-right text-white/80 font-medium">{price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                        <span className="text-amber-400 text-xs mt-0.5">💡</span>
                        <span className="text-amber-300/80 text-xs">Frais de mise en place : <strong>160€ HT</strong> (unique, 1ère année uniquement)</span>
                      </div>
                    </div>

                    <p className="mt-4 text-white/40 text-xs italic">
                      Le prix applicable est celui affiché au moment de la souscription et confirmé sur la facture.
                    </p>
                  </div>

                  {/* 8.2 Paiement */}
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">8.2. Paiement</h3>
                    <p>
                      Paiement via Stripe et/ou Bancontact selon disponibilité. Les données bancaires sont traitées par le prestataire de paiement ; l&apos;Éditeur ne conserve pas les données bancaires complètes.
                    </p>
                  </div>

                  {/* 8.3 Facturation */}
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">8.3. Facturation</h3>
                    <p>
                      La facturation est automatique. Des factures (PDF) sont mises à disposition du Client (par exemple via l&apos;espace client ou sur demande).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. Durée – Renouvellement – Résiliation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    9. Durée – Renouvellement – Résiliation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">9.1. Durée</h3>
                    <p>L&apos;Abonnement est conclu pour la durée correspondant à la formule choisie (mensuelle/saisonnière ou annuelle).</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">9.2. Renouvellement</h3>
                    <p>Sauf mention contraire, l&apos;Abonnement se renouvelle automatiquement à chaque échéance pour une durée identique.</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">9.3. Résiliation (préavis 15 jours)</h3>
                    <p className="mb-2">
                      Le Client peut résilier pour la prochaine échéance par simple demande email à{' '}
                      <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a>, 
                      au moins 15 jours avant la date d&apos;échéance.
                    </p>
                    <p>
                      La résiliation prend effet à la fin de la période en cours. Sauf disposition légale impérative ou accord écrit, aucun remboursement n&apos;est dû pour une période déjà commencée.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Incident de paiement */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    10. Incident de paiement – Suspension
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">En cas d&apos;échec de paiement, l&apos;Éditeur peut :</p>
                  <ul className="space-y-2">
                    {['Relancer le Client', 'Suspendre l\'accès aux fonctionnalités payantes après un délai raisonnable', 'Résilier l\'Abonnement en cas de non-régularisation'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-red-400 mt-0.5">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 11. Accès immédiat */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    11. Accès immédiat – Rétractation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Le Service est fourni de manière digitale et peut être exécuté immédiatement après souscription. Le droit de rétractation vise principalement les consommateurs ; le Service étant B2B, il n&apos;a pas vocation à s&apos;appliquer.
                  </p>
                </div>
              </div>
            </div>

            {/* 12. Obligations du Client */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    12. Obligations du Client – Usages interdits
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">Le Client s&apos;engage à :</p>
                  <ul className="space-y-2">
                    {[
                      'Utiliser le Service conformément aux CGVU et à la loi',
                      'Ne pas compromettre la sécurité du Service (intrusion, contournement, surcharge, extraction automatisée non autorisée, etc.)',
                      'Disposer des droits nécessaires sur les Contenus importés (textes, images, marques, etc.)',
                      'Ne pas publier de contenus illicites (diffamation, haine, atteinte à la vie privée, contenus trompeurs, etc.)',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-amber-400 mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 13. Avis / UGC */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">💬</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    13. Avis / UGC (contenus utilisateurs)
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Le Service peut permettre l&apos;affichage/la collecte d&apos;avis. Le Client demeure responsable des contenus publiés via son compte.
                  </p>
                  <p>
                    L&apos;Éditeur se réserve le droit de retirer, masquer ou rendre inaccessible tout contenu manifestement illicite ou contraire aux CGVU, notamment sur signalement.
                  </p>
                </div>
              </div>
            </div>

            {/* 14. Propriété intellectuelle */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">©️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    14. Propriété intellectuelle
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Le Service (logiciel, interface, marque, éléments graphiques, bases de données, documentation) est protégé. Toute reproduction, extraction ou altération non autorisée est interdite.
                  </p>
                  <p>
                    Le Client conserve ses droits sur ses Contenus. Il concède à l&apos;Éditeur une licence non exclusive, mondiale, pour la durée du contrat, strictement nécessaire à l&apos;hébergement, au traitement technique et à l&apos;affichage des Contenus dans le cadre du Service.
                  </p>
                </div>
              </div>
            </div>

            {/* 15. Support */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🛠️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    15. Support – Maintenance – Disponibilité
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">15.1. Support</h3>
                    <p>Support par email. Délai de réponse cible : dans les 24h.</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">15.2. Maintenance / disponibilité</h3>
                    <p>L&apos;Éditeur met en œuvre des moyens raisonnables pour assurer l&apos;accès au Service, sans garantir une disponibilité ininterrompue (maintenance, mises à jour, incidents, force majeure).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 16. Responsabilité */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    16. Responsabilité – Limitation (B2B)
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">16.1. Principe</h3>
                    <p className="mb-2">Le Service est un outil de création/gestion de contenu. L&apos;Éditeur n&apos;est pas responsable :</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5">
                        <span className="text-rose-400 mt-0.5">→</span>
                        <span>De la légalité, exactitude ou conformité des Contenus du Client</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-rose-400 mt-0.5">→</span>
                        <span>Des dommages indirects (perte de chiffre d&apos;affaires, perte d&apos;exploitation, perte de chance, atteinte à l&apos;image), dans les limites permises par le droit belge</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold text-sm mb-2">16.2. Plafond de responsabilité</h3>
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                      <p>
                        La responsabilité totale de l&apos;Éditeur, toutes causes confondues, est limitée au montant effectivement payé par le Client au titre du Service au cours des <strong className="text-white/80">12 derniers mois</strong> précédant l&apos;événement dommageable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 17. RGPD – Cookies */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔐</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    17. Données personnelles – RGPD – Cookies
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Les traitements de données personnelles (identité et coordonnées, données de facturation, logs/IP/cookies, localisation, contenus uploadés, marketing/newsletter, etc.) sont décrits dans la{' '}
                    <Link href="/confidentialite" className="text-pink-400 hover:text-pink-300 transition-colors">Politique de confidentialité</Link> et la{' '}
                    <Link href="/cookies" className="text-pink-400 hover:text-pink-300 transition-colors">Politique cookies</Link> accessibles sur le site / l&apos;application.
                  </p>
                </div>
              </div>
            </div>

            {/* 18-23 : Articles courts groupés */}
            {[
              { num: '18', icon: '🔄', title: 'Modification des CGVU', gradient: 'from-blue-500/10 to-indigo-500/10', iconGradient: 'from-blue-500/20 to-indigo-500/20', content: 'L\'Éditeur peut modifier les CGVU pour des motifs légitimes (évolution légale, sécurité, évolution du Service). Le Client sera informé avant l\'entrée en vigueur. En cas de refus, il peut résilier pour la prochaine échéance.' },
              { num: '19', icon: '📝', title: 'Preuve', gradient: 'from-violet-500/10 to-purple-500/10', iconGradient: 'from-violet-500/20 to-purple-500/20', content: 'Les enregistrements électroniques (logs, historiques de souscription, emails, factures) peuvent valoir preuve, dans les limites du droit applicable.' },
              { num: '20', icon: '🌪️', title: 'Force majeure', gradient: 'from-amber-500/10 to-orange-500/10', iconGradient: 'from-amber-500/20 to-orange-500/20', content: 'Aucune partie ne sera responsable d\'un manquement dû à un événement de force majeure au sens du droit applicable, pendant la durée de cet événement.' },
              { num: '21', icon: '⚖️', title: 'Nullité partielle – Non-renonciation', gradient: 'from-emerald-500/10 to-teal-500/10', iconGradient: 'from-emerald-500/20 to-teal-500/20', content: 'Si une clause est déclarée nulle ou inapplicable, les autres restent en vigueur. Le fait de ne pas se prévaloir d\'un manquement ne vaut pas renonciation.' },
              { num: '22', icon: '🌍', title: 'Langue', gradient: 'from-cyan-500/10 to-blue-500/10', iconGradient: 'from-cyan-500/20 to-blue-500/20', content: 'Les CGVU sont rédigées en français. En cas de traduction, la version française prévaut.' },
            ].map((article) => (
              <div key={article.num} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${article.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`}></div>
                <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${article.iconGradient} border border-white/10 flex items-center justify-center`}>
                      <span className="text-lg">{article.icon}</span>
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {article.num}. {article.title}
                    </h2>
                  </div>
                  <div className="text-white/60 text-sm leading-relaxed">
                    <p>{article.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* 23. Droit applicable */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🏛️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    23. Droit applicable – Juridictions compétentes
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Les CGVU sont soumises au <strong className="text-white/80">droit belge</strong>.
                  </p>
                  <p>
                    Tout litige relatif à leur validité, interprétation ou exécution relèvera des <strong className="text-white/80">tribunaux compétents de Bruxelles</strong>, sauf règle impérative contraire.
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
            <Link href="/confidentialite" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🔐 Confidentialité →
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
            <Link href="/confidentialite" className="text-white/40 hover:text-white/70 text-xs transition-colors">Confidentialité</Link>
            <span className="text-white/20">|</span>
            <Link href="/cgvu" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">CGVU</Link>
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
