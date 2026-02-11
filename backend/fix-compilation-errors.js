#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les erreurs de compilation TypeScript
 * À exécuter sur le serveur : node fix-compilation-errors.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des erreurs de compilation...\n');

// Correction 1 : src/index.ts
console.log('1️⃣ Correction de src/index.ts...');
const indexPath = path.join(__dirname, 'src', 'index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Commenter permissionsPolicy
indexContent = indexContent.replace(
  /  \/\/ Permissions Policy.*?\n  permissionsPolicy: \{[\s\S]*?  \},/,
  `  // Permissions Policy (anciennement Feature Policy) - Désactivé car non supporté dans cette version de Helmet
  // permissionsPolicy: {
  //   features: {
  //     geolocation: ["'self'"],
  //     microphone: ["'none'"],
  //     camera: ["'none'"],
  //   },
  // },`
);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('   ✅ src/index.ts corrigé');

// Correction 2 : src/routes/livrets.ts
console.log('2️⃣ Correction de src/routes/livrets.ts...');
const livretsPath = path.join(__dirname, 'src', 'routes', 'livrets.ts');
let livretsContent = fs.readFileSync(livretsPath, 'utf8');

// Ajouter la variable si elle n'existe pas
if (!livretsContent.includes('let translateWarningShown = false;')) {
  livretsContent = livretsContent.replace(
    /(async function translateText\(text: string, sourceLang: string, targetLang: string\): Promise<string>)/,
    `// Variable pour éviter les warnings répétés
let translateWarningShown = false;

$1`
  );
}

// Remplacer translateText.warned par translateWarningShown
livretsContent = livretsContent.replace(/translateText\.warned/g, 'translateWarningShown');

fs.writeFileSync(livretsPath, livretsContent, 'utf8');
console.log('   ✅ src/routes/livrets.ts corrigé');

// Correction 3 : src/routes/modules.ts
console.log('3️⃣ Correction de src/routes/modules.ts...');
const modulesPath = path.join(__dirname, 'src', 'routes', 'modules.ts');
let modulesContent = fs.readFileSync(modulesPath, 'utf8');

// Ajouter la variable si elle n'existe pas
if (!modulesContent.includes('let translateWarningShown = false;')) {
  modulesContent = modulesContent.replace(
    /(async function translateText\(text: string, sourceLang: string, targetLang: string\): Promise<string>)/,
    `// Variable pour éviter les warnings répétés
let translateWarningShown = false;

$1`
  );
}

// Remplacer translateText.warned par translateWarningShown
modulesContent = modulesContent.replace(/translateText\.warned/g, 'translateWarningShown');

fs.writeFileSync(modulesPath, modulesContent, 'utf8');
console.log('   ✅ src/routes/modules.ts corrigé');

console.log('\n✅ Toutes les corrections ont été appliquées !');
console.log('\n🔨 Exécutez maintenant : npm run build');
