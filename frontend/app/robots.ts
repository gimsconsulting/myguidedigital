import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/profile/',
          '/invoices/',
          '/subscription/',
          '/affiliation/',
          '/demo/manage/',
          '/api/',
          '/forgot-password/',
        ],
      },
    ],
    sitemap: 'https://app.myguidedigital.com/sitemap.xml',
  }
}
