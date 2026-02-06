'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { modulesApi, livretsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

interface Module {
  id: string;
  type: string;
  name?: string;
  isActive: boolean;
  order: number;
  content?: any;
  translations?: any;
}

const MODULE_DESCRIPTIONS: Record<string, { name: string; icon: string; description: string }> = {
  WIFI: { name: 'Wi-fi', icon: '📶', description: 'Décrivez les informations de connexion Wi-Fi' },
  ARRIVEE: { name: 'Infos arrivée', icon: '📅', description: 'Informations sur l\'arrivée et le check-in' },
  ACCUEIL: { name: 'Mot d\'accueil', icon: '👋', description: 'Message de bienvenue personnalisé' },
  CODES_ENTREE: { name: 'Codes d\'entrée', icon: '🔐', description: 'Codes d\'accès et informations sur les serrures' },
  NUMEROS_UTILES: { name: 'Numéros utiles', icon: '📞', description: 'Contacts importants (propriétaire, voisinage, etc.)' },
  DEPART: { name: 'Infos départ', icon: '✈️', description: 'Informations sur le départ et le check-out' },
  PARKING: { name: 'Parking', icon: '🚗', description: 'Informations de stationnement' },
  RESTAURANTS: { name: 'Restaurants', icon: '🍽️', description: 'Recommandations de restaurants à proximité' },
  REGLEMENT: { name: 'Règlement', icon: '🚫', description: 'Règles de la maison et consignes' },
  EQUIPEMENTS: { name: 'Equipements', icon: '⚡', description: 'Décrivez les équipements disponibles (TV, micro-ondes, spa, etc.)' },
  BARS: { name: 'Bars', icon: '🍸', description: 'Recommandations de bars à proximité' },
  SECURITE: { name: 'Sécurité et secours', icon: '🏥', description: 'Numéros d\'urgence et informations de sécurité' },
  INVENTAIRE: { name: 'Inventaire', icon: '📋', description: 'Liste du contenu du logement' },
  ACTIVITES: { name: 'Activités', icon: '🏔️', description: 'Activités et attractions à proximité' },
  POUBELLES: { name: 'Poubelles', icon: '🗑️', description: 'Informations sur le tri des déchets et les jours de collecte' },
  AVIS: { name: 'Avis', icon: '⭐', description: 'Invitation à laisser un avis' },
  EXTRAS: { name: 'Extras & Services', icon: '🎁', description: 'Services supplémentaires disponibles' },
};

export default function EditModulePage() {
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;
  const moduleId = params.moduleId as string;

  const [module, setModule] = useState<Module | null>(null);
  const [livret, setLivret] = useState<any>(null);
  const [content, setContent] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [livretId, moduleId]);

  const loadData = async () => {
    try {
      const [modulesResponse, livretResponse] = await Promise.all([
        modulesApi.getByLivret(livretId),
        livretsApi.getOne(livretId),
      ]);

      const foundModule = modulesResponse.data.find((m: Module) => m.id === moduleId);

      if (!foundModule) {
        setError('Module non trouvé');
        setIsLoading(false);
        return;
      }

      setModule(foundModule);
      setLivret(livretResponse.data);
      
      // Le contenu devrait déjà être parsé par le backend
      setContent(foundModule.content || {});
    } catch (err: any) {
      setError('Erreur lors du chargement du module');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Convertir le contenu en JSON string pour SQLite
      const contentString = JSON.stringify(content);
      
      await modulesApi.update(moduleId, {
        content: contentString,
        isActive: module?.isActive,
      });
      
      toast.success('Module mis à jour avec succès');
      router.push(`/dashboard/livrets/${livretId}/modules`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await modulesApi.update(moduleId, {
        isActive: !module?.isActive,
        content: typeof content === 'string' ? content : JSON.stringify(content),
      });
      toast.success(`Module ${module?.isActive ? 'désactivé' : 'activé'} avec succès`);
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const updateContentField = (field: string, value: any) => {
    setContent({
      ...content,
      [field]: value,
    });
  };

  // Helper pour extraire l'ID d'une vidéo YouTube ou Vimeo
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

  const renderModuleEditor = () => {
    if (!module) return null;

    const moduleInfo = MODULE_DESCRIPTIONS[module.type] || { name: module.type, icon: '📄', description: '' };

    switch (module.type) {
      case 'WIFI':
        return (
          <div className="space-y-4">
            <Input
              label="Nom du réseau Wi-Fi (SSID)"
              value={content.ssid || ''}
              onChange={(e) => updateContentField('ssid', e.target.value)}
              placeholder="Ex: MonAppartement_WiFi"
            />
            <Input
              label="Mot de passe Wi-Fi"
              type="password"
              value={content.password || ''}
              onChange={(e) => updateContentField('password', e.target.value)}
              placeholder="Entrez le mot de passe"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions supplémentaires (optionnel)
              </label>
              <textarea
                value={content.instructions || ''}
                onChange={(e) => updateContentField('instructions', e.target.value)}
                placeholder="Ex: Le Wi-Fi se trouve dans le salon, près de la télévision"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de vidéo (optionnel)
              </label>
              <Input
                value={content.videoUrl || ''}
                onChange={(e) => updateContentField('videoUrl', e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Supporte YouTube et Vimeo
              </p>
              {content.videoUrl && getVideoEmbedUrl(content.videoUrl) && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <iframe
                    src={getVideoEmbedUrl(content.videoUrl) || ''}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        );

      case 'EQUIPEMENTS':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ajouter un équipement
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="newEquipment"
                  placeholder="Ex: Télévision"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget as HTMLInputElement;
                      const equipment = input.value.trim();
                      if (equipment) {
                        const equipments = content.equipments || [];
                        updateContentField('equipments', [...equipments, { name: equipment, description: '' }]);
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const input = document.getElementById('newEquipment') as HTMLInputElement;
                    const equipment = input.value.trim();
                    if (equipment) {
                      const equipments = content.equipments || [];
                      updateContentField('equipments', [...equipments, { name: equipment, description: '' }]);
                      input.value = '';
                    }
                  }}
                >
                  Ajouter
                </Button>
              </div>
            </div>
            {(content.equipments || []).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Mes équipements</h3>
                <div className="space-y-2">
                  {(content.equipments || []).map((eq: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{eq.name}</div>
                        {eq.description && (
                          <div className="text-sm text-gray-600">{eq.description}</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const equipments = content.equipments || [];
                          updateContentField('equipments', equipments.filter((_: any, i: number) => i !== index));
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de vidéo (optionnel)
              </label>
              <Input
                value={content.videoUrl || ''}
                onChange={(e) => updateContentField('videoUrl', e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Supporte YouTube et Vimeo
              </p>
              {content.videoUrl && getVideoEmbedUrl(content.videoUrl) && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={getVideoEmbedUrl(content.videoUrl) || ''}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        );

      default:
        // Éditeur générique pour les autres modules
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre (optionnel)
              </label>
              <Input
                value={content.title || ''}
                onChange={(e) => updateContentField('title', e.target.value)}
                placeholder="Titre du module"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu
              </label>
              <textarea
                value={content.text || ''}
                onChange={(e) => updateContentField('text', e.target.value)}
                placeholder="Saisissez le contenu de ce module..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                rows={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de vidéo (optionnel)
              </label>
              <Input
                value={content.videoUrl || ''}
                onChange={(e) => updateContentField('videoUrl', e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Supporte YouTube et Vimeo
              </p>
              {content.videoUrl && getVideoEmbedUrl(content.videoUrl) && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={getVideoEmbedUrl(content.videoUrl) || ''}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Module non trouvé</div>
      </div>
    );
  }

  const moduleInfo = MODULE_DESCRIPTIONS[module.type] || { name: module.type, icon: '📄', description: '' };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/livrets/${livretId}/modules`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Retour aux modules
        </Link>
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{moduleInfo.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{moduleInfo.name}</h1>
            <p className="text-gray-600">{moduleInfo.description}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">Module actif</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={module.isActive}
              onChange={handleToggleActive}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Contenu du module</h2>
        {renderModuleEditor()}
        <div className="mt-6 flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/livrets/${livretId}/modules`)}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
