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

export default function PosterConfiguratorPage() {
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;

  const [livret, setLivret] = useState<Livret | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // État pour l'affiche imprimable
  const [posterData, setPosterData] = useState({
    format: 'A4' as 'A3' | 'A4' | 'A5' | 'A6',
    backgroundImage: null as string | null,
    title: 'Welcome',
    titleFont: 'Arial',
    titleSize: 48,
    titleColor: '#FFFFFF',
    subtitle: 'Scan me :)',
    subtitleFont: 'Arial',
    subtitleSize: 24,
    subtitleColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    qrCodeSize: 150,
    logoType: 'custom' as 'black' | 'white' | 'custom',
    logoColor: '#000000',
  });
  const posterPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLivret();
  }, [livretId]);

  const loadLivret = async () => {
    try {
      const response = await livretsApi.getOne(livretId);
      const data = response.data;
      setLivret(data);

      // Initialiser les données de l'affiche avec les valeurs du livret
      setPosterData(prev => ({
        ...prev,
        title: data.welcomeTitle || 'Welcome',
        subtitle: data.welcomeSubtitle || 'Scan me :)',
      }));
    } catch (err: any) {
      toast.error('Erreur lors du chargement du livret');
    } finally {
      setIsLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Personnalisez votre affiche imprimable</h1>
        <p className="text-gray-600 mt-2 text-sm">
          Personnalisez, téléchargez et imprimez votre affiche. Vos visiteurs pourront scanner le QR code pour accéder à votre guide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-4">
        {/* Colonne gauche - Contrôles */}
        <div className="space-y-4 text-sm">
          {/* Format */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Sélectionnez le format que vous souhaitez
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['A3', 'A4', 'A5', 'A6'] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setPosterData({ ...posterData, format })}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    posterData.format === format
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Image de fond */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Modifier l&apos;image de fond de l&apos;affiche
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPosterData({ ...posterData, backgroundImage: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
            {posterData.backgroundImage && (
              <button
                type="button"
                onClick={() => setPosterData({ ...posterData, backgroundImage: null })}
                className="mt-1.5 text-xs text-red-600 hover:text-red-700"
              >
                Supprimer l&apos;image
              </button>
            )}
          </div>

          {/* Bloc central */}
          <div className="border-t pt-4">
            <div className="flex gap-1.5 mb-3">
              <button
                type="button"
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => toast.info('Fonctionnalité à venir')}
              >
                Monter le bloc
              </button>
              <button
                type="button"
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => toast.info('Fonctionnalité à venir')}
              >
                Descendre le bloc
              </button>
            </div>

            {/* Titre */}
            <div className="space-y-2 mb-3">
              <label className="block text-xs font-medium text-gray-700">
                Titre:
              </label>
              <Input
                value={posterData.title}
                onChange={(e) => setPosterData({ ...posterData, title: e.target.value })}
                placeholder="Welcome"
                className="text-sm"
              />
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-600">Police du titre:</label>
                <button
                  type="button"
                  className="px-2 py-0.5 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
                  onClick={() => toast.info('Sélection de police à venir')}
                >
                  Sélectionner une police
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">
                  Taille du titre: {posterData.titleSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="96"
                  value={posterData.titleSize}
                  onChange={(e) => setPosterData({ ...posterData, titleSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-600">Couleur du titre:</label>
                <input
                  type="color"
                  value={posterData.titleColor}
                  onChange={(e) => setPosterData({ ...posterData, titleColor: e.target.value })}
                  className="w-8 h-6 rounded border"
                />
                <Input
                  value={posterData.titleColor}
                  onChange={(e) => setPosterData({ ...posterData, titleColor: e.target.value })}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            {/* Sous-titre */}
            <div className="space-y-2 mb-3">
              <label className="block text-xs font-medium text-gray-700">
                Sous titre:
              </label>
              <Input
                value={posterData.subtitle}
                onChange={(e) => setPosterData({ ...posterData, subtitle: e.target.value })}
                placeholder="Scan me :)"
                className="text-sm"
              />
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-600">Police du sous titre:</label>
                <button
                  type="button"
                  className="px-2 py-0.5 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
                  onClick={() => toast.info('Sélection de police à venir')}
                >
                  Sélectionner une police
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">
                  Taille du sous titre: {posterData.subtitleSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={posterData.subtitleSize}
                  onChange={(e) => setPosterData({ ...posterData, subtitleSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-600">Couleur du sous titre:</label>
                <input
                  type="color"
                  value={posterData.subtitleColor}
                  onChange={(e) => setPosterData({ ...posterData, subtitleColor: e.target.value })}
                  className="w-8 h-6 rounded border"
                />
                <Input
                  value={posterData.subtitleColor}
                  onChange={(e) => setPosterData({ ...posterData, subtitleColor: e.target.value })}
                  className="flex-1 text-xs"
                />
              </div>
            </div>

            {/* Fond */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-600">Couleur du fond:</label>
                <input
                  type="color"
                  value={posterData.backgroundColor}
                  onChange={(e) => setPosterData({ ...posterData, backgroundColor: e.target.value })}
                  className="w-8 h-6 rounded border"
                />
                <Input
                  value={posterData.backgroundColor}
                  onChange={(e) => setPosterData({ ...posterData, backgroundColor: e.target.value })}
                  className="flex-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">
                  Opacité du fond: {Math.round(posterData.backgroundOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={posterData.backgroundOpacity}
                  onChange={(e) => setPosterData({ ...posterData, backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-0.5">
                Taille du QR code: {posterData.qrCodeSize}px
              </label>
              <input
                type="range"
                min="100"
                max="300"
                value={posterData.qrCodeSize}
                onChange={(e) => setPosterData({ ...posterData, qrCodeSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Logo
              </label>
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPosterData({ ...posterData, logoType: 'black', logoColor: '#000000' })}
                    className={`px-2 py-1 rounded text-xs ${
                      posterData.logoType === 'black'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Logo Moovy noir
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterData({ ...posterData, logoType: 'white', logoColor: '#FFFFFF' })}
                    className={`px-2 py-1 rounded text-xs ${
                      posterData.logoType === 'white'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Logo Moovy blanc
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterData({ ...posterData, logoType: 'custom' })}
                    className={`px-2 py-1 rounded text-xs ${
                      posterData.logoType === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Personnalisé
                  </button>
                </div>
                {posterData.logoType === 'custom' && (
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-600">Couleur du logo:</label>
                    <input
                      type="color"
                      value={posterData.logoColor}
                      onChange={(e) => setPosterData({ ...posterData, logoColor: e.target.value })}
                      className="w-8 h-6 rounded border"
                    />
                    <Input
                      value={posterData.logoColor}
                      onChange={(e) => setPosterData({ ...posterData, logoColor: e.target.value })}
                      className="flex-1 text-xs"
                      placeholder="#000000"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Aperçu */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <div
              ref={posterPreviewRef}
              className="relative bg-white rounded-lg overflow-hidden shadow-lg mx-auto"
              style={{
                aspectRatio: '1/1.414', // Format vertical A4/A3/A5/A6
                width: '100%',
                maxWidth: '100%',
              }}
            >
              {/* Image de fond */}
              {posterData.backgroundImage && (
                <img
                  src={posterData.backgroundImage}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Bloc central */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
                style={{
                  backgroundColor: `${posterData.backgroundColor}${Math.round(posterData.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                }}
              >
                {/* Titre */}
                <h3
                  className="text-center mb-4 font-bold"
                  style={{
                    fontFamily: posterData.titleFont,
                    fontSize: `${posterData.titleSize}px`,
                    color: posterData.titleColor,
                  }}
                >
                  {posterData.title}
                </h3>

                {/* Sous-titre */}
                <p
                  className="text-center mb-6"
                  style={{
                    fontFamily: posterData.subtitleFont,
                    fontSize: `${posterData.subtitleSize}px`,
                    color: posterData.subtitleColor,
                  }}
                >
                  {posterData.subtitle}
                </p>

                {/* QR Code */}
                {livret.qrCode && (
                  <div className="mb-6 bg-white p-4 rounded">
                    <QRCodeSVG
                      value={livret.qrCode}
                      size={posterData.qrCodeSize}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}

                {/* Logo */}
                <div className="text-center">
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color: posterData.logoType === 'black' ? '#000000' : posterData.logoType === 'white' ? '#FFFFFF' : posterData.logoColor,
                    }}
                  >
                    Moovy
                  </span>
                </div>
              </div>
            </div>

            {/* Bouton télécharger */}
            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={async () => {
                try {
                  if (!posterPreviewRef.current) {
                    toast.error('Aperçu non disponible');
                    return;
                  }

                  toast.info('Génération de l\'affiche en cours...');

                  // Dimensions selon le format (en pixels pour une bonne qualité)
                  const dimensions: Record<string, { width: number; height: number }> = {
                    A3: { width: 3508, height: 4961 },
                    A4: { width: 2480, height: 3508 },
                    A5: { width: 1748, height: 2480 },
                    A6: { width: 1240, height: 1748 },
                  };

                  const { width, height } = dimensions[posterData.format] || dimensions.A4;
                  const scale = width / posterPreviewRef.current.offsetWidth;

                  // Capturer l'aperçu avec html2canvas
                  const canvas = await html2canvas(posterPreviewRef.current, {
                    width: width,
                    height: height,
                    scale: scale,
                    useCORS: true,
                    backgroundColor: '#FFFFFF',
                  });

                  // Convertir en blob et télécharger
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `affiche-moovy-${posterData.format.toLowerCase()}.png`;
                      link.click();
                      URL.revokeObjectURL(url);
                      toast.success('Affiche téléchargée avec succès !');
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
              Télécharger ({posterData.format})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
