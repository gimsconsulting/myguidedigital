# Information sur les Ports

## État actuel

- **Backend API** : Port **3001** ✅
- **Frontend Next.js** : Port **3002** ✅ (car 3000 et 3001 étaient occupés)

## Accès à l'application

- **Frontend** : http://localhost:3002
- **Backend API** : http://localhost:3001

## Pourquoi le frontend est sur 3002 ?

Next.js a automatiquement choisi le port 3002 car :
- Port 3000 : déjà utilisé (probablement une ancienne instance)
- Port 3001 : déjà utilisé par le backend

C'est normal et fonctionnel ! L'API backend reste sur 3001 et le frontend communique correctement avec lui.

## L'erreur ENOWORKSPACES

L'erreur `npm error code ENOWORKSPACES` n'est pas critique. Le serveur Next.js démarre quand même correctement (vous voyez "✓ Ready in 1418ms").

Cette erreur peut être ignorée - elle n'affecte pas le fonctionnement de l'application.

## Si vous voulez utiliser le port 3000

1. Arrêtez tous les processus Node.js
2. Redémarrez uniquement le frontend :
   ```bash
   cd frontend
   npm run dev
   ```

Ou spécifiez explicitement le port :
```bash
cd frontend
npm run dev -- -p 3000
```

Mais ce n'est pas nécessaire - l'application fonctionne parfaitement sur le port 3002 !
