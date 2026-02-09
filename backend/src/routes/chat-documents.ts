import express from 'express';
import { authenticateToken } from './auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Créer un document texte pour un livret
router.post('/:livretId', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { livretId } = req.params;
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Le titre est requis' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu est requis' });
    }

    // Vérifier que le livret appartient à l'utilisateur
    const livret = await prisma.livret.findFirst({
      where: {
        id: livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Créer l'entrée dans la base de données
    const chatDocument = await prisma.chatDocument.create({
      data: {
        livretId: livretId,
        title: title.trim(),
        content: content.trim()
      }
    });

    res.json({
      message: 'Document créé avec succès',
      document: chatDocument
    });
  } catch (error: any) {
    console.error('Create document error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la création du document' });
  }
});

// Récupérer tous les documents d'un livret
router.get('/:livretId', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { livretId } = req.params;

    // Vérifier que le livret appartient à l'utilisateur
    const livret = await prisma.livret.findFirst({
      where: {
        id: livretId,
        userId: req.userId
      }
    });

    if (!livret) {
      return res.status(404).json({ message: 'Livret non trouvé' });
    }

    // Récupérer tous les documents du livret
    const documents = await prisma.chatDocument.findMany({
      where: {
        livretId: livretId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ documents });
  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la récupération des documents' });
  }
});

// Mettre à jour un document
router.put('/:documentId', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { documentId } = req.params;
    const { title, content } = req.body;

    // Récupérer le document avec le livret pour vérifier la propriété
    const document = await prisma.chatDocument.findUnique({
      where: { id: documentId },
      include: { livret: true }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Vérifier que le livret appartient à l'utilisateur
    if (document.livret.userId !== req.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.chatDocument.update({
      where: { id: documentId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() })
      }
    });

    res.json({
      message: 'Document mis à jour avec succès',
      document: updatedDocument
    });
  } catch (error: any) {
    console.error('Update document error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la mise à jour du document' });
  }
});

// Supprimer un document
router.delete('/:documentId', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { documentId } = req.params;

    // Récupérer le document avec le livret pour vérifier la propriété
    const document = await prisma.chatDocument.findUnique({
      where: { id: documentId },
      include: { livret: true }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Vérifier que le livret appartient à l'utilisateur
    if (document.livret.userId !== req.userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    // Supprimer l'entrée de la base de données
    await prisma.chatDocument.delete({
      where: { id: documentId }
    });

    res.json({ message: 'Document supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: error.message || 'Erreur lors de la suppression du document' });
  }
});

export default router;
