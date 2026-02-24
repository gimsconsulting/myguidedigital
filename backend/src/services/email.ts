import nodemailer from 'nodemailer';

// Configuration du transporteur email
let transporter: nodemailer.Transporter | null = null;

// Initialiser le transporteur email
function initEmailTransporter() {
  // Si le transporteur est déjà initialisé, le retourner
  if (transporter) {
    return transporter;
  }

  // Configuration selon les variables d'environnement
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // Vérifier que les credentials sont configurés
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️ [EMAIL] SMTP credentials non configurées - Les emails ne seront pas envoyés');
    return null;
  }

  try {
    transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ [EMAIL] Transporteur email initialisé');
    return transporter;
  } catch (error) {
    console.error('❌ [EMAIL] Erreur lors de l\'initialisation du transporteur:', error);
    return null;
  }
}

// Template d'email de bienvenue
function getWelcomeEmailTemplate(user: { firstName?: string | null; lastName?: string | null; email: string }) {
  const firstName = user.firstName || 'Cher client';
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.firstName || user.email;

  return {
    subject: 'Bienvenue sur MyGuideDigital ! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur MyGuideDigital</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Bienvenue sur MyGuideDigital ! 🎉</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Bonjour ${firstName},</p>
          
          <p>Nous sommes ravis de vous accueillir sur <strong>MyGuideDigital</strong> !</p>
          
          <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
          
          <ul style="margin: 20px 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;">✅ Créer votre premier livret d'accueil numérique</li>
            <li style="margin-bottom: 10px;">✅ Personnaliser votre guide avec vos modules préférés</li>
            <li style="margin-bottom: 10px;">✅ Générer un QR code pour partager votre guide</li>
            <li style="margin-bottom: 10px;">✅ Suivre les statistiques de consultation</li>
          </ul>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-weight: bold; color: #667eea;">🎁 Offre spéciale</p>
            <p style="margin: 10px 0 0 0;">Profitez de <strong>14 jours d'essai gratuit</strong> pour découvrir toutes les fonctionnalités de la plateforme !</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://app.myguidedigital.com'}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Accéder à mon tableau de bord
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Si vous avez des questions, n'hésitez pas à nous contacter à 
            <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@myguidedigital.com'}" style="color: #667eea;">
              ${process.env.SUPPORT_EMAIL || 'support@myguidedigital.com'}
            </a>
          </p>
          
          <p style="margin-top: 20px; font-size: 14px; color: #999;">
            Cordialement,<br>
            L'équipe MyGuideDigital
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
          <p>Cet email a été envoyé à ${user.email}</p>
          <p>© ${new Date().getFullYear()} MyGuideDigital. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${firstName},

Nous sommes ravis de vous accueillir sur MyGuideDigital !

Votre compte a été créé avec succès. Vous pouvez maintenant :
- Créer votre premier livret d'accueil numérique
- Personnaliser votre guide avec vos modules préférés
- Générer un QR code pour partager votre guide
- Suivre les statistiques de consultation

🎁 Offre spéciale : Profitez de 14 jours d'essai gratuit pour découvrir toutes les fonctionnalités de la plateforme !

Accédez à votre tableau de bord : ${process.env.FRONTEND_URL || 'https://app.myguidedigital.com'}/dashboard

Si vous avez des questions, n'hésitez pas à nous contacter à ${process.env.SUPPORT_EMAIL || 'support@myguidedigital.com'}

Cordialement,
L'équipe MyGuideDigital
    `.trim(),
  };
}

/**
 * Envoyer un email de bienvenue après inscription
 */
export async function sendWelcomeEmail(user: { firstName?: string | null; lastName?: string | null; email: string }): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    
    if (!emailTransporter) {
      console.warn('⚠️ [EMAIL] Transporteur email non disponible - Email de bienvenue non envoyé');
      return false;
    }

    const emailContent = getWelcomeEmailTemplate(user);
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';

    const mailOptions = {
      from: `"MyGuideDigital" <${fromEmail}>`,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ [EMAIL] Email de bienvenue envoyé à:', user.email, 'Message ID:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    // Ne pas faire échouer l'inscription si l'email échoue
    return false;
  }
}

// Template d'email d'expiration de la période d'essai
function getTrialExpiredEmailTemplate(user: { firstName?: string | null; lastName?: string | null; email: string }) {
  const firstName = user.firstName || 'Cher client';

  return {
    subject: '⏰ Votre période d\'essai MyGuideDigital est terminée',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Période d'essai terminée</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">⏰ Votre essai gratuit est terminé</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Bonjour ${firstName},</p>
          
          <p>Votre période d'essai gratuite de <strong>14 jours</strong> sur <strong>MyGuideDigital</strong> est arrivée à son terme.</p>
          
          <p>Votre accès au tableau de bord et à vos livrets d'accueil est désormais restreint. Pour continuer à profiter de tous nos services, il vous suffit de souscrire à l'un de nos abonnements.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-weight: bold; color: #667eea;">🚀 Pourquoi passer à un abonnement ?</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Accès illimité à tous vos livrets d'accueil</li>
              <li style="margin-bottom: 8px;">QR codes personnalisés pour vos hébergements</li>
              <li style="margin-bottom: 8px;">Statistiques de consultation en temps réel</li>
              <li style="margin-bottom: 8px;">Support prioritaire et mises à jour incluses</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://app.myguidedigital.com'}/subscription" 
               style="background: linear-gradient(135deg, #667eea 0%, #ec4899 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Choisir mon abonnement
            </a>
          </div>
          
          <p style="margin-top: 20px; color: #666;">
            Vos livrets et vos données sont conservés. Dès que vous souscrirez un abonnement, vous retrouverez tout exactement comme vous l'avez laissé.
          </p>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Si vous avez des questions ou besoin d'aide pour choisir un abonnement, n'hésitez pas à nous contacter à 
            <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@myguidedigital.com'}" style="color: #667eea;">
              ${process.env.SUPPORT_EMAIL || 'support@myguidedigital.com'}
            </a>
          </p>
          
          <p style="margin-top: 20px; font-size: 14px; color: #999;">
            Cordialement,<br>
            L'équipe MyGuideDigital
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
          <p>Cet email a été envoyé à ${user.email}</p>
          <p>© ${new Date().getFullYear()} MyGuideDigital. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${firstName},

Votre période d'essai gratuite de 14 jours sur MyGuideDigital est arrivée à son terme.

Votre accès au tableau de bord et à vos livrets d'accueil est désormais restreint. Pour continuer à profiter de tous nos services, il vous suffit de souscrire à l'un de nos abonnements.

🚀 Pourquoi passer à un abonnement ?
- Accès illimité à tous vos livrets d'accueil
- QR codes personnalisés pour vos hébergements
- Statistiques de consultation en temps réel
- Support prioritaire et mises à jour incluses

Choisir mon abonnement : ${process.env.FRONTEND_URL || 'https://app.myguidedigital.com'}/subscription

Vos livrets et vos données sont conservés. Dès que vous souscrirez un abonnement, vous retrouverez tout exactement comme vous l'avez laissé.

Si vous avez des questions, contactez-nous à ${process.env.SUPPORT_EMAIL || 'support@myguidedigital.com'}

Cordialement,
L'équipe MyGuideDigital
    `.trim(),
  };
}

/**
 * Envoyer un email de notification d'expiration de la période d'essai
 */
export async function sendTrialExpiredEmail(user: { firstName?: string | null; lastName?: string | null; email: string }): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    
    if (!emailTransporter) {
      console.warn('⚠️ [EMAIL] Transporteur email non disponible - Email d\'expiration non envoyé');
      return false;
    }

    const emailContent = getTrialExpiredEmailTemplate(user);
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';

    const mailOptions = {
      from: `"MyGuideDigital" <${fromEmail}>`,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ [EMAIL] Email d\'expiration trial envoyé à:', user.email, 'Message ID:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Erreur lors de l\'envoi de l\'email d\'expiration trial:', error);
    return false;
  }
}

// Template d'email de contact
function getContactEmailTemplate(data: { name: string; email: string; subject: string; message: string }) {
  const subjectLabels: Record<string, string> = {
    info: "Demande d'information",
    demo: 'Demande de démonstration',
    support: 'Support technique',
    partnership: 'Partenariat / Affiliation',
    migration: 'Migration de livret',
    other: 'Autre',
  };

  const subjectLabel = subjectLabels[data.subject] || data.subject;

  return {
    subject: `[Contact MGD] ${subjectLabel} - ${data.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau message de contact</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📬 Nouveau message de contact</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Expéditeur</p>
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${data.name}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ec4899;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Email</p>
            <p style="margin: 0;"><a href="mailto:${data.email}" style="color: #667eea; font-weight: bold;">${data.email}</a></p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Sujet</p>
            <p style="margin: 0; font-weight: bold;">${subjectLabel}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #999;">Message</p>
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${data.email}?subject=Re: ${subjectLabel}" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Répondre à ${data.name}
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
          <p>Message envoyé depuis le formulaire de contact MyGuideDigital</p>
          <p>© ${new Date().getFullYear()} MyGuideDigital. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Nouveau message de contact MyGuideDigital

Expéditeur: ${data.name}
Email: ${data.email}
Sujet: ${subjectLabel}

Message:
${data.message}

---
Pour répondre, envoyez un email à ${data.email}
    `.trim(),
  };
}

/**
 * Envoyer un email de contact vers info@gims-consulting.be
 */
export async function sendContactEmail(data: { name: string; email: string; subject: string; message: string }): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    
    if (!emailTransporter) {
      console.warn('⚠️ [EMAIL] Transporteur email non disponible - Message de contact non envoyé');
      return false;
    }

    const emailContent = getContactEmailTemplate(data);
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';
    const contactEmail = 'info@gims-consulting.be';

    const mailOptions = {
      from: `"MyGuideDigital - Contact" <${fromEmail}>`,
      to: contactEmail,
      replyTo: data.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ [EMAIL] Message de contact envoyé à:', contactEmail, 'de:', data.email, 'Message ID:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Erreur lors de l\'envoi du message de contact:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════
// EMAILS DEMO BOOKING
// ═══════════════════════════════════════════════

interface DemoBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  accommodationType?: string;
  numberOfUnits?: string;
  message?: string;
  date: string; // Format lisible: "Lundi 24 février 2026"
  startTime: string;
  endTime: string;
  meetingLink: string;
  cancelToken: string;
  id: string;
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://app.myguidedigital.com';
const ADMIN_EMAIL = 'contact@gims-consulting.be';

const accommodationLabels: Record<string, string> = {
  hote: 'Hôte / Location saisonnière',
  hotel: 'Hôtel',
  camping: 'Camping',
};

/**
 * Email de confirmation de réservation de démo au prospect
 */
export async function sendDemoConfirmationEmail(data: DemoBookingData): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    if (!emailTransporter) return false;

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';
    const accomLabel = data.accommodationType ? (accommodationLabels[data.accommodationType] || data.accommodationType) : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">✅ Démo confirmée !</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Bonjour ${data.firstName},</p>
          <p>Votre démonstration de <strong>My Guide Digital</strong> est confirmée ! Voici les détails :</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${data.date}</p>
            <p style="margin: 5px 0;"><strong>🕐 Horaire :</strong> ${data.startTime} - ${data.endTime} (heure de Bruxelles)</p>
            <p style="margin: 5px 0;"><strong>⏱️ Durée :</strong> 30 minutes</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> Visioconférence Google Meet</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.meetingLink}" style="background: #00897B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              🎥 Rejoindre la réunion Google Meet
            </a>
          </div>

          <div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFC107;">
            <p style="margin: 0; font-size: 14px;">⏰ <strong>Rappels automatiques :</strong> Vous recevrez un email de rappel avec le lien de la réunion <strong>1 heure</strong> et <strong>10 minutes</strong> avant la démo.</p>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 25px;">
            Besoin de modifier ou annuler ? Cliquez ci-dessous :
          </p>
          <div style="text-align: center; margin: 15px 0;">
            <a href="${FRONTEND_URL}/demo/manage/${data.cancelToken}" style="background: #f44336; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px;">
              Annuler ou reporter ma démo
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Cordialement,<br>L'équipe My Guide Digital
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} My Guide Digital. Tous droits réservés.</p>
        </div>
      </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"My Guide Digital" <${fromEmail}>`,
      to: data.email,
      subject: `✅ Démo confirmée - ${data.date} à ${data.startTime}`,
      html,
      text: `Bonjour ${data.firstName},\n\nVotre démo My Guide Digital est confirmée !\n\nDate: ${data.date}\nHoraire: ${data.startTime} - ${data.endTime}\nLien: ${data.meetingLink}\n\nPour annuler/reporter: ${FRONTEND_URL}/demo/manage/${data.cancelToken}\n\nCordialement,\nL'équipe My Guide Digital`,
    });

    console.log('✅ [EMAIL] Confirmation démo envoyée à:', data.email);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Erreur confirmation démo:', error);
    return false;
  }
}

/**
 * Email de notification admin pour une nouvelle réservation
 */
export async function sendDemoAdminNotificationEmail(data: DemoBookingData): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    if (!emailTransporter) return false;

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';
    const accomLabel = data.accommodationType ? (accommodationLabels[data.accommodationType] || data.accommodationType) : 'Non précisé';

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">🆕 Nouvelle réservation de démo !</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Prospect</p>
            <p style="margin: 0; font-weight: bold;">${data.firstName} ${data.lastName}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ec4899;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Email</p>
            <p style="margin: 0;"><a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></p>
          </div>
          ${data.phone ? `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #10b981;"><p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Téléphone</p><p style="margin: 0;">${data.phone}</p></div>` : ''}
          ${data.companyName ? `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f59e0b;"><p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Entreprise</p><p style="margin: 0;">${data.companyName}</p></div>` : ''}
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #8b5cf6;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Type d'hébergement</p>
            <p style="margin: 0;">${accomLabel}</p>
          </div>
          ${data.numberOfUnits ? `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #06b6d4;"><p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Nombre de logements/chambres</p><p style="margin: 0;">${data.numberOfUnits}</p></div>` : ''}
          ${data.message ? `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #14b8a6;"><p style="margin: 0 0 5px 0; font-size: 14px; color: #999;">Message</p><p style="margin: 0; white-space: pre-wrap;">${data.message}</p></div>` : ''}
          
          <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2196F3;">
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${data.date}</p>
            <p style="margin: 5px 0;"><strong>🕐 Horaire :</strong> ${data.startTime} - ${data.endTime}</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.meetingLink}" style="background: #00897B; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              🎥 Lien Google Meet
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"My Guide Digital - Démos" <${fromEmail}>`,
      to: ADMIN_EMAIL,
      subject: `🆕 Nouvelle démo - ${data.firstName} ${data.lastName} - ${data.date} ${data.startTime}`,
      html,
      text: `Nouvelle réservation de démo\n\nProspect: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nTéléphone: ${data.phone || 'Non renseigné'}\nEntreprise: ${data.companyName || 'Non renseigné'}\nType: ${accomLabel}\nNombre d'unités: ${data.numberOfUnits || 'Non renseigné'}\n\nDate: ${data.date}\nHoraire: ${data.startTime} - ${data.endTime}\nLien: ${data.meetingLink}`,
    });

    console.log('✅ [EMAIL] Notification admin démo envoyée à:', ADMIN_EMAIL);
    return true;
  } catch (error: any) {
    console.error('❌ [EMAIL] Erreur notification admin démo:', error);
    return false;
  }
}

/**
 * Email de rappel démo (1h ou 10min avant)
 */
export async function sendDemoReminderEmail(data: DemoBookingData, type: '1h' | '10min', recipient: 'prospect' | 'admin'): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    if (!emailTransporter) return false;

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';
    const timeLabel = type === '1h' ? 'dans 1 heure' : 'dans 10 minutes';
    const urgency = type === '1h' ? '⏰' : '🔴';
    const to = recipient === 'admin' ? ADMIN_EMAIL : data.email;
    const name = recipient === 'admin' ? 'Admin' : data.firstName;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${type === '1h' ? '#FF9800, #F57C00' : '#f44336, #D32F2F'}); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">${urgency} Rappel : Démo ${timeLabel}</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Bonjour${recipient === 'admin' ? '' : ` ${name}`},</p>
          <p>${recipient === 'admin' ? `La démo avec <strong>${data.firstName} ${data.lastName}</strong>` : 'Votre démonstration de <strong>My Guide Digital</strong>'} commence <strong>${timeLabel}</strong> !</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${type === '1h' ? '#FF9800' : '#f44336'};">
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${data.date}</p>
            <p style="margin: 5px 0;"><strong>🕐 Horaire :</strong> ${data.startTime} - ${data.endTime}</p>
            ${recipient === 'admin' ? `<p style="margin: 5px 0;"><strong>👤 Prospect :</strong> ${data.firstName} ${data.lastName} (${data.email})</p>` : ''}
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.meetingLink}" style="background: #00897B; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 18px;">
              🎥 Rejoindre la réunion maintenant
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Cordialement,<br>My Guide Digital
          </p>
        </div>
      </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"My Guide Digital" <${fromEmail}>`,
      to,
      subject: `${urgency} Rappel démo ${timeLabel} - ${data.date} ${data.startTime}`,
      html,
      text: `Rappel : votre démo commence ${timeLabel} !\n\nDate: ${data.date}\nHoraire: ${data.startTime} - ${data.endTime}\nLien: ${data.meetingLink}`,
    });

    console.log(`✅ [EMAIL] Rappel démo ${type} envoyé à ${recipient}:`, to);
    return true;
  } catch (error: any) {
    console.error(`❌ [EMAIL] Erreur rappel démo ${type}:`, error);
    return false;
  }
}

/**
 * Email d'annulation de démo
 */
export async function sendDemoCancellationEmail(data: DemoBookingData, recipient: 'prospect' | 'admin'): Promise<boolean> {
  try {
    const emailTransporter = initEmailTransporter();
    if (!emailTransporter) return false;

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@myguidedigital.com';
    const to = recipient === 'admin' ? ADMIN_EMAIL : data.email;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #78909C, #546E7A); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">❌ Démo annulée</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px;">Bonjour${recipient === 'admin' ? '' : ` ${data.firstName}`},</p>
          <p>${recipient === 'admin' ? `La démo de <strong>${data.firstName} ${data.lastName}</strong> (${data.email}) a été annulée.` : 'Votre démonstration a bien été annulée.'}</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #78909C; text-decoration: line-through; color: #999;">
            <p style="margin: 5px 0;">📅 ${data.date}</p>
            <p style="margin: 5px 0;">🕐 ${data.startTime} - ${data.endTime}</p>
          </div>

          ${recipient !== 'admin' ? `
          <p>Vous pouvez réserver un nouveau créneau quand vous le souhaitez :</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${FRONTEND_URL}/contact" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Réserver une nouvelle démo
            </a>
          </div>
          ` : ''}

          <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Cordialement,<br>My Guide Digital
          </p>
        </div>
      </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"My Guide Digital" <${fromEmail}>`,
      to,
      subject: `❌ Démo annulée - ${data.firstName} ${data.lastName} - ${data.date}`,
      html,
      text: `Démo annulée\n\nProspect: ${data.firstName} ${data.lastName}\nDate: ${data.date}\nHoraire: ${data.startTime} - ${data.endTime}`,
    });

    console.log(`✅ [EMAIL] Annulation démo envoyée à ${recipient}:`, to);
    return true;
  } catch (error: any) {
    console.error(`❌ [EMAIL] Erreur annulation démo:`, error);
    return false;
  }
}

/**
 * Vérifier la configuration email
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
