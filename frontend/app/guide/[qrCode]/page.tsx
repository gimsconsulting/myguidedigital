'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { livretsApi, statisticsApi } from '@/lib/api';
import Image from 'next/image';
import ChatWidget from '@/components/ChatWidget';

interface Module {
  id: string;
  type: string;
  name?: string;
  isActive: boolean;
  order: number;
  content?: any;
}

interface Livret {
  id: string;
  name: string;
  address?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  backgroundImage?: string;
  showProfilePhoto?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  tileColor?: string;
  iconColor?: string;
  titleFont?: string;
  languages?: string[];
  translations?: Record<string, { welcomeTitle?: string; welcomeSubtitle?: string }>;
  modules: Module[];
  user?: {
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
  };
}

const MODULE_ICONS: Record<string, string> = {
  WIFI: '📶',
  ARRIVEE: '📅',
  ACCUEIL: '👋',
  CODES_ENTREE: '🔐',
  NUMEROS_UTILES: '📞',
  DEPART: '✈️',
  PARKING: '🚗',
  RESTAURANTS: '🍽️',
  REGLEMENT: '🚫',
  EQUIPEMENTS: '⚡',
  BARS: '🍸',
  SECURITE: '🏥',
  INVENTAIRE: '📋',
  ACTIVITES: '🏔️',
  POUBELLES: '🗑️',
  AVIS: '⭐',
  EXTRAS: '🎁',
};

const MODULE_NAMES: Record<string, Record<string, string>> = {
  WIFI: {
    fr: 'Wi-fi',
    en: 'Wi-fi',
    de: 'Wi-Fi',
    it: 'Wi-Fi',
    es: 'Wi-Fi',
    pt: 'Wi-Fi',
    zh: 'Wi-Fi',
    ru: 'Wi-Fi',
    nl: 'Wi-Fi',
  },
  ARRIVEE: {
    fr: 'Infos arrivée',
    en: 'Arrival info',
    de: 'Ankunftsinformationen',
    it: 'Informazioni arrivo',
    es: 'Información de llegada',
    pt: 'Informações de chegada',
    zh: '到达信息',
    ru: 'Информация о прибытии',
    nl: 'Aankomstinformatie',
  },
  ACCUEIL: {
    fr: 'Mot d\'accueil',
    en: 'Welcome message',
    de: 'Willkommensnachricht',
    it: 'Messaggio di benvenuto',
    es: 'Mensaje de bienvenida',
    pt: 'Mensagem de boas-vindas',
    zh: '欢迎信息',
    ru: 'Приветственное сообщение',
    nl: 'Welkomstbericht',
  },
  CODES_ENTREE: {
    fr: 'Codes d\'entrée',
    en: 'Entry codes',
    de: 'Zugangscodes',
    it: 'Codici di accesso',
    es: 'Códigos de entrada',
    pt: 'Códigos de entrada',
    zh: '入口代码',
    ru: 'Коды доступа',
    nl: 'Toegangscodes',
  },
  NUMEROS_UTILES: {
    fr: 'Numéros utiles',
    en: 'Useful numbers',
    de: 'Nützliche Nummern',
    it: 'Numeri utili',
    es: 'Números útiles',
    pt: 'Números úteis',
    zh: '有用号码',
    ru: 'Полезные номера',
    nl: 'Nuttige nummers',
  },
  DEPART: {
    fr: 'Infos départ',
    en: 'Departure info',
    de: 'Abreiseinformationen',
    it: 'Informazioni partenza',
    es: 'Información de salida',
    pt: 'Informações de partida',
    zh: '出发信息',
    ru: 'Информация об отъезде',
    nl: 'Vertrekinformatie',
  },
  PARKING: {
    fr: 'Parking',
    en: 'Parking',
    de: 'Parkplatz',
    it: 'Parcheggio',
    es: 'Aparcamiento',
    pt: 'Estacionamento',
    zh: '停车场',
    ru: 'Парковка',
    nl: 'Parkeren',
  },
  RESTAURANTS: {
    fr: 'Restaurants',
    en: 'Restaurants',
    de: 'Restaurants',
    it: 'Ristoranti',
    es: 'Restaurantes',
    pt: 'Restaurantes',
    zh: '餐厅',
    ru: 'Рестораны',
    nl: 'Restaurants',
  },
  REGLEMENT: {
    fr: 'Règlement',
    en: 'Rules',
    de: 'Regeln',
    it: 'Regole',
    es: 'Reglas',
    pt: 'Regras',
    zh: '规则',
    ru: 'Правила',
    nl: 'Regels',
  },
  EQUIPEMENTS: {
    fr: 'Equipements',
    en: 'Equipment',
    de: 'Ausstattung',
    it: 'Attrezzature',
    es: 'Equipamiento',
    pt: 'Equipamentos',
    zh: '设备',
    ru: 'Оборудование',
    nl: 'Uitrusting',
  },
  BARS: {
    fr: 'Bars',
    en: 'Bars',
    de: 'Bars',
    it: 'Bar',
    es: 'Bares',
    pt: 'Bares',
    zh: '酒吧',
    ru: 'Бары',
    nl: 'Bars',
  },
  SECURITE: {
    fr: 'Sécurité et secours',
    en: 'Safety and emergency',
    de: 'Sicherheit und Notfall',
    it: 'Sicurezza e soccorso',
    es: 'Seguridad y emergencias',
    pt: 'Segurança e emergência',
    zh: '安全与紧急情况',
    ru: 'Безопасность и помощь',
    nl: 'Veiligheid en hulp',
  },
  INVENTAIRE: {
    fr: 'Inventaire',
    en: 'Inventory',
    de: 'Inventar',
    it: 'Inventario',
    es: 'Inventario',
    pt: 'Inventário',
    zh: '清单',
    ru: 'Инвентарь',
    nl: 'Inventaris',
  },
  ACTIVITES: {
    fr: 'Activités',
    en: 'Activities',
    de: 'Aktivitäten',
    it: 'Attività',
    es: 'Actividades',
    pt: 'Atividades',
    zh: '活动',
    ru: 'Мероприятия',
    nl: 'Activiteiten',
  },
  POUBELLES: {
    fr: 'Poubelles',
    en: 'Waste disposal',
    de: 'Müllentsorgung',
    it: 'Rifiuti',
    es: 'Residuos',
    pt: 'Descarte de lixo',
    zh: '垃圾处理',
    ru: 'Утилизация отходов',
    nl: 'Afvalverwijdering',
  },
  AVIS: {
    fr: 'Avis',
    en: 'Reviews',
    de: 'Bewertungen',
    it: 'Recensioni',
    es: 'Reseñas',
    pt: 'Avaliações',
    zh: '评论',
    ru: 'Отзывы',
    nl: 'Beoordelingen',
  },
  EXTRAS: {
    fr: 'Extras & Services',
    en: 'Extras & Services',
    de: 'Extras & Services',
    it: 'Extra e Servizi',
    es: 'Extras y Servicios',
    pt: 'Extras e Serviços',
    zh: '额外服务',
    ru: 'Дополнительные услуги',
    nl: 'Extras & Diensten',
  },
};

const LANGUAGES = [
  { code: 'fr', name: 'Français', countryCode: 'fr' },
  { code: 'en', name: 'English', countryCode: 'gb' },
  { code: 'de', name: 'Deutsch', countryCode: 'de' },
  { code: 'it', name: 'Italiano', countryCode: 'it' },
  { code: 'es', name: 'Español', countryCode: 'es' },
  { code: 'pt', name: 'Português', countryCode: 'pt' },
  { code: 'zh', name: '中文', countryCode: 'cn' },
  { code: 'ru', name: 'Русский', countryCode: 'ru' },
  { code: 'nl', name: 'Nederlands', countryCode: 'nl' },
];

export default function GuidePage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  
  const [livret, setLivret] = useState<Livret | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLivret();
  }, [qrCode]);

  const loadLivret = async () => {
    try {
      console.log('Chargement livret avec QR code:', qrCode);
      const response = await livretsApi.getPublic(qrCode);
      console.log('Réponse reçue:', response.data);
      const data = response.data;
      
      // Parser les langues si c'est une string
      if (typeof data.languages === 'string') {
        try {
          data.languages = JSON.parse(data.languages);
        } catch (e) {
          data.languages = ['fr'];
        }
      }
      
      // Parser les traductions si c'est une string
      if (typeof data.translations === 'string') {
        try {
          data.translations = JSON.parse(data.translations);
        } catch (e) {
          console.warn('Erreur parsing translations:', e);
          data.translations = {};
        }
      }
      
      console.log('📦 Livret chargé avec traductions:', {
        languages: data.languages,
        translations: data.translations,
        translationsType: typeof data.translations,
        translationsKeys: data.translations ? Object.keys(data.translations) : 'null',
        welcomeTitle: data.welcomeTitle,
        welcomeSubtitle: data.welcomeSubtitle,
      });
      
      // Log détaillé des traductions
      if (data.translations) {
        console.log('🔍 Détails des traductions:', JSON.stringify(data.translations, null, 2));
      } else {
        console.warn('⚠️ Aucune traduction trouvée dans les données reçues');
      }
      
      setLivret(data);
      
      // Définir la langue par défaut
      if (data.languages && data.languages.length > 0) {
        setSelectedLanguage(data.languages[0]);
      }
    } catch (err: any) {
      console.error('Erreur chargement livret:', err);
      console.error('Détails:', err.response?.data);
      setError(err.response?.data?.message || 'Livret non trouvé ou inaccessible');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleClick = async (module: Module) => {
    // Enregistrer la consultation
    try {
      await statisticsApi.recordView({
        livretId: livret!.id,
        moduleType: module.type,
      });
    } catch (err) {
      // Ignore errors
    }

    // Naviguer vers la page de détail du module
    window.location.href = `/guide/${qrCode}/${module.id}`;
  };

  // Recalculer les textes affichés à chaque changement de langue ou livret
  // IMPORTANT: Les hooks doivent être appelés AVANT les retours conditionnels
  const displayedTitle = useMemo(() => {
    if (!livret || !selectedLanguage) {
      return livret?.welcomeTitle || 'Bienvenue';
    }

    // Vérifier si une traduction existe pour la langue sélectionnée
    if (livret.translations && livret.translations[selectedLanguage]) {
      const translation = livret.translations[selectedLanguage];
      if (translation.welcomeTitle) {
        console.log(`🌐 Titre traduit vers ${selectedLanguage}:`, translation.welcomeTitle);
        return translation.welcomeTitle;
      }
    }

    // Si pas de traduction pour cette langue, retourner le texte original
    console.log(`⚠️ Pas de traduction pour ${selectedLanguage}, utilisation du texte original`);
    return livret.welcomeTitle || 'Bienvenue';
  }, [livret, selectedLanguage]);

  const displayedSubtitle = useMemo(() => {
    if (!livret || !selectedLanguage) {
      return livret?.welcomeSubtitle || '';
    }

    // Vérifier si une traduction existe pour la langue sélectionnée
    if (livret.translations && livret.translations[selectedLanguage]) {
      const translation = livret.translations[selectedLanguage];
      if (translation.welcomeSubtitle) {
        console.log(`🌐 Sous-titre traduit vers ${selectedLanguage}:`, translation.welcomeSubtitle);
        return translation.welcomeSubtitle;
      }
    }

    // Si pas de traduction pour cette langue, retourner le texte original
    return livret.welcomeSubtitle || '';
  }, [livret, selectedLanguage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du livret...</p>
        </div>
      </div>
    );
  }

  if (error || !livret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Livret non trouvé'}</p>
          <p className="text-gray-600">Vérifiez que le QR code est correct.</p>
        </div>
      </div>
    );
  }

  const activeModules = livret.modules
    .filter(m => m.isActive)
    .sort((a, b) => a.order - b.order);

  const availableLanguages = LANGUAGES.filter(lang => 
    livret.languages?.includes(lang.code)
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Image de fond avec animation */}
      {livret.backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${livret.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-gray-900"></div>
      )}

      {/* Contenu */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header avec sélecteur de langue - amélioré */}
        <div className="flex justify-between items-center p-4 md:p-6 backdrop-blur-sm bg-black/20">
          <div className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">
            Livrets d&apos;Accueil
          </div>
          {availableLanguages.length > 0 && (
            <div className="flex space-x-2">
              {availableLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    console.log('🔄 Changement de langue vers:', lang.code);
                    setSelectedLanguage(lang.code);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm md:text-base transition-all transform hover:scale-110 flex items-center justify-center ${
                    selectedLanguage === lang.code
                      ? 'bg-white text-primary font-semibold shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                  title={lang.name}
                >
                  <div className="w-6 h-4 md:w-8 md:h-5 flex items-center justify-center rounded overflow-hidden border border-gray-300">
                    <img
                      src={`https://flagcdn.com/w40/${lang.countryCode}.png`}
                      alt={lang.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const emojiSpan = document.createElement('span');
                          emojiSpan.className = 'text-lg md:text-xl';
                          // Fallback emoji selon le code
                          const emojiMap: Record<string, string> = {
                            'fr': '🇫🇷', 'en': '🇬🇧', 'de': '🇩🇪', 'it': '🇮🇹',
                            'es': '🇪🇸', 'pt': '🇵🇹', 'zh': '🇨🇳', 'ru': '🇷🇺', 'nl': '🇳🇱'
                          };
                          emojiSpan.textContent = emojiMap[lang.code] || '🌐';
                          parent.appendChild(emojiSpan);
                        }
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center">
          <div className="max-w-5xl mx-auto w-full text-center">
            {/* Photo de profil avec animation */}
            {livret.showProfilePhoto !== false && livret.user?.profilePhoto && (
              <div className="mb-6 animate-fade-in">
                <div className="relative inline-block">
                  <img
                    src={(() => {
                      const photoPath = livret.user!.profilePhoto!;
                      if (photoPath.startsWith('http')) {
                        return photoPath;
                      }
                      // Utiliser l'IP locale si on est sur le réseau local, sinon localhost
                      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                      const isLocalNetwork = hostname !== 'localhost' && hostname !== '127.0.0.1';
                      const backendHost = isLocalNetwork ? hostname : 'localhost';
                      return `http://${backendHost}:3001${photoPath}`;
                    })()}
                    alt={`${livret.user.firstName || ''} ${livret.user.lastName || ''}`.trim() || 'Profil'}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto border-4 border-white shadow-2xl object-cover ring-4 ring-white/50"
                    onError={(e) => {
                      console.error('Erreur chargement photo de profil:', livret.user?.profilePhoto);
                      // Cacher l'image si elle ne charge pas
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                </div>
              </div>
            )}
            {/* Afficher un message si la photo de profil devrait être affichée mais n'est pas disponible */}
            {livret.showProfilePhoto !== false && !livret.user?.profilePhoto && (
              <div className="mb-6 text-white/80 text-sm">
                Photo de profil non disponible
              </div>
            )}

            {/* Titre et sous-titre avec animation */}
            <div className="animate-slide-up mb-8 md:mb-12">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl"
                style={{ 
                  color: livret.titleColor || '#FFFFFF',
                  fontFamily: livret.titleFont || undefined,
                }}
              >
                {displayedTitle}
              </h1>
              {displayedSubtitle && (
                <p 
                  className="text-lg md:text-2xl lg:text-3xl mb-8 drop-shadow-lg"
                  style={{ color: livret.subtitleColor || '#FFFFFF' }}
                >
                  {displayedSubtitle}
                </p>
              )}
            </div>

            {/* Modules avec animations améliorées */}
            {activeModules.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {activeModules.map((module, index) => (
                  <button
                    key={module.id}
                    onClick={() => handleModuleClick(module)}
                    className="group bg-white/20 backdrop-blur-md rounded-2xl p-6 md:p-8 hover:bg-white/40 hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 animate-fade-in"
                    style={{
                      backgroundColor: livret.tileColor 
                        ? (livret.tileColor.includes('rgba') 
                            ? livret.tileColor.replace(/[\d\.]+\)$/g, '0.2)')
                            : livret.tileColor.length === 7 
                              ? `${livret.tileColor}33` 
                              : livret.tileColor.length === 9 && livret.tileColor.startsWith('#')
                                ? livret.tileColor.substring(0, 7) + '33'
                                : livret.tileColor)
                        : 'rgba(255, 255, 255, 0.2)',
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div 
                      className="text-5xl md:text-6xl mb-4 transition-transform duration-300 group-hover:scale-125"
                      style={{ color: livret.iconColor || '#000000' }}
                    >
                      {MODULE_ICONS[module.type] || '📄'}
                    </div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base">
                      {MODULE_NAMES[module.type]?.[selectedLanguage] || MODULE_NAMES[module.type]?.['fr'] || module.type}
                    </div>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 md:p-12 mt-12 shadow-xl">
                <p className="text-gray-600 text-lg">Aucun module disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Widget de chat */}
        <ChatWidget />
      </div>
    </div>
  );
}
