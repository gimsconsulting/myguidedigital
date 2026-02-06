'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  pricePerLivret: number;
  monthlyPrice?: number;
  savings?: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadPlans();
  }, [isAuthenticated, router]);

  const loadPlans = async () => {
    try {
      const response = await subscriptionsApi.getPlans();
      setPlans(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    try {
      const response = await subscriptionsApi.checkout({ planId });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      alert('Erreur lors de la création de la session de paiement');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Abonnement</h1>

      {user?.subscription?.plan === 'TRIAL' && (
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-primary font-medium">
            Vous bénéficiez actuellement de la période d&apos;essai gratuite.
            {user.subscription.trialDaysLeft && (
              <span className="ml-2">
                Nombre de jours restants : {user.subscription.trialDaysLeft}
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Vous avez un code promo ?</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Entrez votre code ici"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
          />
          <Button variant="primary">Valider</Button>
        </div>
      </div>

      <div className="mb-8 text-center">
        <div className="inline-block bg-gradient-to-r from-primary/20 via-purple-100 to-primary/20 rounded-lg px-8 py-5 border-2 border-primary/30 shadow-lg">
          <p className="text-2xl font-bold text-gray-900 mb-2">
            OFFRE DE LANCEMENT
          </p>
          <p className="text-base text-gray-700 font-medium">
            Valable pendant une durée limitée
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          // Définir les dégradés pour chaque plan
          const gradients = [
            'from-purple-500 via-purple-600 to-indigo-600', // Mensuel - dégradé violet/indigo
            'from-pink-500 via-rose-500 to-purple-600',     // Annuel - dégradé rose/violet (populaire)
            'from-indigo-600 via-purple-700 to-violet-800', // Lifetime - dégradé indigo/violet foncé
          ];
          
          const gradient = gradients[index] || gradients[0];
          const isPopular = plan.id === 'yearly';
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                isPopular ? 'ring-4 ring-primary ring-opacity-50' : ''
              }`}
            >
              {/* Fond dégradé */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}></div>
              
              {/* Contenu */}
              <div className="relative p-6 text-white">
                {isPopular && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    POPULAIRE
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-3 text-white">{plan.name}</h3>
                
                {(plan.id === 'monthly' || plan.id === 'yearly' || plan.id === 'lifetime') && (
                  <div className="mb-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full inline-block">
                    🎯 Offre de lancement
                  </div>
                )}
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  {plan.interval === 'month' && (
                    <span className="text-white/80 ml-2 text-lg">/ mois</span>
                  )}
                  {plan.interval === 'year' && (
                    <span className="text-white/80 ml-2 text-lg">/ an</span>
                  )}
                  {plan.interval === 'lifetime' && (
                    <span className="text-white/80 ml-2 text-lg">à vie</span>
                  )}
                </div>
                
                {plan.id === 'monthly' && (
                  <p className="text-sm text-white/90 mb-2 line-through opacity-60">
                    24€ / mois
                  </p>
                )}
                
                {plan.id === 'yearly' && (
                  <p className="text-sm text-white/90 mb-2 line-through opacity-60">
                    149€ / an
                  </p>
                )}
                
                {plan.id === 'lifetime' && (
                  <p className="text-sm text-white/90 mb-2 line-through opacity-60">
                    299€ à vie
                  </p>
                )}
                
                {plan.monthlyPrice && (
                  <p className="text-sm text-white/90 mb-2">
                    Soit {plan.monthlyPrice.toFixed(2)}€ / mois
                  </p>
                )}
                
                {plan.savings && (
                  <p className="text-sm bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full inline-block mb-4">
                    💰 Économie: {plan.savings}
                  </p>
                )}
                
                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  className={`w-full mt-4 ${
                    isPopular 
                      ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 font-bold shadow-lg border-2 border-yellow-600' 
                      : 'bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 backdrop-blur-sm font-semibold'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Sélectionner
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
