'use client';

import { useEffect, useState, useRef } from 'react';
import { authApi, uploadApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'PARTICULIER',
    profilePhoto: '',
    accommodationType: [] as string[],
  });
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formInitializedRef = useRef(false);

  // Initialiser le formulaire quand user est disponible
  // Le Layout gère déjà la redirection si non authentifié
  useEffect(() => {
    if (formInitializedRef.current) return;
    if (!user) return;
    
    formInitializedRef.current = true;
    setFormData({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      userType: user.userType || 'PARTICULIER',
      profilePhoto: user.profilePhoto || '',
      accommodationType: user.accommodationType || [],
    });
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await authApi.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profil mis à jour avec succès');
      setMessage('Profil mis à jour avec succès');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadApi.uploadProfilePhoto(file);
      const profilePhotoUrl = response.data.profilePhoto;
      setFormData({ ...formData, profilePhoto: profilePhotoUrl });
      updateUser(response.data.user);
      toast.success('Photo de profil uploadée avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'upload de la photo');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (!password || password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        setIsLoading(false);
        return;
      }

      // Vérifier la complexité du mot de passe côté client (le backend vérifiera aussi)
      if (!/[A-Z]/.test(password)) {
        toast.error('Le mot de passe doit contenir au moins une majuscule');
        setIsLoading(false);
        return;
      }
      if (!/[a-z]/.test(password)) {
        toast.error('Le mot de passe doit contenir au moins une minuscule');
        setIsLoading(false);
        return;
      }
      if (!/[0-9]/.test(password)) {
        toast.error('Le mot de passe doit contenir au moins un chiffre');
        setIsLoading(false);
        return;
      }

      await authApi.updatePassword({ password });
      setPassword('');
      toast.success('Mot de passe mis à jour avec succès');
      setMessage('Mot de passe mis à jour avec succès');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg ${
          message.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Informations personnelles
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vous êtes
            </label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PARTICULIER">Un particulier</option>
              <option value="SOCIETE">Une société</option>
            </select>
          </div>

          {/* Type d'hébergement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-xl">🏡</span>
              Quel type d&apos;hébergement proposez-vous ?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'CAMPING', label: 'Camping', emoji: '⛺' },
                { value: 'CHAMBRE_HOTES', label: 'Chambre d\'hôtes', emoji: '🏠' },
                { value: 'CONCIERGERIE', label: 'Conciergerie', emoji: '🔑' },
                { value: 'GESTIONNAIRE', label: 'Gestionnaire de locations', emoji: '🏢' },
                { value: 'PARTICULIER', label: 'Particulier', emoji: '👤' },
                { value: 'GITE', label: 'Gîte', emoji: '🏡' },
                { value: 'HOTEL', label: 'Hôtel', emoji: '🏨' },
              ].map((type) => {
                const isChecked = formData.accommodationType.includes(type.value);
                return (
                  <label
                    key={type.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.accommodationType, type.value]
                          : formData.accommodationType.filter((t) => t !== type.value);
                        setFormData({ ...formData, accommodationType: newTypes });
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-2xl">{type.emoji}</span>
                    <span className={`text-sm font-medium ${isChecked ? 'text-primary' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo de profil
            </label>
            
            {/* Zone de glisser-déposer */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileUpload(files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {formData.profilePhoto ? (
                <div className="flex flex-col items-center">
                  <img
                    src={(() => {
                      const photoPath = formData.profilePhoto;
                      if (photoPath.startsWith('http')) {
                        return photoPath;
                      }
                      // Utiliser l'IP locale si on est sur le réseau local, sinon localhost
                      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
                      const isLocalNetwork = hostname !== 'localhost' && hostname !== '127.0.0.1';
                      const backendHost = isLocalNetwork ? hostname : 'localhost';
                      return `http://${backendHost}:3001${photoPath}`;
                    })()}
                    alt="Photo de profil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                    onError={(e) => {
                      console.error('Erreur chargement image:', formData.profilePhoto);
                    }}
                  />
                  <p className="text-sm text-gray-600 mb-2">Photo actuelle</p>
                  <p className="text-xs text-gray-500">Cliquez ou glissez-déposez pour changer</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mb-2">Glissez-déposez votre photo ici</p>
                  <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
                  <p className="text-xs text-gray-400 mt-2">Formats acceptés: JPG, PNG, GIF (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading}>
            Enregistrer
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Changer le mot de passe</h2>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 caractères, majuscule, minuscule, chiffre"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre
            </p>
          </div>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Mettre à jour le mot de passe
          </Button>
        </form>
      </div>

      {/* Bloc Créer mon livret + mentions légales */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Prêt à accueillir vos voyageurs ?</h2>
        <p className="text-gray-500 mb-6 text-sm">Créez votre livret d&apos;accueil digital en quelques clics et offrez une expérience unique à vos hôtes.</p>
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto px-8"
          onClick={() => window.location.href = '/dashboard'}
        >
          Créer mon livret
        </Button>
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            En sélectionnant « Créer mon livret », vous confirmez avoir lu et accepté
            l&apos;ensemble des{' '}
            <a href="/conditions-generales" className="text-primary hover:underline">
              Conditions Générales d&apos;Utilisation et de Vente
            </a>{' '}
            de My Guide Digital.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Pour comprendre comment My Guide Digital collecte, utilise et sécurise vos
            informations personnelles, nous vous invitons à consulter notre{' '}
            <a href="/politique-confidentialite" className="text-primary hover:underline">
              Politique de confidentialité
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
