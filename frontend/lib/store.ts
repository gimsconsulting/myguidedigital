import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: string;
  role?: string;
  profilePhoto?: string;
  subscription?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (token, user) => {
        console.log('[STORE DEBUG] setAuth called', { hasToken: !!token, hasUser: !!user, userEmail: user?.email });
        
        // Sauvegarder le token dans localStorage séparément
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          console.log('[STORE DEBUG] Token saved to localStorage');
          
          // Vérifier que auth-storage sera bien mis à jour après set()
          setTimeout(() => {
            const authStorage = localStorage.getItem('auth-storage');
            console.log('[STORE DEBUG] auth-storage after setAuth:', authStorage ? authStorage.substring(0, 200) : 'null');
            
            // Si auth-storage n'est pas mis à jour, le mettre à jour manuellement
            if (authStorage) {
              try {
                const parsed = JSON.parse(authStorage);
                if (!parsed.state?.token || !parsed.state?.user) {
                  console.log('[STORE DEBUG] ⚠️ auth-storage incomplete after setAuth, fixing...');
                  const updatedStorage = {
                    state: {
                      token,
                      user,
                      isAuthenticated: true
                    },
                    version: parsed.version || 0
                  };
                  localStorage.setItem('auth-storage', JSON.stringify(updatedStorage));
                  console.log('[STORE DEBUG] ✅ auth-storage manually updated');
                }
              } catch (e) {
                console.error('[STORE DEBUG] Error checking auth-storage after setAuth', e);
              }
            }
          }, 100);
        }
        
        set({ token, user, isAuthenticated: true });
        console.log('[STORE DEBUG] Auth state updated', { isAuthenticated: true });
      },
      logout: () => {
        console.log('[STORE DEBUG] logout called');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          console.log('[STORE DEBUG] Token removed from localStorage');
        }
        set({ token: null, user: null, isAuthenticated: false });
        console.log('[STORE DEBUG] Auth state cleared');
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: false,
      partialize: (state) => {
        // Ne sauvegarder que si on a vraiment des données d'authentification
        // Éviter de sauvegarder des valeurs null qui écraseraient les données existantes
        if (!state.token || !state.user || !state.isAuthenticated) {
          // Si on n'a pas de données valides, retourner undefined pour empêcher Zustand
          // de sauvegarder quoi que ce soit dans auth-storage
          // Cela empêchera Zustand de créer un auth-storage avec des valeurs null
          return undefined;
        }
        return {
          // Exclure hasHydrated de la persistance - il doit être réinitialisé à chaque chargement
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        };
      },
      onRehydrateStorage: () => {
        console.log('[STORE DEBUG] Starting hydration...');
        
        let shouldSkipHydration = false;
        
        // Vérifier le contenu brut de auth-storage AVANT l'hydratation
        if (typeof window !== 'undefined') {
          const rawStorage = localStorage.getItem('auth-storage');
          console.log('[STORE DEBUG] Raw auth-storage before hydration:', rawStorage);
          
          // Si auth-storage contient des valeurs null ou est vide, le supprimer AVANT l'hydratation
          // pour éviter que Zustand ne restaure des valeurs null
          if (rawStorage) {
            try {
              const parsed = JSON.parse(rawStorage);
              const storageState = parsed.state || {};
              // Si auth-storage contient des valeurs null ou est vide, le supprimer
              if (!storageState.token || !storageState.user || storageState.isAuthenticated === false || Object.keys(storageState).length === 0) {
                console.log('[STORE DEBUG] ⚠️ auth-storage contains null/empty values, clearing BEFORE hydration');
                localStorage.removeItem('auth-storage');
                shouldSkipHydration = true;
              }
            } catch (e) {
              console.error('[STORE DEBUG] Error parsing auth-storage before hydration, clearing it', e);
              localStorage.removeItem('auth-storage');
              shouldSkipHydration = true;
            }
          }
          
          // Instrumentation désactivée pour éviter les erreurs CORS en production
          // fetch('http://127.0.0.1:7242/ingest/36c68756-5ba0-48a8-9b2f-5d04f05f23de', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     location: 'store.ts:onRehydrateStorage',
          //     message: 'Starting hydration',
          //     data: { 
          //       timestamp: Date.now(),
          //       hasRawStorage: !!rawStorage,
          //       rawStoragePreview: rawStorage ? rawStorage.substring(0, 200) : null,
          //       shouldSkipHydration
          //     }
          //   })
          // }).catch(() => {});
        }
        
        return (state: AuthState | undefined) => {
          // Si on doit ignorer l'hydratation, marquer simplement comme hydraté sans restaurer les données
          if (shouldSkipHydration) {
            console.log('[STORE DEBUG] Skipping hydration due to null/empty/corrupted auth-storage');
            if (typeof window !== 'undefined') {
              if (state) {
                requestAnimationFrame(() => {
                  state.setHasHydrated(true);
                });
              } else {
                const store = useAuthStore.getState();
                requestAnimationFrame(() => {
                  store.setHasHydrated(true);
                });
              }
            }
            return;
          }
          
          // Vérifier que state existe avant de continuer
          if (!state) {
            console.log('[STORE DEBUG] No state after hydration');
            if (typeof window !== 'undefined') {
              const store = useAuthStore.getState();
              requestAnimationFrame(() => {
                store.setHasHydrated(true);
              });
            }
            return;
          }
          
          const hydrationData = { 
            hasState: !!state,
            hasToken: !!state?.token,
            hasUser: !!state?.user,
            isAuthenticated: state ? state.isAuthenticated : false,
            userEmail: state?.user?.email
          };
          
          console.log('[STORE DEBUG] Hydration complete', hydrationData);
          
          // Vérifier à nouveau auth-storage après hydratation pour voir s'il y a une incohérence
          if (typeof window !== 'undefined') {
            const rawStorageAfter = localStorage.getItem('auth-storage');
            console.log('[STORE DEBUG] Raw auth-storage after hydration:', rawStorageAfter);
            
            // Si le store est vide mais auth-storage contient des données, essayer de les restaurer
            if (state && !state.token && !state.user && rawStorageAfter) {
              try {
                const parsed = JSON.parse(rawStorageAfter);
                if (parsed.state?.token && parsed.state?.user && parsed.state?.isAuthenticated) {
                  console.log('[STORE DEBUG] ⚠️ Store empty but auth-storage has data - restoring manually');
                  // Restaurer manuellement les données
                  state.setAuth(parsed.state.token, parsed.state.user);
                  hydrationData.hasToken = true;
                  hydrationData.hasUser = true;
                  hydrationData.isAuthenticated = true;
                  hydrationData.userEmail = parsed.state.user?.email;
                } else if (!parsed.state?.token || !parsed.state?.user || !parsed.state?.isAuthenticated) {
                  // Si auth-storage contient des valeurs null, le supprimer pour éviter des problèmes
                  console.log('[STORE DEBUG] ⚠️ auth-storage contains null values, clearing it');
                  localStorage.removeItem('auth-storage');
                }
              } catch (e) {
                console.error('[STORE DEBUG] Error parsing auth-storage after hydration', e);
                // Si le parsing échoue, supprimer auth-storage corrompu
                localStorage.removeItem('auth-storage');
              }
            }
          }
          
          // Instrumentation désactivée pour éviter les erreurs CORS en production
          // if (typeof window !== 'undefined') {
          //   fetch('http://127.0.0.1:7242/ingest/36c68756-5ba0-48a8-9b2f-5d04f05f23de', {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify({
          //       location: 'store.ts:onRehydrateStorage',
          //       message: 'Hydration complete',
          //       data: { ...hydrationData, timestamp: Date.now() }
          //     })
          //   }).catch(() => {});
          // }
          // Marquer comme hydraté après la réhydratation
          if (state) {
            // Toujours synchroniser le token depuis localStorage lors de l'hydratation
            // pour éviter les incohérences entre les deux emplacements de stockage
            if (typeof window !== 'undefined') {
              const tokenFromStorage = localStorage.getItem('token');
              const tokenFromStore = state.token;
              
              console.log('[STORE DEBUG] Token synchronization', { 
                hasTokenFromStorage: !!tokenFromStorage,
                hasTokenFromStore: !!tokenFromStore,
                tokensMatch: tokenFromStorage === tokenFromStore
              });
              
              // Si on a un token dans localStorage mais pas dans le store, le récupérer
              if (tokenFromStorage && !tokenFromStore) {
                console.log('[STORE DEBUG] Token found in localStorage but not in store, syncing...');
                state.token = tokenFromStorage;
              }
              // Si on a un token dans le store mais pas dans localStorage, synchroniser aussi
              else if (tokenFromStore && !tokenFromStorage) {
                console.log('[STORE DEBUG] Token found in store but not in localStorage, syncing...');
                localStorage.setItem('token', tokenFromStore);
              }
              // Si les deux existent mais sont différents, utiliser celui de localStorage (plus récent)
              else if (tokenFromStorage && tokenFromStore && tokenFromStorage !== tokenFromStore) {
                console.log('[STORE DEBUG] Tokens differ, using localStorage token');
                state.token = tokenFromStorage;
              }
            }
            
            // Marquer comme hydraté immédiatement après l'hydratation
            // Utiliser requestAnimationFrame pour s'assurer que c'est après le rendu
            if (typeof window !== 'undefined') {
              requestAnimationFrame(() => {
                state.setHasHydrated(true);
                console.log('[STORE DEBUG] hasHydrated set to true after hydration');
              });
            } else {
              state.setHasHydrated(true);
              console.log('[STORE DEBUG] hasHydrated set to true (no window)');
            }
          } else {
            console.log('[STORE DEBUG] No state after hydration');
            // Même sans state, marquer comme hydraté pour éviter de bloquer indéfiniment
            if (typeof window !== 'undefined') {
              const store = useAuthStore.getState();
              requestAnimationFrame(() => {
                store.setHasHydrated(true);
              });
            }
          }
        };
      },
    }
  )
);
