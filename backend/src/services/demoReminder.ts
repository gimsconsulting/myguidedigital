import { sendDemoReminderEmail } from './email';
import prisma from '../lib/prisma';

const MEETING_LINK = 'https://meet.google.com/fix-yryt-tuh?authuser=0&hl=fr';
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function formatDateFR(date: Date): string {
  const day = DAYS_FR[date.getDay()];
  const d = date.getDate();
  const month = MONTHS_FR[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${d} ${month} ${year}`;
}

/**
 * Vérifie les démos à venir et envoie les rappels nécessaires.
 * Appelé toutes les minutes par le cron job.
 */
export async function checkAndSendReminders() {
  try {
    const now = new Date();

    // Récupérer toutes les démos confirmées d'aujourd'hui et demain
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const upcomingBookings = await prisma.demoBooking.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfTomorrow,
        },
        status: 'CONFIRMED',
        OR: [
          { reminder1hSent: false },
          { reminder10mSent: false },
        ],
      },
    });

    for (const booking of upcomingBookings) {
      // Construire la date/heure de la démo
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      const demoDateTime = new Date(booking.date);
      demoDateTime.setHours(hours, minutes, 0, 0);

      const diffMs = demoDateTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      const emailData = {
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        date: formatDateFR(booking.date),
        startTime: booking.startTime,
        endTime: booking.endTime,
        meetingLink: booking.meetingLink || MEETING_LINK,
        cancelToken: booking.cancelToken,
        id: booking.id,
      };

      // Rappel 1 heure avant (entre 55 et 65 minutes avant)
      if (!booking.reminder1hSent && diffMinutes <= 65 && diffMinutes > 50) {
        console.log(`⏰ [REMINDER] Envoi rappel 1h pour démo ${booking.id} - ${booking.firstName} ${booking.lastName}`);
        
        await Promise.all([
          sendDemoReminderEmail(emailData, '1h', 'prospect'),
          sendDemoReminderEmail(emailData, '1h', 'admin'),
        ]);

        await prisma.demoBooking.update({
          where: { id: booking.id },
          data: { reminder1hSent: true },
        });
      }

      // Rappel 10 minutes avant (entre 7 et 15 minutes avant)
      if (!booking.reminder10mSent && diffMinutes <= 15 && diffMinutes > 5) {
        console.log(`🔴 [REMINDER] Envoi rappel 10min pour démo ${booking.id} - ${booking.firstName} ${booking.lastName}`);

        await Promise.all([
          sendDemoReminderEmail(emailData, '10min', 'prospect'),
          sendDemoReminderEmail(emailData, '10min', 'admin'),
        ]);

        await prisma.demoBooking.update({
          where: { id: booking.id },
          data: { reminder10mSent: true },
        });
      }
    }
  } catch (error) {
    console.error('❌ [REMINDER] Erreur lors de la vérification des rappels:', error);
  }
}

/**
 * Marquer les démos passées comme COMPLETED ou NO_SHOW
 * Appelé toutes les heures
 */
export async function cleanupPastDemos() {
  try {
    const now = new Date();
    
    // Récupérer les démos confirmées dont l'heure est passée depuis plus de 30 min
    const pastBookings = await prisma.demoBooking.findMany({
      where: {
        status: 'CONFIRMED',
        date: {
          lte: now,
        },
      },
    });

    for (const booking of pastBookings) {
      const [hours, minutes] = booking.endTime.split(':').map(Number);
      const endDateTime = new Date(booking.date);
      endDateTime.setHours(hours, minutes, 0, 0);

      // Si la démo est terminée depuis plus de 30 min, la marquer comme COMPLETED
      if (now.getTime() > endDateTime.getTime() + 30 * 60 * 1000) {
        await prisma.demoBooking.update({
          where: { id: booking.id },
          data: { status: 'COMPLETED' },
        });
        console.log(`✅ [CLEANUP] Démo ${booking.id} marquée comme COMPLETED`);
      }
    }
  } catch (error) {
    console.error('❌ [CLEANUP] Erreur lors du nettoyage des démos passées:', error);
  }
}
