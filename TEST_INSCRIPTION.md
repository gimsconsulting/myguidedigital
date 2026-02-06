# Test d'inscription - Dépannage

## Vérifications à faire

1. **Backend est-il démarré ?**
   - Ouvrez un terminal
   - Allez dans `backend/`
   - Vérifiez qu'il y a un processus Node.js qui tourne
   - Le serveur doit afficher : `🚀 Server running on port 3001`

2. **Base de données existe-t-elle ?**
   - Vérifiez que le fichier `backend/dev.db` existe
   - Si non, exécutez : `cd backend && npx prisma migrate dev`

3. **Variables d'environnement**
   - Vérifiez que `backend/.env` contient bien `JWT_SECRET`

4. **Console du navigateur**
   - Ouvrez les outils de développement (F12)
   - Allez dans l'onglet "Console"
   - Essayez de vous inscrire
   - Regardez les erreurs affichées

5. **Réseau**
   - Onglet "Network" dans les outils de développement
   - Essayez de vous inscrire
   - Regardez la requête vers `/api/auth/register`
   - Vérifiez le statut de la réponse (200, 400, 500, etc.)
   - Regardez le contenu de la réponse

## Test manuel de l'API

Vous pouvez tester l'API directement avec cette commande PowerShell :

```powershell
$body = @{
    email = "test@example.com"
    password = "test123456"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

Si cela fonctionne, vous devriez recevoir un token et les informations de l'utilisateur.

## Erreurs courantes

- **"Network Error"** : Le backend n'est pas démarré ou n'est pas accessible
- **"Cet email est déjà utilisé"** : L'email existe déjà dans la base de données
- **"Données invalides"** : Le format de l'email ou le mot de passe est invalide (minimum 6 caractères)
- **"Erreur de configuration serveur"** : JWT_SECRET n'est pas défini dans le .env
