'use client';

import { useEffect, useState, useRef } from 'react';
import { authApi, uploadApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'PARTICULIER',
    profilePhoto: '',
    companyName: '',
    vatNumber: '',
    address: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    accommodationType: [] as string[],
  });
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formInitializedRef = useRef(false);

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
      companyName: user.companyName || '',
      vatNumber: user.vatNumber || '',
      address: user.address || '',
      street: user.street || '',
      postalCode: user.postalCode || '',
      city: user.city || '',
      country: user.country || '',
      accommodationType: user.accommodationType || [],
    });
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 5MB)");
      return;
    }
    setIsUploading(true);
    try {
      const response = await uploadApi.uploadProfilePhoto(file);
      const profilePhotoUrl = response.data.profilePhoto;
      setFormData({ ...formData, profilePhoto: profilePhotoUrl });
      updateUser(response.data.user);
      toast.success('Photo de profil mise à jour !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!password || password.length < 8) {
        toast.error('Le mot de passe doit contenir au moins 8 caractères');
        setIsLoading(false);
        return;
      }
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilePhotoUrl = () => {
    const photoPath = formData.profilePhoto;
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    
    if (typeof window === 'undefined') return photoPath;
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Localhost → backend direct sur port 3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:3001${photoPath}`;
    }
    
    // Production (nom de domaine) → passer par /api/uploads via nginx
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    if (!isIp) {
      // photoPath = "/uploads/profile-xxx.jpg" → on ajoute /api devant
      return `${protocol}//${hostname}/api${photoPath}`;
    }
    
    // IP locale (réseau local) → backend direct sur port 3001
    return `${protocol}//${hostname}:3001${photoPath}`;
  };

  const completionFields = [
    { label: 'Prénom', done: !!formData.firstName },
    { label: 'Nom', done: !!formData.lastName },
    { label: 'Email', done: !!formData.email },
    { label: 'Téléphone', done: !!formData.phone },
    { label: 'Adresse', done: !!formData.street },
    { label: 'Pays', done: !!formData.country },
    { label: 'Hébergement', done: formData.accommodationType.length > 0 },
    { label: 'Photo', done: !!formData.profilePhoto },
  ];
  const completionCount = completionFields.filter(f => f.done).length;
  const completionPercent = Math.round((completionCount / completionFields.length) * 100);

  const accommodationTypes = [
    { value: 'LOCATION_COURTE_DUREE', label: 'Location courte durée', emoji: '🏠', desc: 'Airbnb, Booking, chambres d\'hôtes, gîtes, particulier' },
    { value: 'CONCIERGERIE', label: 'Conciergerie', emoji: '🔑', desc: 'Services de conciergerie' },
    { value: 'HOTEL', label: 'Hôtel', emoji: '🏨', desc: 'Hôtels & résidences' },
    { value: 'CAMPING', label: 'Camping', emoji: '⛺', desc: 'Campings & centres de vacances' },
  ];

  const sections = [
    { id: 'info', label: 'Informations', icon: '👤' },
    { id: 'accommodation', label: 'Hébergement', icon: '🏡' },
    { id: 'photo', label: 'Photo', icon: '📷' },
    { id: 'password', label: 'Sécurité', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════ */}
        {/* HEADER PROFIL */}
        {/* ══════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-pink-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <div
                  className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center cursor-pointer overflow-hidden border-4 border-white/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.profilePhoto ? (
                    <img
                      src={getProfilePhotoUrl()}
                      alt="Profil"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-4xl">
                      {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : '👤'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Info header */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.lastName}`.trim()
                    : 'Mon Profil'}
                </h1>
                <p className="text-white/60 mt-1">{formData.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/80 border border-white/10">
                    {formData.userType === 'SOCIETE' ? '🏢 Société' : '👤 Particulier'}
                  </span>
                  {formData.accommodationType.length > 0 && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary-light border border-primary/20">
                      {formData.accommodationType.length} type{formData.accommodationType.length > 1 ? 's' : ''} d&apos;hébergement
                    </span>
                  )}
                  {formData.country && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                      📍 {formData.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Completion */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke="url(#grad-completion)"
                      strokeWidth="6"
                      strokeDasharray={`${(completionPercent / 100) * 201} 201`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad-completion" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{completionPercent}%</span>
                  </div>
                </div>
                <span className="text-xs text-white/50">Profil complété</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input file TOUJOURS présent dans le DOM pour upload photo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
          }}
        />

        {/* ══════════════════════════════════════ */}
        {/* NAVIGATION SECTIONS */}
        {/* ══════════════════════════════════════ */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg shadow-primary/20'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-primary/30'
              }`}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════ */}
        {/* SECTION: INFORMATIONS PERSONNELLES */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'info' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-pink-500/5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <span className="text-white">👤</span>
                  </div>
                  Informations personnelles
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-13">Gérez votre identité et vos coordonnées</p>
              </div>

              <div className="p-6 space-y-5">
                {/* Nom / Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Votre prénom"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Votre nom"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-xs">✏️</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <span className="text-xs">✉️</span>
                    </div>
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+32 xxx xx xx xx"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-xs">📱</span>
                    </div>
                  </div>
                </div>

                {/* Type utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vous êtes</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'PARTICULIER', label: 'Particulier', icon: '👤', desc: 'Propriétaire individuel' },
                      { value: 'SOCIETE', label: 'Société', icon: '🏢', desc: 'Entreprise ou organisation' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type.value })}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                          formData.userType === type.value
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-gray-200 hover:border-primary/30 bg-white'
                        }`}
                      >
                        {formData.userType === type.value && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className="text-2xl">{type.icon}</span>
                        <p className="font-semibold text-gray-900 mt-2">{type.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champs conditionnels Société */}
                {formData.userType === 'SOCIETE' && (
                  <div className="space-y-4 p-5 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs">🏢</span>
                      </div>
                      Coordonnées de la société
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la société</label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="Ma Société"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de TVA</label>
                        <input
                          type="text"
                          value={formData.vatNumber}
                          onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                          placeholder="BE0123456789"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rue et numéro</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="Rue, numéro"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          placeholder="Code postal"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Ville"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      >
                        <option value="">Sélectionnez un pays</option>
                        <option value="Allemagne">🇩🇪 Allemagne</option>
                        <option value="Belgique">🇧🇪 Belgique</option>
                        <option value="Croatie">🇭🇷 Croatie</option>
                        <option value="Espagne">🇪🇸 Espagne</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Irlande">🇮🇪 Irlande</option>
                        <option value="Italie">🇮🇹 Italie</option>
                        <option value="Luxembourg">🇱🇺 Luxembourg</option>
                        <option value="Monaco">🇲🇨 Monaco</option>
                        <option value="Pays-Bas">🇳🇱 Pays-Bas</option>
                        <option value="Portugal">🇵🇹 Portugal</option>
                        <option value="Royaume-Uni">🇬🇧 Royaume-Uni</option>
                        <option value="Suisse">🇨🇭 Suisse</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Champs conditionnels Particulier */}
                {formData.userType === 'PARTICULIER' && (
                  <div className="space-y-4 p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-emerald-200/50">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white text-xs">👤</span>
                      </div>
                      Vos coordonnées
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rue et numéro</label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        placeholder="Rue, numéro"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          placeholder="Code postal"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Ville"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      >
                        <option value="">Sélectionnez un pays</option>
                        <option value="Allemagne">🇩🇪 Allemagne</option>
                        <option value="Belgique">🇧🇪 Belgique</option>
                        <option value="Croatie">🇭🇷 Croatie</option>
                        <option value="Espagne">🇪🇸 Espagne</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Irlande">🇮🇪 Irlande</option>
                        <option value="Italie">🇮🇹 Italie</option>
                        <option value="Luxembourg">🇱🇺 Luxembourg</option>
                        <option value="Monaco">🇲🇨 Monaco</option>
                        <option value="Pays-Bas">🇳🇱 Pays-Bas</option>
                        <option value="Portugal">🇵🇹 Portugal</option>
                        <option value="Royaume-Uni">🇬🇧 Royaume-Uni</option>
                        <option value="Suisse">🇨🇭 Suisse</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton save */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Créer mon compte
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════ */}
        {/* SECTION: TYPE D'HÉBERGEMENT */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'accommodation' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white">🏡</span>
                  </div>
                  Type d&apos;hébergement
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-13">Sélectionnez un ou plusieurs types d&apos;hébergement que vous proposez</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accommodationTypes.map((type) => {
                    const isChecked = formData.accommodationType.includes(type.value);
                    return (
                      <label
                        key={type.value}
                        className={`relative group cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 ${
                          isChecked
                            ? 'border-primary bg-gradient-to-br from-primary/5 to-pink-500/5 shadow-lg shadow-primary/10'
                            : 'border-gray-200 hover:border-primary/40 bg-white hover:shadow-md'
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
                          className="sr-only"
                        />
                        {/* Checkmark */}
                        <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isChecked
                            ? 'bg-gradient-to-r from-primary to-pink-500 scale-100'
                            : 'bg-gray-100 scale-90'
                        }`}>
                          {isChecked && (
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        <span className="text-4xl block mb-3">{type.emoji}</span>
                        <p className={`font-bold text-sm ${isChecked ? 'text-primary' : 'text-gray-900'}`}>
                          {type.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{type.desc}</p>
                      </label>
                    );
                  })}
                </div>

                {/* Résumé sélection */}
                {formData.accommodationType.length > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-pink-500/5 rounded-xl border border-primary/10">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-primary">{formData.accommodationType.length}</span> type{formData.accommodationType.length > 1 ? 's' : ''} sélectionné{formData.accommodationType.length > 1 ? 's' : ''} :
                      {' '}
                      {formData.accommodationType.map(v => {
                        const t = accommodationTypes.find(at => at.value === v);
                        return t ? `${t.emoji} ${t.label}` : v;
                      }).join(' • ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer mes choix
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════ */}
        {/* SECTION: PHOTO DE PROFIL */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'photo' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white">📷</span>
                </div>
                Photo de profil
              </h2>
              <p className="text-sm text-gray-500 mt-1 ml-13">Personnalisez votre avatar pour une touche professionnelle</p>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center">
                {/* Preview */}
                <div className="relative group mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                    {formData.profilePhoto ? (
                      <img
                        src={getProfilePhotoUrl()}
                        alt="Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">
                        {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : '👤'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full max-w-md border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-violet-500 bg-violet-50 scale-[1.02]'
                      : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/30'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin mb-4"></div>
                      <p className="text-sm text-gray-600">Upload en cours...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-medium mb-1">Glissez-déposez votre photo ici</p>
                      <p className="text-sm text-gray-400">ou cliquez pour parcourir vos fichiers</p>
                      <div className="flex gap-2 justify-center mt-4">
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">JPG</span>
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">PNG</span>
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">GIF</span>
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">Max 5MB</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* SECTION: SÉCURITÉ */}
        {/* ══════════════════════════════════════ */}
        {activeSection === 'password' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="text-white">🔒</span>
                  </div>
                  Sécurité du compte
                </h2>
                <p className="text-sm text-gray-500 mt-1 ml-13">Changez votre mot de passe pour sécuriser votre compte</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Minimum 8 caractères"
                      className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-amber-400/10 flex items-center justify-center">
                      <span className="text-xs">🔐</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
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
                </div>

                {/* Indicateurs force du mot de passe */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: '8+ caractères', met: password.length >= 8 },
                    { label: '1 majuscule', met: /[A-Z]/.test(password) },
                    { label: '1 minuscule', met: /[a-z]/.test(password) },
                    { label: '1 chiffre', met: /[0-9]/.test(password) },
                  ].map((rule, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                        rule.met
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-100'
                      }`}
                    >
                      {rule.met ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                      )}
                      {rule.label}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Mettre à jour le mot de passe
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* CTA CRÉER MON LIVRET */}
        {/* ══════════════════════════════════════ */}
        <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          <div className="relative z-10 text-left">
            <h2 className="text-2xl font-bold text-white mb-2">
              Prêt à accueillir vos voyageurs ? ✨
            </h2>
            <p className="text-white/60 mb-6 max-w-xl">
              Créez votre livret d&apos;accueil digital en quelques clics et offrez une expérience unique à vos hôtes.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-xl"
            >
              Créer mon livret
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* MENTIONS LÉGALES */}
        {/* ══════════════════════════════════════ */}
        <div className="mt-6 p-5 rounded-xl bg-white/60 border border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            En sélectionnant « Créer mon livret », vous confirmez avoir lu et accepté
            l&apos;ensemble des{' '}
            <a href="/conditions-generales" className="text-primary hover:underline font-medium">
              Conditions Générales d&apos;Utilisation et de Vente
            </a>{' '}
            de My Guide Digital.
            Pour comprendre comment My Guide Digital collecte, utilise et sécurise vos
            informations personnelles, nous vous invitons à consulter notre{' '}
            <a href="/politique-confidentialite" className="text-primary hover:underline font-medium">
              Politique de confidentialité
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
}
