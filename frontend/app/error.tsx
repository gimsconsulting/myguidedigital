'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur dans la console pour le débogage
    console.error('🔴 [ERROR BOUNDARY] Erreur capturée:', error);
    console.error('🔴 [ERROR BOUNDARY] Message:', error.message);
    console.error('🔴 [ERROR BOUNDARY] Stack:', error.stack);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'Erreur inconnue'}
        </p>
        <details className="text-left bg-gray-100 rounded-lg p-4 mb-4 text-sm text-gray-700 max-h-40 overflow-auto">
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
