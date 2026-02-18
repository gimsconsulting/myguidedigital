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
      include: { creditNotes: true },
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

    // Utiliser le numéro séquentiel ou fallback
    const invoiceDate = new Date(invoice.createdAt);
    const invoiceNumber = invoice.invoiceNumber || `${invoiceDate.getFullYear()}-${invoice.id.substring(0, 5).toUpperCase()}`;

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
    const isPreview = req.query.preview === 'true';
    const isCredit = (invoice as any).type === 'CREDIT_NOTE';
    const prefix = isCredit ? 'note-credit' : 'facture';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${isPreview ? 'inline' : 'attachment'}; filename="${prefix}-${invoiceNumber}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // ===== HEADER =====
    // Titre FACTURE ou NOTE DE CRÉDIT en gras + numéro
    const docTitle = isCredit ? 'NOTE DE CRÉDIT' : 'FACTURE';
    const titleColor = isCredit ? '#ef4444' : '#6366f1';
    doc.fontSize(isCredit ? 20 : 24).font('Helvetica-Bold').fillColor(titleColor).text(docTitle, 50, 50);
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
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text('Gims Consulting SRL', 50, yPos);
    doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
    doc.text('Avenue Louise 143/4', 50, yPos + 15);
    doc.text('1050 Bruxelles, Belgique', 50, yPos + 28);
    doc.text('TVA : BE0848903319', 50, yPos + 41);
    doc.text('info@gims-consulting.be', 50, yPos + 54);
    doc.text('www.myguidedigital.com', 50, yPos + 67);

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
    doc.text('Montant HT', 370, yPos + 7);
    doc.text('TVA', 430, yPos + 7);
    doc.text('Total TTC', 480, yPos + 7);
    yPos += 25;

    // Calculs TVA 21%
    // Le montant stocké est le montant TTC (ce que Stripe facture)
    const amountTTC = invoice.amount;
    const amountHT = parseFloat((amountTTC / 1.21).toFixed(2));
    const amountTVA = parseFloat((amountTTC - amountHT).toFixed(2));

    // Ligne du tableau
    doc.fontSize(9).font('Helvetica').fillColor('#111827');
    doc.text(`${planLabel} — My Guide Digital`, 60, yPos + 8, { width: 300 });
    doc.text(`${amountHT.toFixed(2)} €`, 370, yPos + 8);
    doc.text(`${amountTVA.toFixed(2)} €`, 430, yPos + 8);
    doc.text(`${amountTTC.toFixed(2)} €`, 480, yPos + 8);
    yPos += 28;

    // Ligne de séparation
    doc.moveTo(50, yPos).lineTo(545, yPos).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    yPos += 20;

    // ===== TOTAUX =====
    // Total HT
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280');
    doc.text('Total HT', 370, yPos);
    doc.font('Helvetica').fillColor('#111827').text(`${amountHT.toFixed(2)} €`, 480, yPos);
    yPos += 20;

    // TVA 21%
    doc.font('Helvetica').fillColor('#6b7280');
    doc.text('TVA (21%)', 370, yPos);
    doc.fillColor('#111827').text(`${amountTVA.toFixed(2)} €`, 480, yPos);
    yPos += 20;

    // Ligne séparateur total
    doc.moveTo(360, yPos).lineTo(545, yPos).strokeColor(isCredit ? '#ef4444' : '#6366f1').lineWidth(2).stroke();
    yPos += 12;

    // Total TTC
    const totalColor = isCredit ? '#ef4444' : '#6366f1';
    doc.fontSize(13).font('Helvetica-Bold').fillColor(totalColor);
    doc.text('Total TTC', 370, yPos);
    doc.text(`${isCredit ? '-' : ''}${amountTTC.toFixed(2)} €`, 475, yPos);

    // Référence facture d'origine pour les notes de crédit
    if (isCredit && (invoice as any).parentInvoiceId) {
      yPos += 30;
      doc.fontSize(9).font('Helvetica').fillColor('#6b7280');
      doc.text(`Note de crédit relative à la facture d'origine`, 50, yPos);
    }

    // ===== FOOTER =====
    const footerY = 750;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    
    doc.fontSize(8).font('Helvetica').fillColor('#9ca3af');
    doc.text('Merci pour votre confiance !', 50, footerY + 10, { align: 'center', width: 495 });
    doc.text('Gims Consulting SRL — Avenue Louise 143/4, 1050 Bruxelles — TVA BE0848903319', 50, footerY + 22, { align: 'center', width: 495 });
    doc.text(`Facture générée automatiquement le ${new Date().toLocaleDateString('fr-FR')}`, 50, footerY + 34, { align: 'center', width: 495 });

    // Finalize PDF
    doc.end();
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
  }
});

// ═══════════════════════════════════════════
// Créer une note de crédit à partir d'une facture
// ═══════════════════════════════════════════
router.post('/:id/credit-note', authenticateToken, async (req: any, res) => {
  try {
    // Vérifier que la facture existe et appartient à l'utilisateur
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      }
    });

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    if ((invoice as any).type === 'CREDIT_NOTE') {
      return res.status(400).json({ message: 'Impossible de créer une note de crédit sur une note de crédit' });
    }

    // Vérifier qu'il n'y a pas déjà une note de crédit pour cette facture
    const existingCreditNote = await prisma.invoice.findFirst({
      where: {
        parentInvoiceId: invoice.id,
        type: 'CREDIT_NOTE',
      }
    });

    if (existingCreditNote) {
      return res.status(400).json({ message: 'Une note de crédit existe déjà pour cette facture' });
    }

    // Générer le numéro de note de crédit
    const year = new Date().getFullYear();
    const countCN = await prisma.invoice.count({
      where: {
        type: 'CREDIT_NOTE',
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        }
      }
    });
    const creditNoteNumber = `CN-${year}-${String(countCN + 1).padStart(5, '0')}`;

    // Créer la note de crédit
    const creditNote = await prisma.invoice.create({
      data: {
        invoiceNumber: creditNoteNumber,
        userId: req.userId,
        subscriptionId: invoice.subscriptionId,
        amount: invoice.amount,
        currency: invoice.currency,
        status: 'PAID',
        type: 'CREDIT_NOTE',
        parentInvoiceId: invoice.id,
        paidAt: new Date(),
      }
    });

    res.json(creditNote);
  } catch (error: any) {
    console.error('Create credit note error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la note de crédit' });
  }
});

export default router;
