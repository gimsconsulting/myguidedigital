# 🔄 Mise à Jour du Code sur le Serveur

## ❌ Problème

Les corrections ne sont pas encore actives car le code source sur le serveur n'a pas été mis à jour depuis votre machine locale.

## ✅ Solution : Mettre à Jour le Code

### Option 1 : Via Git (Recommandé)

Si vous avez fait un `git push` depuis votre machine locale :

```bash
cd /root/myguidedigital/myguidedigital/backend

# 1. Récupérer les dernières modifications
git pull origin main
# ou la branche que vous utilisez

# 2. Vérifier que les modifications sont présentes
grep -A 3 "NODE_ENV === 'development'" src/index.ts

# 3. Recompiler
npm run build

# 4. Redémarrer
pm2 restart my-guidedigital-backend

# 5. Vérifier les logs
pm2 logs my-guidedigital-backend --lines 20
```

### Option 2 : Modifier Directement sur le Serveur

Si vous n'utilisez pas Git, modifiez directement le fichier sur le serveur :

```bash
cd /root/myguidedigital/myguidedigital/backend

# Éditer le fichier
nano src/index.ts
```

Cherchez cette section (vers la ligne 40-45) :

```typescript
// Vérifier que la clé API est chargée (pour debug)
console.log('🔍 Vérification des variables d\'environnement...');
if (process.env.GOOGLE_TRANSLATE_API_KEY) {
  console.log('✅ GOOGLE_TRANSLATE_API_KEY chargée:', process.env.GOOGLE_TRANSLATE_API_KEY.substring(0, 15) + '...');
} else {
  console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée dans les variables d\'environnement');
  console.log('📁 Répertoire courant:', process.cwd());
  console.log('📋 Variables disponibles:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('API') || k.includes('TRANSLATE')));
  
  // Essayer de lire directement le fichier
  try {
    const envContent = envPath ? fs.readFileSync(envPath, 'utf8') : '';
    const hasKey = envContent.includes('GOOGLE_TRANSLATE_API_KEY');
    console.log('📄 Contenu du .env contient GOOGLE_TRANSLATE_API_KEY?', hasKey);
    if (hasKey) {
      const keyLine = envContent.split('\n').find((line: string) => line.includes('GOOGLE_TRANSLATE_API_KEY'));
      console.log('📝 Ligne trouvée:', keyLine?.substring(0, 50));
    }
  } catch (err: any) {
    console.error('❌ Erreur lecture fichier .env:', err.message);
  }
}
```

**Remplacez-la par** :

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

Puis sauvegardez (`Ctrl+O`, `Enter`, `Ctrl+X`) et :

```bash
# Recompiler
npm run build

# Redémarrer
pm2 restart my-guidedigital-backend

# Vérifier
pm2 logs my-guidedigital-backend --lines 20
```

## 🔍 Vérification

Après la mise à jour, vérifiez que les modifications sont présentes :

```bash
# Vérifier le code source
grep -A 5 "NODE_ENV === 'development'" src/index.ts

# Vérifier le code compilé
grep -A 5 "NODE_ENV === 'development'" dist/index.js
```

## 📊 Résultat Attendu

Après mise à jour et redémarrage, dans les **nouveaux logs** (pas les anciens), vous devriez voir seulement :

```
⚠️ GOOGLE_TRANSLATE_API_KEY non trouvée - Les traductions seront désactivées
```

Au lieu de tous les messages verbeux.

## ⚠️ Note Importante

Les logs que vous voyez datent du **9-11 février** (anciens). Pour voir les corrections :

1. ✅ Mettre à jour le code source (git pull ou modification manuelle)
2. ✅ Recompiler (`npm run build`)
3. ✅ Redémarrer (`pm2 restart`)
4. ✅ Attendre de nouvelles requêtes ou faire un test

Les anciens logs ne disparaîtront pas, mais les **nouveaux logs** seront propres.

## ✅ Checklist

- [ ] Code source mis à jour (git pull ou modification manuelle)
- [ ] Modifications vérifiées dans `src/index.ts`
- [ ] Code recompilé (`npm run build`)
- [ ] Backend redémarré (`pm2 restart`)
- [ ] Nouveaux logs vérifiés (moins verbeux)

---

**Le problème principal** : Le code source sur le serveur n'a pas été mis à jour avec les corrections. Il faut faire un `git pull` ou modifier le fichier directement sur le serveur.
