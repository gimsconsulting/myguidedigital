'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSelector from '@/components/LanguageSelector';

// Grille tarifaire dégressive par chambre/an
function getPricePerRoom(roomCount: number): number {
  if (roomCount >= 400) return 5;
  if (roomCount >= 300) return 6;
  if (roomCount >= 200) return 7;
  if (roomCount >= 150) return 8;
  if (roomCount >= 100) return 9;
  if (roomCount >= 75) return 10;
  if (roomCount >= 50) return 11;
  if (roomCount >= 30) return 13;
  if (roomCount >= 20) return 15;
  if (roomCount >= 10) return 17;
  return 19;
}

const features = [
  {
    title: 'Modules adaptés à l\'hôtellerie',
    desc: 'Wi-Fi, digicode, numéros utiles, consignes d\'arrivée et de départ, informations pratiques, découvertes autour de l\'hôtel, livre d\'or, mot de bienvenue… Activez uniquement les contenus pertinents pour vos clients.',
    icon: '🏨',
  },
  {
    title: 'Gestion centralisée multi-chambres',
    desc: 'Créez un livret par typologie de chambre (standard, supérieure, suite…) et gérez l\'ensemble depuis un tableau de bord unique. L\'abonnement est calculé par chambre, pas par livret.',
    icon: '🗂️',
  },
  {
    title: 'Mise à jour en temps réel',
    desc: 'Code Wi-Fi modifié ? Nouveau restaurant partenaire ? Changez l\'information en quelques clics, elle est instantanément visible par tous vos clients. Fini les impressions coûteuses.',
    icon: '⚡',
  },
  {
    title: 'Personnalisation à l\'image de votre hôtel',
    desc: 'Intégrez votre logo, vos couleurs et votre identité visuelle. Chaque livret reflète le standing et l\'univers de votre établissement pour une expérience client cohérente.',
    icon: '🎨',
  },
  {
    title: 'Recommandations locales illimitées',
    desc: 'Valorisez l\'environnement de votre hôtel en recommandant sans limite restaurants, lieux touristiques, services et activités à proximité.',
    icon: '📍',
  },
  {
    title: 'Traduction automatique multilingue',
    desc: 'Proposez vos livrets en plusieurs langues grâce à la traduction automatique. Assurez une communication claire et professionnelle, quelle que soit la nationalité de vos clients.',
    icon: '🌍',
  },
  {
    title: 'Chatbot IA pour vos clients',
    desc: 'Un assistant intelligent disponible 24h/24 répond aux questions de vos clients à partir du contenu de votre livret. Moins de sollicitations à la réception, plus de satisfaction.',
    icon: '🤖',
  },
  {
    title: 'Accessible sans téléchargement',
    desc: 'Un simple QR code en chambre, à la réception ou dans l\'email de confirmation suffit. Vos clients accèdent au livret depuis n\'importe quel appareil, sans installer quoi que ce soit.',
    icon: '📱',
  },
  {
    title: 'Statistiques d\'utilisation détaillées',
    desc: 'Suivez les consultations, identifiez les modules les plus consultés et les langues utilisées. Optimisez votre contenu en fonction des besoins réels de votre clientèle.',
    icon: '📊',
  },
  {
    title: 'Support dédié aux professionnels',
    desc: 'Notre équipe vous accompagne avec un support réactif et personnalisé. Prise en main rapide, formation incluse pour vos collaborateurs.',
    icon: '💼',
  },
];

const hotelTestimonials = [
  {
    name: 'Philippe D.',
    role: 'Hôtel 3 étoiles — Bruges',
    text: 'Depuis que nous utilisons My Guide Digital, nos clients ont toutes les infos en main dès leur arrivée. Le code Wi-Fi, les horaires du petit-déjeuner, les bonnes adresses... Tout est là. Nos équipes à la réception sont beaucoup moins sollicitées.',
    rating: 5,
  },
  {
    name: 'Catherine V.',
    role: 'Résidence hôtelière — Namur',
    text: 'La gestion par typologie de chambre est un vrai plus. On a créé 3 livrets différents pour nos 45 chambres. Le calculateur de prix dégressif rend la solution très abordable pour notre taille.',
    rating: 5,
  },
  {
    name: 'Marc W.',
    role: 'Boutique hôtel — Bruxelles',
    text: 'Le chatbot IA est impressionnant. Nos clients internationaux posent leurs questions en anglais, espagnol ou allemand et obtiennent des réponses instantanées. C\'est devenu indispensable.',
    rating: 5,
  },
  {
    name: 'François B.',
    role: 'Hôtel 4 étoiles — Liège',
    text: 'Nous cherchions une solution élégante pour remplacer nos classeurs en chambre. Le QR code sur la carte-clé est très apprécié. La personnalisation aux couleurs de notre hôtel donne un résultat professionnel.',
    rating: 5,
  },
  {
    name: 'Nathalie R.',
    role: 'Hôtel de charme — Ardennes belges',
    text: 'La mise à jour en temps réel est un gain de temps énorme. Quand on change la carte du restaurant ou les activités saisonnières, tout est actualisé instantanément pour tous nos hôtes.',
    rating: 5,
  },
  {
    name: 'Stéphane M.',
    role: 'Hôtel bord de mer — Knokke-Heist',
    text: 'Excellent rapport qualité-prix surtout avec le tarif dégressif pour nos 60 chambres. L\'outil est simple, nos équipes l\'ont pris en main en une demi-heure. Je recommande vivement.',
    rating: 5,
  },
];

const hotelFaqs = [
  {
    question: 'Faut-il créer un livret pour chaque chambre ?',
    answer: 'Non, vous pouvez créer un livret par typologie de chambre (standard, supérieure, suite…). Chaque chambre reçoit son propre QR code qui pointe vers le bon livret. Vous ne saisissez les informations qu\'une seule fois.',
  },
  {
    question: 'Comment est calculé le prix ?',
    answer: 'Le tarif est calculé par chambre et par an, avec une grille dégressive : plus vous avez de chambres, plus le prix unitaire diminue. Utilisez notre calculateur ci-dessus pour obtenir votre tarif exact.',
  },
  {
    question: 'Comment mes clients accèdent-ils au livret ?',
    answer: 'Aucun téléchargement requis. Un simple scan du QR code (en chambre, à la réception, sur la carte-clé) ou un clic sur le lien dans l\'email de confirmation suffit. L\'interface est responsive et fonctionne sur tout appareil.',
  },
  {
    question: 'Peut-on l\'intégrer à notre PMS ou système de réservation ?',
    answer: 'Le livret peut être intégré dans vos emails de confirmation ou automatisations PMS via un lien ou QR code. Contactez-nous pour discuter des possibilités d\'intégration avec votre système.',
  },
  {
    question: 'Les traductions sont-elles fiables pour un hôtel international ?',
    answer: 'Oui, notre système de traduction automatique prend en charge de nombreuses langues. Vous pouvez également modifier manuellement chaque traduction pour garantir un niveau de qualité adapté à votre standing.',
  },
  {
    question: 'Mes équipes doivent-elles être formées ?',
    answer: 'L\'outil est conçu pour être intuitif. Une prise en main de 30 minutes suffit pour que l\'ensemble du personnel puisse l\'utiliser. Aucune compétence technique n\'est requise.',
  },
  {
    question: 'Comment fonctionne le chatbot IA pour les hôtels ?',
    answer: 'Le chatbot analyse le contenu de votre livret et répond automatiquement aux questions de vos clients 24h/24 : horaires, équipements, recommandations, consignes… Moins de sollicitations à la réception, plus de satisfaction client.',
  },
  {
    question: 'Et si le Wi-Fi ne fonctionne pas, le client peut quand même accéder au livret ?',
    answer: 'Le QR code peut être accompagné des informations essentielles en clair (Wi-Fi, code porte). Le lien peut aussi être envoyé par email en amont. Les clients peuvent sauvegarder le livret en favoris pour une consultation ultérieure.',
  },
  {
    question: 'Peut-on afficher le QR code sur différents supports ?',
    answer: 'Absolument. Le QR code peut être imprimé sur des chevalets en chambre, à la réception, sur les cartes-clés, dans les ascenseurs, dans les emails de confirmation… Multipliez les points de contact pour maximiser l\'utilisation.',
  },
  {
    question: 'Le livret remplace-t-il notre réception ?',
    answer: 'Non, il la complète. Le livret prend en charge les informations répétitives (Wi-Fi, horaires, recommandations…) pour que votre équipe puisse se concentrer sur l\'accueil personnalisé et le service à haute valeur ajoutée.',
  },
];

export default function TarifsHotelsPage() {
  const { t } = useTranslation();
  const [roomCount, setRoomCount] = useState(20);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pricePerRoom = useMemo(() => getPricePerRoom(roomCount), [roomCount]);
  const totalPrice = useMemo(() => pricePerRoom * roomCount, [pricePerRoom, roomCount]);
  const monthlyEquivalent = useMemo(() => (totalPrice / 12).toFixed(2), [totalPrice]);

  const handleRoomChange = (value: number) => {
    if (value < 5) value = 5;
    if (value > 500) value = 500;
    setRoomCount(value);
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-light to-pink-500 bg-clip-text text-transparent">
                MY GUIDE DIGITAL
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white hover:text-primary transition-colors">Accueil</Link>
              <Link href="/hote-airbnb" className="text-white hover:text-primary transition-colors">Nos services</Link>
              <Link href="/tarifs" className="text-primary font-semibold">Nos tarifs</Link>
              <Link href="/blog" className="text-white hover:text-primary transition-colors">Blog</Link>
              <Link href="/contact" className="text-white hover:text-primary transition-colors">Contact</Link>
              <Link href="/login" className="text-white hover:text-primary transition-colors">Connexion</Link>
              <LanguageSelector />
            </div>
            <div className="hidden md:block">
              <Link href="/register">
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold">
                  <span className="flex items-center gap-2">
                    <span>&gt;</span>
                    <span>Testez gratuitement</span>
                  </span>
                </Button>
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white hover:text-primary transition-colors" aria-label="Menu">
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
            <div className="md:hidden py-4 border-t border-primary/20">
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
                <Link href="/hote-airbnb" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Nos services</Link>
                <Link href="/tarifs" className="text-primary font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Nos tarifs</Link>
                <Link href="/blog" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
                <Link href="/contact" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                <Link href="/login" className="text-white hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Connexion</Link>
                <LanguageSelector />
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-6 py-2 rounded-full font-semibold w-full">
                    Testez gratuitement
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-8 sm:pt-32 sm:pb-12 bg-dark relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/tarifs" className="hover:text-primary transition-colors">Nos tarifs</Link>
            <span>/</span>
            <span className="text-primary">Hôtels</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            <span className="text-white">Le livret digital</span>
            <br />
            <span className="bg-gradient-purple-pink bg-clip-text text-transparent">conçu pour les hôtels</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-4 animate-fade-in">
            Pour les hôtels, résidences hôtelières et établissements touristiques. Digitalisez votre accueil et offrez une expérience client d&apos;exception.
          </p>
          <p className="text-base text-primary font-semibold animate-fade-in">
            Essai gratuit • Sans carte bancaire • Tarif dégressif dès 20 chambres
          </p>
        </div>
      </section>

      {/* Dynamic Pricing Calculator */}
      <section className="py-12 sm:py-16 bg-dark relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-dark rounded-3xl p-8 sm:p-12 border-2 border-primary/30 glow-gradient animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Calculez votre tarif
              </h2>
              <p className="text-gray-400">
                Tarif dégressif : plus vous avez de chambres, moins vous payez par chambre
              </p>
            </div>

            {/* Room Counter */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleRoomChange(roomCount - 5)}
                  className="w-14 h-14 rounded-full bg-dark-lighter border-2 border-primary/30 text-white text-2xl font-bold hover:border-primary hover:bg-primary/20 transition-all duration-300 flex items-center justify-center"
                >
                  −
                </button>
                <div className="text-center min-w-[180px]">
                  <input
                    type="number"
                    value={roomCount}
                    onChange={(e) => handleRoomChange(parseInt(e.target.value) || 5)}
                    min={5}
                    max={500}
                    className="w-28 text-center text-5xl font-bold bg-transparent text-white border-b-2 border-primary/50 focus:border-primary outline-none pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-gray-400 text-sm mt-2">chambres</p>
                </div>
                <button
                  onClick={() => handleRoomChange(roomCount + 5)}
                  className="w-14 h-14 rounded-full bg-dark-lighter border-2 border-primary/30 text-white text-2xl font-bold hover:border-primary hover:bg-primary/20 transition-all duration-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Slider */}
              <div className="w-full max-w-md">
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={1}
                  value={roomCount}
                  onChange={(e) => handleRoomChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-lighter rounded-lg appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-pink-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                  <span>400</span>
                  <span>500</span>
                </div>
              </div>

              {/* Price Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-4">
                <div className="glass-dark rounded-xl p-6 text-center border border-primary/20">
                  <p className="text-gray-400 text-sm mb-1">Prix par chambre / an</p>
                  <p className="text-3xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent">{pricePerRoom}€</p>
                  <p className="text-gray-500 text-xs mt-1">HT</p>
                </div>
                <div className="bg-gradient-purple-pink rounded-xl p-6 text-center shadow-lg transform sm:scale-105">
                  <p className="text-white/80 text-sm mb-1">Total annuel</p>
                  <p className="text-4xl font-bold text-white">{totalPrice}€</p>
                  <p className="text-white/70 text-xs mt-1">HT / an</p>
                </div>
                <div className="glass-dark rounded-xl p-6 text-center border border-primary/20">
                  <p className="text-gray-400 text-sm mb-1">Équivalent mensuel</p>
                  <p className="text-3xl font-bold bg-gradient-purple-pink bg-clip-text text-transparent">{monthlyEquivalent}€</p>
                  <p className="text-gray-500 text-xs mt-1">HT / mois</p>
                </div>
              </div>

              {/* Degressive pricing table */}
              <div className="w-full mt-4">
                <p className="text-center text-gray-400 text-sm mb-4">Grille tarifaire dégressive</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-11 gap-2 text-center">
                  {[
                    { rooms: '5-9', price: '19€' },
                    { rooms: '10-19', price: '17€' },
                    { rooms: '20-29', price: '15€' },
                    { rooms: '30-49', price: '13€' },
                    { rooms: '50-74', price: '11€' },
                    { rooms: '75-99', price: '10€' },
                    { rooms: '100-149', price: '9€' },
                    { rooms: '150-199', price: '8€' },
                    { rooms: '200-299', price: '7€' },
                    { rooms: '300-399', price: '6€' },
                    { rooms: '400+', price: '5€' },
                  ].map((tier, i) => (
                    <div
                      key={i}
                      className={`rounded-lg p-2 text-xs transition-all duration-300 ${
                        getPricePerRoom(parseInt(tier.rooms)) === pricePerRoom
                          ? 'bg-gradient-purple-pink text-white shadow-lg scale-105'
                          : 'glass-dark text-gray-400 border border-primary/10'
                      }`}
                    >
                      <p className="font-bold">{tier.price}</p>
                      <p className="opacity-80">{tier.rooms}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/register" className="mt-4">
                <Button variant="primary" size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg text-lg px-10 py-4 rounded-full font-semibold">
                  Essayer gratuitement — {roomCount} chambres
                </Button>
              </Link>

              <p className="text-gray-500 text-sm text-center">
                Prix par chambre / an. <strong className="text-primary">Essai gratuit sans carte bancaire.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-dark-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Des fonctionnalités<br />
              <span className="bg-gradient-purple-pink bg-clip-text text-transparent">pensées pour l&apos;hôtellerie</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Chaque module est conçu pour simplifier le quotidien de vos équipes et enrichir l&apos;expérience de vos clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 flex gap-5">
                  <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-16 sm:py-20 bg-dark relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demo Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-purple-pink rounded-2xl p-8 sm:p-10 overflow-hidden">
                <div className="absolute inset-0 bg-dark/30"></div>
                <div className="relative text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Vous souhaitez une démonstration ?
                  </h3>
                  <p className="text-white/90 mb-6 leading-relaxed">
                    Bénéficiez de tarifs dégressifs dès 20 chambres. En moins de 30 minutes, découvrez l&apos;outil et permettez à vos équipes une prise en main immédiate.
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      Demander une démo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Migration Block */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-primary to-pink-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              <div className="relative glass-dark rounded-2xl p-8 sm:p-10 border-2 border-primary/30 overflow-hidden">
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    On s&apos;occupe de tout
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Vous avez déjà un livret papier ou un document existant ? Confiez-le nous et nous le transformons en livret digital complet, traduit et enrichi de recommandations locales.
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-0 shadow-lg font-bold px-8 py-3 rounded-full">
                      Nous contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-dark-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-pink-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Des hôteliers <span className="bg-gradient-purple-pink bg-clip-text text-transparent">nous font confiance</span>
            </h2>
            <p className="text-xl text-gray-400">
              Découvrez comment nos clients transforment leur accueil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl p-6 border border-primary/10 hover:border-primary/30 transition-all duration-300 animate-slide-up">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="border-t border-primary/10 pt-4">
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-24 bg-dark relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-400">
              Tout ce que les hôteliers nous demandent avant de se lancer
            </p>
          </div>

          <div className="space-y-4">
            {hotelFaqs.map((faq, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-pink-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative glass-dark rounded-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 overflow-hidden animate-slide-up">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                  >
                    <span className="text-white font-semibold text-base">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-5">
                      <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-purple-pink relative overflow-hidden">
        <div className="absolute inset-0 bg-dark/50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
            Modernisez l&apos;accueil de votre hôtel
          </h2>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Rejoignez les établissements qui ont choisi le digital pour enrichir l&apos;expérience de leurs clients
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Essayer gratuitement
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-2 border-white text-lg px-8 py-4 rounded-full transition-all duration-300 font-semibold">
                Demander une démo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                {['facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all">
                    <span className="bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent text-xs font-semibold">{social.charAt(0).toUpperCase()}</span>
                  </a>
                ))}
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
