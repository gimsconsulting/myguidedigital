import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient pour éviter de créer plusieurs connexions à la DB
// En développement, on stocke l'instance dans globalThis pour survivre au hot reload
// En production, on crée une seule instance

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
