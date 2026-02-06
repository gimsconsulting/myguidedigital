# 🧪 Comment Tester la Traduction Automatique

## ✅ Prérequis

1. **Clé API Google Translate configurée** dans `backend/.env`
2. **Backend démarré** et accessible sur `http://localhost:3001`
3. **Frontend démarré** et accessible sur `http://localhost:3000`
4. **Compte utilisateur** créé et connecté

---

## 🧪 Test 1 : Test Rapide depuis l'Interface

### Étapes :

1. **Connectez-vous** à votre compte sur `http://localhost:3000/login`

2. **Accédez à un livret** :
   - Cliquez sur "Mes Livrets" dans le dashboard
   - Cliquez sur "Modifier le livret" pour un livret existant
   - Ou créez un nouveau livret

3. **Remplissez les champs de texte** :
   - Dans "Texte 1 page d'accueil (Titre du livret)", tapez : `Bienvenue dans notre logement`
   - Dans "Texte 2 page d'accueil (Sous titre)", tapez : `Nous sommes ravis de vous accueillir`

4. **Sélectionnez plusieurs langues** :
   - Cochez au moins 2 langues (ex: 🇫🇷 Français et 🇬🇧 Anglais)

5. **Testez la traduction** :
   - Cliquez sur le bouton **"🌐 Tester"** à côté du champ "Texte 1"
   - Vous devriez voir une notification de succès avec la traduction

### Résultat attendu :

- ✅ Notification : `✅ Traduction réussie : "Welcome to our accommodation"`
- ✅ Dans la console du navigateur (F12), vous verrez :
  ```
  Texte original: Bienvenue dans notre logement
  Texte traduit: Welcome to our accommodation
  ```

---

## 🧪 Test 2 : Test depuis la Console du Navigateur

### Étapes :

1. **Ouvrez la console** du navigateur (F12 → onglet Console)

2. **Récupérez votre token JWT** :
   ```javascript
   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
   console.log('Token:', token);
   ```

3. **Testez la traduction directement** :
   ```javascript
   fetch('http://localhost:3001/api/translate', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       text: 'Bonjour, comment allez-vous ?',
       sourceLang: 'fr',
       targetLang: 'en'
     })
   })
   .then(r => r.json())
   .then(result => {
     console.log('✅ Résultat:', result);
     console.log('Texte traduit:', result.translatedText);
   })
   .catch(error => {
     console.error('❌ Erreur:', error);
   });
   ```

### Résultat attendu :

```json
{
  "translatedText": "Hello, how are you?",
  "sourceLang": "fr",
  "targetLang": "en"
}
```

---

## 🧪 Test 3 : Test de Traduction Multiple (Batch)

### Étapes :

1. **Ouvrez la console** du navigateur (F12 → onglet Console)

2. **Récupérez votre token JWT** :
   ```javascript
   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
   ```

3. **Testez la traduction batch** :
   ```javascript
   fetch('http://localhost:3001/api/translate/batch', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       texts: [
         'Bienvenue dans notre logement',
         'Nous sommes ravis de vous accueillir',
         'Profitez de votre séjour'
       ],
       sourceLang: 'fr',
       targetLang: 'en'
     })
   })
   .then(r => r.json())
   .then(result => {
     console.log('✅ Résultats:', result);
     console.log('Traductions:', result.translations);
   })
   .catch(error => {
     console.error('❌ Erreur:', error);
   });
   ```

### Résultat attendu :

```json
{
  "translations": [
    "Welcome to our accommodation",
    "We are delighted to welcome you",
    "Enjoy your stay"
  ],
  "sourceLang": "fr",
  "targetLang": "en"
}
```

---

## 🧪 Test 4 : Test avec Différentes Langues

### Testez plusieurs combinaisons :

```javascript
const token = localStorage.getItem('token') || sessionStorage.getItem('token');

const tests = [
  { text: 'Bonjour', sourceLang: 'fr', targetLang: 'en', expected: 'Hello' },
  { text: 'Bonjour', sourceLang: 'fr', targetLang: 'de', expected: 'Hallo' },
  { text: 'Bonjour', sourceLang: 'fr', targetLang: 'es', expected: 'Hola' },
  { text: 'Bonjour', sourceLang: 'fr', targetLang: 'it', expected: 'Ciao' },
];

tests.forEach(async (test) => {
  const response = await fetch('http://localhost:3001/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: test.text,
      sourceLang: test.sourceLang,
      targetLang: test.targetLang
    })
  });
  
  const result = await response.json();
  console.log(`✅ ${test.sourceLang} → ${test.targetLang}:`, result.translatedText);
});
```

---

## 🐛 Dépannage

### Erreur "Network Error"

**Cause :** Le backend n'est pas accessible ou la clé API n'est pas configurée.

**Solution :**
1. Vérifiez que le backend tourne sur `http://localhost:3001`
2. Vérifiez le fichier `backend/.env` contient bien `GOOGLE_TRANSLATE_API_KEY=...`
3. Redémarrez le backend après modification du `.env`

### Erreur "401 Unauthorized"

**Cause :** Le token JWT est invalide ou expiré.

**Solution :**
1. Déconnectez-vous et reconnectez-vous
2. Vérifiez que vous êtes bien connecté dans l'interface

### Erreur "API key not valid"

**Cause :** La clé API Google Translate est incorrecte ou n'a pas les bonnes permissions.

**Solution :**
1. Vérifiez que la clé commence par `AIzaSy`
2. Vérifiez que Cloud Translation API est activée dans Google Cloud Console
3. Vérifiez que la clé n'est pas restreinte à une autre API

### La traduction retourne le texte original

**Cause :** La clé API n'est pas configurée ou Google Translate API n'est pas activée.

**Solution :**
1. Vérifiez les logs du backend dans le terminal
2. Vous devriez voir un avertissement : `⚠️ GOOGLE_TRANSLATE_API_KEY non configurée`
3. Vérifiez que la clé est bien dans `backend/.env` et redémarrez le backend

### Erreur "Billing account required"

**Cause :** Google Cloud nécessite une carte de crédit même pour le quota gratuit.

**Solution :**
1. Allez dans Google Cloud Console → Billing
2. Ajoutez une carte de crédit
3. Attendez quelques minutes et réessayez

---

## ✅ Checklist de Vérification

- [ ] Backend démarré sans erreur
- [ ] Pas d'avertissement `GOOGLE_TRANSLATE_API_KEY non configurée` dans les logs
- [ ] Test depuis l'interface fonctionne (bouton "🌐 Tester")
- [ ] Test depuis la console fonctionne
- [ ] Traduction vers l'anglais fonctionne
- [ ] Traduction vers d'autres langues fonctionne
- [ ] Traduction batch fonctionne

---

## 🎯 Prochaines Étapes

Une fois que les tests fonctionnent :

1. **Intégrer la traduction automatique** lors de la sauvegarde du livret
2. **Afficher les traductions** dans l'interface publique selon la langue sélectionnée
3. **Sauvegarder les traductions** dans la base de données pour éviter de retraduire

Voir `docs/GUIDE_PRATIQUE_TRADUCTION.md` pour plus de détails.
