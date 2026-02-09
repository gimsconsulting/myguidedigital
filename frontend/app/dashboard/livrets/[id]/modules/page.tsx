'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { modulesApi, livretsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Module {
  id: string;
  type: string;
  name?: string;
  isActive: boolean;
  order: number;
  content?: any;
  translations?: any;
}

const MODULE_TYPES = [
  { id: 'WIFI', name: 'Wi-fi', icon: '📶', description: 'Informations de connexion Wi-Fi' },
  { id: 'ARRIVEE', name: 'Infos arrivée', icon: '📅', description: 'Informations sur l\'arrivée' },
  { id: 'ACCUEIL', name: 'Mot d\'accueil', icon: '👋', description: 'Message de bienvenue personnalisé' },
  { id: 'CODES_ENTREE', name: 'Codes d\'entrée', icon: '🔐', description: 'Codes d\'accès et serrures' },
  { id: 'NUMEROS_UTILES', name: 'Numéros utiles', icon: '📞', description: 'Contacts importants' },
  { id: 'DEPART', name: 'Infos départ', icon: '✈️', description: 'Informations sur le départ' },
  { id: 'PARKING', name: 'Parking', icon: '🚗', description: 'Informations de stationnement' },
  { id: 'RESTAURANTS', name: 'Restaurants', icon: '🍽️', description: 'Recommandations de restaurants' },
  { id: 'REGLEMENT', name: 'Règlement', icon: '🚫', description: 'Règles de la maison' },
  { id: 'EQUIPEMENTS', name: 'Equipements', icon: '⚡', description: 'Équipements disponibles' },
  { id: 'BARS', name: 'Bars', icon: '🍸', description: 'Recommandations de bars' },
  { id: 'SECURITE', name: 'Sécurité et secours', icon: '🏥', description: 'Numéros d\'urgence et sécurité' },
  { id: 'INVENTAIRE', name: 'Inventaire', icon: '📋', description: 'Liste du contenu du logement' },
  { id: 'ACTIVITES', name: 'Activités', icon: '🏔️', description: 'Activités à proximité' },
  { id: 'POUBELLES', name: 'Poubelles', icon: '🗑️', description: 'Informations sur le tri des déchets' },
  { id: 'AVIS', name: 'Avis', icon: '⭐', description: 'Laissez un avis' },
  { id: 'EXTRAS', name: 'Extras & Services', icon: '🎁', description: 'Services supplémentaires' },
];

// Composant pour un module draggable
function SortableModuleItem({ module, livretId, onToggleActive, onDelete, getModuleInfo }: {
  module: Module;
  livretId: string;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  getModuleInfo: (type: string, moduleName?: string) => { name: string; icon: string; description: string };
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const moduleInfo = getModuleInfo(module.type, module.name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md p-6 flex items-center justify-between ${
        isDragging ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-center space-x-4 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 text-2xl select-none"
          title="Maintenez et glissez pour réorganiser"
        >
          ⋮⋮
        </div>
        <div className="text-3xl">{moduleInfo.icon}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">
              {moduleInfo.name}
            </h3>
            {module.type === 'CUSTOM' && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                Personnalisé
              </span>
            )}
            {module.isActive ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Actif
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                Inactif
              </span>
            )}
          </div>
          {module.type !== 'CUSTOM' && moduleInfo.description && (
            <p className="text-sm text-gray-600">{moduleInfo.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={module.isActive}
            onChange={() => onToggleActive(module.id, module.isActive)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
        <Link href={`/dashboard/livrets/${livretId}/modules/${module.id}`}>
          <Button variant="primary" size="sm">
            Modifier
          </Button>
        </Link>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(module.id)}
        >
          Supprimer
        </Button>
      </div>
    </div>
  );
}

export default function ModulesPage() {
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;

  const [livret, setLivret] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showCustomModuleModal, setShowCustomModuleModal] = useState(false);
  const [customModuleTitle, setCustomModuleTitle] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; moduleId: string | null }>({
    isOpen: false,
    moduleId: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, [livretId]);

  const loadData = async () => {
    try {
      const [livretResponse, modulesResponse] = await Promise.all([
        livretsApi.getOne(livretId),
        modulesApi.getByLivret(livretId),
      ]);
      setLivret(livretResponse.data);
      // S'assurer que les modules sont triés par ordre
      const sortedModules = [...modulesResponse.data].sort((a, b) => a.order - b.order);
      setModules(sortedModules);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModule = async (moduleType: string) => {
    try {
      console.log('Ajout module:', { livretId, type: moduleType });
      const response = await modulesApi.create({
        livretId,
        type: moduleType,
        content: {},
        translations: {},
      });
      console.log('Module ajouté:', response.data);
      toast.success('Module ajouté avec succès');
      setShowAddModule(false);
      loadData();
    } catch (err: any) {
      console.error('Erreur complète:', err);
      console.error('Réponse erreur:', err.response?.data);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.details ||
                          err.message || 
                          'Erreur lors de l\'ajout du module';
      toast.error(errorMessage);
    }
  };

  const handleToggleModuleSelection = (moduleType: string) => {
    setSelectedModules(prev => {
      if (prev.includes(moduleType)) {
        return prev.filter(type => type !== moduleType);
      } else {
        return [...prev, moduleType];
      }
    });
  };

  const handleAddSelectedModules = async () => {
    if (selectedModules.length === 0) {
      toast.error('Veuillez sélectionner au moins un module');
      return;
    }

    setIsAddingMultiple(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Ajouter les modules un par un
      for (const moduleType of selectedModules) {
        try {
          await modulesApi.create({
            livretId,
            type: moduleType,
            content: {},
            translations: {},
          });
          successCount++;
        } catch (err: any) {
          console.error(`Erreur ajout module ${moduleType}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} module(s) ajouté(s) avec succès`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} module(s) n'a(ont) pas pu être ajouté(s)`);
      }

      setSelectedModules([]);
      setShowAddModule(false);
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de l\'ajout des modules');
    } finally {
      setIsAddingMultiple(false);
    }
  };

  const handleCreateCustomModule = async () => {
    if (!customModuleTitle.trim()) {
      toast.error('Veuillez saisir un titre pour le module');
      return;
    }

    try {
      console.log('Ajout module personnalisé:', { livretId, type: 'CUSTOM', name: customModuleTitle });
      const response = await modulesApi.create({
        livretId,
        type: 'CUSTOM',
        name: customModuleTitle.trim(),
        content: {},
        translations: {},
      });
      console.log('Module personnalisé ajouté:', response.data);
      toast.success('Module personnalisé créé avec succès');
      setShowCustomModuleModal(false);
      setCustomModuleTitle('');
      setShowAddModule(false);
      loadData();
    } catch (err: any) {
      console.error('Erreur création module personnalisé:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.details ||
                          err.message || 
                          'Erreur lors de la création du module personnalisé';
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (moduleId: string, currentStatus: boolean) => {
    try {
      await modulesApi.update(moduleId, { isActive: !currentStatus });
      toast.success(`Module ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = (moduleId: string) => {
    setDeleteConfirm({ isOpen: true, moduleId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.moduleId) return;

    try {
      await modulesApi.delete(deleteConfirm.moduleId);
      toast.success('Module supprimé avec succès');
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteConfirm({ isOpen: false, moduleId: null });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // S'assurer que les modules sont triés par ordre
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);
    
    const oldIndex = sortedModules.findIndex((m) => m.id === active.id);
    const newIndex = sortedModules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      console.error('Module non trouvé dans la liste');
      return;
    }

    const newModules = arrayMove(sortedModules, oldIndex, newIndex);
    
    // Mettre à jour l'ordre localement immédiatement pour un feedback visuel
    setModules(newModules);

    // Mettre à jour l'ordre dans la base de données
    try {
      setIsReordering(true);
      const moduleOrders = newModules.map((module, index) => ({
        id: module.id,
        order: index + 1,
      }));

      console.log('Réorganisation des modules:', { livretId, moduleOrders });

      await modulesApi.reorder({
        livretId,
        moduleOrders,
      });

      console.log('Modules réorganisés avec succès');
      
      // Mettre à jour l'ordre des modules dans l'état local avec le nouvel ordre
      // pour éviter un rechargement qui pourrait causer un flash
      const updatedModules = newModules.map((module, index) => ({
        ...module,
        order: index + 1,
      }));
      setModules(updatedModules);
      
      // Optionnel : recharger depuis le serveur après un court délai pour synchroniser
      // (mais on garde l'état local pour un feedback immédiat)
      setTimeout(async () => {
        try {
          const modulesResponse = await modulesApi.getByLivret(livretId);
          const sortedModules = [...modulesResponse.data].sort((a, b) => a.order - b.order);
          setModules(sortedModules);
        } catch (err) {
          console.error('Erreur lors du rechargement des modules:', err);
        }
      }, 500);
    } catch (err: any) {
      console.error('Erreur lors de la réorganisation:', err);
      console.error('Détails de l\'erreur:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.message || 
                          'Erreur lors de la réorganisation des modules';
      
      alert(`Erreur: ${errorMessage}`);
      
      // Recharger les données en cas d'erreur pour restaurer l'ordre original
      await loadData();
    } finally {
      setIsReordering(false);
    }
  };

  const getModuleInfo = (type: string, moduleName?: string) => {
    if (type === 'CUSTOM' && moduleName) {
      return { name: moduleName, icon: '📝', description: 'Module personnalisé' };
    }
    return MODULE_TYPES.find(m => m.id === type) || { name: type, icon: '📄', description: '' };
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Chargement...</div>
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
          ← Retour à l'édition du livret
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Modules d'information - {livret?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez les modules d'information de votre livret. Vous pouvez modifier l'ordre en maintenant et glissant le bouton ⋮⋮ présent sur chaque module.
        </p>
      </div>

      {!livret?.address && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          ⚠️ Veuillez renseigner l'adresse de votre logement dans les informations de base du livret.
        </div>
      )}

      <div className="mb-6">
        <Button
          variant="primary"
          onClick={() => {
            setShowAddModule(!showAddModule);
            if (showAddModule) {
              // Réinitialiser la sélection quand on ferme
              setSelectedModules([]);
            }
          }}
        >
          {showAddModule ? 'Annuler' : '+ Créer un module'}
        </Button>
      </div>

      {showAddModule && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Choisir un ou plusieurs modules à ajouter</h2>
            {selectedModules.length > 0 && (
              <Button
                variant="primary"
                onClick={handleAddSelectedModules}
                isLoading={isAddingMultiple}
              >
                Ajouter {selectedModules.length} module(s) sélectionné(s)
              </Button>
            )}
          </div>
          
          {/* Module personnalisé */}
          <div className="mb-6 p-4 border-2 border-dashed border-primary rounded-lg bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📝</span>
                  <div>
                    <div className="font-semibold text-gray-900">Module personnalisé</div>
                    <div className="text-sm text-gray-600">Créez un module avec votre propre titre</div>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowCustomModuleModal(true)}
              >
                Créer un module personnalisé
              </Button>
            </div>
          </div>

          {/* Modules prédéfinis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULE_TYPES.map((moduleType) => {
              const alreadyAdded = modules.some(m => m.type === moduleType.id);
              const isSelected = selectedModules.includes(moduleType.id);
              return (
                <div
                  key={moduleType.id}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    alreadyAdded
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'border-primary bg-primary/10 shadow-md cursor-pointer'
                      : 'border-gray-300 hover:border-primary hover:bg-primary/5 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!alreadyAdded) {
                      handleToggleModuleSelection(moduleType.id);
                    }
                  }}
                  onDoubleClick={() => {
                    if (!alreadyAdded) {
                      handleAddModule(moduleType.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{moduleType.icon}</div>
                    {!alreadyAdded && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleModuleSelection(moduleType.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                      />
                    )}
                  </div>
                  <div className="font-semibold text-gray-900">{moduleType.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{moduleType.description}</div>
                  {alreadyAdded && (
                    <div className="text-xs text-gray-500 mt-2">Déjà ajouté</div>
                  )}
                  {isSelected && !alreadyAdded && (
                    <div className="text-xs text-primary font-medium mt-2">✓ Sélectionné</div>
                  )}
                  {!alreadyAdded && (
                    <div className="text-xs text-gray-400 mt-2 italic">Double-clic pour ajouter directement</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton d'ajout en bas si des modules sont sélectionnés */}
          {selectedModules.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
              <Button
                variant="primary"
                onClick={handleAddSelectedModules}
                isLoading={isAddingMultiple}
                size="lg"
              >
                Ajouter {selectedModules.length} module(s) sélectionné(s)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal pour créer un module personnalisé */}
      {showCustomModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Créer un module personnalisé</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du module
                </label>
                <input
                  type="text"
                  value={customModuleTitle}
                  onChange={(e) => setCustomModuleTitle(e.target.value)}
                  placeholder="Ex: Informations sur la plage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomModule();
                    }
                    if (e.key === 'Escape') {
                      setShowCustomModuleModal(false);
                      setCustomModuleTitle('');
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce titre sera visible par vos voyageurs
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomModuleModal(false);
                    setCustomModuleTitle('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateCustomModule}
                  disabled={!customModuleTitle.trim()}
                >
                  Créer le module
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 mb-4">Aucun module ajouté pour le moment</p>
          <Button variant="primary" onClick={() => setShowAddModule(true)}>
            Ajouter votre premier module
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {modules
                .sort((a, b) => a.order - b.order)
                .map((module) => (
                  <SortableModuleItem
                    key={module.id}
                    module={module}
                    livretId={livretId}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    getModuleInfo={getModuleInfo}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Supprimer le module"
        message="Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, moduleId: null })}
      />
    </div>
  );
}
