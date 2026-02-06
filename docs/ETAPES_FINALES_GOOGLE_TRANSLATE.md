# ✅ Étapes Finales : Activer Google Translate

## 📋 Étape 1 : Ajouter la clé API dans le backend

### 1.1 Ouvrir le fichier .env

Ouvrez le fichier : `backend/.env`

### 1.2 Ajouter la clé API

Ajoutez cette ligne (remplacez par votre vraie clé) :

```
GOOGLE_TRANSLATE_API_KEY=votre-cle-api-google-ici
```

**Exemple :**
```
GOOGLE_TRANSLATE_API_KEY=AIzaSyAbc123Def456Ghi789Jkl012Mno345Pqr
```

⚠️ **Important :** 
- Ne mettez PAS d'espaces avant ou après le `=`
- Ne mettez PAS de guillemets autour de la clé
- La clé doit commencer par `AIzaSy`

### 1.3 Vérifier le fichier .env

Votre fichier `backend/.env` devrait ressembler à ça :

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-secret-jwt"
PORT=3001
GOOGLE_TRANSLATE_API_KEY=AIzaSy...
```

---

## 📋 Étape 2 : Redémarrer le backend

### 2.1 Arrêter le serveur backend

Dans le terminal où tourne le backend, appuyez sur **Ctrl+C**

### 2.2 Redémarrer le backend

```powershell
cd backend
npm run dev
```

### 2.3 Vérifier les logs

Vous devriez voir dans les logs :
```
🚀 Server running on http://0.0.0.0:3001
```

Si vous voyez un avertissement comme :
```
⚠️ GOOGLE_TRANSLATE_API_KEY non configurée
```
Cela signifie que la clé n'a pas été détectée. Vérifiez votre fichier `.env`.

---

## 📋 Étape 3 : Tester la traduction

### 3.1 Test depuis la console du navigateur

1. **Ouvrez votre application** dans le navigateur
2. **Connectez-vous** à votre compte
3. **Ouvrez la console** (F12 → onglet Console)
4. **Copiez-collez** ce code (remplacez `VOTRE_TOKEN` par votre token JWT) :

```javascript
// Récupérer le token depuis localStorage
const token = localStorage.getItem('token');

// Tester la traduction
fetch('http://localhost:3001/api/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    text: 'Bonjour',
    sourceLang: 'fr',
    targetLang: 'en'
  })
})
.then(r => r.json())
.then(result => {
  console.log('✅ Traduction réussie:', result);
  console.log('Texte traduit:', result.translatedText); // Devrait afficher "Hello"
})
.catch(error => {
  console.error('❌ Erreur:', error);
});
```

### 3.2 Résultat attendu

Si tout fonctionne, vous devriez voir :
```json
{
  "translatedText": "Hello",
  "sourceLang": "fr",
  "targetLang": "en"
}
```

---

## 📋 Étape 4 : Tester depuis l'interface (optionnel)

### 4.1 Ajouter un bouton de test dans l'édition du livret

Ouvrez : `frontend/app/dashboard/livrets/[id]/page.tsx`

Ajoutez cette fonction (après `handleLanguageToggle`) :

```tsx
const testTranslation = async () => {
  try {
    toast.info('Test de traduction en cours...');
    const result = await translationService.translateText(
      'Bonjour',
      'fr',
      'en'
    );
    toast.success(`Traduction réussie : "${result}"`);
    console.log('Résultat:', result);
  } catch (error) {
    toast.error('Erreur lors de la traduction');
    console.error(error);
  }
};
```

Et ajoutez un bouton de test temporaire :

```tsx
<Button 
  type="button" 
  variant="outline"
  onClick={testTranslation}
  className="mt-2"
>
  🧪 Tester la traduction
</Button>
```

---

## ✅ Checklist de vérification

- [ ] Clé API Google ajoutée dans `backend/.env`
- [ ] Clé API commence par `AIzaSy`
- [ ] Pas d'espaces ou de guillemets autour de la clé
- [ ] Backend redémarré après modification du .env
- [ ] Pas d'erreur dans les logs du backend
- [ ] Test depuis la console du navigateur réussi
- [ ] La traduction retourne bien "Hello" pour "Bonjour"

---

## 🐛 Dépannage

### Erreur "GOOGLE_TRANSLATE_API_KEY non configurée"

**Solution :**
1. Vérifiez que le fichier s'appelle bien `.env` (pas `.env.txt`)
2. Vérifiez qu'il est dans le dossier `backend/`
3. Vérifiez qu'il n'y a pas d'espaces avant/après le `=`
4. Redémarrez le backend

### Erreur "API key not valid"

**Solution :**
1. Vérifiez que vous avez bien copié toute la clé API
2. Vérifiez que Cloud Translation API est bien activée dans Google Cloud
3. Vérifiez que la clé n'est pas restreinte à une autre API

### Erreur "Billing account required"

**Solution :**
1. Allez dans Google Cloud Console → Billing
2. Ajoutez une carte de crédit (nécessaire même pour le quota gratuit)
3. Attendez quelques minutes et réessayez

### La traduction ne fonctionne pas

**Solution :**
1. Vérifiez les logs du backend dans le terminal
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que vous êtes bien connecté (token JWT valide)
4. Testez avec un texte simple comme "Bonjour"

---

## 🎯 Prochaines étapes

Une fois que la traduction fonctionne :

1. **Traduire automatiquement le contenu des livrets** lors de la création/modification
2. **Ajouter le bouton de traduction** dans l'interface d'édition
3. **Sauvegarder les traductions** dans la base de données pour les réutiliser

Voir `docs/GUIDE_PRATIQUE_TRADUCTION.md` pour les détails.
