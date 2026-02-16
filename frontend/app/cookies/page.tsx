'use client';

import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';

export default function CookiesPage() {
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
            <span>🍪</span>
            <span className="text-white/60 text-sm font-medium">Gestion des cookies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Politique{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Cookies
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

            {/* 1. Définition */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📌</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    1. Définition
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Un cookie est un fichier texte enregistré sur ton terminal lors de la consultation d&apos;un site ou de 
                    l&apos;utilisation d&apos;une application web. Il peut servir à mémoriser une session ou des préférences.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Cookies utilisés */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔍</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    2. Cookies utilisés par My Guide Digital
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-6">

                  {/* A) Cookies strictement nécessaires */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs">🔒</span>
                      </div>
                      <h3 className="text-white/80 font-semibold text-sm">A) Cookies strictement nécessaires (obligatoires)</h3>
                    </div>
                    <p className="mb-3">
                      Ils sont indispensables au fonctionnement du Service : authentification, gestion de session, 
                      sécurité, préférences essentielles.
                    </p>
                    <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                      <span className="text-emerald-400 text-xs mt-0.5">➡️</span>
                      <span className="text-emerald-300/80 text-xs">Ces cookies sont déposés sans consentement car ils sont nécessaires.</span>
                    </div>
                    <div className="mt-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-white/40 uppercase tracking-wider">
                            <th className="text-left py-2 pr-4">Cookie</th>
                            <th className="text-left py-2 pr-4">Finalité</th>
                            <th className="text-left py-2">Durée</th>
                          </tr>
                        </thead>
                        <tbody className="text-white/60">
                          <tr className="border-t border-white/5">
                            <td className="py-2.5 pr-4 font-mono text-primary/80">cookie-consent</td>
                            <td className="py-2.5 pr-4">Mémorise ton choix de cookies</td>
                            <td className="py-2.5">12 mois</td>
                          </tr>
                          <tr className="border-t border-white/5">
                            <td className="py-2.5 pr-4 font-mono text-primary/80">auth-token</td>
                            <td className="py-2.5 pr-4">Authentification et session utilisateur</td>
                            <td className="py-2.5">Session</td>
                          </tr>
                          <tr className="border-t border-white/5">
                            <td className="py-2.5 pr-4 font-mono text-primary/80">i18nextLng</td>
                            <td className="py-2.5 pr-4">Préférence de langue de l&apos;interface</td>
                            <td className="py-2.5">12 mois</td>
                          </tr>
                          <tr className="border-t border-white/5">
                            <td className="py-2.5 pr-4 font-mono text-primary/80">csrf-token</td>
                            <td className="py-2.5 pr-4">Protection contre les attaques CSRF</td>
                            <td className="py-2.5">Session</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* B) Mesure d'audience */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-xs">📊</span>
                      </div>
                      <h3 className="text-white/80 font-semibold text-sm">B) Mesure d&apos;audience / analytics</h3>
                    </div>
                    <p className="mb-2">
                      My Guide Digital <strong className="text-white/80">ne dépose pas de cookies analytics</strong>.
                    </p>
                    <p>
                      Nous utilisons uniquement des logs serveurs (journaux techniques) à des fins de sécurité, 
                      maintenance et amélioration du Service.
                    </p>
                  </div>

                  {/* C) Cookies marketing */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center">
                        <span className="text-xs">📢</span>
                      </div>
                      <h3 className="text-white/80 font-semibold text-sm">C) Cookies marketing</h3>
                    </div>
                    <p>
                      À ce jour, My Guide Digital <strong className="text-white/80">ne dépose pas de cookies marketing</strong>. 
                      Si cela devait changer, une information et, le cas échéant, un recueil de consentement seraient 
                      mis en place avant activation.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* 3. Gestion des cookies */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚙️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    3. Gestion des cookies
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Tu peux gérer les cookies via les paramètres de ton navigateur (suppression/blocage).
                  </p>
                  <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                    <span className="text-amber-400 text-xs mt-0.5">⚠️</span>
                    <span className="text-amber-300/80 text-xs">
                      Attention : bloquer certains cookies nécessaires peut empêcher le bon fonctionnement de l&apos;application.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('cookie-consent');
                      window.location.reload();
                    }}
                    className="relative group/btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                    <span className="relative">🍪 Modifier mes préférences de cookies</span>
                  </button>
                  <div className="mt-4 space-y-2">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Configuration par navigateur :</p>
                    <ul className="text-white/50 text-xs space-y-1.5">
                      <li>• <strong className="text-white/70">Chrome</strong> : Paramètres → Confidentialité et sécurité → Cookies</li>
                      <li>• <strong className="text-white/70">Firefox</strong> : Options → Vie privée et sécurité → Cookies</li>
                      <li>• <strong className="text-white/70">Safari</strong> : Préférences → Confidentialité → Cookies</li>
                      <li>• <strong className="text-white/70">Edge</strong> : Paramètres → Cookies et autorisations de site</li>
                    </ul>
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
                    <span className="text-lg">⏱️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    4. Durée de conservation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                      <span className="text-base mt-0.5">🔄</span>
                      <div>
                        <p className="text-white/80 text-xs font-semibold">Cookies de session</p>
                        <p className="text-white/40 text-xs mt-0.5">Supprimés à la fermeture du navigateur</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                      <span className="text-base mt-0.5">💾</span>
                      <div>
                        <p className="text-white/80 text-xs font-semibold">Cookies nécessaires persistants (si utilisés)</p>
                        <p className="text-white/40 text-xs mt-0.5">Conservés pour une durée proportionnée à leur finalité</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Contact */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📬</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    5. Contact
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed">
                  <p>
                    Pour toute question :{' '}
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
            <Link href="/mentions-legales" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                ⚖️ Mentions légales →
              </span>
            </Link>
            <Link href="/confidentialite" className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-white/[0.03] border border-white/[0.06] rounded-xl group-hover:border-white/10 transition-all"></div>
              <span className="relative text-sm font-medium bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🔐 Politique de confidentialité →
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
            <Link href="/cookies" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">Cookies</Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="text-white/40 hover:text-white/70 text-xs transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
