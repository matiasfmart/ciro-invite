import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calendarDaysUntil, countdownTo, eventInstant, formatEventDate, mapsUrl, whatsappUrl } from './event';
import { invitation } from '../config/invitation';

const calendarEvent = { ...invitation.event, date: '2026-10-24', time: null, endTime: null };

describe('invitation configuration', () => {
  it('formats the configured calendar date without shifting days', () => {
    assert.equal(formatEventDate('2026-10-24', { day: 'numeric', month: 'long' }), '24 de octubre');
  });
  it('resolves the configured event timezone', () => {
    assert.equal(eventInstant({ ...calendarEvent, time: '16:00' }).toISOString(), '2026-10-24T19:00:00.000Z');
  });
  it('resolves Thursday October 29 at 20:00 in Buenos Aires', () => {
    assert.equal(eventInstant({ ...invitation.event, date: '2026-10-29', time: '20:00' }).toISOString(), '2026-10-29T23:00:00.000Z');
    assert.equal(formatEventDate('2026-10-29', { weekday: 'long' }), 'jueves');
  });
  it('never shows a negative countdown', () => {
    assert.deepEqual(countdownTo(new Date('2020-01-01'), new Date('2026-01-01')), { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
  });
  it('counts calendar days instead of assuming an unconfirmed hour', () => {
    assert.equal(calendarDaysUntil(calendarEvent, new Date('2026-10-10T20:00:00Z')), 14);
  });
  it('uses the event timezone when counting calendar days', () => {
    assert.equal(calendarDaysUntil(calendarEvent, new Date('2026-10-10T02:00:00Z')), 15);
    assert.equal(calendarDaysUntil(calendarEvent, new Date('2026-10-25T12:00:00Z')), 0);
  });
  it('uses the configured location', () => {
    assert.ok(decodeURIComponent(mapsUrl(invitation.event)).includes('Mundo Risas, Pueyrredón 2136'));
  });
  it('uses interchangeable event and recipient data in WhatsApp', () => {
    const config = { ...invitation, child: { name: 'Luna', age: 5 }, rsvp: { phone: '+54 9 11 1234 5678', maxGuests: 12 } };
    const url = whatsappUrl(config, ' Ana ', 3);
    assert.ok(url.startsWith('https://wa.me/5491112345678?text='));
    assert.ok(decodeURIComponent(url).includes('Soy Ana. Confirmo nuestra asistencia al cumple de Luna'));
    assert.ok(decodeURIComponent(url).includes('Vamos 3 personas'));
  });
  it('includes the interchangeable theme closing in the confirmation', () => {
    const config = { ...invitation, theme: { ...invitation.theme, adventure: { ...invitation.theme.adventure, confirmationClosing: '¡A celebrar juntos!' } } };
    assert.ok(decodeURIComponent(whatsappUrl(config, 'Ana', 1)).includes('¡A celebrar juntos!'));
  });
  it('does not send guests to a fictitious number', () => {
    assert.throws(() => whatsappUrl({ ...invitation, rsvp: { ...invitation.rsvp, phone: null } }, 'Ana', 2), /disponible pronto/);
  });
  it('validates attendance input', () => {
    const config = { ...invitation, rsvp: { phone: '5491112345678', maxGuests: 12 } };
    assert.throws(() => whatsappUrl(config, ' ', 1), /nombre/);
    assert.throws(() => whatsappUrl(config, 'Ana', 0), /cantidad/);
  });
});