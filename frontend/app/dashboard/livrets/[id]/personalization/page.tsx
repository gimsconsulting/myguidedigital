'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { livretsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { SketchPicker } from 'react-color';

interface Livret {
  id: string;
  name: string;
  backgroundImage?: string;
  showProfilePhoto?: boolean;
  titleFont?: string;
  titleColor?: string;
  subtitleColor?: string;
  tileColor?: string;
  iconColor?: string;
}

const FONTS = [
  { name: 'Par défaut', value: '' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
];

export default function PersonalizationPage() {
  const router = useRouter();
  const params = useParams();
  const livretId = params.id as string;

  const [livret, setLivret] = useState<Livret | null>(null);
  const [formData, setFormData] = useState({
    showProfilePhoto: true,
    titleFont: '',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    tileColor: 'rgba(0, 0, 0, 0.7)',
    iconColor: '#FFFFFF',
    backgroundImage: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  useEffect(() => {
    loadLivret();
  }, [livretId]);

  const loadLivret = async () => {
    try {
      const response = await livretsApi.getOne(livretId);
      const data = response.data;
      setLivret(data);
      setFormData({
        showProfilePhoto: data.showProfilePhoto ?? true,
        titleFont: data.titleFont || '',
        titleColor: data.titleColor || '#FFFFFF',
        subtitleColor: data.subtitleColor || '#FFFFFF',
        tileColor: data.tileColor || 'rgba(0, 0, 0, 0.7)',
        iconColor: data.iconColor || '#FFFFFF',
        backgroundImage: data.backgroundImage || '',
      });
    } catch (err: any) {
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await livretsApi.update(livretId, {
        showProfilePhoto: formData.showProfilePhoto,
        titleFont: formData.titleFont,
        titleColor: formData.titleColor,
        subtitleColor: formData.subtitleColor,
        tileColor: formData.tileColor,
        iconColor: formData.iconColor,
        backgroundImage: formData.backgroundImage,
      });
      toast.success('Personnalisation enregistrée avec succès');
      loadLivret();
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (field: string, color: any) => {
    const colorValue = color.rgb 
      ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a || 1})`
      : color.hex;
    setFormData({ ...formData, [field]: colorValue });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/livrets/${livretId}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Retour à l'édition du livret
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Personnalisation visuelle</h1>
        <p className="text-gray-600 mt-2">
          Personnalisez l'apparence de votre livret côté voyageur
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image de fond */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Image de fond</h2>
          <p className="text-gray-600 mb-4">
            Cliquez sur l'image ci-dessous pour changer l'image de fond du livret.
            Vous pouvez utiliser des images gratuites depuis{' '}
            <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Pexels.com
            </a>
          </p>
          <Input
            label="URL de l'image de fond"
            value={formData.backgroundImage}
            onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
            placeholder="https://images.pexels.com/photos/..."
          />
          {formData.backgroundImage && (
            <div className="mt-4">
              <img
                src={formData.backgroundImage}
                alt="Aperçu"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Paramètres de design */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Paramètres de design</h2>

          <div className="space-y-6">
            {/* Afficher la photo de profil */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Afficher la photo de profil
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showProfilePhoto}
                  onChange={(e) => setFormData({ ...formData, showProfilePhoto: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Police d'écriture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police d'écriture
              </label>
              <select
                value={formData.titleFont}
                onChange={(e) => setFormData({ ...formData, titleFont: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {FONTS.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Couleur du titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du titre
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.titleColor }}
                  onClick={() => setShowColorPicker(showColorPicker === 'title' ? null : 'title')}
                />
                <Input
                  value={formData.titleColor}
                  onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
              {showColorPicker === 'title' && (
                <div className="mt-2">
                  <SketchPicker
                    color={formData.titleColor}
                    onChange={(color) => handleColorChange('titleColor', color)}
                  />
                </div>
              )}
            </div>

            {/* Couleur du sous-titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du sous-titre
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.subtitleColor }}
                  onClick={() => setShowColorPicker(showColorPicker === 'subtitle' ? null : 'subtitle')}
                />
                <Input
                  value={formData.subtitleColor}
                  onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
              {showColorPicker === 'subtitle' && (
                <div className="mt-2">
                  <SketchPicker
                    color={formData.subtitleColor}
                    onChange={(color) => handleColorChange('subtitleColor', color)}
                  />
                </div>
              )}
            </div>

            {/* Couleur des vignettes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur des vignettes (modules)
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Choisissez la couleur et la transparence qui vous convient
              </p>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.tileColor }}
                  onClick={() => setShowColorPicker(showColorPicker === 'tile' ? null : 'tile')}
                />
                <Input
                  value={formData.tileColor}
                  onChange={(e) => setFormData({ ...formData, tileColor: e.target.value })}
                  placeholder="rgba(0, 0, 0, 0.7)"
                  className="flex-1"
                />
              </div>
              {showColorPicker === 'tile' && (
                <div className="mt-2">
                  <SketchPicker
                    color={formData.tileColor}
                    onChange={(color) => handleColorChange('tileColor', color)}
                  />
                </div>
              )}
            </div>

            {/* Couleur des icônes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur des icônes
              </label>
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: formData.iconColor }}
                  onClick={() => setShowColorPicker(showColorPicker === 'icon' ? null : 'icon')}
                />
                <Input
                  value={formData.iconColor}
                  onChange={(e) => setFormData({ ...formData, iconColor: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
              {showColorPicker === 'icon' && (
                <div className="mt-2">
                  <SketchPicker
                    color={formData.iconColor}
                    onChange={(color) => handleColorChange('iconColor', color)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/livrets/${livretId}`)}
          >
            Annuler
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Mettre à jour
          </Button>
        </div>
      </form>
    </div>
  );
}
