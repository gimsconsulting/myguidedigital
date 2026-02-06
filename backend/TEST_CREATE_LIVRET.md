# Test de création de livret

## Vérifications

1. **Base de données existe** : `backend/dev.db` doit exister
2. **Backend est démarré** : Le serveur doit tourner sur le port 3001
3. **Logs du backend** : Regardez les logs dans le terminal du backend

## Pour déboguer

1. Ouvrez le terminal où tourne le backend
2. Essayez de créer un livret depuis le frontend
3. Regardez les logs qui s'affichent :
   - "Création livret avec: ..." devrait s'afficher
   - "Livret créé avec succès: ..." devrait s'afficher
   - Ou une erreur détaillée

## Erreurs possibles

- **"EPERM: operation not permitted"** : Le fichier est verrouillé, arrêtez le backend et réessayez
- **"Database does not exist"** : Exécutez `npx prisma migrate dev`
- **"Unique constraint failed"** : Le QR code existe déjà (peu probable)

## Solution rapide

1. Arrêtez le backend (Ctrl+C)
2. Supprimez `backend/dev.db` si elle existe
3. Exécutez : `cd backend && npx prisma migrate dev --name init`
4. Redémarrez le backend : `npm run dev`
