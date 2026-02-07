#!/bin/bash

# Script de déploiement automatique pour My Guide Digital
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de My Guide Digital..."
echo ""

# Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# Récupérer les dernières modifications
echo "📥 Récupération des modifications depuis Git..."
git pull origin main

# Rebuild le frontend (build propre pour éviter cache)
echo ""
echo "🔨 Build du frontend..."
cd frontend
rm -rf .next
npm install --production=false  # Installer toutes les dépendances
npm run build
cd ..

# Rebuild le backend
echo ""
echo "🔨 Build du backend..."
cd backend
npm install --production=false  # Installer toutes les dépendances
npm run build
cd ..

# Redémarrer les applications PM2
echo ""
echo "🔄 Redémarrage des applications..."
pm2 restart all

# Attendre un peu pour que les apps démarrent
sleep 3

# Vérifier le statut
echo ""
echo "✅ Vérification du statut..."
pm2 list

echo ""
echo "🎉 Déploiement terminé avec succès !"
echo ""
echo "📊 Pour voir les logs: pm2 logs"
echo "🌐 Votre site: https://app.myguidedigital.com"
echo ""
echo "💡 Après déploiement: faire un rafraîchissement forcé (Ctrl+Shift+R ou Cmd+Shift+R)"
echo "   dans le navigateur pour voir les changements sans cache."
echo ""
