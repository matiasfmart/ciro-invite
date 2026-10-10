import type { InvitationConfig } from '../config/types';

export function formatEventDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-AR', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export function eventInstant(event: InvitationConfig['event']) {
  const clock = event.time ?? '00:00';
  const wallTime = new Date(`${event.date}T${clock}:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: event.timeZone,
    timeZoneName: 'longOffset',
  });
  const offset = formatter.formatToParts(wallTime).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);
  const minutes = match ? (Number(match[2]) * 60 + Number(match[3])) * (match[1] === '+' ? 1 : -1) : 0;
  return new Date(wallTime.getTime() - minutes * 60_000);
}

export function countdownTo(target: Date, now = new Date()) {
  const remaining = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    finished: remaining === 0,
  };
}

export function calendarDaysUntil(event: InvitationConfig['event'], now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: event.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const today = Date.UTC(value('year'), value('month') - 1, value('day'));
  const target = new Date(`${event.date}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((target - today) / 86_400_000));
}

export function mapsUrl(event: InvitationConfig['event']) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue}, ${event.address}, ${event.city}`)}`;
}

export function whatsappUrl(config: InvitationConfig, name: string, guests: number) {
  const phone = config.rsvp.phone?.replace(/\D/g, '');
  if (!phone || phone.length < 8 || phone.length > 15) throw new Error('La confirmación estará disponible pronto.');
  if (!name.trim()) throw new Error('Ingresá tu nombre para confirmar.');
  if (!Number.isInteger(guests) || guests < 1 || guests > config.rsvp.maxGuests) throw new Error('Revisá la cantidad de invitados.');
  const message = `¡Hola! Soy ${name.trim()}. Confirmo nuestra asistencia al cumple de ${config.child.name} el ${formatEventDate(config.event.date, { day: 'numeric', month: 'long' })}. Vamos ${guests} ${guests === 1 ? 'persona' : 'personas'} en total. ${config.theme.adventure.confirmationClosing} ¡Nos vemos!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}