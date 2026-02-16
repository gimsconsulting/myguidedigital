'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function CookiesPage() {
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

  const cookieTable = [
    { cookieKey: 's2aCookie1', purposeKey: 's2aPurpose1', durationKey: 's2aDuration1' },
    { cookieKey: 's2aCookie2', purposeKey: 's2aPurpose2', durationKey: 's2aDuration2' },
    { cookieKey: 's2aCookie3', purposeKey: 's2aPurpose3', durationKey: 's2aDuration3' },
    { cookieKey: 's2aCookie4', purposeKey: 's2aPurpose4', durationKey: 's2aDuration4' },
  ];

  const browsers = [
    { nameKey: 's3Chrome', pathKey: 's3ChromePath', icon: '🌐' },
    { nameKey: 's3Firefox', pathKey: 's3FirefoxPath', icon: '🦊' },
    { nameKey: 's3Safari', pathKey: 's3SafariPath', icon: '🧭' },
    { nameKey: 's3Edge', pathKey: 's3EdgePath', icon: '🔷' },
  ];

  const handleResetCookieConsent = () => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-preferences');
    window.location.reload();
  };

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
            <span>🍪</span>
            <span className="text-white/60 text-sm font-medium">{t('cookiePage.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {t('cookiePage.title1')}{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('cookiePage.title2')}
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">My Guide Digital</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">{t('cookiePage.version')}</span>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* 1. Définition */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cookiePage.s1Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>{t('cookiePage.s1Text')}</p>
                </div>
              </div>
            </div>

            {/* 2. Cookies utilisés */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cookiePage.s2Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-6">

                  {/* A - Cookies nécessaires */}
                  <div>
                    <h3 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      {t('cookiePage.s2aTitle')}
                    </h3>
                    <p className="mb-3">{t('cookiePage.s2aText')}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/50 pb-2 pr-4">{t('cookiePage.s2aThCookie')}</th>
                            <th className="text-left text-white/50 pb-2 pr-4">{t('cookiePage.s2aThPurpose')}</th>
                            <th className="text-right text-white/50 pb-2">{t('cookiePage.s2aThDuration')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cookieTable.map((row, idx) => (
                            <tr key={idx} className="border-b border-white/[0.04]">
                              <td className="py-2 pr-4">
                                <code className="bg-white/[0.05] border border-white/[0.08] rounded px-1.5 py-0.5 text-pink-400 text-[10px]">
                                  {t(`cookiePage.${row.cookieKey}`)}
                                </code>
                              </td>
                              <td className="py-2 pr-4 text-white/60">{t(`cookiePage.${row.purposeKey}`)}</td>
                              <td className="py-2 text-right text-white/80 font-medium">{t(`cookiePage.${row.durationKey}`)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-white/40 text-xs italic mt-3">{t('cookiePage.s2aNote')}</p>
                  </div>

                  {/* B - Analytics */}
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <h3 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-blue-400">📊</span>
                      {t('cookiePage.s2bTitle')}
                    </h3>
                    <p>
                      {t('cookiePage.s2bText1')}{' '}
                      <strong className="text-emerald-400">{t('cookiePage.s2bText1b')}</strong>.
                    </p>
                    <p className="mt-2">{t('cookiePage.s2bText2')}</p>
                  </div>

                  {/* C - Marketing */}
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <h3 className="text-white/80 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-amber-400">📢</span>
                      {t('cookiePage.s2cTitle')}
                    </h3>
                    <p>
                      {t('cookiePage.s2cText1')}{' '}
                      <strong className="text-emerald-400">{t('cookiePage.s2cText1b')}</strong>.
                    </p>
                    <p className="mt-2">{t('cookiePage.s2cText2')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Gestion des cookies */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cookiePage.s3Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-4">
                  <p>{t('cookiePage.s3Text')}</p>

                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                    <p className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">⚠️</span>
                      <span>{t('cookiePage.s3Warning')}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleResetCookieConsent}
                    className="group/btn relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-500 rounded-xl opacity-80 group-hover/btn:opacity-100 transition-opacity"></div>
                    <span className="relative text-white font-medium text-sm">🍪 {t('cookiePage.s3Button')}</span>
                  </button>

                  <div className="mt-4">
                    <p className="text-white/80 font-semibold text-xs mb-3">{t('cookiePage.s3BrowserTitle')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {browsers.map((browser, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{browser.icon}</span>
                            <p className="text-white/80 text-xs font-semibold">{t(`cookiePage.${browser.nameKey}`)}</p>
                          </div>
                          <p className="text-white/40 text-xs">{t(`cookiePage.${browser.pathKey}`)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Durée de conservation */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">4️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cookiePage.s4Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                      <span className="text-base mt-0.5">⏳</span>
                      <div>
                        <p className="text-white/80 text-xs font-semibold">{t('cookiePage.s4SessionTitle')}</p>
                        <p className="text-white/40 text-xs mt-0.5">{t('cookiePage.s4SessionDesc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                      <span className="text-base mt-0.5">📌</span>
                      <div>
                        <p className="text-white/80 text-xs font-semibold">{t('cookiePage.s4PersistentTitle')}</p>
                        <p className="text-white/40 text-xs mt-0.5">{t('cookiePage.s4PersistentDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Contact */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">5️⃣</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('cookiePage.s5Title')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p className="mb-3">{t('cookiePage.s5Text')}</p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                    <p className="text-white/80 font-semibold">Gims Consulting SRL</p>
                    <p>Avenue Louise 143/4, 1050 Bruxelles</p>
                    <p>
                      Email :{' '}
                      <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">
                        info@gims-consulting.be
                      </a>
                    </p>
                  </div>
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
            <Link href="/cgvu" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                📜 {t('legalPage.linkCGVU')} →
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
            <Link href="/cgvu" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkCGVU')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/cookies" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">{t('legalPage.linkCookies')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkContact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
