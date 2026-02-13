'use client';

import { useEffect } from 'react';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🔴 [PROFILE ERROR] Erreur sur la page profil:', error);
    console.error('🔴 [PROFILE ERROR] Message:', error.message);
    console.error('🔴 [PROFILE ERROR] Stack:', error.stack);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur sur la page Profil
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'Une erreur inconnue est survenue'}
        </p>
        <details className="text-left bg-gray-100 rounded-lg p-4 mb-6 text-sm text-gray-700 max-h-40 overflow-auto">
          <summary className="cursor-pointer font-medium">Détails techniques</summary>
          <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
            {error.stack || 'Pas de stack trace disponible'}
          </pre>
        </details>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
