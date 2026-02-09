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
    return envApiUrl || 'http://localhost:3001';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Localhost → backend sur le port 3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }

  // Ngrok → localhost pour l'API (test depuis l'ordinateur)
  if (hostname.includes('ngrok') || hostname.includes('ngrok-free') || hostname.includes('ngrok.io') || hostname.includes('ngrok-free.dev')) {
    return 'http://localhost:3001';
  }

  // Production (nom de domaine type app.myguidedigital.com) → même origine, pas de port
  // Les requêtes iront vers https://app.myguidedigital.com/api/... (proxy nginx vers le backend)
  // IMPORTANT: En production, on ignore le port même si NEXT_PUBLIC_API_URL est défini avec un port
  if (!isIpAddress(hostname)) {
    // Utiliser le même hostname et protocole que le frontend (sans port)
    // Nginx proxyfera /api/ vers le backend sur localhost:3001
    const apiUrl = `${protocol}//${hostname}`;
    return apiUrl;
  }

  // IP locale (ex: smartphone sur le réseau) → même IP, port 3001
  return `${protocol}//${hostname}:3001`;
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
});

// Intercepteur pour définir le baseURL dynamiquement et ajouter le token JWT
api.interceptors.request.use((config) => {
  // Définir le baseURL dynamiquement pour chaque requête
  const baseURL = getBaseURL();
  config.baseURL = baseURL;
  console.log('🌐 Requête API:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: baseURL,
    fullURL: baseURL + config.url
  });
  
  // Ne pas ajouter le token pour les routes publiques
  const isPublicRoute = config.url?.includes('/livrets/public/');
  if (!isPublicRoute && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.baseURL + error.config?.url
      });
    }
    
    // Ne pas rediriger vers login pour les routes publiques
    const isPublicRoute = error.config?.url?.includes('/livrets/public/');
    
    // Gérer les erreurs d'authentification (401) et d'autorisation (403)
    if ((error.response?.status === 401 || error.response?.status === 403) && !isPublicRoute) {
      // Token expiré ou invalide
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
    }
    
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: { password: string }) => api.put('/auth/password', data),
  resetPassword: (data: { email: string; password: string }) => api.post('/auth/reset-password', data),
};

// Upload
export const uploadApi = {
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/upload/profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Livrets
export const livretsApi = {
  getAll: () => api.get('/livrets'),
  getOne: (id: string) => api.get(`/livrets/${id}`),
  create: (data: any) => api.post('/livrets', data),
  update: (id: string, data: any) => api.put(`/livrets/${id}`, data),
  delete: (id: string) => api.delete(`/livrets/${id}`),
  duplicate: (id: string) => api.post(`/livrets/${id}/duplicate`),
  getPublic: (qrCode: string) => api.get(`/livrets/public/${qrCode}`),
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
  checkout: (data: { planId: string }) => api.post('/subscriptions/checkout', data),
  upgrade: (data: { targetPlanId: string }) => api.post('/subscriptions/upgrade', data),
  applyPromo: (data: { code: string }) => api.post('/subscriptions/promo', data),
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
  getRevenue: (params?: { period?: number }) =>
    api.get('/admin/revenue', { params }),
  getSubscriptions: (params?: { page?: number; limit?: number; plan?: string; status?: string }) =>
    api.get('/admin/subscriptions', { params }),
  getLivrets: () => api.get('/admin/livrets'),
  getInvoices: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/invoices', { params }),
};

// Chat Documents (PDFs pour le chat)
export const chatDocumentsApi = {
  upload: (livretId: string, file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post(`/chat-documents/${livretId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: (livretId: string) => api.get(`/chat-documents/${livretId}`),
  delete: (documentId: string) => api.delete(`/chat-documents/${documentId}`),
};

export default api;
