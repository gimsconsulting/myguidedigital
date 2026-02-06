'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { livretsApi } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

interface Livret {
  id: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  qrCode?: string;
}

export default function BusinessCardPage() {
  const params = useParams();
  const cardId = params.id as string;
  
  const [livret, setLivret] = useState<Livret | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLivret();
  }, [cardId]);

  const loadLivret = async () => {
    try {
      // Chercher le livret par son QR code ou ID
      // Pour l'instant, on utilise l'ID directement
      const response = await livretsApi.getOne(cardId);
      setLivret(response.data);
    } catch (err: any) {
      // Si ça ne marche pas avec l'ID, essayer de trouver par QR code
      try {
        const qrCode = `http://${typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}/guide/${cardId}`;
        const response = await livretsApi.getPublic(cardId);
        setLivret(response.data);
      } catch (err2: any) {
        setError('Carte de visite non trouvée');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !livret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Carte de visite non trouvée</h1>
          <p className="text-gray-600">{error || 'Cette carte de visite n\'existe pas ou a été supprimée.'}</p>
        </div>
      </div>
    );
  }

  // Données par défaut pour la carte (on pourrait les stocker en base de données plus tard)
  const cardData = {
    title: livret.welcomeTitle || 'Guide',
    subtitle: livret.welcomeSubtitle || 'Accédez à notre guide',
    titleSize: 42,
    titleColor: '#FFFFFF',
    subtitleSize: 18,
    subtitleColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.75,
    logoType: 'white' as 'black' | 'white' | 'custom',
    logoColor: '#FFFFFF',
  };

  // Réseaux sociaux par défaut (on pourrait les stocker en base de données plus tard)
  const socialLinks = [
    { type: 'website', label: 'Site web', url: '', icon: '🌐' },
    { type: 'airbnb', label: 'Airbnb', url: '', icon: '🏠' },
    { type: 'booking', label: 'Booking', url: '', icon: '📅' },
    { type: 'instagram', label: 'Instagram', url: '', icon: '📷' },
    { type: 'facebook', label: 'Facebook', url: '', icon: '👥' },
    { type: 'tiktok', label: 'TikTok', url: '', icon: '🎵' },
  ].filter(link => link.url.trim() !== '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl mx-auto"
        style={{
          aspectRatio: '9/16',
          width: '100%',
          maxWidth: '400px',
          minHeight: '600px',
        }}
      >
        {/* Bloc central */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-800 to-gray-900"
          style={{
            backgroundColor: `${cardData.backgroundColor}${Math.round(cardData.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
          }}
        >
          {/* Titre */}
          <h1
            className="text-center mb-3 font-bold"
            style={{
              fontSize: `${cardData.titleSize}px`,
              color: cardData.titleColor,
            }}
          >
            {cardData.title}
          </h1>

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
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-auto">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
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
          )}
        </div>
      </div>
    </div>
  );
}
