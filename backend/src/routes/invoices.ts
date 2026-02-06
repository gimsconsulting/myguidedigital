import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';
import PDFDocument from 'pdfkit';

const router = express.Router();
const prisma = new PrismaClient();

// Get all invoices
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error: any) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
});

// Get single invoice
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    res.json(invoice);
  } catch (error: any) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la facture' });
  }
});

// Download invoice PDF
router.get('/:id/pdf', authenticateToken, async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoice.id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();

    // Company info
    doc.fontSize(12);
    doc.text('Livrets d\'Accueil', { align: 'left' });
    doc.text('Plateforme SaaS', { align: 'left' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(14).text('Détails de la facture', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Numéro de facture: ${invoice.id}`, { continued: false });
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, { continued: false });
    if (invoice.paidAt) {
      doc.text(`Date de paiement: ${new Date(invoice.paidAt).toLocaleDateString('fr-FR')}`, { continued: false });
    }
    doc.moveDown();

    // Customer info
    doc.fontSize(14).text('Client', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`${invoice.user.firstName || ''} ${invoice.user.lastName || ''}`.trim() || 'Client');
    doc.text(invoice.user.email);
    doc.moveDown();

    // Invoice items
    doc.fontSize(14).text('Détails', { underline: true });
    doc.moveDown(0.5);
    
    // Table header
    doc.fontSize(10);
    doc.text('Description', 50, doc.y);
    doc.text('Montant', 400, doc.y, { align: 'right' });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Invoice item
    doc.text('Abonnement Livrets d\'Accueil', 50, doc.y);
    doc.text(`${invoice.amount.toFixed(2)} ${invoice.currency}`, 400, doc.y, { align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Total
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Total TTC', 50, doc.y);
    doc.text(`${invoice.amount.toFixed(2)} ${invoice.currency}`, 400, doc.y, { align: 'right' });
    doc.moveDown(2);

    // Status
    doc.fontSize(10).font('Helvetica');
    const statusText = invoice.status === 'PAID' ? 'Payée' : 
                       invoice.status === 'PENDING' ? 'En attente' : 
                       'Échouée';
    const statusColor = invoice.status === 'PAID' ? '#00FF00' : 
                        invoice.status === 'PENDING' ? '#FFA500' : 
                        '#FF0000';
    
    doc.fillColor(statusColor);
    doc.text(`Statut: ${statusText}`, { align: 'right' });
    doc.fillColor('#000000');

    // Footer
    doc.fontSize(8);
    doc.text('Merci pour votre confiance !', { align: 'center' });
    doc.text('Livrets d\'Accueil - Plateforme SaaS', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
  }
});

export default router;
