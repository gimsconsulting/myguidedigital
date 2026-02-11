# 🔧 Corriger les Erreurs de Syntaxe TypeScript

## ❌ Problème

Il y a des erreurs de compilation TypeScript aux lignes 39 et 53 :
- `error TS1128: Declaration or statement expected.`

Cela signifie qu'il y a probablement une parenthèse ou accolade mal fermée lors de la modification.

## ✅ Solution

### Option 1 : Vérifier et Corriger le Fichier

```bash
cd /root/myguidedigital/myguidedigital/backend

# Voir les lignes autour de l'erreur
sed -n '35,60p' src/index.ts
```

### Option 2 : Restaurer et Recommencer

Si la modification a créé des erreurs, il vaut mieux restaurer le fichier et recommencer proprement :

```bash
cd /root/myguidedigital/myguidedigital/backend

# Voir le contexte autour de la ligne 39
sed -n '30,45p' src/index.ts
```

## 🔍 Code Correct à Insérer

Le code autour de la ligne 40 devrait ressembler à ceci :

```typescript
}

// Vérifier que la clé API est chargée (seulement en développement)
if (process.env.NODE_ENV === 'development') {
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    console.log('✅ GOOGLE_TRANSLATE_API_KEY chargée');
  } else {
    console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée - Les traductions seront désactivées');
  }
}

const app = express();
```

## 📝 Instructions Détaillées

1. **Ouvrir le fichier** :
   ```bash
   nano src/index.ts
   ```

2. **Aller à la ligne 40** (ou chercher `// Vérifier que la clé API`)

3. **Supprimer TOUT le bloc** depuis `// Vérifier que la clé API...` jusqu'à la fin du `try/catch` (jusqu'à la ligne avec `}` qui ferme le bloc)

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

5. **Vérifier la syntaxe** :
   - Assurez-vous qu'il n'y a pas de parenthèses ou accolades orphelines
   - Le code doit être entre les lignes qui contiennent `}` (fin du bloc précédent) et `const app = express();`

6. **Sauvegarder** : `Ctrl+O`, `Enter`, `Ctrl+X`

7. **Vérifier qu'il n'y a pas d'erreurs** :
   ```bash
   # Vérifier la syntaxe autour de la ligne 40
   sed -n '35,50p' src/index.ts
   ```

8. **Compiler** :
   ```bash
   npm run build
   ```

9. **Si compilation réussie, redémarrer** :
   ```bash
   pm2 restart my-guidedigital-backend
   pm2 logs my-guidedigital-backend --lines 20
   ```

## ⚠️ Si les Erreurs Persistent

Si vous avez encore des erreurs après correction, montrez-moi le code autour des lignes 35-50 :

```bash
sed -n '35,50p' src/index.ts
```

Et je vous aiderai à corriger précisément.
