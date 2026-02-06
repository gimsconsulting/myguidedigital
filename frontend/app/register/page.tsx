'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import LanguageSelector from '@/components/LanguageSelector';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentative d\'inscription avec:', { email: formData.email, firstName: formData.firstName });
      const response = await authApi.register(formData);
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
        config: err.config,
      });
      
      let errorMessage = t('register.error', 'Erreur lors de l\'inscription');
      
      if (err.message && err.message.includes('URL')) {
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
            {t('register.subtitle', 'Commencez votre essai gratuit de 30 jours')}
          </p>
          <div className="mt-4 flex justify-center">
            <LanguageSelector />
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
                placeholder={t('register.minLength', 'Minimum 6 caractères')}
                minLength={6}
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
