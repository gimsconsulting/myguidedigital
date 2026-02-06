'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setError('Session ID manquant');
      setIsLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      // Le backend vérifiera la session Stripe et mettra à jour l'abonnement
      // Pour l'instant, on attend quelques secondes puis on redirige
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Recharger les données utilisateur pour avoir l'abonnement à jour
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError('Erreur lors de la vérification du paiement');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/subscription">
            <Button variant="primary">Retour aux abonnements</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Paiement réussi !</h1>
        <p className="text-gray-600 mb-6">
          Votre abonnement a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.
        </p>
        <Link href="/dashboard">
          <Button variant="primary">Aller au dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
