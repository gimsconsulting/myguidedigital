'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { authApi, getCsrfToken, resetCsrfToken } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import LanguageSelector from '@/components/LanguageSelector';

declare global {
  interface Window {
    google?: any;
    handleGoogleCallback?: (response: any) => void;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get('ref') || '';
  const { t, i18n } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSuccess = useCallback(async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const result = await authApi.googleAuth({ credential: response.credential });
      const { token, user } = result.data;
      toast.success(t('register.success', 'Inscription réussie ! Bienvenue !'));
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erreur Google Auth:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la connexion avec Google';
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [router, setAuth, t]);

  // Charger le script Google avec la bonne langue et rendre le bouton
  useEffect(() => {
    const lang = i18n.language || 'fr';

    // Supprimer l'ancien script Google si présent (pour forcer le rechargement avec la nouvelle langue)
    const oldScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (oldScript) {
      oldScript.remove();
      // Réinitialiser l'objet google pour forcer un rechargement propre
      delete (window as any).google;
    }

    const script = document.createElement('script');
    script.src = `https://accounts.google.com/gsi/client?hl=${lang}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSuccess,
        });
        const container = document.getElementById('google-signin-btn-register');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'pill',
            logo_alignment: 'center',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [handleGoogleSuccess, i18n.language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Récupérer le token CSRF avant de soumettre (à chaque fois pour être sûr)
      try {
        await getCsrfToken();
        console.log('✅ Token CSRF récupéré');
      } catch (csrfError) {
        console.error('❌ Erreur récupération CSRF:', csrfError);
        toast.error('Erreur de sécurité. Veuillez rafraîchir la page.');
        setIsLoading(false);
        return;
      }
      
      console.log('Tentative d\'inscription avec:', { email: formData.email, firstName: formData.firstName, referralCode });
      const response = await authApi.register({ ...formData, referralCode: referralCode || undefined } as any);
      console.log('Réponse reçue:', response);
      const { token, user } = response.data;
      
      toast.success(t('register.success', 'Inscription réussie ! Bienvenue !'));
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erreur inscription complète:', err);
      console.error('Erreur details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      
      let errorMessage = t('register.error', 'Erreur lors de l\'inscription');
      
      // Gérer spécifiquement l'erreur CSRF (403)
      if (err.response?.status === 403 && (err.response?.data?.code === 'CSRF_TOKEN_MISSING' || err.response?.data?.code === 'CSRF_TOKEN_INVALID')) {
        errorMessage = 'Erreur de sécurité. Veuillez rafraîchir la page et réessayer.';
        // Réinitialiser le token CSRF pour en obtenir un nouveau
        resetCsrfToken();
      } else if (err.response?.status === 429) {
        // Gérer le rate limiting
        const retryAfter = err.response?.data?.retryAfter || 60 * 60;
        const minutes = Math.ceil(retryAfter / 60);
        errorMessage = err.response?.data?.error || `Trop de tentatives. Veuillez réessayer dans ${minutes} minute(s).`;
      } else if (err.message && err.message.includes('URL')) {
        errorMessage = 'Erreur de configuration: URL API invalide. Vérifiez la console pour plus de détails.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors?.[0]?.msg) {
        errorMessage = err.response.data.errors[0].msg;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-primary hover:text-primary/80 transition-colors">
            <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('register.backHome', 'Retour à l\'accueil')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('register.title', 'Créer un compte')}
          </h1>
          <p className="text-gray-600">
            {t('register.subtitle', 'Commencez votre essai gratuit de 14 jours')}
          </p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        {/* Bouton Google */}
        <div className="mb-6">
          <div id="google-signin-btn-register" className="flex justify-center"></div>
          {isGoogleLoading && (
            <div className="flex items-center justify-center mt-2">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-sm text-gray-500">Connexion en cours...</span>
            </div>
          )}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">ou</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('register.firstName', 'Prénom')}
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jean"
            />

            <Input
              label={t('register.lastName', 'Nom')}
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Dupont"
            />
          </div>

          <Input
            label={t('register.email', 'Email')}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="votre@email.com"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('register.password', 'Mot de passe')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 8 caractères, majuscule, minuscule, chiffre"
                minLength={8}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? t('register.hidePassword', 'Masquer le mot de passe') : t('register.showPassword', 'Afficher le mot de passe')}
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {t('register.submit', 'S\'inscrire')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t('register.hasAccount', 'Déjà un compte ?')}{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t('register.login', 'Se connecter')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
