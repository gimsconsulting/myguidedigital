/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'pexels.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
  },
  // Forcer le bon port pour les assets
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Désactiver le cache problématique
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // ─── Headers de sécurité ───────────────────────────────────────────
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/(.*)',
        headers: [
          {
            // Empêche le site d'être intégré dans une iframe (anti-clickjacking)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Empêche le navigateur de deviner le type MIME (anti-MIME sniffing)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Force HTTPS pendant 1 an (HSTS)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Contrôle les informations envoyées dans le header Referer
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Désactive les fonctionnalités sensibles du navigateur non utilisées
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            // Protection XSS pour les anciens navigateurs
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Empêche la détection du type de téléchargement par IE
            key: 'X-Download-Options',
            value: 'noopen',
          },
          {
            // Empêche la mise en cache de données sensibles
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
