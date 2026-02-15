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

/**
 * Vérifier la configuration email
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}
