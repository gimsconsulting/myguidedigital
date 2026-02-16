'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import api from '@/lib/api';

export default function ContactPage() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      await api.post('/contact', formData);
      setFormStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Erreur envoi formulaire de contact:', error);
      setFormStatus('error');
    }
  };

  const contactCards = [
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email',
      value: 'info@gims-consulting.be',
      href: 'mailto:info@gims-consulting.be',
      gradient: 'from-primary to-pink-500',
      description: 'Réponse sous 24h ouvrées',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Téléphone & WhatsApp',
      value: '+32 476 34 23 64',
      href: 'tel:+32476342364',
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Lun-Ven : 9h - 18h (CET)',
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Adresse',
      value: 'Avenue Louise 143/4',
      secondLine: '1050 Bruxelles, Belgique',
      href: 'https://maps.google.com/?q=Avenue+Louise+143,+1050+Bruxelles',
      gradient: 'from-violet-500 to-purple-500',
      description: 'Sur rendez-vous uniquement',
    },
  ];

  const faqItems = [
    {
      question: 'Quel est le délai de réponse ?',
      answer: 'Nous nous engageons à répondre à toutes les demandes dans un délai de 24 heures ouvrées maximum.',
    },
    {
      question: 'Proposez-vous une démonstration ?',
      answer: 'Oui ! Nous proposons des démonstrations personnalisées gratuites. Contactez-nous pour planifier un créneau.',
    },
    {
      question: 'Puis-je migrer mon livret existant ?',
      answer: 'Absolument ! Notre équipe vous accompagne dans la migration de votre livret papier ou PDF vers My Guide Digital.',
    },
    {
      question: 'Avez-vous un programme d\'affiliation ?',
      answer: 'Oui, nous proposons un programme d\'affiliation avec 30% de commission. Consultez notre page dédiée pour plus d\'informations.',
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950">

      {/* ══════════════════════════════════════ */}
      {/* NAVIGATION */}
      {/* ══════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.home', 'Accueil')}
              </Link>
              <Link href="/hote-airbnb" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.services', 'Nos services')}
              </Link>
              <Link href="/tarifs" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.pricing', 'Nos tarifs')}
              </Link>
              <Link href="/blog" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.blog', 'Blog')}
              </Link>
              <Link href="/contact" className="text-white font-semibold text-sm border-b-2 border-primary pb-0.5">
                {t('nav.contact', 'Contact')}
              </Link>
              <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                {t('nav.login', 'Connexion')}
              </Link>
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <Link href="/register">
                <button className="relative group px-6 py-2.5 rounded-full font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    <span>✨</span>
                    <span>{t('nav.testApp', 'Testez gratuitement')}</span>
                  </span>
                </button>
              </Link>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 py-4 space-y-3">
              <Link href="/" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home', 'Accueil')}</Link>
              <Link href="/hote-airbnb" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.services', 'Nos services')}</Link>
              <Link href="/tarifs" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing', 'Nos tarifs')}</Link>
              <Link href="/blog" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog', 'Blog')}</Link>
              <Link href="/contact" className="block text-white font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.contact', 'Contact')}</Link>
              <Link href="/login" className="block text-white/80 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login', 'Connexion')}</Link>
              <Link href="/register" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full relative group px-6 py-2.5 rounded-full font-semibold text-sm text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>{t('nav.testApp', 'Testez gratuitement')}</span>
                  </span>
                </button>
              </Link>
              <div className="pt-2">
                <LanguageSelector />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════ */}
      {/* HERO */}
      {/* ══════════════════════════════════════ */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-pink-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
              <span className="text-white/70 text-sm font-medium">💬 Parlons de votre projet</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('contact.title', 'Contactez-nous')}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/50 max-w-3xl mx-auto">
              {t('contact.subtitle', 'Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner dans votre projet.')}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* CARDS CONTACT */}
      {/* ══════════════════════════════════════ */}
      <section className="pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card, index) => (
              <a
                key={index}
                href={card.href}
                target={card.href.startsWith('https') ? '_blank' : undefined}
                rel={card.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                className="group relative"
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${card.gradient} rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-md`}></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06] hover:border-white/[0.15] transition-all duration-300 h-full text-center">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-primary font-semibold text-lg mb-1">{card.value}</p>
                  {card.secondLine && (
                    <p className="text-primary/80 font-medium">{card.secondLine}</p>
                  )}
                  <p className="text-white/30 text-sm mt-3">{card.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FORMULAIRE + INFOS SUPPLÉMENTAIRES */}
      {/* ══════════════════════════════════════ */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <div className="group relative">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-pink-500/30 to-purple-500/30 rounded-2xl opacity-60 blur-sm"></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 sm:p-10 border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-pink-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-white">Envoyez-nous un message</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-2">
                          Nom complet <span className="text-pink-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Votre nom"
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                          Email <span className="text-pink-400">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="votre@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white/60 mb-2">
                        Sujet <span className="text-pink-400">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all text-sm appearance-none"
                      >
                        <option value="" className="bg-slate-900">Sélectionnez un sujet</option>
                        <option value="info" className="bg-slate-900">Demande d&apos;information</option>
                        <option value="demo" className="bg-slate-900">Demande de démonstration</option>
                        <option value="support" className="bg-slate-900">Support technique</option>
                        <option value="partnership" className="bg-slate-900">Partenariat / Affiliation</option>
                        <option value="migration" className="bg-slate-900">Migration de livret</option>
                        <option value="other" className="bg-slate-900">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-white/60 mb-2">
                        Message <span className="text-pink-400">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Décrivez votre demande en détail..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === 'sending'}
                      className="relative group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-80 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {formStatus === 'sending' ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            <span>Envoyer le message</span>
                          </>
                        )}
                      </span>
                    </button>

                    {formStatus === 'sent' && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-emerald-300 text-sm">Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</p>
                      </div>
                    )}

                    {formStatus === 'error' && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-red-300 text-sm">Une erreur est survenue. Veuillez réessayer ou nous contacter directement à info@gims-consulting.be</p>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pourquoi nous contacter */}
              <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06]">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <span className="text-2xl">🤝</span>
                  Pourquoi nous contacter ?
                </h3>
                <ul className="space-y-4">
                  {[
                    { icon: '🎯', text: 'Démonstration personnalisée gratuite' },
                    { icon: '🔄', text: 'Migration de votre livret existant' },
                    { icon: '💡', text: 'Conseils sur mesure pour votre activité' },
                    { icon: '🛠️', text: 'Support technique réactif' },
                    { icon: '🤝', text: 'Programme de partenariat & affiliation' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <span className="text-white/50 text-sm leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/32476342364"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block"
              >
                <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-md"></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Discutez sur WhatsApp</p>
                      <p className="text-white/40 text-sm">Réponse rapide en direct</p>
                    </div>
                    <svg className="w-5 h-5 text-white/30 ml-auto group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </a>

              {/* Horaires */}
              <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/[0.06]">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <span className="text-2xl">🕐</span>
                  Horaires de disponibilité
                </h3>
                <div className="space-y-3">
                  {[
                    { day: 'Lundi - Vendredi', hours: '9h00 - 18h00', active: true },
                    { day: 'Samedi', hours: '10h00 - 14h00', active: true },
                    { day: 'Dimanche', hours: 'Fermé', active: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <span className="text-white/50 text-sm">{item.day}</span>
                      <span className={`text-sm font-medium ${item.active ? 'text-emerald-400' : 'text-white/30'}`}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-white/20 text-xs mt-4">Fuseau horaire : CET (Bruxelles)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/* FAQ RAPIDE */}
      {/* ══════════════════════════════════════ */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-white/40 text-lg">Trouvez rapidement les réponses à vos questions</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="group relative">
                <div className={`absolute -inset-[1px] bg-gradient-to-r from-primary to-purple-500 rounded-2xl transition-opacity duration-500 blur-sm ${openFaq === index ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`}></div>
                <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-white font-semibold pr-4">{item.question}</span>
                    <svg
                      className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-white/40 leading-relaxed">{item.answer}</p>
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
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-pink-500/10 to-purple-500/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Prêt à digitaliser votre accueil ?
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/60">
            Testez gratuitement pendant 14 jours et offrez une expérience mémorable à vos voyageurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="relative group px-8 py-4 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 text-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-pink-500 to-purple-500 blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <span className="relative">Créer mon livret gratuitement</span>
              </button>
            </Link>
            <Link href="/tarifs">
              <button className="px-8 py-4 rounded-full font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 text-lg">
                Découvrir nos tarifs
              </button>
            </Link>
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
              <p className="bg-gradient-to-r from-purple-300/60 via-violet-300/50 to-purple-400/60 bg-clip-text text-transparent mb-6 leading-relaxed max-w-md">
                La solution moderne pour créer et partager vos livrets d&apos;accueil digitaux. Simplifiez l&apos;expérience de vos voyageurs.
              </p>
              <div className="flex gap-3">
                {['facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
                    <span className="bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent text-xs font-semibold">{social.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white text-sm uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Accueil</Link></li>
                <li><Link href="/hote-airbnb" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Nos services</Link></li>
                <li><Link href="/tarifs" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Nos tarifs</Link></li>
                <li><Link href="/blog" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Blog</Link></li>
                <li><Link href="/login" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Contact</Link></li>
                <li><Link href="/#faq" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">FAQ</Link></li>
                <li><Link href="/affiliation" className="bg-gradient-to-r from-purple-300/50 to-violet-300/50 bg-clip-text text-transparent hover:from-purple-200 hover:to-violet-200 transition-all text-sm">Programme d&apos;affiliation</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-8 text-center">
            <p className="bg-gradient-to-r from-purple-400/30 via-violet-300/30 to-purple-400/30 bg-clip-text text-transparent text-sm">
              © {new Date().getFullYear()} My Guide Digital. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
