# Créer le script de déploiement sur le serveur

## Méthode 1 : Créer directement sur le serveur

Connectez-vous à votre serveur VPS via SSH et exécutez :

```bash
# Aller dans le répertoire du projet
cd /root/myguidedigital/myguidedigital

# Créer le fichier deploy.sh
cat > deploy.sh << 'EOF'
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

# Rebuild le frontend
echo ""
echo "🔨 Build du frontend..."
cd frontend
npm install --production=false
npm run build
cd ..

# Rebuild le backend
echo ""
echo "🔨 Build du backend..."
cd backend
npm install --production=false
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
EOF

# Rendre le script exécutable
chmod +x deploy.sh

# Tester le script
./deploy.sh
```

## Utilisation

Après avoir créé le script, pour déployer vos modifications :

1. **Sur votre ordinateur** : `git add .`, `git commit -m "message"`, `git push origin main`
2. **Sur le serveur** : `./deploy.sh`

C'est tout !
