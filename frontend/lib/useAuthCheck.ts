import { useEffect, useState } from 'react';
import { useAuthStore } from './store';

// Instrumentation pour envoyer des logs au serveur (désactivée en production)
const logToServer = (message: string, data: any) => {
  // Désactivé pour éviter les erreurs CORS en production
  // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  //   fetch('http://127.0.0.1:7242/ingest/36c68756-5ba0-48a8-9b2f-5d04f05f23de', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       location: 'useAuthCheck.ts',
  //       message,
  //       data,
  //       timestamp: Date.now()
  //     })
  //   }).catch(() => {});
  // }
};

/**
 * Hook personnalisé pour vérifier l'authentification de manière synchrone
 * avant que les composants ne se rendent
 */
export function useAuthCheck() {
  // Utiliser un seul appel à useAuthStore pour éviter les problèmes de synchronisation
  const { setAuth, hasHydrated, isAuthenticated, token, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    
    console.log('🔍 [AUTH CHECK] Starting auth check...', { pathname });
    
    let timeoutId: NodeJS.Timeout | null = null;
    let checkIntervalId: NodeJS.Timeout | null = null;
    
    // Fonction pour vérifier l'authentification
    const checkAuth = () => {
      // Vérifier DIRECTEMENT dans auth-storage de manière synchrone AVANT toute autre vérification
      if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            const hasAuthData = parsed.state?.isAuthenticated && 
                               parsed.state?.token && 
                               parsed.state?.user;
            
            if (hasAuthData) {
              console.log('🔍 [AUTH CHECK] ✅ Found authenticated data in storage');
              setAuth(parsed.state.token, parsed.state.user);
              setIsReady(true);
              setShouldRedirect(false);
              return true;
            }
          } catch (e) {
            console.error('🔍 [AUTH CHECK] Error parsing auth-storage', e);
          }
        }
      }
      
      // Vérifier depuis le store si hydraté
      if (hasHydrated) {
        const finalIsAuthenticated = isAuthenticated || (token && user);
        
        if (finalIsAuthenticated) {
          console.log('🔍 [AUTH CHECK] ✅ User authenticated from store');
          setIsReady(true);
          setShouldRedirect(false);
          return true;
        } else {
          console.log('🔍 [AUTH CHECK] ❌ User not authenticated');
          setIsReady(true);
          setShouldRedirect(true);
          return true;
        }
      }
      
      return false;
    };
    
    // Vérifier immédiatement
    if (checkAuth()) {
      return;
    }
    
    // Si pas encore hydraté, attendre avec un timeout
    if (!hasHydrated) {
      timeoutId = setTimeout(() => {
        if (!checkAuth()) {
          // Dernière vérification dans auth-storage
          if (typeof window !== 'undefined') {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              try {
                const parsed = JSON.parse(authStorage);
                if (parsed.state?.isAuthenticated && parsed.state?.token && parsed.state?.user) {
                  console.log('🔍 [AUTH CHECK] ✅ Found auth in storage (timeout), restoring');
                  setAuth(parsed.state.token, parsed.state.user);
                  setIsReady(true);
                  setShouldRedirect(false);
                  return;
                }
              } catch (e) {
                // Ignore
              }
            }
          }
          
          console.log('🔍 [AUTH CHECK] ❌ User not authenticated (timeout)');
          setIsReady(true);
          setShouldRedirect(true);
        }
      }, 2000);
    }
    
    // Nettoyage
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (checkIntervalId) clearInterval(checkIntervalId);
    };
  }, [hasHydrated, isAuthenticated, token, user, setAuth]);

  return { isReady, shouldRedirect };
}
