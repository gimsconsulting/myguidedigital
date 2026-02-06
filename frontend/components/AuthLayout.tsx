'use client';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Layout simplifié pour les pages d'authentification - SANS i18n
export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}
