'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { livretsApi, chatDocumentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { QRCodeSVG } from 'qrcode.react';
import { translationService } from '@/lib/translations';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Livret {
  id: string;
  name: string;
  address?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  isActive: boolean;
  qrCode?: string;
  languages?: string; // JSON string array
}

export default function EditLivretPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;
  
  const [livret, setLivret] = useState<Livret | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    welcomeTitle: '',
    welcomeSubtitle: '',
    languages: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Langues disponibles avec leurs codes et drapeaux
  const availableLanguages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', countryCode: 'fr' },
    { code: 'en', name: 'Anglais', flag: '🇬🇧', countryCode: 'gb' },
    { code: 'de', name: 'Allemand', flag: '🇩🇪', countryCode: 'de' },
    { code: 'it', name: 'Italien', flag: '🇮🇹', countryCode: 'it' },
    { code: 'es', name: 'Espagnol', flag: '🇪🇸', countryCode: 'es' },
    { code: 'pt', name: 'Portugais', flag: '🇵🇹', countryCode: 'pt' },
    { code: 'zh', name: 'Chinois', flag: '🇨🇳', countryCode: 'cn' },
    { code: 'ru', name: 'Russe', flag: '🇷🇺', countryCode: 'ru' },
    { code: 'nl', name: 'Néerlandais', flag: '🇳🇱', countryCode: 'nl' },
  ];

  useEffect(() => {
    loadLivret();
  }, [livretId]);

  // Forcer le re-render quand la langue change
  useEffect(() => {
    const handleLanguageChange = () => {
      // Forcer un re-render en mettant à jour un état
      setFormData(prev => ({ ...prev }));
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    if (typeof window !== 'undefined') {
      window.addEventListener('languagechange', handleLanguageChange);
    }
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      if (typeof window !== 'undefined') {
        window.removeEventListener('languagechange', handleLanguageChange);
      }
    };
  }, [i18n]);

  const loadLivret = async () => {
    try {
      const response = await livretsApi.getOne(livretId);
      const data = response.data;
      setLivret(data);
      
      // Parser les langues depuis JSON string
      let languages: string[] = [];
      if (data.languages) {
        try {
          languages = typeof data.languages === 'string' 
            ? JSON.parse(data.languages) 
            : data.languages;
        } catch (e) {
          // Si le parsing échoue, utiliser un tableau vide
          languages = [];
        }
      }
      // Par défaut, au moins le français
      if (languages.length === 0) {
        languages = ['fr'];
      }
      
      setFormData({
        name: data.name || '',
        address: data.address || '',
        welcomeTitle: data.welcomeTitle || '',
        welcomeSubtitle: data.welcomeSubtitle || '',
        languages: languages,
      });

    } catch (err: any) {
      setError(t('livret.loadError', 'Erreur lors du chargement du livret'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour recharger le livret (exposée pour les boutons)
  const reloadLivret = loadLivret;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Le backend attend un tableau de langues, pas une string JSON
      const updateData = {
        ...formData,
        languages: formData.languages, // Tableau directement
      };
      await livretsApi.update(livretId, updateData);
      toast.success(t('livret.updateSuccess', 'Livret mis à jour avec succès'));
      loadLivret();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || t('livret.updateError', 'Erreur lors de la mise à jour');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    setFormData(prev => {
      const currentLanguages = [...prev.languages];
      const index = currentLanguages.indexOf(langCode);
      
      if (index > -1) {
        // Si on désélectionne la dernière langue, ne pas permettre
        if (currentLanguages.length === 1) {
          toast.error(t('livret.atLeastOneLanguage', 'Au moins une langue doit être sélectionnée'));
          return prev;
        }
        currentLanguages.splice(index, 1);
      } else {
        currentLanguages.push(langCode);
      }
      
      return { ...prev, languages: currentLanguages };
    });
  };

  // Fonction pour tester la traduction
  const testTranslation = async () => {
    if (!formData.welcomeTitle && !formData.welcomeSubtitle) {
      toast.error(t('livret.translationTestError', 'Veuillez d\'abord remplir au moins un des champs de texte'));
      return;
    }

    if (formData.languages.length <= 1) {
      toast.error(t('livret.translationTestError2', 'Sélectionnez au moins 2 langues pour tester la traduction'));
      return;
    }

    setIsTranslating(true);
    try {
      const sourceLang = 'fr'; // Langue source par défaut
      const targetLang = formData.languages.find(lang => lang !== sourceLang) || 'en';
      const textToTranslate = formData.welcomeTitle || formData.welcomeSubtitle || 'Bonjour';
      
      toast.info(`${t('livret.translationInProgress', 'Traduction en cours vers')} ${targetLang}...`);
      const translatedText = await translationService.translateText(
        textToTranslate,
        sourceLang,
        targetLang
      );
      
      toast.success(`✅ ${t('livret.translationSuccess', 'Traduction réussie :')} "${translatedText}"`);
      console.log('Texte original:', textToTranslate);
      console.log('Texte traduit:', translatedText);
    } catch (error: any) {
      console.error('Erreur de traduction:', error);
      const errorMessage = error.response?.data?.message || error.message || t('livret.translationError', 'Erreur lors de la traduction');
      const errorDetails = error.response?.data || {};
      console.error('Détails erreur:', errorDetails);
      toast.error(`${t('livret.translationError', 'Erreur lors de la traduction')}: ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('livret.loading', 'Chargement...')}</div>
      </div>
    );
  }

  if (!livret) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">{t('livret.notFound', 'Livret non trouvé')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-primary hover:underline mb-4"
        >
          ← {t('livret.backToDashboard', 'Retour au dashboard')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{t('livret.editBooklet', 'Éditer le livret')}</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('livret.basicInfo', 'Informations de base')}
          </h2>
          
          {/* Section QR Code intégrée */}
          {livret.qrCode && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {t('livret.qrCode', 'QR Code')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('livret.qrCodeDescription', 'Scannez (avec votre smartphone) ou cliquez sur le QR code pour accéder à votre livret')}
              </p>
              <div className="flex flex-col items-start space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  {livret.qrCode && (() => {
                    // Extraire l'ID du QR code et construire l'URL complète selon l'environnement
                    let qrCodeValue = livret.qrCode;
                    try {
                      // Extraire l'ID du QR code
                      let qrCodeId = '';
                      const urlParts = livret.qrCode.split('/guide/');
                      if (urlParts.length > 1) {
                        qrCodeId = urlParts[1].split('?')[0].split('#')[0];
                      } else {
                        qrCodeId = livret.qrCode.split('/').pop() || livret.qrCode;
                      }
                      
                      // Construire l'URL complète selon l'environnement
                      const hostname = window.location.hostname;
                      const protocol = window.location.protocol;
                      
                      // Si on est en production (domaine myguidedigital.com), utiliser HTTPS sans port
                      if (hostname.includes('myguidedigital.com')) {
                        qrCodeValue = `${protocol}//${hostname}/guide/${qrCodeId}`;
                      } else {
                        // En développement/local, utiliser l'URL complète avec port
                        const port = window.location.port || '3000';
                        qrCodeValue = `${protocol}//${hostname}:${port}/guide/${qrCodeId}`;
                      }
                    } catch (e) {
                      // En cas d'erreur, utiliser l'URL telle quelle
                      qrCodeValue = livret.qrCode;
                    }
                    
                    return (
                      <QRCodeSVG
                        value={qrCodeValue}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    );
                  })()}
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600 mb-2">{t('livret.qrCodeUrl', 'URL du livret :')}</p>
                  {livret.qrCode && (() => {
                    // Extraire l'ID du QR code
                    let qrCodeId = '';
                    try {
                      const urlParts = livret.qrCode.split('/guide/');
                      if (urlParts.length > 1) {
                        qrCodeId = urlParts[1].split('?')[0].split('#')[0]; // Enlever query params et hash
                      } else {
                        qrCodeId = livret.qrCode.split('/').pop() || '';
                      }
                    } catch (e) {
                      qrCodeId = livret.qrCode.split('/').pop() || '';
                    }
                    
                    // Construire l'URL complète selon l'environnement
                    const hostname = window.location.hostname;
                    const protocol = window.location.protocol;
                    let fullGuideUrl = '';
                    
                    if (hostname.includes('myguidedigital.com')) {
                      // Production : utiliser le domaine sans port
                      fullGuideUrl = `${protocol}//${hostname}/guide/${qrCodeId}`;
                    } else {
                      // Développement/local : utiliser avec port
                      const port = window.location.port || '3000';
                      fullGuideUrl = `${protocol}//${hostname}:${port}/guide/${qrCodeId}`;
                    }
                    
                    return (
                      <>
                        <a
                          href={fullGuideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline break-all max-w-md inline-block"
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(fullGuideUrl, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          {fullGuideUrl}
                        </a>
                        {!hostname.includes('myguidedigital.com') && (
                          <p className="text-xs text-blue-600 mt-2">
                            💡 {t('livret.qrCodeWifiTip', 'Assurez-vous que votre smartphone est sur le même réseau Wi-Fi que votre ordinateur')}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (livret.qrCode) {
                        // Extraire l'ID du QR code depuis l'URL complète
                        // Format attendu: http://192.168.0.126:3000/guide/[ID]
                        let qrCodeId = '';
                        try {
                          const urlParts = livret.qrCode.split('/guide/');
                          if (urlParts.length > 1) {
                            qrCodeId = urlParts[1].split('?')[0]; // Enlever les query params si présents
                          } else {
                            // Si c'est déjà juste l'ID
                            qrCodeId = livret.qrCode;
                          }
                          
                          // Construire l'URL complète pour ouvrir dans un nouvel onglet
                          const hostname = window.location.hostname;
                          const protocol = window.location.protocol;
                          let guideUrl = '';
                          
                          if (hostname.includes('myguidedigital.com')) {
                            guideUrl = `${protocol}//${hostname}/guide/${qrCodeId}`;
                          } else {
                            const port = window.location.port || '3000';
                            guideUrl = `${protocol}//${hostname}:${port}/guide/${qrCodeId}`;
                          }
                          
                          window.open(guideUrl, '_blank', 'noopener,noreferrer');
                        } catch (err) {
                          console.error('Erreur lors de l\'ouverture du guide:', err);
                          toast.error(t('livret.guideOpenError', 'Erreur lors de l\'ouverture du guide'));
                        }
                      } else {
                        toast.error(t('livret.qrCodeNotAvailable', 'QR code non disponible'));
                      }
                    }}
                  >
                    {t('livret.viewTravelerGuide', 'Voir le guide côté voyageur')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Extraire l'ID unique du QR code actuel
                        let uniqueId = '';
                        if (livret.qrCode) {
                          try {
                            const urlParts = livret.qrCode.split('/guide/');
                            if (urlParts.length > 1) {
                              uniqueId = urlParts[1].split('?')[0].split('#')[0];
                            } else {
                              uniqueId = livret.qrCode.split('/').pop() || '';
                            }
                          } catch (e) {
                            uniqueId = livret.qrCode.split('/').pop() || '';
                          }
                        }
                        
                        if (!uniqueId) {
                          // Si pas d'ID, en générer un nouveau
                          uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        }
                        
                        // Construire l'URL de base selon l'environnement
                        const hostname = window.location.hostname;
                        const protocol = window.location.protocol;
                        let baseUrl = '';
                        
                        if (hostname.includes('myguidedigital.com')) {
                          // Production : utiliser le domaine sans port
                          baseUrl = `${protocol}//${hostname}`;
                        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
                          // Si on est sur localhost, essayer de détecter l'IP locale
                          // Demander à l'utilisateur de saisir son IP locale
                          const userIp = prompt(
                            `${t('livret.qrCodeUpdate.localhostPrompt', 'Votre ordinateur est sur localhost.')}\n\n` +
                            `${t('livret.qrCodeUpdate.ipRequired', 'Pour que le QR code fonctionne sur smartphone, entrez votre IP locale (ex: 192.168.0.126):')}\n\n` +
                            `${t('livret.qrCodeUpdate.ipCommand', 'Vous pouvez trouver votre IP avec la commande: ipconfig (Windows) ou ifconfig (Mac/Linux)')}`
                          );
                          
                          if (!userIp || userIp.trim() === '') {
                            toast.error(t('livret.qrCodeUpdate.ipRequiredError', 'IP locale requise pour le QR code smartphone'));
                            return;
                          }
                          
                          baseUrl = `http://${userIp.trim()}:3000`;
                        } else {
                          // Utiliser l'hostname actuel avec le port
                          const port = window.location.port || '3000';
                          baseUrl = `${protocol}//${hostname}:${port}`;
                        }
                        
                        const newQrCodeUrl = `${baseUrl}/guide/${uniqueId}`;
                        
                        console.log('🔄 Mise à jour QR code:', { uniqueId, baseUrl, newQrCodeUrl });
                        
                        // Mettre à jour le livret
                        await livretsApi.update(livretId, { qrCode: newQrCodeUrl });
                        // Recharger les données
                        const response = await livretsApi.getOne(livretId);
                        setLivret(response.data);
                        toast.success(`✅ ${t('livret.qrCodeUpdateSuccess', 'QR code mis à jour !')} URL: ${newQrCodeUrl}\n\n${t('livret.qrCodeWifiTip', 'Assurez-vous que votre smartphone est sur le même réseau Wi-Fi que votre ordinateur')}.`);
                      } catch (err: any) {
                        toast.error(t('livret.qrCodeUpdateError', 'Erreur lors de la mise à jour du QR code') + ': ' + (err.response?.data?.message || err.message));
                        console.error(err);
                      }
                    }}
                  >
                    {t('livret.updateQrCode', 'Mettre à jour le QR code (pour smartphone)')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('livret.nameVisibleOnly', 'Nom du livret (visible uniquement par vous)')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('livret.address', 'Adresse postale du logement')}
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('livret.addressPlaceholder', 'Adresse de votre logement')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('livret.languages', 'Langues du livret')}
              </label>
              <div className="flex flex-wrap gap-4 mb-2">
                {availableLanguages.map((lang) => (
                  <label
                    key={lang.code}
                    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity p-3 rounded-lg border-2 border-transparent hover:border-primary/30 bg-primary/5"
                  >
                    <div className="w-8 h-6 flex items-center justify-center bg-primary/10 rounded overflow-hidden shadow-sm">
                      <img
                        src={`https://flagcdn.com/w40/${lang.countryCode}.png`}
                        alt={lang.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback vers emoji si l'image ne charge pas
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const emojiSpan = document.createElement('span');
                            emojiSpan.className = 'text-4xl';
                            emojiSpan.textContent = lang.flag;
                            parent.appendChild(emojiSpan);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang.code)}
                        onChange={() => handleLanguageToggle(lang.code)}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">{lang.code.toUpperCase()}</span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {t('livret.autoTranslationInfo', 'Nous vous offrons la possibilité de traduire automatiquement chaque champ dans les langues que vous aurez sélectionnées.')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('livret.welcomeTitle', 'Texte 1 page d\'accueil (Titre du livret)')}
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.welcomeTitle}
                  onChange={(e) => setFormData({ ...formData, welcomeTitle: e.target.value })}
                  placeholder={t('livret.welcomeTitlePlaceholder', availableLanguages.find(l => l.code === (i18n.language || 'fr'))?.name || 'Français')}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={testTranslation}
                  isLoading={isTranslating}
                  className="whitespace-nowrap"
                  title={t('livret.testTranslation', 'Tester la traduction automatique')}
                >
                  🌐 {t('common.test', 'Tester')}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-4 flex items-center justify-center rounded overflow-hidden">
                  {(() => {
                    const currentLang = availableLanguages.find(l => l.code === (i18n.language || 'fr')) || availableLanguages[0];
                    return (
                      <img
                        src={`https://flagcdn.com/w40/${currentLang.countryCode}.png`}
                        alt={currentLang.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const emojiSpan = document.createElement('span');
                            emojiSpan.className = 'text-xl';
                            emojiSpan.textContent = currentLang.flag;
                            parent.appendChild(emojiSpan);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-500">
                  {t('livret.autoTranslation', 'La traduction automatique est activée sur ce champ.')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('livret.welcomeSubtitle', 'Texte 2 page d\'accueil (Sous titre)')}
              </label>
              <Input
                value={formData.welcomeSubtitle}
                onChange={(e) => setFormData({ ...formData, welcomeSubtitle: e.target.value })}
                placeholder={t('livret.welcomeSubtitlePlaceholder', availableLanguages.find(l => l.code === (i18n.language || 'fr'))?.name || 'Français')}
              />
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-4 flex items-center justify-center rounded overflow-hidden">
                  {(() => {
                    const currentLang = availableLanguages.find(l => l.code === (i18n.language || 'fr')) || availableLanguages[0];
                    return (
                      <img
                        src={`https://flagcdn.com/w40/${currentLang.countryCode}.png`}
                        alt={currentLang.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const emojiSpan = document.createElement('span');
                            emojiSpan.className = 'text-xl';
                            emojiSpan.textContent = currentLang.flag;
                            parent.appendChild(emojiSpan);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
                <span className="text-sm text-gray-500">
                  {t('livret.autoTranslation', 'La traduction automatique est activée sur ce champ.')}
                </span>
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isSaving} className="w-full sm:w-auto">
              {t('livret.save', 'Enregistrer')}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {t('livret.modules', 'Modules d\'information')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('livret.modulesDescription', 'Choisissez quels blocs d\'informations vous souhaitez activer pour vos voyageurs. Vous pouvez modifier l\'ordre des modules en maintenant le bouton ⋮⋮ présent sur chaque bloc.')}
          </p>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-3xl">📶</span>
            <span className="text-3xl">📅</span>
            <span className="text-3xl">👋</span>
            <span className="text-3xl">🔐</span>
            <span className="text-3xl">📞</span>
            <span className="text-3xl">✈️</span>
            <span className="text-3xl">🚗</span>
            <span className="text-3xl">🍽️</span>
          </div>
          <Link href={`/dashboard/livrets/${livretId}/modules`}>
            <Button variant="primary">
              {t('livret.manageModules', 'Gérer les modules')}
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            {t('livret.personalization', 'Personnalisation visuelle')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('livret.personalizationDescription', 'Personnalisez les couleurs, la police et l\'image de fond de votre livret.')}
          </p>
          <div className="mb-4 flex justify-start">
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-3 flex items-center justify-center shadow-md">
              <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              {/* Petites pastilles de couleur */}
              <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-400 rounded-full border-2 border-white"></div>
              <div className="absolute top-1.5 right-6 w-3 h-3 bg-blue-400 rounded-full border-2 border-white"></div>
              <div className="absolute top-1.5 right-10.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-1.5 right-6 w-3 h-3 bg-purple-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <Link href={`/dashboard/livrets/${livretId}/personalization`}>
            <Button variant="primary">
              {t('livret.customizeDesign', 'Personnaliser le design')}
            </Button>
          </Link>
        </div>

        {/* Section Affiche Imprimable */}
        {livret.qrCode && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t('livret.poster.title', 'Personnalisez votre affiche imprimable')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('livret.poster.description', 'Personnalisez, téléchargez et imprimez votre affiche. Vos visiteurs pourront scanner le QR code pour accéder à votre guide.')}
            </p>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative w-36 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-lg border-4 border-gray-400 p-3 flex flex-col items-center justify-center">
                    {/* Plaque murale stylisée */}
                    <div className="absolute inset-0 bg-gradient-to-br from-silver-200 to-silver-400 rounded-lg"></div>
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-2">
                      <div className="w-16 h-16 bg-white rounded border-2 border-gray-400 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div className="w-16 h-16 bg-white rounded border-2 border-gray-400 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                    </div>
                    {/* Vis de fixation */}
                    <div className="absolute top-2 left-2 w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-gray-600 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-gray-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <strong>{t('livret.poster.wallPlaque', 'Plaque murale personnalisée :')}</strong> {t('livret.poster.wallPlaqueDescription', 'Nous pouvons vous créer une plaque murale en alu avec le QR CODE du code wifi et QR code du livret de votre suite, contactez-nous pour plus de renseignements.')}
                  </p>
                </div>
              </div>
            </div>
            <Link href={`/dashboard/livrets/${livretId}/poster`}>
              <Button variant="primary">
                {t('livret.poster.customize', 'Personnaliser l\'affiche')}
              </Button>
            </Link>
          </div>
        )}

        {/* Section Carte de visite numérique */}
        {livret.qrCode && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              {t('livret.businessCard.title', 'Personnalisez votre carte de visite numérique')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('livret.businessCard.description', 'Créez une carte de visite professionnelle en ligne facilement ! Partagez vos informations et vos réseaux sociaux en un seul lien.')}
            </p>
            <div className="mb-4 flex justify-start">
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-3 flex items-center justify-center shadow-md">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                {/* Petites icônes de réseaux sociaux */}
                <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-blue-500 rounded border border-white"></div>
                <div className="absolute top-1.5 right-6 w-3 h-3 bg-pink-500 rounded border border-white"></div>
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 bg-green-500 rounded border border-white"></div>
                <div className="absolute bottom-1.5 right-6 w-3 h-3 bg-orange-500 rounded border border-white"></div>
              </div>
            </div>
            <Link href={`/dashboard/livrets/${livretId}/business-card`}>
              <Button variant="primary">
                {t('livret.businessCard.customize', 'Personnaliser la carte de visite')}
              </Button>
            </Link>
          </div>
        )}

        {/* Section Documents PDF pour le Chat */}
        {livret.qrCode && (
          <ChatDocumentsSection livretId={livretId} />
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('livret.statistics', 'Statistiques')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('livret.statisticsDescription', 'Consultez les statistiques d\'utilisation de votre livret : nombre d\'ouvertures, consultations par module, et historique détaillé.')}
          </p>
          <div className="mb-4 flex justify-start">
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-3 flex items-center justify-center shadow-md">
              <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {/* Petites barres de statistiques */}
              <div className="absolute top-1.5 right-1.5 w-2 h-4 bg-green-500 rounded-t border border-white"></div>
              <div className="absolute top-1.5 right-4 w-2 h-6 bg-green-600 rounded-t border border-white"></div>
              <div className="absolute bottom-1.5 right-1.5 w-2 h-5 bg-green-500 rounded-t border border-white"></div>
              <div className="absolute bottom-1.5 right-4 w-2 h-7 bg-green-600 rounded-t border border-white"></div>
            </div>
          </div>
          <Link href={`/dashboard/livrets/${livretId}/statistics`}>
            <Button variant="primary">
              {t('livret.viewStatistics', 'Voir les statistiques')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant pour gérer les documents texte du chat
function ChatDocumentsSection({ livretId }: { livretId: string }) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; documentId: string | null }>({
    isOpen: false,
    documentId: null,
  });

  useEffect(() => {
    loadDocuments();
  }, [livretId]);

  const loadDocuments = async () => {
    try {
      const response = await chatDocumentsApi.getAll(livretId);
      setDocuments(response.data.documents || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des documents:', err);
      toast.error(t('chatDocuments.loadError', 'Erreur lors du chargement des documents'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error(t('chatDocuments.titleRequired', 'Le titre est requis'));
      return;
    }

    if (!formData.content.trim()) {
      toast.error(t('chatDocuments.contentRequired', 'Le contenu est requis'));
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Mettre à jour
        await chatDocumentsApi.update(editingId, formData);
        toast.success(t('chatDocuments.updateSuccess', 'Document mis à jour avec succès'));
      } else {
        // Créer
        await chatDocumentsApi.create(livretId, formData);
        toast.success(t('chatDocuments.createSuccess', 'Document créé avec succès'));
      }
      setFormData({ title: '', content: '' });
      setShowAddForm(false);
      setEditingId(null);
      loadDocuments();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          t('chatDocuments.saveError', 'Erreur lors de la sauvegarde');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (doc: any) => {
    setFormData({ title: doc.title, content: doc.content });
    setEditingId(doc.id);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleDelete = (documentId: string) => {
    setDeleteConfirm({ isOpen: true, documentId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.documentId) return;

    try {
      await chatDocumentsApi.delete(deleteConfirm.documentId);
      toast.success(t('chatDocuments.deleteSuccess', 'PDF supprimé avec succès'));
      loadDocuments();
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      toast.error(t('chatDocuments.deleteError', 'Erreur lors de la suppression du document'));
    } finally {
      setDeleteConfirm({ isOpen: false, documentId: null });
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {t('chatDocuments.title', 'Documents pour le Chat')}
      </h2>
      <p className="text-gray-600 mb-4">
        {t('chatDocuments.description', 'Ajoutez du contenu texte pour enrichir les connaissances du chat. Ces documents seront utilisés pour répondre aux questions des voyageurs.')}
      </p>

      {/* Bouton pour ajouter un document */}
      {!showAddForm && (
        <div className="mb-6">
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
          >
            {t('chatDocuments.addDocument', '+ Ajouter un document')}
          </Button>
        </div>
      )}

      {/* Formulaire d'ajout/édition */}
      {showAddForm && (
        <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? t('chatDocuments.editDocument', 'Modifier le document') : t('chatDocuments.newDocument', 'Nouveau document')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('chatDocuments.documentTitle', 'Titre du document')}
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('chatDocuments.titlePlaceholder', 'Ex: Règles de la maison')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('chatDocuments.documentContent', 'Contenu')}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={t('chatDocuments.contentPlaceholder', 'Collez ou tapez votre texte ici...')}
                required
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('chatDocuments.contentHint', 'Ce texte sera utilisé par le chat pour répondre aux questions des voyageurs')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
              >
                {editingId ? t('common.update', 'Mettre à jour') : t('common.save', 'Enregistrer')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t('common.cancel', 'Annuler')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des documents */}
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">
          {t('common.loading', 'Chargement...')}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t('chatDocuments.noDocuments', 'Aucun document pour le moment')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{doc.title}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEdit(doc)}
                  >
                    {t('common.edit', 'Modifier')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    {t('common.delete', 'Supprimer')}
                  </Button>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                  {doc.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={t('chatDocuments.deleteConfirmTitle', 'Supprimer le document')}
        message={t('chatDocuments.deleteConfirm', 'Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')}
        confirmText={t('common.delete', 'Supprimer')}
        cancelText={t('common.cancel', 'Annuler')}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, documentId: null })}
      />
    </div>
  );
}
