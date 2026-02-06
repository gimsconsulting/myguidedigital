'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { livretsApi, statisticsApi } from '@/lib/api';
import Link from 'next/link';

interface Module {
  id: string;
  type: string;
  name?: string;
  content?: any;
  translations?: Record<string, any>;
}

interface Livret {
  id: string;
  name: string;
  languages?: string[];
  modules: Module[];
}

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

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qrCode = params.qrCode as string;
  const moduleId = params.moduleId as string;

  const [livret, setLivret] = useState<Livret | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(true);

  const LANGUAGES = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  ];

  useEffect(() => {
    loadData();
  }, [qrCode, moduleId]);

  // Re-rendre le contenu quand la langue change
  useEffect(() => {
    // Le contenu sera automatiquement mis à jour via getTranslatedContent()
  }, [selectedLanguage, module]);

  const loadData = async () => {
    try {
      const response = await livretsApi.getPublic(qrCode);
      const data = response.data;
      
      // Parser les modules avec traductions
      const modulesWithParsedContent = (data.modules || []).map((m: any) => {
        let parsedContent = {};
        let parsedTranslations = {};
        try {
          parsedContent = typeof m.content === 'string' ? JSON.parse(m.content) : (m.content || {});
          parsedTranslations = typeof m.translations === 'string' ? JSON.parse(m.translations) : (m.translations || {});
        } catch (e) {}
        return { ...m, content: parsedContent, translations: parsedTranslations };
      });

      // Parser les langues
      let parsedLanguages = ['fr'];
      if (data.languages) {
        try {
          parsedLanguages = typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages;
        } catch (e) {
          parsedLanguages = ['fr'];
        }
      }

      setLivret({ ...data, modules: modulesWithParsedContent, languages: parsedLanguages });
      
      // Définir la langue par défaut
      if (parsedLanguages.length > 0) {
        setSelectedLanguage(parsedLanguages[0]);
      }
      
      const foundModule = modulesWithParsedContent.find((m: Module) => m.id === moduleId);
      if (foundModule) {
        setModule(foundModule);
        
        // Enregistrer la consultation
        try {
          await statisticsApi.recordView({
            livretId: data.id,
            moduleType: foundModule.type,
          });
        } catch (err) {
          // Ignore
        }
      }
    } catch (err: any) {
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper pour extraire l'URL d'embed d'une vidéo YouTube ou Vimeo
  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Si c'est déjà une URL d'embed, la retourner telle quelle
    if (url.includes('youtube.com/embed') || url.includes('vimeo.com/video')) {
      return url;
    }
    
    return null;
  };

  // Composant pour afficher une vidéo
  const renderVideo = (videoUrl: string | undefined) => {
    if (!videoUrl) return null;
    
    const embedUrl = getVideoEmbedUrl(videoUrl);
    if (!embedUrl) return null;
    
    return (
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <span>🎥</span>
          <span>Vidéo</span>
        </h3>
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  };

  // Fonction pour obtenir le contenu traduit selon la langue sélectionnée
  const getTranslatedContent = (): any => {
    if (!module) return null;

    // Si des traductions existent pour la langue sélectionnée, les utiliser
    if (module.translations && module.translations[selectedLanguage]) {
      return module.translations[selectedLanguage];
    }

    // Sinon, utiliser le contenu original
    return module.content || null;
  };

  const renderModuleContent = () => {
    const content = getTranslatedContent();
    
    if (!content) {
      return <p className="text-gray-600">Aucun contenu disponible pour ce module.</p>;
    }

    switch (module.type) {
      case 'WIFI':
        return (
          <div className="space-y-6">
            {content.ssid && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>📶</span>
                  <span>Nom du réseau (SSID)</span>
                </h3>
                <p className="text-xl bg-white p-4 rounded-lg font-mono shadow-sm border border-gray-200">{content.ssid}</p>
              </div>
            )}
            {content.password && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <span>🔑</span>
                  <span>Mot de passe</span>
                </h3>
                <p className="text-xl bg-white p-4 rounded-lg font-mono shadow-sm border border-gray-200">{content.password}</p>
              </div>
            )}
            {content.instructions && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{content.instructions}</p>
              </div>
            )}
            {renderVideo(content.videoUrl)}
          </div>
        );

      case 'EQUIPEMENTS':
        return (
          <div className="space-y-4">
            {(content.equipments || []).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {content.equipments.map((eq: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{eq.name}</h3>
                    {eq.description && (
                      <p className="text-gray-700 leading-relaxed">{eq.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-600">Aucun équipement listé.</p>
              </div>
            )}
            {renderVideo(content.videoUrl)}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {content.title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{content.title}</h2>
            )}
            {content.text && (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg bg-gray-50 p-6 rounded-xl border border-gray-200">
                {content.text}
              </div>
            )}
            {renderVideo(content.videoUrl)}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!module || !livret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">Module non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header amélioré */}
      <div className="bg-white shadow-md sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={`/guide/${qrCode}`}
              className="text-primary hover:text-primary/80 font-semibold flex items-center space-x-2 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour au livret</span>
            </Link>
            <div className="text-xl font-bold text-gray-900">Livrets d&apos;Accueil</div>
            {livret?.languages && livret.languages.length > 0 && (
              <div className="flex space-x-2">
                {LANGUAGES.filter(lang => livret.languages?.includes(lang.code)).map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all transform hover:scale-110 ${
                      selectedLanguage === lang.code
                        ? 'bg-primary text-white font-semibold shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title={lang.name}
                  >
                    <span className="text-lg">{lang.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal amélioré */}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 animate-fade-in">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {MODULE_NAMES[module.type]?.[selectedLanguage] || MODULE_NAMES[module.type]?.['fr'] || module.type}
            </h1>
          </div>
          <div className="prose prose-lg max-w-none">
            {renderModuleContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
