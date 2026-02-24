'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { demoBookingsApi } from '@/lib/api';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DemoBookingCalendarProps {
  onClose?: () => void;
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const FULL_DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function DemoBookingCalendar({ onClose }: DemoBookingCalendarProps) {
  const [step, setStep] = useState<'date' | 'time' | 'form' | 'success'>('date');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    accommodationType: '',
    numberOfUnits: '',
    message: '',
  });

  // Charger les créneaux quand une date est sélectionnée
  const loadSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setError('');
    try {
      const response = await demoBookingsApi.getAvailableSlots(date);
      setAvailableSlots(response.data.slots || []);
      if (response.data.slots?.length === 0) {
        setError(response.data.message || 'Aucun créneau disponible');
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des créneaux');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Générer les jours du mois
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0

    const days: (Date | null)[] = [];

    // Jours vides avant le premier jour du mois
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();
    // Pas de week-end et pas dans le passé
    return dayOfWeek !== 0 && dayOfWeek !== 6 && date >= today;
  };

  const formatDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateSelectable(date)) return;
    const dateStr = formatDateStr(date);
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    loadSlots(dateStr);
    setStep('time');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await demoBookingsApi.createBooking({
        ...formData,
        date: selectedDate,
        startTime: selectedSlot.startTime,
      });
      setSuccessData(response.data);
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const selectedDateFormatted = selectedDateObj
    ? `${FULL_DAYS_FR[selectedDateObj.getDay()]} ${selectedDateObj.getDate()} ${MONTHS_FR[selectedDateObj.getMonth()]} ${selectedDateObj.getFullYear()}`
    : '';

  return (
    <div className="bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-pink-500 to-purple-500 p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🎥 Réserver une démo gratuite
        </h3>
        <p className="text-white/80 text-sm mt-1">30 minutes • Visioconférence Google Meet</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 p-4 border-b border-white/[0.06]">
        {['date', 'time', 'form'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === s ? 'bg-primary text-white' :
              ['date', 'time', 'form'].indexOf(step) > i ? 'bg-green-500 text-white' :
              'bg-white/10 text-white/40'
            }`}>
              {['date', 'time', 'form'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 ${['date', 'time', 'form'].indexOf(step) > i ? 'bg-green-500' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="p-6">
        {error && step !== 'success' && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ÉTAPE 1 : Sélection de la date */}
        {step === 'date' && (
          <div>
            <p className="text-white/70 text-sm mb-4">Choisissez une date (lundi - vendredi) :</p>
            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
              >
                ◀
              </button>
              <span className="text-white font-semibold">
                {MONTHS_FR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
              >
                ▶
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center text-white/40 text-xs font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Jours du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="h-10" />;

                const selectable = isDateSelectable(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate === formatDateStr(day);

                return (
                  <button
                    key={day.getTime()}
                    onClick={() => selectable && handleDateSelect(day)}
                    disabled={!selectable}
                    className={`h-10 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary text-white ring-2 ring-primary/50'
                        : selectable
                        ? 'text-white hover:bg-white/10 cursor-pointer'
                        : 'text-white/20 cursor-not-allowed'
                    } ${isToday && !isSelected ? 'ring-1 ring-white/30' : ''}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Sélection du créneau */}
        {step === 'time' && (
          <div>
            <button
              onClick={() => setStep('date')}
              className="text-primary text-sm mb-4 flex items-center gap-1 hover:underline"
            >
              ← Changer la date
            </button>
            <p className="text-white font-medium mb-1">{selectedDateFormatted}</p>
            <p className="text-white/60 text-sm mb-4">Sélectionnez un créneau horaire :</p>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map(slot => (
                  <button
                    key={slot.startTime}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedSlot?.startTime === slot.startTime
                        ? 'border-primary bg-primary/20 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/80 hover:border-primary/50 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-lg font-semibold">{slot.startTime}</span>
                    <span className="text-white/40 text-sm ml-1">- {slot.endTime}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/40">Aucun créneau disponible pour cette date</p>
                <button
                  onClick={() => setStep('date')}
                  className="mt-3 text-primary text-sm hover:underline"
                >
                  Choisir une autre date
                </button>
              </div>
            )}
          </div>
        )}

        {/* ÉTAPE 3 : Formulaire */}
        {step === 'form' && (
          <div>
            <button
              onClick={() => setStep('time')}
              className="text-primary text-sm mb-4 flex items-center gap-1 hover:underline"
            >
              ← Changer le créneau
            </button>
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
              <p className="text-white font-medium">{selectedDateFormatted}</p>
              <p className="text-white/70">{selectedSlot?.startTime} - {selectedSlot?.endTime} (heure de Bruxelles)</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    placeholder="Votre prénom"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    placeholder="Votre nom"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  placeholder="+32 xxx xx xx xx"
                  autoComplete="tel"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Nom de l'entreprise / hébergement</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  placeholder="Nom de votre hébergement"
                  autoComplete="organization"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Type d'hébergement</label>
                  <select
                    name="accommodationType"
                    value={formData.accommodationType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                  >
                    <option value="" className="bg-slate-900">Sélectionnez...</option>
                    <option value="hote" className="bg-slate-900">🏠 Hôte / Location</option>
                    <option value="hotel" className="bg-slate-900">🏨 Hôtel</option>
                    <option value="camping" className="bg-slate-900">⛺ Camping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Nombre de logements/chambres</label>
                  <input
                    type="text"
                    name="numberOfUnits"
                    value={formData.numberOfUnits}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                    placeholder="ex: 5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Message (optionnel)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base resize-none"
                  placeholder="Y a-t-il quelque chose que vous aimeriez aborder lors de la démo ?"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary via-pink-500 to-purple-500 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                    Réservation en cours...
                  </span>
                ) : (
                  '✅ Confirmer ma réservation'
                )}
              </button>
            </form>
          </div>
        )}

        {/* ÉTAPE 4 : Succès */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Réservation confirmée !</h4>
            <p className="text-white/70 mb-6">
              Un email de confirmation avec le lien de la réunion Google Meet vous a été envoyé à <strong className="text-white">{formData.email}</strong>.
            </p>

            {successData?.booking && (
              <div className="bg-white/[0.05] rounded-xl p-4 mb-6 border border-white/10">
                <p className="text-white font-medium">{successData.booking.date}</p>
                <p className="text-white/70">{successData.booking.startTime} - {successData.booking.endTime}</p>
                <a
                  href={successData.booking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-4 py-2 rounded-lg bg-[#00897B] text-white text-sm font-medium hover:opacity-90 transition"
                >
                  🎥 Lien Google Meet
                </a>
              </div>
            )}

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-200">
              <p>⏰ Vous recevrez des rappels automatiques <strong>1 heure</strong> et <strong>10 minutes</strong> avant la démo.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
