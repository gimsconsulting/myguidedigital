# 🔧 Correction Directe sur le Serveur

## ✅ Les Fichiers Locaux sont Corrects

Les corrections sont déjà dans vos fichiers locaux. Il faut maintenant les appliquer sur le serveur.

## 🎯 Solution : Corriger Directement sur le Serveur

Sur votre VPS, exécutez ces commandes pour corriger directement les fichiers :

### Correction 1 : `src/index.ts` (ligne 97)

```bash
cd /root/myguidedigital/myguidedigital/backend

# Éditer le fichier
nano src/index.ts
```

Dans nano, allez à la ligne 97 (ou cherchez `permissionsPolicy:`).

**Remplacez** :
```typescript
  // Permissions Policy (anciennement Feature Policy)
  permissionsPolicy: {
    features: {
      geolocation: ["'self'"],
      microphone: ["'none'"],
      camera: ["'none'"],
    },
  },
```

**Par** :
```typescript
  // Permissions Policy (anciennement Feature Policy) - Désactivé car non supporté dans cette version de Helmet
  // permissionsPolicy: {
  //   features: {
  //     geolocation: ["'self'"],
  //     microphone: ["'none'"],
  //     camera: ["'none'"],
  //   },
  // },
```

Sauvegardez : `Ctrl+O`, `Enter`, `Ctrl+X`

### Correction 2 : `src/routes/livrets.ts` (lignes 20-22)

```bash
nano src/routes/livrets.ts
```

Cherchez la fonction `translateText` (vers la ligne 12-25).

**Remplacez** :
```typescript
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '' || sourceLang === targetLang) {
    return text;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    // Ne logger qu'une seule fois au démarrage, pas à chaque appel
    if (!translateText.warned) {
      console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non configurée - Les traductions seront désactivées');
      translateText.warned = true;
    }
    return text;
  }
```

**Par** :
```typescript
// Variable pour éviter les warnings répétés
let translateWarningShown = false;

// Fonction utilitaire pour traduire un texte
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '' || sourceLang === targetLang) {
    return text;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    // Ne logger qu'une seule fois au démarrage, pas à chaque appel
    if (!translateWarningShown) {
      console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY non configurée - Les traductions seront désactivées');
      translateWarningShown = true;
    }
    return text;
  }
```

Sauvegardez : `Ctrl+O`, `Enter`, `Ctrl+X`

### Correction 3 : `src/routes/modules.ts` (lignes 19-21)

```bash
nano src/routes/modules.ts
```

Faites la même correction que pour `livrets.ts` :
- Ajoutez `let translateWarningShown = false;` avant la fonction
- Remplacez `translateText.warned` par `translateWarningShown`

Sauvegardez : `Ctrl+O`, `Enter`, `Ctrl+X`

### Après les Corrections

```bash
# Compiler
npm run build

# Si compilation réussie, redémarrer
pm2 restart my-guidedigital-backend

# Vérifier les logs
pm2 logs my-guidedigital-backend --lines 20
```

---

**Exécutez ces corrections directement sur le serveur !** 🔧
