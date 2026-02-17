'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/lib/store';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCountrySet: (country: string) => void;
}

const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'IE', name: 'Irlande', flag: '🇮🇪' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'GR', name: 'Grèce', flag: '🇬🇷' },
  { code: 'HR', name: 'Croatie', flag: '🇭🇷' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'MU', name: 'Maurice', flag: '🇲🇺' },
  { code: 'RE', name: 'Réunion', flag: '🇷🇪' },
  { code: 'GP', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'MQ', name: 'Martinique', flag: '🇲🇶' },
  { code: 'PF', name: 'Polynésie française', flag: '🇵🇫' },
  { code: 'NC', name: 'Nouvelle-Calédonie', flag: '🇳🇨' },
];

export default function CountryModal({ isOpen, onClose, onCountrySet }: CountryModalProps) {
  const [selectedCountry, setSelectedCountry] = useState('FR');
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await authApi.updateProfile({ country: selectedCountry });
      updateUser({ country: selectedCountry });
      toast.success('Pays enregistré avec succès');
      onCountrySet(selectedCountry);
      onClose();
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde du pays');
    } finally {
      setIsLoading(false);
    }
  };

  const selected = countries.find(c => c.code === selectedCountry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations requises</h2>
          <p className="text-gray-500 mb-6">Pour accéder à nos tarifs, merci de renseigner votre pays</p>

          {/* Select pays */}
          <div className="text-left mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pays</label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full appearance-none pl-12 pr-10 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-base"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              {/* Drapeau en overlay */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                {selected?.flag}
              </div>
              {/* Chevron */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bouton Valider */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-all duration-300 disabled:opacity-50 text-base shadow-lg shadow-teal-500/25"
          >
            {isLoading ? 'Enregistrement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
}
