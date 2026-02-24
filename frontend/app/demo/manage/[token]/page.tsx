'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { demoBookingsApi } from '@/lib/api';
import DemoBookingCalendar from '@/components/DemoBookingCalendar';

interface BookingDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  date: string;
  rawDate: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingLink: string;
}

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const FULL_DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function ManageDemoPage() {
  const params = useParams();
  const token = params?.token as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState<string | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ startTime: string; endTime: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (token) {
      loadBooking();
    }
  }, [token]);

  const loadBooking = async () => {
    try {
      const response = await demoBookingsApi.getBookingByToken(token);
      setBooking(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Réservation non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette démo ?')) return;
    setCancelling(true);
    try {
      await demoBookingsApi.cancelBooking(token);
      setCancelled(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  const loadRescheduleSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const response = await demoBookingsApi.getAvailableSlots(date);
      setAvailableSlots(response.data.slots || []);
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleSlot) return;
    setRescheduling(true);
    try {
      await demoBookingsApi.rescheduleBooking(token, {
        date: rescheduleDate,
        startTime: rescheduleSlot,
      });
      setRescheduled(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du report');
    } finally {
      setRescheduling(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6 && date >= today;
  };

  const formatDateStr = (date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Réservation non trouvée</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Link href="/contact">
            <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
              Retour à la page contact
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0c0a1d] to-slate-950 py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-pink-400 to-purple-400 bg-clip-text text-transparent">
              MY GUIDE DIGITAL
            </span>
          </Link>
        </div>

        {/* Annulation confirmée */}
        {cancelled && (
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Démo annulée</h2>
            <p className="text-white/60 mb-6">Votre réservation a été annulée avec succès. Un email de confirmation vous a été envoyé.</p>
            <Link href="/contact#demo">
              <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
                Réserver un autre créneau
              </button>
            </Link>
          </div>
        )}

        {/* Report confirmé */}
        {rescheduled && (
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Démo reportée !</h2>
            <p className="text-white/60 mb-6">Votre réservation a été mise à jour. Un nouvel email de confirmation vous a été envoyé avec les détails.</p>
            <Link href="/">
              <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition">
                Retour à l'accueil
              </button>
            </Link>
          </div>
        )}

        {/* Détails de la réservation */}
        {!cancelled && !rescheduled && booking && (
          <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="bg-gradient-to-r from-primary via-pink-500 to-purple-500 p-6">
              <h2 className="text-xl font-bold text-white">Gérer votre réservation</h2>
              <p className="text-white/80 text-sm mt-1">{booking.firstName} {booking.lastName}</p>
            </div>

            <div className="p-6">
              {booking.status === 'CANCELLED' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❌</span>
                  </div>
                  <p className="text-white/60">Cette réservation a déjà été annulée.</p>
                  <Link href="/contact#demo" className="text-primary hover:underline mt-4 inline-block">
                    Réserver un nouveau créneau
                  </Link>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Détails */}
                  <div className="bg-white/[0.03] rounded-xl p-4 mb-6 border border-white/[0.06]">
                    <p className="text-white font-semibold text-lg">{booking.date}</p>
                    <p className="text-white/70">{booking.startTime} - {booking.endTime} (heure de Bruxelles)</p>
                    <p className="text-white/40 text-sm mt-1">⏱️ 30 minutes • 🎥 Google Meet</p>
                  </div>

                  {booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 rounded-xl text-center font-semibold bg-[#00897B] text-white hover:opacity-90 transition mb-4"
                    >
                      🎥 Rejoindre la réunion Google Meet
                    </a>
                  )}

                  {/* Actions */}
                  {!showReschedule && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowReschedule(true)}
                        className="py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
                      >
                        📅 Reporter
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {cancelling ? '...' : '❌ Annuler'}
                      </button>
                    </div>
                  )}

                  {/* Report : choix nouvelle date */}
                  {showReschedule && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Choisir une nouvelle date</h3>
                        <button
                          onClick={() => { setShowReschedule(false); setRescheduleDate(null); setRescheduleSlot(null); }}
                          className="text-white/40 hover:text-white text-sm"
                        >
                          Annuler
                        </button>
                      </div>

                      {/* Mini calendrier */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">◀</button>
                          <span className="text-white text-sm font-medium">{MONTHS_FR[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white">▶</button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <div key={i} className="text-center text-white/30 text-xs py-1">{d}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDays().map((day, i) => {
                            if (!day) return <div key={`e-${i}`} className="h-8" />;
                            const sel = isDateSelectable(day);
                            const dateStr = formatDateStr(day);
                            const isSel = rescheduleDate === dateStr;
                            return (
                              <button
                                key={day.getTime()}
                                onClick={() => {
                                  if (!sel) return;
                                  setRescheduleDate(dateStr);
                                  setRescheduleSlot(null);
                                  loadRescheduleSlots(dateStr);
                                }}
                                disabled={!sel}
                                className={`h-8 rounded text-xs font-medium transition ${
                                  isSel ? 'bg-primary text-white' :
                                  sel ? 'text-white hover:bg-white/10' : 'text-white/15'
                                }`}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Créneaux pour la date sélectionnée */}
                      {rescheduleDate && (
                        <div className="mb-4">
                          <p className="text-white/60 text-sm mb-2">Créneaux disponibles :</p>
                          {loadingSlots ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            </div>
                          ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {availableSlots.map(slot => (
                                <button
                                  key={slot.startTime}
                                  onClick={() => setRescheduleSlot(slot.startTime)}
                                  className={`py-2 rounded-lg text-sm font-medium transition ${
                                    rescheduleSlot === slot.startTime
                                      ? 'bg-primary text-white'
                                      : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/10'
                                  }`}
                                >
                                  {slot.startTime}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm text-center py-2">Aucun créneau disponible</p>
                          )}
                        </div>
                      )}

                      {/* Bouton confirmer le report */}
                      {rescheduleDate && rescheduleSlot && (
                        <button
                          onClick={handleReschedule}
                          disabled={rescheduling}
                          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary via-pink-500 to-purple-500 hover:shadow-lg transition disabled:opacity-50"
                        >
                          {rescheduling ? 'Report en cours...' : '✅ Confirmer le report'}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
