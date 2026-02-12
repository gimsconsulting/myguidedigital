#!/bin/bash

echo "🚀 Déploiement du frontend..."
echo "================================"

# Aller dans le répertoire frontend
cd /root/myguidedigital/myguidedigital/frontend

echo ""
echo "1️⃣ Arrêt du processus PM2..."
pm2 stop my-guidedigital-frontend 2>/dev/null || echo "   Processus déjà arrêté"

echo ""
echo "2️⃣ Nettoyage des fichiers de build..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "3️⃣ Vérification des dépendances..."
npm install

echo ""
echo "4️⃣ Build du frontend (cela peut prendre quelques minutes)..."
npm run build

# Vérifier si le build a réussi
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build réussi !"
    
    # Vérifier que BUILD_ID existe
    if [ -f ".next/BUILD_ID" ]; then
        echo "✅ Fichier BUILD_ID trouvé"
    else
        echo "❌ ERREUR: BUILD_ID introuvable après le build"
        exit 1
    fi
    
    echo ""
    echo "5️⃣ Redémarrage du processus PM2..."
    pm2 restart my-guidedigital-frontend
    
    echo ""
    echo "6️⃣ Attente de 3 secondes..."
    sleep 3
    
    echo ""
    echo "7️⃣ Vérification des logs..."
    pm2 logs my-guidedigital-frontend --lines 20 --nostream
    
    echo ""
    echo "✅ Déploiement terminé !"
    echo ""
    echo "📊 Statut PM2:"
    pm2 status
    
else
    echo ""
    echo "❌ ERREUR: Le build a échoué"
    echo "Vérifiez les erreurs ci-dessus"
    exit 1
fi
