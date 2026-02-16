'use client';

import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export default function MentionsLegalesPage() {
  const { t } = useTranslation();

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
            <span>⚖️</span>
            <span className="text-white/60 text-sm font-medium">{t('legalPage.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {t('legalPage.title1')}{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('legalPage.title2')}
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
            My Guide Digital
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">{t('legalPage.version')}</span>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* Éditeur du site */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🏢</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('legalPage.editorTitle')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-2.5">
                    <p className="text-white/80 font-semibold text-base">{t('legalPage.editorCompany')}</p>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{t('legalPage.editorAddress')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏛️</span>
                      <span>{t('legalPage.editorVAT')} <strong className="text-white/80">BE0848903319</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">
                        info@gims-consulting.be
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>{t('legalPage.editorRepresentative')} <strong className="text-white/80">{t('legalPage.editorRepName')}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hébergement */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🌐</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('legalPage.hostingTitle')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    {t('legalPage.hostingText')} <strong className="text-white/80">{t('legalPage.hostingProvider')}</strong>.
                  </p>
                  <p>
                    {t('legalPage.hostingContact')} <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">info@gims-consulting.be</a>
                  </p>
                  <p className="text-white/40 text-xs italic">
                    {t('legalPage.hostingNote')}
                  </p>
                </div>
              </div>
            </div>

            {/* Propriété intellectuelle */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">©️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('legalPage.ipTitle')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('legalPage.ipText1')}</p>
                  <p>{t('legalPage.ipText2')}</p>
                </div>
              </div>
            </div>

            {/* Responsabilité */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('legalPage.responsibilityTitle')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>{t('legalPage.responsibilityText')}</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📬</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {t('legalPage.contactTitle')}
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    {t('legalPage.contactText')}{' '}
                    <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors font-medium">
                      info@gims-consulting.be
                    </a>
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Liens vers les autres pages légales */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/confidentialite" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🔐 {t('legalPage.linkPrivacy')} →
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
            <Link href="/mentions-legales" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">{t('legalPage.linkLegal')}</Link>
            <span className="text-white/20">|</span>
            <Link href="/confidentialite" className="text-white/40 hover:text-white/70 text-xs transition-colors">{t('legalPage.linkConfidentiality')}</Link>
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
