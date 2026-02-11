#!/bin/bash

# Script pour corriger les erreurs de compilation sur le serveur
# À exécuter sur le VPS dans le dossier backend

cd /root/myguidedigital/myguidedigital/backend || exit 1

echo "🔧 Correction des erreurs de compilation..."

# Correction 1 : Commenter permissionsPolicy dans src/index.ts
echo "1️⃣ Correction de src/index.ts..."
sed -i 's/^  permissionsPolicy: {/  \/\/ permissionsPolicy: {/' src/index.ts
sed -i 's/^    features: {/    \/\/ features: {/' src/index.ts
sed -i 's/^      geolocation:/      \/\/ geolocation:/' src/index.ts
sed -i 's/^      microphone:/      \/\/ microphone:/' src/index.ts
sed -i 's/^      camera:/      \/\/ camera:/' src/index.ts
sed -i 's/^    },/    \/\/ },/' src/index.ts
sed -i 's/^  },/  \/\/ },/' src/index.ts

# Correction 2 : Remplacer translateText.warned par translateWarningShown dans src/routes/livrets.ts
echo "2️⃣ Correction de src/routes/livrets.ts..."
# Ajouter la variable avant la fonction translateText si elle n'existe pas
if ! grep -q "let translateWarningShown = false;" src/routes/livrets.ts; then
    sed -i '/^async function translateText/i\\/\/ Variable pour éviter les warnings répétés\nlet translateWarningShown = false;\n' src/routes/livrets.ts
fi
# Remplacer translateText.warned par translateWarningShown
sed -i 's/translateText\.warned/translateWarningShown/g' src/routes/livrets.ts

# Correction 3 : Remplacer translateText.warned par translateWarningShown dans src/routes/modules.ts
echo "3️⃣ Correction de src/routes/modules.ts..."
# Ajouter la variable avant la fonction translateText si elle n'existe pas
if ! grep -q "let translateWarningShown = false;" src/routes/modules.ts; then
    sed -i '/^async function translateText/i\\/\/ Variable pour éviter les warnings répétés\nlet translateWarningShown = false;\n' src/routes/modules.ts
fi
# Remplacer translateText.warned par translateWarningShown
sed -i 's/translateText\.warned/translateWarningShown/g' src/routes/modules.ts

echo "✅ Corrections appliquées !"
echo ""
echo "🔨 Compilation..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Compilation réussie !"
    echo "🔄 Redémarrage du serveur..."
    pm2 restart my-guidedigital-backend
    echo "✅ Serveur redémarré !"
else
    echo ""
    echo "❌ Erreurs de compilation détectées. Vérifiez les messages ci-dessus."
fi
