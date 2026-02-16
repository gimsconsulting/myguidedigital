'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function ConfidentialitePage() {
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const dataTypes = [
    { icon: '👤', titleKey: 's2d1Title', descKey: 's2d1Desc', gradient: 'from-primary/20 to-pink-500/20' },
    { icon: '📋', titleKey: 's2d2Title', descKey: 's2d2Desc', gradient: 'from-blue-500/20 to-indigo-500/20' },
    { icon: '💳', titleKey: 's2d3Title', descKey: 's2d3Desc', gradient: 'from-emerald-500/20 to-teal-500/20' },
    { icon: '📍', titleKey: 's2d4Title', descKey: 's2d4Desc', gradient: 'from-amber-500/20 to-orange-500/20' },
    { icon: '📝', titleKey: 's2d5Title', descKey: 's2d5Desc', gradient: 'from-violet-500/20 to-purple-500/20' },
  ];

  const purposes = ['s3i1', 's3i2', 's3i3', 's3i4', 's3i5', 's3i6'];

  const legalBases = [
    { titleKey: 's4b1Title', descKey: 's4b1Desc', color: 'from-primary to-pink-500' },
    { titleKey: 's4b2Title', descKey: 's4b2Desc', color: 'from-emerald-500 to-teal-500' },
    { titleKey: 's4b3Title', descKey: 's4b3Desc', color: 'from-blue-500 to-indigo-500' },
    { titleKey: 's4b4Title', descKey: 's4b4Desc', color: 'from-amber-500 to-orange-500' },
  ];

  const recipients = ['s5i1', 's5i2', 's5i3', 's5i4'];

  const retentionPeriods = [
    { icon: '👤', labelKey: 's7d1Label', valueKey: 's7d1Value' },
    { icon: '📋', labelKey: 's7d2Label', valueKey: 's7d2Value' },
    { icon: '📧', labelKey: 's7d3Label', valueKey: 's7d3Value' },
    { icon: '🧾', labelKey: 's7d4Label', valueKey: 's7d4Value' },
  ];

  const rights = [
    { icon: '👁️', titleKey: 's9r1Title', descKey: 's9r1Desc' },
    { icon: '✏️', titleKey: 's9r2Title', descKey: 's9r2Desc' },
    { icon: '🗑️', titleKey: 's9r3Title', descKey: 's9r3Desc' },
    { icon: '⏸️', titleKey: 's9r4Title', descKey: 's9r4Desc' },
    { icon: '✋', titleKey: 's9r5Title', descKey: 's9r5Desc' },
    { icon: '📤', titleKey: 's9r6Title', descKey: 's9r6Desc' },
    { icon: '🔄', titleKey: 's9r7Title', descKey: 's9r7Desc' },
  ];

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
            <span>🔐</span>
            <span className="text-white/60 text-sm font-medium">{t('privacyPage.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {t('privacyPage.title1')}{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('privacyPage.title2')}
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">My Guide Digital</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">{t('privacyPage.version')}</span>
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
                    {t('privacyPage.s1Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('privacyPage.s1Text')}</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <p className="text-white/80 font-semibold">Gims Consulting SRL</p>
                    <p>Avenue Louise 143/4, 1050 Bruxelles, Belgique — <strong className="text-white/80">BE0848903319</strong></p>
                    <p>Email : <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a></p>
                  </div>
                  <p className="text-white/40 text-xs italic">{t('privacyPage.s1Note')}</p>
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
                    {t('privacyPage.s2Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('privacyPage.s2Intro')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dataTypes.map((item, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} border border-white/10 flex items-center justify-center`}>
                            <span className="text-sm">{item.icon}</span>
                          </div>
                          <p className="text-white/80 text-xs font-semibold">{t(`privacyPage.${item.titleKey}`)}</p>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{t(`privacyPage.${item.descKey}`)}</p>
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
                    {t('privacyPage.s3Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">{t('privacyPage.s3Intro')}</p>
                  <ul className="space-y-2.5">
                    {purposes.map((key, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{t(`privacyPage.${key}`)}</span>
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
                    {t('privacyPage.s4Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {legalBases.map((item, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`}></div>
                          <p className="text-white/80 text-xs font-semibold">{t(`privacyPage.${item.titleKey}`)}</p>
                        </div>
                        <p className="text-white/40 text-xs leading-relaxed">{t(`privacyPage.${item.descKey}`)}</p>
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
                    {t('privacyPage.s5Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">{t('privacyPage.s5Intro')}</p>
                  <ul className="space-y-2.5">
                    {recipients.map((key, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-amber-400 mt-0.5">→</span>
                        <span>{t(`privacyPage.${key}`)}</span>
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
                    {t('privacyPage.s6Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>{t('privacyPage.s6Text')}</p>
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
                    {t('privacyPage.s7Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-4">{t('privacyPage.s7Intro')}</p>
                  <div className="space-y-3">
                    {retentionPeriods.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <span className="text-base mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-white/80 text-xs font-semibold">{t(`privacyPage.${item.labelKey}`)}</p>
                          <p className="text-white/40 text-xs mt-0.5">{t(`privacyPage.${item.valueKey}`)}</p>
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
                    {t('privacyPage.s8Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>{t('privacyPage.s8Text')}</p>
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
                    {t('privacyPage.s9Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('privacyPage.s9Intro')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rights.map((right, idx) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{right.icon}</span>
                          <p className="text-white/80 text-xs font-semibold">{t(`privacyPage.${right.titleKey}`)}</p>
                        </div>
                        <p className="text-white/40 text-xs">{t(`privacyPage.${right.descKey}`)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3">
                    {t('privacyPage.s9Contact')}{' '}
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
                    {t('privacyPage.s10Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('privacyPage.s10Intro')}</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{t('privacyPage.s10Address')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <a href="mailto:contact@apd-gba.be" className="text-pink-400 hover:text-pink-300 transition-colors">contact@apd-gba.be</a>
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
                    {t('privacyPage.s11Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('privacyPage.s11Text1')}</p>
                  <p>
                    {t('privacyPage.s11Text2')}{' '}
                    <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a>.
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
                    {t('privacyPage.s12Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>{t('privacyPage.s12Text')}</p>
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
            <Link href="/cgvu" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                📜 {t('legalPage.linkCGVU')} →
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
            <Link href="/confidentialite" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">{t('legalPage.linkConfidentiality')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/cgvu" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkCGVU')}</Link>
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
