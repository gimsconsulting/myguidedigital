# 🔧 Remplacer le Code sur le Serveur

## 📋 Commandes à Exécuter

Sur votre VPS, exécutez cette commande pour voir TOUT le bloc à remplacer :

```bash
cd /root/myguidedigital/myguidedigital/backend

# Voir toutes les lignes qui contiennent GOOGLE_TRANSLATE_API_KEY avec leur contexte
grep -n "GOOGLE_TRANSLATE_API_KEY\|Vérifier que la clé API\|Répertoire courant\|Variables disponibles" src/index.ts

# Voir le bloc complet (lignes 35-65 environ)
sed -n '35,65p' src/index.ts
```

## 🔍 Ce que Nous Devons Trouver

Le bloc à remplacer commence probablement par quelque chose comme :
- `// Vérifier que la clé API est chargée (pour debug)`
- Ou `console.log('🔍 Vérification des variables d\'environnement...');`

Et se termine avant `const app = express();`

## ✅ Solution : Remplacer Tout le Bloc

Une fois que vous avez vu le bloc complet avec `sed -n '35,65p'`, vous devez :

1. **Ouvrir le fichier** :
   ```bash
   nano src/index.ts
   ```

2. **Trouver le début du bloc** (cherchez `Vérifier que la clé API` ou `🔍 Vérification`)

3. **Supprimer TOUT** depuis le début du bloc jusqu'à la ligne juste avant `const app = express();`

4. **Insérer exactement ce code** :
   ```typescript
   // Vérifier que la clé API est chargée (seulement en développement)
   if (process.env.NODE_ENV === 'development') {
     if (process.env.GOOGLE_TRANSLATE_API_KEY) {
       console.log('✅ GOOGLE_TRANSLATE_API_KEY chargée');
     } else {
       console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée - Les traductions seront désactivées');
     }
   }
   ```

5. **Sauvegarder** : `Ctrl+O`, `Enter`, `Ctrl+X`

6. **Compiler** :
   ```bash
   npm run build
   ```

7. **Si compilation réussie, redémarrer** :
   ```bash
   pm2 restart my-guidedigital-backend
   pm2 logs my-guidedigital-backend --lines 20
   ```

---

**Exécutez d'abord `sed -n '35,65p' src/index.ts` et montrez-moi le résultat pour que je vous donne les instructions précises !** 🔍
