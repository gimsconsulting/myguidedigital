import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import {
  sendDemoConfirmationEmail,
  sendDemoAdminNotificationEmail,
  sendDemoCancellationEmail,
} from '../services/email';

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiter pour les créneaux disponibles : max 30 requêtes par minute par IP
const slotsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Trop de requêtes. Veuillez patienter quelques instants.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour la création de réservation : max 5 par heure par IP
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: { error: 'Trop de réservations. Veuillez réessayer dans une heure.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les actions de gestion (annulation/report) : max 10 par heure par IP
const manageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══════════════════════════════════════════════
// CONFIGURATION DES CRÉNEAUX
// ═══════════════════════════════════════════════
const DEMO_DURATION = 30; // minutes
const GAP_BETWEEN = 20; // minutes
const SLOT_TOTAL = DEMO_DURATION + GAP_BETWEEN; // 50 min
const START_HOUR = 10; // 10h00
const END_HOUR = 17; // 17h00 (dernière démo doit finir avant 17h)
const MAX_DEMOS_PER_DAY = 6;
const MEETING_LINK = 'https://meet.google.com/fix-yryt-tuh?authuser=0&hl=fr';

// Jours de la semaine en français
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/**
 * Générer tous les créneaux possibles de la journée
 */
function generateAllSlots(): { startTime: string; endTime: string }[] {
  const slots: { startTime: string; endTime: string }[] = [];
  let currentMinutes = START_HOUR * 60; // 600 min (10h00)
  const endMinutes = END_HOUR * 60; // 1020 min (17h00)

  while (currentMinutes + DEMO_DURATION <= endMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const endH = Math.floor((currentMinutes + DEMO_DURATION) / 60);
    const endM = (currentMinutes + DEMO_DURATION) % 60;

    slots.push({
      startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
      endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
    });

    currentMinutes += SLOT_TOTAL;
  }

  return slots;
}

/**
 * Formater une date en français
 */
function formatDateFR(date: Date): string {
  const day = DAYS_FR[date.getDay()];
  const d = date.getDate();
  const month = MONTHS_FR[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${d} ${month} ${year}`;
}

/**
 * Convertir une date string en objet Date à minuit UTC+1 (Brussels)
 */
function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// ═══════════════════════════════════════════════
// ROUTES PUBLIQUES
// ═══════════════════════════════════════════════

/**
 * GET /available-slots?date=YYYY-MM-DD
 * Récupérer les créneaux disponibles pour une date donnée
 */
router.get('/available-slots', slotsLimiter, [
  query('date').notEmpty().withMessage('Le paramètre date est requis').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format de date invalide (attendu YYYY-MM-DD)'),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { date } = req.query;
    }

    const targetDate = parseDateString(date);
    const dayOfWeek = targetDate.getDay();

    // Vérifier que c'est un jour ouvrable (lundi-vendredi)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({ slots: [], message: 'Pas de créneaux le week-end' });
    }

    // Vérifier que la date n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate < today) {
      return res.json({ slots: [], message: 'Impossible de réserver dans le passé' });
    }

    // Récupérer les réservations existantes pour cette date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [existingBookings, blockedSlots] = await Promise.all([
      prisma.demoBooking.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: ['CONFIRMED'] },
        },
        select: { startTime: true },
      }),
      prisma.blockedSlot.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: { startTime: true },
      }),
    ]);

    // Vérifier le max de démos par jour
    if (existingBookings.length >= MAX_DEMOS_PER_DAY) {
      return res.json({ slots: [], message: 'Plus de créneaux disponibles pour cette date' });
    }

    const bookedTimes = new Set(existingBookings.map(b => b.startTime));
    const blockedTimes = new Set(blockedSlots.map(b => b.startTime));

    // Générer les créneaux et filtrer
    const allSlots = generateAllSlots();
    const now = new Date();

    const availableSlots = allSlots
      .filter(slot => !bookedTimes.has(slot.startTime))
      .filter(slot => !blockedTimes.has(slot.startTime))
      .filter(slot => {
        // Si c'est aujourd'hui, filtrer les créneaux passés (avec 1h de marge)
        if (targetDate.toDateString() === now.toDateString()) {
          const [h, m] = slot.startTime.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(h, m, 0, 0);
          return slotTime.getTime() > now.getTime() + 60 * 60 * 1000; // 1h de marge
        }
        return true;
      });

    res.json({
      date,
      slots: availableSlots,
      remainingSlots: MAX_DEMOS_PER_DAY - existingBookings.length,
    });
  } catch (error: any) {
    console.error('❌ Erreur available-slots:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des créneaux' });
  }
});

/**
 * POST /
 * Créer une réservation de démo
 */
router.post('/', bookingLimiter, [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis').isLength({ max: 100 }).withMessage('Le prénom ne doit pas dépasser 100 caractères').escape(),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 100 }).withMessage('Le nom ne doit pas dépasser 100 caractères').escape(),
  body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail().isLength({ max: 255 }),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }).withMessage('Le téléphone ne doit pas dépasser 30 caractères'),
  body('companyName').optional({ values: 'falsy' }).trim().isLength({ max: 200 }).withMessage('Le nom de l\'entreprise ne doit pas dépasser 200 caractères').escape(),
  body('accommodationType').optional({ values: 'falsy' }).trim().isLength({ max: 50 }),
  body('numberOfUnits').optional({ values: 'falsy' }).isInt({ min: 0, max: 99999 }).withMessage('Nombre de logements invalide'),
  body('message').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('Le message ne doit pas dépasser 2000 caractères'),
  body('date').notEmpty().withMessage('La date est requise').isString(),
  body('startTime').notEmpty().withMessage('Le créneau est requis').isString(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      accommodationType,
      numberOfUnits,
      message,
      date,
      startTime,
    } = req.body;

    const targetDate = parseDateString(date);
    const dayOfWeek = targetDate.getDay();

    // Vérifier jour ouvrable
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ message: 'Les démos ne sont pas disponibles le week-end' });
    }

    // Vérifier que le créneau existe
    const allSlots = generateAllSlots();
    const selectedSlot = allSlots.find(s => s.startTime === startTime);
    if (!selectedSlot) {
      return res.status(400).json({ message: 'Créneau invalide' });
    }

    // Vérifier la disponibilité
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [existingBooking, blockedSlot, dayBookingsCount] = await Promise.all([
      prisma.demoBooking.findFirst({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          startTime,
          status: 'CONFIRMED',
        },
      }),
      prisma.blockedSlot.findFirst({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          startTime,
        },
      }),
      prisma.demoBooking.count({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          status: 'CONFIRMED',
        },
      }),
    ]);

    if (existingBooking) {
      return res.status(409).json({ message: 'Ce créneau est déjà réservé' });
    }

    if (blockedSlot) {
      return res.status(409).json({ message: 'Ce créneau n\'est pas disponible' });
    }

    if (dayBookingsCount >= MAX_DEMOS_PER_DAY) {
      return res.status(409).json({ message: 'Le nombre maximum de démos pour cette journée est atteint' });
    }

    // Créer la réservation
    const cancelToken = crypto.randomUUID();

    const booking = await prisma.demoBooking.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        companyName: companyName || null,
        accommodationType: accommodationType || null,
        numberOfUnits: numberOfUnits || null,
        message: message || null,
        date: startOfDay,
        startTime,
        endTime: selectedSlot.endTime,
        cancelToken,
        meetingLink: MEETING_LINK,
        status: 'CONFIRMED',
      },
    });

    const dateFormatted = formatDateFR(targetDate);

    // Envoyer les emails (en parallèle)
    const emailData = {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      accommodationType,
      numberOfUnits,
      message,
      date: dateFormatted,
      startTime,
      endTime: selectedSlot.endTime,
      meetingLink: MEETING_LINK,
      cancelToken,
      id: booking.id,
    };

    await Promise.all([
      sendDemoConfirmationEmail(emailData),
      sendDemoAdminNotificationEmail(emailData),
    ]);

    res.status(201).json({
      message: 'Réservation confirmée ! Vous allez recevoir un email de confirmation.',
      booking: {
        id: booking.id,
        date: dateFormatted,
        startTime: booking.startTime,
        endTime: booking.endTime,
        meetingLink: MEETING_LINK,
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur création démo booking:', error);
    res.status(500).json({ message: 'Erreur lors de la réservation' });
  }
});

/**
 * GET /manage/:token
 * Récupérer les détails d'une réservation via le token (pour annuler/reporter)
 */
router.get('/manage/:token', manageLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.params;

    const booking = await prisma.demoBooking.findUnique({
      where: { cancelToken: token },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    res.json({
      id: booking.id,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      date: formatDateFR(booking.date),
      rawDate: booking.date.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      meetingLink: booking.meetingLink,
    });
  } catch (error: any) {
    console.error('❌ Erreur get manage booking:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la réservation' });
  }
});

/**
 * PUT /manage/:token/cancel
 * Annuler une réservation via le token
 */
router.put('/manage/:token/cancel', manageLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const { token } = req.params;

    const booking = await prisma.demoBooking.findUnique({
      where: { cancelToken: token },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
    }

    await prisma.demoBooking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    const dateFormatted = formatDateFR(booking.date);
    const emailData = {
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      date: dateFormatted,
      startTime: booking.startTime,
      endTime: booking.endTime,
      meetingLink: booking.meetingLink || MEETING_LINK,
      cancelToken: booking.cancelToken,
      id: booking.id,
    };

    // Envoyer les emails d'annulation
    await Promise.all([
      sendDemoCancellationEmail(emailData, 'prospect'),
      sendDemoCancellationEmail(emailData, 'admin'),
    ]);

    res.json({ message: 'Votre réservation a été annulée avec succès' });
  } catch (error: any) {
    console.error('❌ Erreur annulation démo:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation' });
  }
});

/**
 * PUT /manage/:token/reschedule
 * Reporter une réservation via le token
 */
router.put('/manage/:token/reschedule', manageLimiter, [
  param('token').isString().notEmpty().withMessage('Token invalide'),
  body('date').notEmpty().withMessage('La date est requise').isString(),
  body('startTime').notEmpty().withMessage('Le créneau est requis').isString(),
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { token } = req.params;
    const { date, startTime } = req.body;

    const booking = await prisma.demoBooking.findUnique({
      where: { cancelToken: token },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Impossible de reporter une réservation annulée' });
    }

    const targetDate = parseDateString(date);
    const dayOfWeek = targetDate.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ message: 'Les démos ne sont pas disponibles le week-end' });
    }

    const allSlots = generateAllSlots();
    const selectedSlot = allSlots.find(s => s.startTime === startTime);
    if (!selectedSlot) {
      return res.status(400).json({ message: 'Créneau invalide' });
    }

    // Vérifier disponibilité du nouveau créneau
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [existingBooking, blockedSlot] = await Promise.all([
      prisma.demoBooking.findFirst({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          startTime,
          status: 'CONFIRMED',
          id: { not: booking.id },
        },
      }),
      prisma.blockedSlot.findFirst({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          startTime,
        },
      }),
    ]);

    if (existingBooking || blockedSlot) {
      return res.status(409).json({ message: 'Ce créneau n\'est pas disponible' });
    }

    // Mettre à jour la réservation
    const newCancelToken = crypto.randomUUID();
    await prisma.demoBooking.update({
      where: { id: booking.id },
      data: {
        date: startOfDay,
        startTime,
        endTime: selectedSlot.endTime,
        cancelToken: newCancelToken,
        reminder1hSent: false,
        reminder10mSent: false,
      },
    });

    const dateFormatted = formatDateFR(targetDate);
    const emailData = {
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone || undefined,
      companyName: booking.companyName || undefined,
      accommodationType: booking.accommodationType || undefined,
      numberOfUnits: booking.numberOfUnits || undefined,
      date: dateFormatted,
      startTime,
      endTime: selectedSlot.endTime,
      meetingLink: MEETING_LINK,
      cancelToken: newCancelToken,
      id: booking.id,
    };

    // Envoyer les emails de confirmation du report
    await Promise.all([
      sendDemoConfirmationEmail(emailData),
      sendDemoAdminNotificationEmail(emailData),
    ]);

    res.json({
      message: 'Votre réservation a été reportée avec succès',
      booking: {
        date: dateFormatted,
        startTime,
        endTime: selectedSlot.endTime,
      },
    });
  } catch (error: any) {
    console.error('❌ Erreur reschedule démo:', error);
    res.status(500).json({ message: 'Erreur lors du report' });
  }
});

export default router;
