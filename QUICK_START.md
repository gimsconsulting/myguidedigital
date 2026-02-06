# ⚡ Démarrage Rapide

## En 5 Minutes

### 1. Installer
```bash
npm run install:all
```

### 2. PostgreSQL
```bash
# Option Docker (recommandé)
docker run --name postgres-livrets -e POSTGRES_PASSWORD=password -e POSTGRES_DB=livrets_accueil -p 5432:5432 -d postgres:14
```

### 3. Configurer
Créez `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/livrets_accueil"
JWT_SECRET="votre-secret-jwt"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

Créez `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Base de données
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Démarrer
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

✅ **C'est prêt !**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

📖 Pour plus de détails, voir `INSTRUCTIONS_DEMARRAGE.md`
