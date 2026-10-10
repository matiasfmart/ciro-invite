import type { InvitationConfig } from './types';
import { davidTheme } from '../themes/david';

export const invitation: InvitationConfig = {
  child: { name: 'Ciro', age: 2 },
  event: {
    date: '2026-10-29',
    time: '20:00',
    endTime: '22:30',
    timeZone: 'America/Argentina/Buenos_Aires',
    venue: 'Mundo Risas',
    address: 'Pueyrredón 2136',
    city: 'Villa Ballester, Provincia de Buenos Aires',
    notes: 'Traé tus ganas de jugar. ¡De la diversión nos encargamos nosotros!',
  },
  rsvp: { phone: '+54 9 11 2458-6026', maxGuests: 12 },
  theme: davidTheme,
  sections: { countdown: true, details: true, rsvp: true },
};