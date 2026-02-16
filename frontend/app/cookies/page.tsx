'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

export default function CookiesPage() {
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
            <span className="text-white/60 text-sm font-medium">Mentions légales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Politique de{' '}
            <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Cookies
            </span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Contenu */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">

            {/* Section 1 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📌</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    1. Qu&apos;est-ce qu&apos;un cookie ?
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) 
                    lors de votre visite sur notre site web <strong className="text-white/80">app.myguidedigital.com</strong>.
                  </p>
                  <p>
                    Les cookies permettent au site de mémoriser vos actions et préférences (langue, taille d&apos;affichage, 
                    connexion, etc.) pendant une durée déterminée, afin que vous n&apos;ayez pas à les réintroduire 
                    à chaque visite ou lorsque vous naviguez d&apos;une page à l&apos;autre.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🔒</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    2. Cookies strictement nécessaires
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. 
                    Ils sont généralement activés en réponse à des actions de votre part, comme la configuration 
                    de vos préférences de confidentialité, la connexion à votre compte ou le remplissage de formulaires.
                  </p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mt-3">
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
                          <td className="py-2.5 pr-4">Mémorise votre choix de cookies</td>
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
              </div>
            </div>

            {/* Section 3 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    3. Cookies analytiques
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Ces cookies nous permettent de mesurer l&apos;audience de notre site, de comprendre comment les visiteurs 
                    interagissent avec le contenu et d&apos;identifier les pages les plus populaires. Toutes les données 
                    collectées par ces cookies sont agrégées et anonymisées.
                  </p>
                  <p>
                    Si vous n&apos;autorisez pas ces cookies, nous ne serons pas en mesure d&apos;inclure vos visites 
                    dans nos statistiques.
                  </p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mt-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-white/40 uppercase tracking-wider">
                          <th className="text-left py-2 pr-4">Cookie</th>
                          <th className="text-left py-2 pr-4">Fournisseur</th>
                          <th className="text-left py-2">Durée</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/60">
                        <tr className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-mono text-primary/80">_ga</td>
                          <td className="py-2.5 pr-4">Google Analytics</td>
                          <td className="py-2.5">2 ans</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-mono text-primary/80">_ga_*</td>
                          <td className="py-2.5 pr-4">Google Analytics</td>
                          <td className="py-2.5">2 ans</td>
                        </tr>
                        <tr className="border-t border-white/5">
                          <td className="py-2.5 pr-4 font-mono text-primary/80">_gid</td>
                          <td className="py-2.5 pr-4">Google Analytics</td>
                          <td className="py-2.5">24 heures</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">📢</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    4. Cookies marketing
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Ces cookies sont utilisés pour diffuser des publicités pertinentes en fonction de vos centres d&apos;intérêt. 
                    Ils servent également à limiter le nombre d&apos;affichages d&apos;une même publicité et à mesurer l&apos;efficacité 
                    d&apos;une campagne publicitaire.
                  </p>
                  <p>
                    Si vous n&apos;autorisez pas ces cookies, vous continuerez à voir des publicités mais elles seront 
                    moins pertinentes.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚙️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    5. Gérer vos préférences de cookies
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Vous pouvez à tout moment modifier vos préférences en matière de cookies en cliquant sur le bouton 
                    ci-dessous. Vous pouvez également configurer votre navigateur pour refuser les cookies ou être 
                    averti lorsqu&apos;un cookie est envoyé.
                  </p>
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

            {/* Section 6 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">⚖️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    6. Base légale et réglementation
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Conformément au <strong className="text-white/80">Règlement Général sur la Protection des Données (RGPD)</strong> 
                    et à la <strong className="text-white/80">directive ePrivacy</strong>, nous vous informons de l&apos;utilisation 
                    de cookies sur notre site et recueillons votre consentement préalable pour les cookies non essentiels.
                  </p>
                  <p>
                    Votre consentement est valable pour une durée de <strong className="text-white/80">12 mois</strong>. 
                    Passé ce délai, le bandeau cookies vous sera de nouveau présenté.
                  </p>
                  <p>
                    Pour toute question relative aux cookies ou à la protection de vos données personnelles, vous pouvez 
                    nous contacter :
                  </p>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📧</span>
                      <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors text-sm">
                        info@gims-consulting.be
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">📍</span>
                      <span className="text-white/60 text-sm">Avenue Louise 143/4, 1050 Bruxelles, Belgique</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">📞</span>
                      <a href="tel:+32476342364" className="text-pink-400 hover:text-pink-300 transition-colors text-sm">
                        +32 476 34 23 64
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7 - Droits */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    7. Vos droits
                  </h2>
                </div>
                <div className="text-white/60 text-sm leading-relaxed space-y-3">
                  <p>
                    Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {[
                      { icon: '👁️', title: 'Droit d\'accès', desc: 'Accéder aux données que nous détenons sur vous' },
                      { icon: '✏️', title: 'Droit de rectification', desc: 'Corriger vos données inexactes ou incomplètes' },
                      { icon: '🗑️', title: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données' },
                      { icon: '⏸️', title: 'Droit à la limitation', desc: 'Restreindre le traitement de vos données' },
                      { icon: '📤', title: 'Droit à la portabilité', desc: 'Récupérer vos données dans un format structuré' },
                      { icon: '✋', title: 'Droit d\'opposition', desc: 'Vous opposer au traitement de vos données' },
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
                    Vous pouvez exercer ces droits en nous contactant à{' '}
                    <a href="mailto:info@gims-consulting.be" className="text-pink-400 hover:text-pink-300 transition-colors">
                      info@gims-consulting.be
                    </a>
                    . Vous disposez également du droit d&apos;introduire une réclamation auprès de l&apos;
                    <strong className="text-white/80">Autorité de Protection des Données (APD)</strong> belge.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer simple */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-sm">
            © {new Date().getFullYear()} My Guide Digital — GIMS Consulting SPRL — Avenue Louise 143/4, 1050 Bruxelles
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              Accueil
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              Contact
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/cookies" className="text-pink-400/60 hover:text-pink-400 text-xs transition-colors">
              Politique de cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
