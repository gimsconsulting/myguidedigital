import { useEffect, useState } from 'react';
import { useAuthStore } from './store';

// Instrumentation pour envoyer des logs au serveur
const logToServer = (message: string, data: any) => {
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/36c68756-5ba0-48a8-9b2f-5d04f05f23de', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'useAuthCheck.ts',
        message,
        data,
        timestamp: Date.now()
      })
    }).catch(() => {});
  }
};

/**
 * Hook personnalisé pour vérifier l'authentification de manière synchrone
 * avant que les composants ne se rendent
 */
export function useAuthCheck() {
  const { setAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
    const logData = {
      timestamp: new Date().toISOString(),
      pathname
    };
    
    console.log('🔍 [AUTH CHECK] Starting auth check...', logData);
    logToServer('Starting auth check', logData);
    
    // Vérifier DIRECTEMENT dans auth-storage de manière synchrone AVANT toute autre vérification
    let foundAuthInStorage = false;
    
    if (typeof window !== 'undefined') {
      // Vérifier aussi le token dans localStorage directement
      const tokenFromLocalStorage = localStorage.getItem('token');
      console.log('🔍 [AUTH CHECK] Token from localStorage:', tokenFromLocalStorage ? tokenFromLocalStorage.substring(0, 20) + '...' : 'null');
      
      const authStorage = localStorage.getItem('auth-storage');
      const hasAuthStorage = !!authStorage;
      
      console.log('🔍 [AUTH CHECK] auth-storage exists?', hasAuthStorage);
      logToServer('Checking auth-storage', { hasAuthStorage, pathname, hasTokenInLocalStorage: !!tokenFromLocalStorage });
      
      if (authStorage) {
        console.log('🔍 [AUTH CHECK] auth-storage content preview:', authStorage.substring(0, 200));
        
        try {
          const parsed = JSON.parse(authStorage);
          const hasAuthData = parsed.state?.isAuthenticated && 
                             parsed.state?.token && 
                             parsed.state?.user;
          
          console.log('🔍 [AUTH CHECK] Parsed auth-storage', {
            hasAuthData,
            isAuthenticated: parsed.state?.isAuthenticated,
            hasToken: !!parsed.state?.token,
            hasUser: !!parsed.state?.user,
            tokenPreview: parsed.state?.token ? parsed.state.token.substring(0, 20) + '...' : null,
            userEmail: parsed.state?.user?.email,
            fullParsed: parsed
          });
          
          // Si on a un token dans localStorage mais pas dans auth-storage, essayer de restaurer
          if (tokenFromLocalStorage && (!parsed.state?.token || !parsed.state?.user)) {
            console.log('🔍 [AUTH CHECK] ⚠️ Token in localStorage but missing in auth-storage, checking store...');
            const storeState = useAuthStore.getState();
            if (storeState.user && storeState.token) {
              console.log('🔍 [AUTH CHECK] ✅ Found user in store, restoring auth-storage');
              setAuth(storeState.token, storeState.user);
              setIsReady(true);
              setShouldRedirect(false);
              foundAuthInStorage = true;
              return;
            }
          }
          
          if (hasAuthData) {
            // Restaurer l'état immédiatement
            console.log('🔍 [AUTH CHECK] ✅ Found authenticated data in storage, restoring immediately');
            logToServer('Found authenticated data in storage', {
              hasToken: !!parsed.state.token,
              hasUser: !!parsed.state.user,
              userEmail: parsed.state.user?.email
            });
            setAuth(parsed.state.token, parsed.state.user);
            setIsReady(true);
            setShouldRedirect(false);
            foundAuthInStorage = true;
            return;
          } else {
            console.log('🔍 [AUTH CHECK] ⚠️ auth-storage exists but missing required data');
            logToServer('auth-storage exists but missing required data', {
              hasIsAuthenticated: !!parsed.state?.isAuthenticated,
              hasToken: !!parsed.state?.token,
              hasUser: !!parsed.state?.user,
              parsedKeys: Object.keys(parsed),
              stateKeys: parsed.state ? Object.keys(parsed.state) : []
            });
          }
        } catch (e) {
          console.error('🔍 [AUTH CHECK] Error parsing auth-storage', e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          logToServer('Error parsing auth-storage', { error: errorMessage, pathname });
        }
      } else {
        console.log('🔍 [AUTH CHECK] No auth-storage found in localStorage');
        // Si on a un token dans localStorage mais pas auth-storage, vérifier le store
        if (tokenFromLocalStorage) {
          console.log('🔍 [AUTH CHECK] ⚠️ Token in localStorage but no auth-storage, checking store...');
          const storeState = useAuthStore.getState();
          if (storeState.user && storeState.token) {
            console.log('🔍 [AUTH CHECK] ✅ Found user in store, using it');
            setIsReady(true);
            setShouldRedirect(false);
            foundAuthInStorage = true;
            return;
          }
        }
      }
    }
    
    // Si on a trouvé l'auth dans storage, ne pas continuer
    if (foundAuthInStorage) {
      return;
    }
    
    // Si on n'a pas trouvé d'auth dans storage, continuer avec la vérification du store
    console.log('🔍 [AUTH CHECK] No auth found in storage, checking store hydration...');

    // Attendre que le store soit hydraté
    const checkHydration = setInterval(() => {
      const storeState = useAuthStore.getState();
      console.log('🔍 [AUTH CHECK] Checking hydration', {
        hasHydrated: storeState.hasHydrated,
        isAuthenticated: storeState.isAuthenticated,
        hasToken: !!storeState.token,
        hasUser: !!storeState.user
      });
      
      if (storeState.hasHydrated) {
        clearInterval(checkHydration);
        
        // Vérifier l'authentification depuis le store
        const finalIsAuthenticated = storeState.isAuthenticated || 
                                     (storeState.token && storeState.user);
        
        if (finalIsAuthenticated) {
          console.log('🔍 [AUTH CHECK] ✅ User authenticated from store');
          setIsReady(true);
          setShouldRedirect(false);
        } else {
          // Vérifier une dernière fois dans auth-storage
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            try {
              const parsed = JSON.parse(authStorage);
              if (parsed.state?.isAuthenticated && parsed.state?.token && parsed.state?.user) {
                console.log('🔍 [AUTH CHECK] ✅ Found auth in storage, restoring');
                setAuth(parsed.state.token, parsed.state.user);
                setIsReady(true);
                setShouldRedirect(false);
                return;
              }
            } catch (e) {
              // Ignore parsing errors
              console.error('🔍 [AUTH CHECK] Error parsing auth-storage in hydration check', e);
            }
          }
          
          console.log('🔍 [AUTH CHECK] ❌ User not authenticated');
          logToServer('User not authenticated - redirecting', {
            hasHydrated: storeState.hasHydrated,
            isAuthenticated: storeState.isAuthenticated,
            hasToken: !!storeState.token,
            hasUser: !!storeState.user
          });
          setIsReady(true);
          setShouldRedirect(true);
        }
      }
    }, 50);

    // Timeout de sécurité après 2 secondes
    const timeout = setTimeout(() => {
      clearInterval(checkHydration);
      const storeState = useAuthStore.getState();
      
      // Vérifier dans auth-storage en dernier recours
      const authStorage = localStorage.getItem('auth-storage');
      let finalIsAuthenticated = storeState.isAuthenticated || 
                                 (storeState.token && storeState.user);
      
      if (!finalIsAuthenticated && authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          if (parsed.state?.isAuthenticated && parsed.state?.token && parsed.state?.user) {
            console.log('🔍 [AUTH CHECK] ✅ Found auth in storage (timeout), restoring');
            setAuth(parsed.state.token, parsed.state.user);
            finalIsAuthenticated = true;
          }
        } catch (e) {
          // Ignore
        }
      }
      
      if (finalIsAuthenticated) {
        console.log('🔍 [AUTH CHECK] ✅ User authenticated (timeout)');
        setIsReady(true);
        setShouldRedirect(false);
      } else {
        console.log('🔍 [AUTH CHECK] ❌ User not authenticated (timeout)');
        setIsReady(true);
        setShouldRedirect(true);
      }
    }, 2000);
    
    return () => {
      clearInterval(checkHydration);
      clearTimeout(timeout);
    };
  }, [setAuth]);

  return { isReady, shouldRedirect };
}
