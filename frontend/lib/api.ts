import axios from 'axios';

// Détecte si l'hôte est une IP (ex: 192.168.1.1)
function isIpAddress(host: string): boolean {
  const ipv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
  return ipv4 || host.startsWith('['); // IPv6
}

// Fonction pour déterminer l'URL de l'API de manière dynamique
function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: utiliser la variable d'environnement ou localhost par défaut
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('🔍 [SSR] getApiUrl - envApiUrl:', envApiUrl);
    return envApiUrl || 'http://localhost:3001';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isIp = isIpAddress(hostname);

  // Log de débogage
  console.log('🔍 [CLIENT] getApiUrl - hostname:', hostname, 'protocol:', protocol, 'isIp:', isIp);

  // Localhost → backend sur le port 3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🔍 [CLIENT] Using localhost:3001');
    return 'http://localhost:3001';
  }

  // Ngrok → localhost pour l'API (test depuis l'ordinateur)
  if (hostname.includes('ngrok') || hostname.includes('ngrok-free') || hostname.includes('ngrok.io') || hostname.includes('ngrok-free.dev')) {
    console.log('🔍 [CLIENT] Using ngrok -> localhost:3001');
    return 'http://localhost:3001';
  }

  // Production (nom de domaine type app.myguidedigital.com) → même origine, pas de port
  // Les requêtes iront vers https://app.myguidedigital.com/api/... (proxy nginx vers le backend)
  // IMPORTANT: En production, on ignore le port même si NEXT_PUBLIC_API_URL est défini avec un port
  if (!isIp) {
    // Utiliser le même hostname et protocole que le frontend (sans port)
    // Nginx proxyfera /api/ vers le backend sur localhost:3001
    const apiUrl = `${protocol}//${hostname}`;
    console.log('🔍 [CLIENT] Production domain detected, using:', apiUrl);
    return apiUrl;
  }

  // IP locale (ex: smartphone sur le réseau) → même IP, port 3001
  const apiUrl = `${protocol}//${hostname}:3001`;
  console.log('🔍 [CLIENT] IP address detected, using:', apiUrl);
  return apiUrl;
}

// Fonction pour obtenir le baseURL dynamiquement
function getBaseURL(): string {
  const API_URL = getApiUrl();
  const baseURL = API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`;
  return baseURL;
}

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    // Bypass localtunnel warning page
    'bypass-tunnel-reminder': 'true',
  },
  withCredentials: true, // Inclure les cookies dans les requêtes (nécessaire pour CSRF sessionId)
});

// Variable pour stocker le token CSRF
let csrfToken: string | null = null;
// Variable pour stocker le sessionId CSRF
let csrfSessionId: string | null = null;

// Fonction pour récupérer le token CSRF depuis le serveur
export async function getCsrfToken(): Promise<string> {
  // CRITIQUE : Vérifier que les deux (token ET sessionId) sont présents
  if (csrfToken && csrfSessionId) {
    return csrfToken;
  }
  
  // Si seulement le token existe mais pas le sessionId, on doit récupérer à nouveau
  if (csrfToken && !csrfSessionId) {
    console.warn('⚠️ [CSRF] Token présent mais sessionId manquant, récupération nécessaire');
  }

  try {
    const baseURL = getBaseURL();
    const response = await axios.get(`${baseURL}/csrf-token`);
    const token = response.data.csrfToken;
    const sessionId = response.data.sessionId;
    
    if (!token || typeof token !== 'string') {
      throw new Error('Token CSRF invalide reçu du serveur');
    }
    
    // Vérifier que le sessionId est une string valide
    if (!sessionId || typeof sessionId !== 'string') {
      console.warn('⚠️ [CSRF] SessionId invalide ou manquant dans la réponse:', sessionId);
    }
    
    csrfToken = token;
    csrfSessionId = (sessionId && typeof sessionId === 'string') ? sessionId : null;
    
    // Vérification finale : s'assurer que le sessionId est bien stocké
    if (!csrfSessionId && sessionId) {
      console.warn('⚠️ [CSRF] SessionId reçu mais non stocké:', sessionId);
      csrfSessionId = sessionId;
    }
    
    return csrfToken;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    throw error;
  }
}

// Fonction pour réinitialiser le token CSRF (utile après certaines actions)
export function resetCsrfToken() {
  csrfToken = null;
  csrfSessionId = null;
}

// Intercepteur pour définir le baseURL dynamiquement et ajouter le token JWT
api.interceptors.request.use(async (config) => {
  // Si la requête contient FormData, ne pas définir Content-Type (axios le fera avec la boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  // Définir le baseURL dynamiquement pour chaque requête
  const baseURL = getBaseURL();
  config.baseURL = baseURL;
  console.log('🌐 Requête API:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: baseURL,
    fullURL: baseURL + config.url,
    isFormData: config.data instanceof FormData
  });
  
  // Ne pas ajouter le token pour les routes publiques
  const isPublicRoute = config.url?.includes('/livrets/public/');
  if (!isPublicRoute && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Ajouter le token CSRF pour les routes qui en ont besoin
  // Routes nécessitant CSRF: register, forgot-password, reset-password, delete user
  const needsCsrf = config.url?.includes('/auth/register') ||
                    config.url?.includes('/auth/forgot-password') ||
                    config.url?.includes('/auth/reset-password') ||
                    (config.method === 'delete' && config.url?.includes('/admin/users/'));
  
  if (needsCsrf) {
    if (!csrfToken || !csrfSessionId) {
      console.warn('⚠️ [CSRF] Token CSRF ou sessionId manquant pour:', config.url, '- Tentative de récupération...');
      // Essayer de récupérer le token si manquant
      try {
        const response = await axios.get(`${baseURL}/csrf-token`);
        const token = response.data.csrfToken;
        const sessionId = response.data.sessionId;
        if (token && typeof token === 'string') {
          csrfToken = token;
          
          // CRITIQUE : Récupérer aussi le sessionId !
          if (sessionId && typeof sessionId === 'string') {
            csrfSessionId = sessionId;
            console.log('✅ [CSRF] Token CSRF et sessionId récupérés automatiquement');
          } else {
            console.warn('⚠️ [CSRF] SessionId invalide ou manquant dans la réponse');
          }
        } else {
          console.error('❌ [CSRF] Token CSRF invalide reçu du serveur');
        }
      } catch (error) {
        console.error('❌ [CSRF] Impossible de récupérer le token:', error);
      }
    }
    if (csrfToken) {
      // Utiliser la casse exacte attendue par Express (minuscules)
      config.headers['x-csrf-token'] = csrfToken;
      
      // Ajouter aussi le sessionId dans un header séparé (solution hybride)
      if (csrfSessionId) {
        config.headers['x-csrf-session-id'] = csrfSessionId;
        console.log('🔐 [CSRF] Token CSRF et sessionId ajoutés aux headers pour:', config.url);
      } else {
        console.warn('⚠️ [CSRF] Token CSRF ajouté mais sessionId manquant pour:', config.url);
      }
    } else {
      console.error('❌ [CSRF] Token CSRF manquant pour:', config.url);
    }
  }
  
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log détaillé de l'erreur pour le débogage
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          fullURL: error.config?.baseURL + error.config?.url
        }
      });
    } else {
      // Log détaillé avec distinction 401 vs 403
      const status = error.response?.status;
      const errorData = error.response?.data;
      const isCsrfError = status === 403 && (errorData?.code === 'CSRF_TOKEN_MISSING' || errorData?.code === 'CSRF_TOKEN_INVALID' || errorData?.code === 'CSRF_SESSION_MISSING');
      
      console.error('API Error:', {
        status: status,
        statusText: error.response?.statusText,
        data: errorData,
        url: error.config?.baseURL + error.config?.url,
        isCsrfError: isCsrfError,
        errorCode: errorData?.code,
        errorMessage: errorData?.message
      });
      
      // Log spécifique pour les erreurs CSRF
      if (isCsrfError) {
        console.error('🚫 [CSRF] Erreur CSRF détectée:', {
          code: errorData?.code,
          message: errorData?.message,
          url: error.config?.baseURL + error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        });
      }
    }
    
    // Ne pas rediriger vers login pour les routes publiques
    const isPublicRoute = error.config?.url?.includes('/livrets/public/');
    
    // Gérer les erreurs d'authentification (401) et d'autorisation (403)
    // Mais NE PAS traiter les erreurs CSRF (403 avec code CSRF_*) comme des erreurs d'authentification
    const status = error.response?.status;
    const errorData = error.response?.data;
    const isCsrfError = status === 403 && errorData && (
      errorData.code === 'CSRF_TOKEN_MISSING' || 
      errorData.code === 'CSRF_TOKEN_INVALID' || 
      errorData.code === 'CSRF_SESSION_MISSING'
    );
    
    if ((status === 401 || (status === 403 && !isCsrfError)) && !isPublicRoute) {
      // Token expiré ou invalide (mais pas erreur CSRF)
      if (typeof window !== 'undefined') {
        // Nettoyer le token et le store
        localStorage.removeItem('token');
        
        // Importer et utiliser le store pour déconnecter proprement
        import('@/lib/store').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
        
        // Rediriger vers login seulement si on n'est pas déjà sur la page de login
        if (!window.location.pathname.includes('/login')) {
          // Utiliser replace au lieu de href pour éviter de créer une entrée dans l'historique
          window.location.replace('/login');
        }
      }
    } else if (isCsrfError) {
      // Erreur CSRF : ne pas rediriger, juste logger
      console.error('🚫 [CSRF] Erreur CSRF - ne pas rediriger vers login');
    }
    
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    // S'assurer que le token CSRF est récupéré avant l'envoi
    if (!csrfToken || !csrfSessionId) {
      await getCsrfToken();
    }
    
    // Vérifier une dernière fois que le token est disponible avant d'envoyer
    if (!csrfToken) {
      throw new Error('Token CSRF non disponible. Veuillez rafraîchir la page.');
    }
    
    return api.post('/auth/register', data);
  },
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: { password: string }) => api.put('/auth/password', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
  googleAuth: (data: { credential: string }) => api.post('/auth/google', data),
};

// Upload
export const uploadApi = {
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    // NE PAS définir Content-Type manuellement - axios le fera automatiquement avec la bonne boundary
    return api.post('/upload/profile-photo', formData);
  },
};

// Livrets
export const livretsApi = {
  getAll: () => api.get('/livrets'),
  getOne: (id: string) => api.get(`/livrets/${id}`),
  create: (data: any) => api.post('/livrets', data),
  update: (id: string, data: any) => api.put(`/livrets/${id}`, data),
  delete: (id: string) => api.delete(`/livrets/${id}`),
  duplicate: (id: string, data?: { type?: string }) => api.post(`/livrets/${id}/duplicate`, data || {}),
  getPublic: (qrCode: string) => api.get(`/livrets/public/${qrCode}`),
  getSlots: () => api.get('/livrets/slots'),
};

// Modules
export const modulesApi = {
  getByLivret: (livretId: string) => api.get(`/modules/livret/${livretId}`),
  getOne: (moduleId: string) => {
    // On récupère tous les modules et on filtre, car il n'y a pas de route directe
    // TODO: Ajouter une route GET /modules/:id dans le backend
    return api.get(`/modules/livret/${moduleId}`).then(res => {
      // Cette route n'existe pas encore, on utilisera getByLivret et on filtrera côté frontend
      return res;
    });
  },
  create: (data: any) => api.post('/modules', data),
  update: (id: string, data: any) => api.put(`/modules/${id}`, data),
  delete: (id: string) => api.delete(`/modules/${id}`),
  reorder: (data: { livretId: string; moduleOrders: Array<{ id: string; order: number }> }) =>
    api.put('/modules/reorder', data),
};

// Statistics
export const statisticsApi = {
  getByLivret: (livretId: string) => api.get(`/statistics/livret/${livretId}`),
  recordView: (data: { livretId: string; moduleType?: string }) => api.post('/statistics/view', data),
  reset: (livretId: string) => api.delete(`/statistics/livret/${livretId}`),
};

// Subscriptions
export const subscriptionsApi = {
  getCurrent: () => api.get('/subscriptions'),
  getPlans: () => api.get('/subscriptions/plans'),
  checkout: (data: { planId: string; category: string; unitCount?: number; quantity?: number }) => api.post('/subscriptions/checkout', data),
  upgrade: (data: { planId: string; category: string; unitCount?: number }) => api.post('/subscriptions/upgrade', data),
  applyPromo: (data: { code: string }) => api.post('/subscriptions/promo', data),
  seasonalDuplicateCheckout: (data: { livretId: string; seasonalOffer: number }) => api.post('/subscriptions/seasonal-duplicate-checkout', data),
};

// Invoices
export const invoicesApi = {
  getAll: () => api.get('/invoices'),
  getOne: (id: string) => api.get(`/invoices/${id}`),
};

// Translations
export const translateApi = {
  translate: (data: { text: string; sourceLang: string; targetLang: string }) =>
    api.post('/translate', data),
  translateBatch: (data: { texts: string[]; sourceLang: string; targetLang: string }) =>
    api.post('/translate/batch', data),
};

// Admin
export const adminApi = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params?: { page?: number; limit?: number; search?: string; plan?: string; status?: string }) =>
    api.get('/admin/users', { params }),
  updateUserRole: (userId: string, role: 'USER' | 'ADMIN') => 
    api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  extendTrial: (userId: string) => api.post(`/admin/users/${userId}/extend-trial`),
  getRevenue: (params?: { period?: number }) =>
    api.get('/admin/revenue', { params }),
  getSubscriptions: (params?: { page?: number; limit?: number; plan?: string; status?: string }) =>
    api.get('/admin/subscriptions', { params }),
  getLivrets: () => api.get('/admin/livrets'),
  getInvoices: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/invoices', { params }),
};

// Chat Documents (Textes pour le chat)
export const chatDocumentsApi = {
  create: (livretId: string, data: { title: string; content: string }) =>
    api.post(`/chat-documents/${livretId}`, data),
  update: (documentId: string, data: { title?: string; content?: string }) =>
    api.put(`/chat-documents/${documentId}`, data),
  getAll: (livretId: string) => api.get(`/chat-documents/${livretId}`),
  delete: (documentId: string) => api.delete(`/chat-documents/${documentId}`),
};

// API pour le chatbot IA (livret)
export const chatApi = {
  sendMessage: (livretId: string, data: { message: string; conversationHistory?: Array<{ role: string; content: string }> }) =>
    api.post(`/chat/${livretId}`, data),
};

// API pour le chatbot de l'application (prospect)
export const appChatApi = {
  sendMessage: (data: { message: string; conversationHistory?: Array<{ role: string; content: string }> }) =>
    api.post('/app-chat', data),
};

// API pour la config du chatbot app (admin)
export const appChatConfigApi = {
  get: () => api.get('/admin/chatbot-config'),
  update: (data: { context?: string; isActive?: boolean }) =>
    api.put('/admin/chatbot-config', data),
};

// Affiliates
export const affiliatesApi = {
  apply: (data: { companyName: string; vatNumber: string; contactName: string; email: string; address?: string; country?: string; iban?: string }) =>
    api.post('/affiliates/apply', data),
  getMe: () => api.get('/affiliates/me'),
  getStats: () => api.get('/affiliates/stats'),
  verifyCode: (code: string) => api.get(`/affiliates/verify/${code}`),
  // Admin
  adminList: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/affiliates/admin/list', { params }),
  adminGetDetail: (affiliateId: string) => api.get(`/affiliates/admin/${affiliateId}`),
  adminUpdateStatus: (affiliateId: string, status: string) =>
    api.put(`/affiliates/admin/${affiliateId}/status`, { status }),
  adminPayAffiliate: (affiliateId: string, month: number, year: number) =>
    api.put(`/affiliates/admin/pay/${affiliateId}`, { month, year }),
  adminOverview: () => api.get('/affiliates/admin/overview'),
};

// Blog
export const blogApi = {
  // Public
  getArticles: (params?: { category?: string; featured?: string; page?: number; limit?: number; search?: string }) =>
    api.get('/blog', { params }),
  getArticle: (slug: string) => api.get(`/blog/article/${slug}`),
  getPublicCategories: () => api.get('/blog/categories'),
  // Admin
  adminList: (params?: { status?: string; category?: string; page?: number; limit?: number }) =>
    api.get('/blog/admin/list', { params }),
  adminGetArticle: (id: string) => api.get(`/blog/admin/${id}`),
  adminCreate: (data: any) => api.post('/blog/admin', data),
  adminUpdate: (id: string, data: any) => api.put(`/blog/admin/${id}`, data),
  adminDelete: (id: string) => api.delete(`/blog/admin/${id}`),
  adminUploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/blog/admin/upload-image', formData);
  },
  adminPexelsSearch: (query: string, page?: number) =>
    api.get('/blog/admin/pexels/search', { params: { query, page: page || 1 } }),
  adminStats: () => api.get('/blog/admin/stats'),
  // Admin - Catégories
  adminGetCategories: () => api.get('/blog/admin/categories'),
  adminCreateCategory: (data: { label: string; emoji?: string; gradient?: string }) =>
    api.post('/blog/admin/categories', data),
  adminUpdateCategory: (id: string, data: { label?: string; emoji?: string; gradient?: string; isActive?: boolean }) =>
    api.put(`/blog/admin/categories/${id}`, data),
  adminDeleteCategory: (id: string) => api.delete(`/blog/admin/categories/${id}`),
};

// Demo Bookings API
export const demoBookingsApi = {
  // Public
  getAvailableSlots: (date: string) => api.get(`/demo-bookings/available-slots?date=${date}`),
  createBooking: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    accommodationType?: string;
    numberOfUnits?: string;
    message?: string;
    date: string;
    startTime: string;
  }) => api.post('/demo-bookings', data),
  getBookingByToken: (token: string) => api.get(`/demo-bookings/manage/${token}`),
  cancelBooking: (token: string) => api.put(`/demo-bookings/manage/${token}/cancel`),
  rescheduleBooking: (token: string, data: { date: string; startTime: string }) =>
    api.put(`/demo-bookings/manage/${token}/reschedule`, data),
  // Admin
  adminGetAll: (params?: { status?: string; from?: string; to?: string }) =>
    api.get('/admin/demo-bookings', { params }),
  adminUpdateStatus: (id: string, data: { status: string; adminNotes?: string }) =>
    api.put(`/admin/demo-bookings/${id}/status`, data),
  adminGetBlockedSlots: () => api.get('/admin/demo-bookings-blocked'),
  adminBlockSlot: (data: { date: string; startTime: string; endTime?: string; reason?: string }) =>
    api.post('/admin/demo-bookings-block', data),
  adminUnblockSlot: (id: string) => api.delete(`/admin/demo-bookings-block/${id}`),
  adminBlockDay: (data: { date: string; reason?: string }) =>
    api.post('/admin/demo-bookings-block-day', data),
};

export default api;
