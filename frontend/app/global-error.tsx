'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🔴 [GLOBAL ERROR] Erreur capturée:', error);
    console.error('🔴 [GLOBAL ERROR] Message:', error.message);
    console.error('🔴 [GLOBAL ERROR] Stack:', error.stack);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '32rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              Une erreur est survenue
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {error.message || 'Erreur inconnue'}
            </p>
            <details style={{
              textAlign: 'left',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              color: '#374151',
              maxHeight: '10rem',
              overflow: 'auto',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Détails techniques</summary>
              <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {error.stack || 'Pas de stack trace'}
              </pre>
            </details>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#111827',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Retour au dashboard
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
