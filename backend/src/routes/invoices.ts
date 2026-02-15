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
            companyName: true,
            vatNumber: true,
            address: true,
            country: true,
            userType: true,
          }
        },
        subscription: {
          select: {
            plan: true,
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    // Générer un numéro de facture lisible basé sur la date et l'ID
    const invoiceDate = new Date(invoice.createdAt);
    const year = invoiceDate.getFullYear();
    const shortId = invoice.id.substring(0, 6).toUpperCase();
    const invoiceNumber = `MGD-${year}-${shortId}`;

    // Déterminer le libellé du plan
    const planLabels: Record<string, string> = {
      'MONTHLY': 'Abonnement Mensuel',
      'YEARLY': 'Abonnement Annuel',
      'LIFETIME': 'Abonnement À Vie',
      'TRIAL': 'Période d\'essai',
    };
    const planLabel = planLabels[invoice.subscription?.plan || ''] || 'Abonnement My Guide Digital';

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoiceNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // ===== HEADER =====
    // Titre FACTURE en gras + numéro
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#6366f1').text('FACTURE', 50, 50);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`N° ${invoiceNumber}`, 50, 78);

    // Statut en haut à droite
    const statusText = invoice.status === 'PAID' ? 'PAYÉE' : 
                       invoice.status === 'PENDING' ? 'EN ATTENTE' : 
                       'ÉCHOUÉE';
    const statusColor = invoice.status === 'PAID' ? '#22c55e' : 
                        invoice.status === 'PENDING' ? '#f59e0b' : 
                        '#ef4444';
    doc.fontSize(12).font('Helvetica-Bold').fillColor(statusColor).text(statusText, 400, 55, { align: 'right' });

    // Ligne de séparation
    doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ===== ÉMETTEUR (gauche) =====
    let yPos = 120;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('My Guide Digital', 50, yPos);
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
    doc.text('Plateforme de livrets d\'accueil digitaux', 50, yPos + 14);
    doc.text('support@myguidedigital.com', 50, yPos + 28);
    doc.text('www.myguidedigital.com', 50, yPos + 42);

    // ===== CLIENT (droite) =====
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111827').text('Facturé à :', 350, yPos);
    doc.fontSize(9).font('Helvetica').fillColor('#374151');
    
    let clientY = yPos + 14;
    // Nom de la société si applicable
    if (invoice.user.userType === 'SOCIETE' && invoice.user.companyName) {
      doc.font('Helvetica-Bold').text(invoice.user.companyName, 350, clientY);
      clientY += 14;
      doc.font('Helvetica');
    }
    // Nom du client
    const clientName = `${invoice.user.firstName || ''} ${invoice.user.lastName || ''}`.trim() || 'Client';
    doc.text(clientName, 350, clientY);
    clientY += 14;
    doc.text(invoice.user.email, 350, clientY);
    clientY += 14;
    // Adresse si disponible
    if (invoice.user.address) {
      doc.text(invoice.user.address, 350, clientY);
      clientY += 14;
    }
    if (invoice.user.country) {
      doc.text(invoice.user.country, 350, clientY);
      clientY += 14;
    }
    // TVA si disponible
    if (invoice.user.vatNumber) {
      doc.text(`TVA: ${invoice.user.vatNumber}`, 350, clientY);
      clientY += 14;
    }

    // ===== DATES =====
    yPos = Math.max(yPos + 70, clientY + 10);
    doc.moveTo(50, yPos).lineTo(545, yPos).strokeColor('#e5e7eb').lineWidth(1).stroke();
    yPos += 15;

    doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
    doc.text(`Date d'émission : ${invoiceDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, yPos);
    if (invoice.paidAt) {
      doc.text(`Date de paiement : ${new Date(invoice.paidAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`, 300, yPos);
    }

    // ===== TABLEAU DES PRESTATIONS =====
    yPos += 35;

    // Header du tableau
    doc.rect(50, yPos, 495, 25).fill('#f3f4f6');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
    doc.text('Description', 60, yPos + 7);
    doc.text('Montant HT', 380, yPos + 7);
    doc.text('Total', 470, yPos + 7);
    yPos += 25;

    // Ligne du tableau
    const amountHT = invoice.amount;
    doc.fontSize(9).font('Helvetica').fillColor('#111827');
    doc.text(`${planLabel} — My Guide Digital`, 60, yPos + 8);
    doc.text(`${amountHT.toFixed(2)} €`, 380, yPos + 8);
    doc.text(`${amountHT.toFixed(2)} €`, 470, yPos + 8);
    yPos += 28;

    // Ligne de séparation
    doc.moveTo(50, yPos).lineTo(545, yPos).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    yPos += 15;

    // ===== TOTAL =====
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280');
    doc.text('Total HT', 380, yPos);
    doc.font('Helvetica-Bold').fillColor('#111827').text(`${amountHT.toFixed(2)} €`, 470, yPos);
    yPos += 18;

    doc.font('Helvetica').fillColor('#6b7280');
    doc.text('TVA (0%)', 380, yPos);
    doc.fillColor('#111827').text('0.00 €', 470, yPos);
    yPos += 18;

    doc.moveTo(370, yPos).lineTo(545, yPos).strokeColor('#6366f1').lineWidth(1.5).stroke();
    yPos += 10;

    doc.fontSize(12).font('Helvetica-Bold').fillColor('#6366f1');
    doc.text('Total TTC', 380, yPos);
    doc.text(`${amountHT.toFixed(2)} €`, 460, yPos);

    // ===== FOOTER =====
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af');
    doc.text('Merci pour votre confiance !', 50, footerY + 10, { align: 'center', width: 495 });
    doc.text('My Guide Digital — Plateforme de livrets d\'accueil digitaux', 50, footerY + 22, { align: 'center', width: 495 });
    doc.text(`Facture générée automatiquement le ${new Date().toLocaleDateString('fr-FR')}`, 50, footerY + 34, { align: 'center', width: 495 });

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
  }
});

export default router;
