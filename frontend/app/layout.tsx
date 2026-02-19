import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Layout from '@/components/Layout'
import { ToastContainer } from '@/components/ui/Toast'
import { I18nProvider } from '@/i18n/client'
import ScrollToTop from '@/components/ScrollToTop'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'My Guide Digital',
  description: 'Plateforme de création de livrets d\'accueil digitaux pour hébergements touristiques',
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  openGraph: {
    title: 'My Guide Digital',
    description: 'Plateforme de création de livrets d\'accueil digitaux pour hébergements touristiques',
    siteName: 'My Guide Digital',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <I18nProvider>
          <Layout>{children}</Layout>
          <ScrollToTop />
          <CookieConsent />
          <ToastContainer />
        </I18nProvider>
      </body>
    </html>
  )
}
