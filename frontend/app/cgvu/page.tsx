'use client';

import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function CGVUPage() {
  const { t } = useTranslation();

  const definitions = [
    { termKey: 's2d1Term', defKey: 's2d1Def' },
    { termKey: 's2d2Term', defKey: 's2d2Def' },
    { termKey: 's2d3Term', defKey: 's2d3Def' },
    { termKey: 's2d4Term', defKey: 's2d4Def' },
    { termKey: 's2d5Term', defKey: 's2d5Def' },
    { termKey: 's2d6Term', defKey: 's2d6Def' },
  ];

  const hotelPricing = [
    { range: '5–9', price: '19€ HT' },
    { range: '10–19', price: '17€ HT' },
    { range: '20–29', price: '15€ HT' },
    { range: '30–49', price: '13€ HT' },
    { range: '50–74', price: '11€ HT' },
    { range: '75–99', price: '10€ HT' },
    { range: '100–149', price: '9€ HT' },
    { range: '150–199', price: '8€ HT' },
    { range: '200–299', price: '7€ HT' },
    { range: '300–399', price: '6€ HT' },
    { range: '400+', price: '5€ HT' },
  ];

  const campingPricing = [
    { range: '5–9', price: '39€ HT' },
    { range: '10–29', price: '33€ HT' },
    { range: '30–49', price: '27€ HT' },
    { range: '50–74', price: '22€ HT' },
    { range: '75–99', price: '18€ HT' },
    { range: '100–149', price: '14€ HT' },
    { range: '150+', price: '10€ HT' },
  ];

  // Helper to render a simple section with title + text
  const renderSection = (num: string, titleKey: string, textKey: string, gradient: string, icon?: string) => (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`}></div>
      <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} border border-white/10 flex items-center justify-center`}>
            <span className="text-lg">{icon || num}</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
            {t(`cgvuPage.${titleKey}`)}
          </h2>
        </div>
        <div className="text-white/60 text-sm leading-relaxed">
          <p>{t(`cgvuPage.${textKey}`)}</p>
        </div>
      </div>
    </div>
  );

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
              {t('legalPage.backHome')}
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
            <span className="text-white/60 text-sm font-medium">{t('cgvuPage.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {t('cgvuPage.title1')}{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('cgvuPage.title2')}
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">My Guide Digital</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">{t('cgvuPage.version')}</span>
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
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s1Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('cgvuPage.s1Intro')}</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <p className="text-white/80 font-semibold">Gims Consulting SRL</p>
                    <p>Avenue Louise 143/4, 1050 Bruxelles, Belgique — <strong className="text-white/80">BE0848903319</strong></p>
                    <p>Email : <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a></p>
                  </div>
                  <p className="text-white/40 text-xs">{t('cgvuPage.s1Host')} Hostinger France</p>
                </div>
              </div>
            </div>

            {/* 2. Définitions */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s2Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <div className="space-y-3">
                    {definitions.map((def, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <span className="text-blue-400 font-bold mt-0.5">•</span>
                        <div>
                          <p className="text-white/80 text-xs font-semibold">{t(`cgvuPage.${def.termKey}`)}</p>
                          <p className="text-white/40 text-xs mt-0.5">{t(`cgvuPage.${def.defKey}`)}</p>
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
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s3Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('cgvuPage.s3Intro')}</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5"><span className="text-emerald-400 mt-0.5">✓</span><span>{t('cgvuPage.s3i1')}</span></li>
                    <li className="flex items-start gap-2.5"><span className="text-emerald-400 mt-0.5">✓</span><span>{t('cgvuPage.s3i2')}</span></li>
                  </ul>
                  <p>{t('cgvuPage.s3Text')}</p>
                </div>
              </div>
            </div>

            {/* 4. Acceptation */}
            {renderSection('4️⃣', 's4Title', 's4Text', 'from-violet-500/10 to-purple-500/10')}

            {/* 5. Création de compte */}
            {renderSection('5️⃣', 's5Title', 's5Text', 'from-amber-500/10 to-orange-500/10')}

            {/* 6. Description du Service */}
            {renderSection('6️⃣', 's6Title', 's6Text', 'from-cyan-500/10 to-blue-500/10')}

            {/* 7. Période d'essai */}
            {renderSection('7️⃣', 's7Title', 's7Text', 'from-rose-500/10 to-pink-500/10')}

            {/* 8. Offres – Prix – Paiement – Facturation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">8️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s8Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-6">
                  {/* 8.1 Prix */}
                  <div>
                    <h3 className="text-white/80 font-semibold mb-2">{t('cgvuPage.s8_1Title')}</h3>
                    <p className="mb-4">{t('cgvuPage.s8_1Intro')}</p>

                    {/* A - Hôtes */}
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mb-4">
                      <h4 className="text-white/80 font-semibold text-sm mb-1">
                        {t('cgvuPage.s8_1aTitle')}{' '}
                        <span className="text-white/40 font-normal">{t('cgvuPage.s8_1aSubtitle')}</span>
                      </h4>
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-pink-500/5 border border-primary/10 rounded-lg px-4 py-2">
                          <span className="text-white/70">{t('cgvuPage.s8_1aAnnual')}</span>
                          <span className="text-primary font-bold">{t('cgvuPage.s8_1aAnnualPrice')} <span className="text-white/40 font-normal text-xs">{t('cgvuPage.s8_1aAnnualNote')}</span></span>
                        </div>
                        <p className="text-white/50 text-xs mt-2">{t('cgvuPage.s8_1aSeasonal')}</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 text-center">
                            <p className="text-white/50 text-xs">{t('cgvuPage.s8_1a1m')}</p>
                            <p className="text-white/80 font-semibold">9,90€</p>
                          </div>
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 text-center">
                            <p className="text-white/50 text-xs">{t('cgvuPage.s8_1a2m')}</p>
                            <p className="text-white/80 font-semibold">14,90€</p>
                          </div>
                          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 text-center">
                            <p className="text-white/50 text-xs">{t('cgvuPage.s8_1a3m')}</p>
                            <p className="text-white/80 font-semibold">19,90€</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* B - Hôtels */}
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mb-4">
                      <h4 className="text-white/80 font-semibold text-sm mb-1">
                        {t('cgvuPage.s8_1bTitle')}{' '}
                        <span className="text-white/40 font-normal">{t('cgvuPage.s8_1bSubtitle')}</span>
                      </h4>
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left text-white/50 pb-2 pr-4">{t('cgvuPage.s8_1bRooms')}</th>
                              <th className="text-right text-white/50 pb-2">{t('cgvuPage.s8_1bPrice')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hotelPricing.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/[0.04]">
                                <td className="py-1.5 text-white/60">{row.range}</td>
                                <td className="py-1.5 text-right text-white/80 font-medium">{row.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* C - Campings */}
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 mb-4">
                      <h4 className="text-white/80 font-semibold text-sm mb-1">
                        {t('cgvuPage.s8_1cTitle')}{' '}
                        <span className="text-white/40 font-normal">{t('cgvuPage.s8_1cSubtitle')}</span>
                      </h4>
                      <div className="overflow-x-auto mt-3">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left text-white/50 pb-2 pr-4">{t('cgvuPage.s8_1cPitches')}</th>
                              <th className="text-right text-white/50 pb-2">{t('cgvuPage.s8_1cPrice')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campingPricing.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/[0.04]">
                                <td className="py-1.5 text-white/60">{row.range}</td>
                                <td className="py-1.5 text-right text-white/80 font-medium">{row.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-2 mt-3">
                        <span className="text-white/70">{t('cgvuPage.s8_1cSetup')}</span>
                        <span className="text-amber-400 font-bold">{t('cgvuPage.s8_1cSetupPrice')} <span className="text-white/40 font-normal text-xs">{t('cgvuPage.s8_1cSetupNote')}</span></span>
                      </div>
                    </div>

                    <p className="text-white/40 text-xs italic">{t('cgvuPage.s8_1Note')}</p>
                  </div>

                  {/* 8.2 Paiement */}
                  <div>
                    <h3 className="text-white/80 font-semibold mb-2">{t('cgvuPage.s8_2Title')}</h3>
                    <p>{t('cgvuPage.s8_2Text')}</p>
                  </div>

                  {/* 8.3 Facturation */}
                  <div>
                    <h3 className="text-white/80 font-semibold mb-2">{t('cgvuPage.s8_3Title')}</h3>
                    <p>{t('cgvuPage.s8_3Text')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. Durée – Renouvellement – Résiliation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">9️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s9Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s9_1Title')}</h3>
                    <p>{t('cgvuPage.s9_1Text')}</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s9_2Title')}</h3>
                    <p>{t('cgvuPage.s9_2Text')}</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s9_3Title')}</h3>
                    <p>
                      {t('cgvuPage.s9_3Text1')}{' '}
                      <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a>
                      {t('cgvuPage.s9_3Text1b')}
                    </p>
                    <p className="mt-2">{t('cgvuPage.s9_3Text2')}</p>
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
                    <span className="text-lg">🔟</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s10Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">{t('cgvuPage.s10Intro')}</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">→</span><span>{t('cgvuPage.s10i1')}</span></li>
                    <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">→</span><span>{t('cgvuPage.s10i2')}</span></li>
                    <li className="flex items-start gap-2.5"><span className="text-red-400 mt-0.5">→</span><span>{t('cgvuPage.s10i3')}</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 11. Accès immédiat */}
            {renderSection('⚡', 's11Title', 's11Text', 'from-emerald-500/10 to-teal-500/10')}

            {/* 12. Obligations du Client */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s12Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">{t('cgvuPage.s12Intro')}</p>
                  <ul className="space-y-2">
                    {['s12i1', 's12i2', 's12i3', 's12i4'].map((key, idx) => (
                      <li key={idx} className="flex items-start gap-2.5"><span className="text-violet-400 mt-0.5">✓</span><span>{t(`cgvuPage.${key}`)}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 13. Avis / UGC */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">💬</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s13Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('cgvuPage.s13Text1')}</p>
                  <p>{t('cgvuPage.s13Text2')}</p>
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
                    {t('cgvuPage.s14Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('cgvuPage.s14Text1')}</p>
                  <p>{t('cgvuPage.s14Text2')}</p>
                </div>
              </div>
            </div>

            {/* 15. Support – Maintenance – Disponibilité */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🛠️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s15Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s15_1Title')}</h3>
                    <p>{t('cgvuPage.s15_1Text')}</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s15_2Title')}</h3>
                    <p>{t('cgvuPage.s15_2Text')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 16. Responsabilité */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚖️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s16Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s16_1Title')}</h3>
                    <p className="mb-2">{t('cgvuPage.s16_1Intro')}</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">•</span><span>{t('cgvuPage.s16_1i1')}</span></li>
                      <li className="flex items-start gap-2.5"><span className="text-primary mt-0.5">•</span><span>{t('cgvuPage.s16_1i2')}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-semibold mb-1">{t('cgvuPage.s16_2Title')}</h3>
                    <p>{t('cgvuPage.s16_2Text')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 17. Données personnelles */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔐</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s17Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    {t('cgvuPage.s17Text1')}{' '}
                    <Link href="/confidentialite" className="text-pink-400 hover:text-pink-300 transition-colors">{t('legalPage.linkConfidentiality')}</Link>{' '}
                    {t('cgvuPage.s17Text2')}{' '}
                    <Link href="/cookies" className="text-pink-400 hover:text-pink-300 transition-colors">{t('legalPage.linkCookies')}</Link>{' '}
                    {t('cgvuPage.s17Text3')}
                  </p>
                </div>
              </div>
            </div>

            {/* 18-22. Sections restantes */}
            {[
              { num: '18', titleKey: 'a18Title', textKey: 'a18Content', gradient: 'from-violet-500/10 to-purple-500/10', icon: '📝' },
              { num: '19', titleKey: 'a19Title', textKey: 'a19Content', gradient: 'from-amber-500/10 to-orange-500/10', icon: '📄' },
              { num: '20', titleKey: 'a20Title', textKey: 'a20Content', gradient: 'from-cyan-500/10 to-blue-500/10', icon: '🌪️' },
              { num: '21', titleKey: 'a21Title', textKey: 'a21Content', gradient: 'from-rose-500/10 to-pink-500/10', icon: '🔗' },
              { num: '22', titleKey: 'a22Title', textKey: 'a22Content', gradient: 'from-blue-500/10 to-indigo-500/10', icon: '🌐' },
            ].map((section, idx) => (
              <div key={idx}>
                {renderSection(section.icon, section.titleKey, section.textKey, section.gradient)}
              </div>
            ))}

            {/* 23. Droit applicable */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🏛️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cgvuPage.s23Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    {t('cgvuPage.s23Text1')}{' '}
                    <strong className="text-white/80">{t('cgvuPage.s23Law')}</strong>.{' '}
                    {t('cgvuPage.s23Text2')}{' '}
                    <strong className="text-white/80">{t('cgvuPage.s23Court')}</strong>
                    {t('cgvuPage.s23Text3')}
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
                ⚖️ {t('legalPage.linkLegal')} →
              </span>
            </Link>
            <Link href="/confidentialite" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🔐 {t('legalPage.linkConfidentiality')} →
              </span>
            </Link>
            <Link href="/cookies" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🍪 {t('legalPage.linkCookies')} →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-sm">
            © {new Date().getFullYear()} {t('legalPage.footerCopyright')}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <Link href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.footerHome')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/mentions-legales" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkLegal')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/confidentialite" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkConfidentiality')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/cgvu" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">CGVU</Link>
            <span className="text-white/20">|</span>
            <Link href="/cookies" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkCookies')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkContact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
