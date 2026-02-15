'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import LanguageSelector from '@/components/LanguageSelector';

declare global {
  interface Window {
    google?: any;
  }
}

const ERROR_STORAGE_KEY = 'login-error';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoogleSuccess = useCallback(async (response: any) => {
    setIsGoogleLoading(true);
    try {
      const result = await authApi.googleAuth({ credential: response.credential });
      const { token, user } = result.data;
      setError('');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(ERROR_STORAGE_KEY);
      }
      toast.success(t('login.success', 'Connexion réussie !'));
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erreur Google Auth:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la connexion avec Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [router, setAuth, t]);

  // Charger le script Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSuccess,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn-login'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'center',
          }
        );
      }
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleGoogleSuccess]);

  // Charger l'erreur depuis sessionStorage au montage et la garder
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedError = sessionStorage.getItem(ERROR_STORAGE_KEY);
      if (storedError) {
        setError(storedError);
      }
    }
  }, []);

  // Mettre à jour sessionStorage quand l'erreur change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (error) {
        sessionStorage.setItem(ERROR_STORAGE_KEY, error);
      } else {
        sessionStorage.removeItem(ERROR_STORAGE_KEY);
      }
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ne pas réinitialiser l'erreur immédiatement - elle sera mise à jour après la réponse
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      
      // Nettoyer l'erreur en cas de succès
      setError('');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(ERROR_STORAGE_KEY);
      }
      
      toast.success(t('login.success', 'Connexion réussie !'));
      
      // Si "Rester connecté" est coché, sauvegarder le token dans localStorage (déjà fait par setAuth)
      // Sinon, le token sera dans sessionStorage seulement
      setAuth(token, user);
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erreur connexion:', err);
      
      // Gérer spécifiquement l'erreur 429 (Rate Limit)
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || 15 * 60;
        const minutes = Math.ceil(retryAfter / 60);
        const errorMessage = err.response?.data?.error || 
                            `Trop de tentatives de connexion. Veuillez réessayer dans ${minutes} minute(s).`;
        setError(errorMessage);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(ERROR_STORAGE_KEY, errorMessage);
        }
        toast.error(errorMessage);
        return;
      }
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          err.response?.data?.errors?.[0]?.msg ||
                          err.message || 
                          t('login.error', 'Erreur lors de la connexion');
      // Sauvegarder l'erreur dans sessionStorage pour persistance
      setError(errorMessage);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ERROR_STORAGE_KEY, errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Ne pas effacer l'erreur quand on tape - elle reste affichée
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-primary hover:text-primary/80 transition-colors">
            <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('login.backHome', 'Retour à l\'accueil')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('login.title', 'Bienvenue')}
          </h1>
          <p className="text-gray-600">
            {t('login.subtitle', 'Connectez-vous à votre compte')}
          </p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
          </div>
        </div>

        {/* Bouton Google */}
        <div className="mb-6">
          <div id="google-signin-btn-login" className="flex justify-center"></div>
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

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {error && (
            <div 
              key={error} 
              className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg animate-fade-in"
              style={{ display: 'block' }}
            >
              <div className="flex items-center">
                <span className="text-xl mr-2 flex-shrink-0">❌</span>
                <p className="font-semibold break-words">{error}</p>
              </div>
            </div>
          )}

          <Input
            label={t('login.email', 'Email')}
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
            placeholder="votre@email.com"
            autoComplete="off"
            name="login-email"
            id="login-email"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('login.password', 'Mot de passe')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                name="login-password"
                id="login-password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? t('login.hidePassword', 'Masquer le mot de passe') : t('login.showPassword', 'Afficher le mot de passe')}
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

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">{t('login.rememberMe', 'Rester connecté')}</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {t('login.forgotPassword', 'Mot de passe oublié ?')}
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {t('login.submit', 'Se connecter')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t('login.noAccount', 'Pas encore de compte ?')}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t('login.signup', 'S\'inscrire')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
