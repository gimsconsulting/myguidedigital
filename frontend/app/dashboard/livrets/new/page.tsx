'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { livretsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';

export default function NewLivretPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!name.trim()) {
        toast.error(t('livret.nameRequired', 'Le nom du livret est requis'));
        return;
      }

      const response = await livretsApi.create({
        name,
        address,
        languages: ['fr'],
      });
      toast.success(t('livret.createSuccess', 'Livret créé avec succès !'));
      router.push(`/dashboard/livrets/${response.data.id}`);
    } catch (err: any) {
      console.error('Erreur création livret:', err);
      console.error('Détails:', err.response?.data);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.details ||
                          err.message || 
                          t('livret.createError', 'Erreur lors de la création du livret');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4"
        >
          ← {t('common.back', 'Retour')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{t('livret.createNew', 'Créer un nouveau livret')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('livret.nameVisibleOnly', 'Nom du livret (visible uniquement par vous)')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('livret.namePlaceholder', 'Ex: Mon appartement à Paris')}
          />

          <Input
            label={t('livret.address', 'Adresse postale du logement')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('livret.addressPlaceholder', 'Adresse de votre logement')}
          />

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              {t('livret.create', 'Créer le livret')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
