#!/bin/bash

# Script de déploiement pour My Guide Digital
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté à la racine du projet${NC}"
    exit 1
fi

# 1. Mettre à jour le code depuis Git (si disponible)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Mise à jour du code depuis Git...${NC}"
    git pull origin master || echo "⚠️  Git pull échoué, continuation..."
fi

# 2. Installer les dépendances du backend
echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
cd backend
npm install --production
cd ..

# 3. Générer Prisma Client
echo -e "${YELLOW}🗄️  Génération du client Prisma...${NC}"
cd backend
npx prisma generate
cd ..

# 4. Appliquer les migrations (si PostgreSQL)
if grep -q "postgresql" backend/.env 2>/dev/null; then
    echo -e "${YELLOW}🔄 Application des migrations...${NC}"
    cd backend
    npx prisma migrate deploy || echo "⚠️  Migrations échouées, continuation..."
    cd ..
fi

# 5. Créer les dossiers nécessaires
echo -e "${YELLOW}📁 Création des dossiers...${NC}"
mkdir -p backend/uploads
mkdir -p backend/uploads/chat-documents
mkdir -p logs
chmod -R 755 backend/uploads

# 6. Installer les dépendances du frontend
echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
cd frontend
npm install --production
cd ..

# 7. Build du frontend
echo -e "${YELLOW}🏗️  Build du frontend...${NC}"
cd frontend
npm run build
cd ..

# 8. Redémarrer les services PM2
echo -e "${YELLOW}🔄 Redémarrage des services PM2...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✅ Services redémarrés${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 n'est pas installé. Installez-le avec: npm install -g pm2${NC}"
fi

# 9. Vérification
echo -e "${YELLOW}🔍 Vérification...${NC}"
sleep 2

if command -v pm2 &> /dev/null; then
    pm2 list
fi

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}🌐 Votre application devrait être accessible sur votre domaine${NC}"
