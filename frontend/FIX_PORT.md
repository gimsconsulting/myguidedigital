# Fix du problème de port

## Problème
Le navigateur essaie de charger des fichiers depuis `http://localhost:3000` alors que le serveur tourne sur `http://localhost:3002`.

## Solution

1. **Arrêtez complètement le serveur frontend** (Ctrl+C)

2. **Supprimez le cache** (déjà fait) :
   ```bash
   cd frontend
   rm -rf .next
   ```
   Ou sur Windows :
   ```bash
   cd frontend
   rmdir /s /q .next
   ```

3. **Videz le cache du navigateur** :
   - Appuyez sur `Ctrl + Shift + Delete`
   - Cochez "Images et fichiers en cache"
   - Cliquez sur "Effacer les données"

4. **Redémarrez le serveur** :
   ```bash
   cd frontend
   npm run dev
   ```

5. **Ouvrez le bon port** :
   - Si le serveur démarre sur 3002, allez sur http://localhost:3002
   - Si le serveur démarre sur 3000, allez sur http://localhost:3000

## Alternative : Forcer le port 3000

Si vous voulez forcer le port 3000 :

1. Arrêtez tous les processus sur le port 3000
2. Modifiez `package.json` dans `frontend/` :
   ```json
   "scripts": {
     "dev": "next dev -p 3000"
   }
   ```

3. Redémarrez le serveur
