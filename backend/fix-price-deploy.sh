#!/bin/bash

echo "🔧 Correction du prix mensuel - Déploiement"
echo "============================================"

# Aller dans le répertoire backend
cd /root/myguidedigital/myguidedigital/backend

echo ""
echo "1️⃣ Vérification du code source..."
# Vérifier que le prix est bien à 15€ dans le code source
if grep -q "price: 15.00" src/routes/subscriptions.ts; then
    echo "✅ Code source correct (15€)"
else
    echo "❌ Code source incorrect - modification nécessaire"
    echo "Modification du fichier..."
    
    # Remplacer toutes les occurrences de 12.00 par 15.00 pour le plan mensuel
    sed -i 's/monthly: { price: 12\.00/monthly: { price: 15.00/g' src/routes/subscriptions.ts
    sed -i 's/price: 12\.00,.*Mensuel/price: 15.00, name: '\''Mensuel'\''/g' src/routes/subscriptions.ts
    sed -i 's/pricePerLivret: 12\.00/pricePerLivret: 15.00/g' src/routes/subscriptions.ts
    sed -i "s/savings: '50%'/savings: '21%'/g" src/routes/subscriptions.ts
    
    echo "✅ Fichier modifié"
fi

echo ""
echo "2️⃣ Compilation du backend..."
# Recompiler le backend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Compilation réussie"
else
    echo "❌ Erreur lors de la compilation"
    exit 1
fi

echo ""
echo "3️⃣ Vérification du code compilé..."
# Vérifier que le prix est bien à 15€ dans le code compilé
if grep -q "price: 15" dist/routes/subscriptions.js; then
    echo "✅ Code compilé correct (15€)"
else
    echo "⚠️  Le code compilé ne contient pas 15€ - vérification..."
    grep -n "price:" dist/routes/subscriptions.js | head -5
fi

echo ""
echo "4️⃣ Redémarrage du backend..."
pm2 restart my-guidedigital-backend

if [ $? -eq 0 ]; then
    echo "✅ Backend redémarré"
else
    echo "❌ Erreur lors du redémarrage"
    exit 1
fi

echo ""
echo "5️⃣ Attente de 3 secondes pour que le backend démarre..."
sleep 3

echo ""
echo "6️⃣ Vérification du prix via l'API..."
RESPONSE=$(curl -s http://localhost:3001/api/subscriptions/plans)
MONTHLY_PRICE=$(echo $RESPONSE | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)

echo "Réponse API:"
echo $RESPONSE | python3 -m json.tool 2>/dev/null || echo $RESPONSE

echo ""
if [ "$MONTHLY_PRICE" = "15" ] || [ "$MONTHLY_PRICE" = "15.00" ]; then
    echo "✅ SUCCÈS ! Le prix mensuel est maintenant à 15€"
else
    echo "❌ Le prix n'est toujours pas correct. Prix trouvé: $MONTHLY_PRICE"
    echo ""
    echo "Vérifications supplémentaires:"
    echo "- Logs du backend:"
    pm2 logs my-guidedigital-backend --lines 10 --nostream
    echo ""
    echo "- Statut PM2:"
    pm2 status
fi

echo ""
echo "📊 Pour voir les logs en temps réel: pm2 logs my-guidedigital-backend"
