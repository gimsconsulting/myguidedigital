'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi, getCsrfToken } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Étape 1: Demander la réinitialisation
  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Étape 2: Réinitialiser avec le token
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Si un token est présent dans l'URL, on est à l'étape 2
  const isResetStep = !!token;

  // Étape 1: Demander la réinitialisation
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');

    if (!email) {
      setRequestError('Veuillez entrer votre adresse email');
      return;
    }

    setIsRequesting(true);

    try {
      // Récupérer le token CSRF avant de soumettre
      await getCsrfToken();
      
      const response = await authApi.forgotPassword({ email });
      setRequestSent(true);
      
      // En développement, afficher le token dans la console
      if (response.data.resetToken) {
        console.log('🔐 [DEV] Token de réinitialisation:', response.data.resetToken);
        console.log('🔗 [DEV] Lien complet:', response.data.resetUrl);
        toast.success('Lien de réinitialisation généré (voir console en dev)');
      } else {
        toast.success(response.data.message || 'Si cet email existe, un lien de réinitialisation a été envoyé.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg ||
                          err.message || 
                          'Erreur lors de la demande de réinitialisation';
      setRequestError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  // Étape 2: Réinitialiser avec le token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!token) {
      setResetError('Token de réinitialisation manquant');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setResetError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // Vérifier la complexité du mot de passe côté client (le backend vérifiera aussi)
    if (!/[A-Z]/.test(newPassword)) {
      setResetError('Le mot de passe doit contenir au moins une majuscule');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setResetError('Le mot de passe doit contenir au moins une minuscule');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setResetError('Le mot de passe doit contenir au moins un chiffre');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsResetting(true);

    try {
      // Récupérer le token CSRF avant de soumettre
      await getCsrfToken();
      
      await authApi.resetPassword({ token, password: newPassword });
      toast.success('Mot de passe réinitialisé avec succès !');
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.msg ||
                          err.message || 
                          'Erreur lors de la réinitialisation du mot de passe';
      setResetError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  // Si on est à l'étape 2 (avec token), afficher le formulaire de réinitialisation
  if (isResetStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link href="/login" className="inline-block mb-4 text-primary hover:text-primary/80 transition-colors">
              <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à la connexion
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Réinitialiser le mot de passe
            </h1>
            <p className="text-gray-600">
              Entrez votre nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6" autoComplete="off">
            {resetError && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2 flex-shrink-0">❌</span>
                  <p className="font-semibold break-words">{resetError}</p>
                </div>
              </div>
            )}

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 caractères, majuscule, minuscule, chiffre"
                  autoComplete="new-password"
                  name="new-password"
                  id="new-password"
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

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                  name="confirm-password"
                  id="confirm-password"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirmPassword ? (
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
              isLoading={isResetting}
              className="w-full"
            >
              Réinitialiser le mot de passe
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Étape 1: Demander la réinitialisation
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-primary/5 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block mb-4 text-primary hover:text-primary/80 transition-colors">
            <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la connexion
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-gray-600">
            {requestSent 
              ? 'Vérifiez votre email pour le lien de réinitialisation'
              : 'Entrez votre email pour recevoir un lien de réinitialisation'}
          </p>
        </div>

        {requestSent ? (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-xl mr-2 flex-shrink-0">✅</span>
                <p className="font-semibold">
                  Si cet email existe, un lien de réinitialisation a été envoyé.
                  Vérifiez votre boîte de réception (et vos spams).
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setRequestSent(false);
                setEmail('');
              }}
              className="w-full"
            >
              Demander un nouveau lien
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-6" autoComplete="off">
            {requestError && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-xl mr-2 flex-shrink-0">❌</span>
                  <p className="font-semibold break-words">{requestError}</p>
                </div>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              autoComplete="off"
              name="forgot-email"
              id="forgot-email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isRequesting}
              className="w-full"
            >
              Envoyer le lien de réinitialisation
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
