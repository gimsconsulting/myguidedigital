'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { livretsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

interface Livret {
  id: string;
  name: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  qrCode?: string;
}

interface SocialLink {
  id: string;
  type: 'website' | 'airbnb' | 'booking' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter' | 'youtube' | 'custom';
  label: string;
  url: string;
  icon: string;
}

export default function BusinessCardConfiguratorPage() {
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;

  const [livret, setLivret] = useState<Livret | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessCardUrl, setBusinessCardUrl] = useState('');

  // État pour la carte de visite
  const [cardData, setCardData] = useState({
    backgroundImage: null as string | null,
    title: 'Guide',
    subtitle: 'Accédez à notre guide',
    titleSize: 42,
    titleColor: '#FFFFFF',
    subtitleSize: 18,
    subtitleColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.75,
    logoType: 'white' as 'black' | 'white' | 'custom',
    logoColor: '#FFFFFF',
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { id: '1', type: 'website', label: 'Site web', url: '', icon: '🌐' },
    { id: '2', type: 'airbnb', label: 'Airbnb', url: '', icon: '🏠' },
    { id: '3', type: 'booking', label: 'Booking', url: '', icon: '📅' },
    { id: '4', type: 'instagram', label: 'Instagram', url: '', icon: '📷' },
    { id: '5', type: 'facebook', label: 'Facebook', url: '', icon: '👥' },
    { id: '6', type: 'tiktok', label: 'TikTok', url: '', icon: '🎵' },
  ]);

  const cardPreviewRef = useRef<HTMLDivElement>(null);

  const socialIcons: Record<string, string> = {
    website: '🌐',
    airbnb: '🏠',
    booking: '📅',
    instagram: '📷',
    facebook: '👥',
    tiktok: '🎵',
    linkedin: '💼',
    twitter: '🐦',
    youtube: '▶️',
    custom: '🔗',
  };

  useEffect(() => {
    loadLivret();
    generateBusinessCardUrl();
  }, [livretId]);

  const loadLivret = async () => {
    try {
      const response = await livretsApi.getOne(livretId);
      const data = response.data;
      setLivret(data);

      // Initialiser les données avec les valeurs du livret
      setCardData(prev => ({
        ...prev,
        title: data.welcomeTitle || 'Guide',
        subtitle: data.welcomeSubtitle || 'Accédez à notre guide',
      }));

      // Générer l'URL de la carte de visite
      if (data.qrCode) {
        const uniqueId = data.qrCode.split('/').pop() || data.id;
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const port = typeof window !== 'undefined' ? window.location.port : '3000';
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
        setBusinessCardUrl(`${baseUrl}/business-card/${uniqueId}`);
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement du livret');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBusinessCardUrl = () => {
    if (livret?.qrCode) {
      const uniqueId = livret.qrCode.split('/').pop() || livret.id;
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const port = typeof window !== 'undefined' ? window.location.port : '3000';
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
      const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
      setBusinessCardUrl(`${baseUrl}/business-card/${uniqueId}`);
    }
  };

  const handleSocialLinkChange = (id: string, field: 'url' | 'label', value: string) => {
    setSocialLinks(prev =>
      prev.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const addCustomLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      type: 'custom',
      label: 'Lien personnalisé',
      url: '',
      icon: '🔗',
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const removeLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id));
  };

  const copyUrlToClipboard = () => {
    if (businessCardUrl) {
      navigator.clipboard.writeText(businessCardUrl);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!livret || !livret.qrCode) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Livret non trouvé ou QR code manquant</div>
        <Link href={`/dashboard/livrets/${livretId}`}>
          <Button variant="primary" className="mt-4">
            Retour au livret
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/livrets/${livretId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Retour au livret
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Personnalisez votre carte de visite numérique</h1>
        <p className="text-gray-600 mt-2 text-sm">
          Créez une carte de visite professionnelle en ligne facilement ! Partagez vos informations et vos réseaux sociaux en un seul lien.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6">
        {/* Colonne gauche - Contrôles */}
        <div className="space-y-6">
          {/* Image de fond */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Modifier l&apos;image de fond
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setCardData({ ...cardData, backgroundImage: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {cardData.backgroundImage && (
              <button
                type="button"
                onClick={() => setCardData({ ...cardData, backgroundImage: null })}
                className="mt-2 text-sm text-red-600 hover:text-red-700"
              >
                Supprimer l&apos;image
              </button>
            )}
          </div>

          {/* Bloc central */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Contenu principal</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => toast.info('Fonctionnalité à venir')}
              >
                Monter le bloc
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => toast.info('Fonctionnalité à venir')}
              >
                Descendre le bloc
              </button>
            </div>

            {/* Titre */}
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Titre
              </label>
              <Input
                value={cardData.title}
                onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
                placeholder="Guide"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Taille du titre: {cardData.titleSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  value={cardData.titleSize}
                  onChange={(e) => setCardData({ ...cardData, titleSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Couleur du titre:</label>
                <input
                  type="color"
                  value={cardData.titleColor}
                  onChange={(e) => setCardData({ ...cardData, titleColor: e.target.value })}
                  className="w-12 h-8 rounded border"
                />
                <Input
                  value={cardData.titleColor}
                  onChange={(e) => setCardData({ ...cardData, titleColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Sous-titre */}
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Sous-titre
              </label>
              <Input
                value={cardData.subtitle}
                onChange={(e) => setCardData({ ...cardData, subtitle: e.target.value })}
                placeholder="Accédez à notre guide"
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Taille du sous-titre: {cardData.subtitleSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={cardData.subtitleSize}
                  onChange={(e) => setCardData({ ...cardData, subtitleSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Couleur du sous-titre:</label>
                <input
                  type="color"
                  value={cardData.subtitleColor}
                  onChange={(e) => setCardData({ ...cardData, subtitleColor: e.target.value })}
                  className="w-12 h-8 rounded border"
                />
                <Input
                  value={cardData.subtitleColor}
                  onChange={(e) => setCardData({ ...cardData, subtitleColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Fond */}
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Fond du bloc
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Couleur:</label>
                <input
                  type="color"
                  value={cardData.backgroundColor}
                  onChange={(e) => setCardData({ ...cardData, backgroundColor: e.target.value })}
                  className="w-12 h-8 rounded border"
                />
                <Input
                  value={cardData.backgroundColor}
                  onChange={(e) => setCardData({ ...cardData, backgroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Opacité: {Math.round(cardData.backgroundOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={cardData.backgroundOpacity}
                  onChange={(e) => setCardData({ ...cardData, backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCardData({ ...cardData, logoType: 'black', logoColor: '#000000' })}
                    className={`px-3 py-2 rounded text-sm ${
                      cardData.logoType === 'black'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Logo Moovy noir
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardData({ ...cardData, logoType: 'white', logoColor: '#FFFFFF' })}
                    className={`px-3 py-2 rounded text-sm ${
                      cardData.logoType === 'white'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Logo Moovy blanc
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardData({ ...cardData, logoType: 'custom' })}
                    className={`px-3 py-2 rounded text-sm ${
                      cardData.logoType === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Personnalisé
                  </button>
                </div>
                {cardData.logoType === 'custom' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Couleur:</label>
                    <input
                      type="color"
                      value={cardData.logoColor}
                      onChange={(e) => setCardData({ ...cardData, logoColor: e.target.value })}
                      className="w-12 h-8 rounded border"
                    />
                    <Input
                      value={cardData.logoColor}
                      onChange={(e) => setCardData({ ...cardData, logoColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Vos réseaux et sites</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ajoutez des liens vers vos réseaux sociaux et sites web
            </p>
            
            <div className="space-y-3">
              {socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2">
                  <span className="text-2xl">{link.icon}</span>
                  <Input
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                    placeholder={`URL ${link.label}`}
                    className="flex-1"
                  />
                  {link.type === 'custom' && (
                    <Input
                      value={link.label}
                      onChange={(e) => handleSocialLinkChange(link.id, 'label', e.target.value)}
                      placeholder="Label"
                      className="w-32"
                    />
                  )}
                  {link.type === 'custom' && (
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCustomLink}
              className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              + Ajouter un lien personnalisé
            </button>
          </div>
        </div>

        {/* Colonne droite - Aperçu */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div
              ref={cardPreviewRef}
              className="relative bg-white rounded-lg overflow-hidden shadow-lg mx-auto"
              style={{
                aspectRatio: '9/16', // Format vertical pour carte de visite
                width: '100%',
                maxWidth: '400px',
                minHeight: '600px',
              }}
            >
              {/* Image de fond */}
              {cardData.backgroundImage && (
                <img
                  src={cardData.backgroundImage}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Bloc central */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{
                  backgroundColor: `${cardData.backgroundColor}${Math.round(cardData.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                }}
              >
                {/* Titre */}
                <h2
                  className="text-center mb-3 font-bold"
                  style={{
                    fontSize: `${cardData.titleSize}px`,
                    color: cardData.titleColor,
                  }}
                >
                  {cardData.title}
                </h2>

                {/* Sous-titre */}
                <p
                  className="text-center mb-8"
                  style={{
                    fontSize: `${cardData.subtitleSize}px`,
                    color: cardData.subtitleColor,
                  }}
                >
                  {cardData.subtitle}
                </p>

                {/* QR Code */}
                {livret.qrCode && (
                  <div className="mb-6 bg-white p-3 rounded">
                    <QRCodeSVG
                      value={livret.qrCode}
                      size={120}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}

                {/* Logo */}
                <div className="mb-6 text-center">
                  <span
                    className="text-xl font-bold"
                    style={{
                      color: cardData.logoType === 'black' ? '#000000' : cardData.logoType === 'white' ? '#FFFFFF' : cardData.logoColor,
                    }}
                  >
                    Moovy
                  </span>
                </div>

                {/* Réseaux sociaux */}
                <div className="flex flex-wrap justify-center gap-3 mt-auto">
                  {socialLinks
                    .filter(link => link.url.trim() !== '')
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl hover:scale-110 transition-transform"
                        title={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                </div>
              </div>
            </div>

            {/* Lien de la carte */}
            <div className="bg-white rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien de votre carte de visite :
              </label>
              <div className="flex gap-2">
                <Input
                  value={businessCardUrl}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUrlToClipboard}
                >
                  Copier
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Partagez ce lien pour donner accès à votre carte de visite numérique
              </p>
            </div>

            {/* Bouton télécharger */}
            <Button
              variant="primary"
              className="w-full"
              onClick={async () => {
                try {
                  if (!cardPreviewRef.current) {
                    toast.error('Aperçu non disponible');
                    return;
                  }

                  toast.info('Génération de l\'image en cours...');

                  const canvas = await html2canvas(cardPreviewRef.current, {
                    width: 800,
                    height: 1422,
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#FFFFFF',
                  });

                  canvas.toBlob((blob) => {
                    if (blob) {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `carte-visite-moovy.png`;
                      link.click();
                      URL.revokeObjectURL(url);
                      toast.success('Carte de visite téléchargée avec succès !');
                    } else {
                      toast.error('Erreur lors de la génération de l\'image');
                    }
                  }, 'image/png');
                } catch (error) {
                  toast.error('Erreur lors du téléchargement');
                  console.error(error);
                }
              }}
            >
              Télécharger l&apos;image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
