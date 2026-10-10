import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, Minus, Plus } from 'lucide-react';
import type { InvitationConfig } from '../config/types';
import { whatsappUrl } from '../lib/event';
import { useAdventure } from './AdventureProvider';
import { GuestFlock } from './GuestFlock';

export function Rsvp({ config }: { config: InvitationConfig }) {
  const [name, setName] = useState('');
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (sendTimer.current) clearTimeout(sendTimer.current); }, []);
  const { chime } = useAdventure();
  const digits = config.rsvp.phone?.replace(/\D/g, '') ?? '';
  const available = digits.length >= 8 && digits.length <= 15;

  function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setError('');
    try {
      const url = whatsappUrl(config, name, guests);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) window.location.assign(url);
      else {
        setSending(true);
        sendTimer.current = setTimeout(() => { setSending(false); window.location.assign(url); }, 260);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos preparar la confirmación.');
    }
  }

  return (
    <section id="rsvp" className="rsvp section" aria-labelledby="rsvp-title">
      <div className="rsvp-heading"><div><p className="section-label">Tu respuesta</p><h2 id="rsvp-title">¿Venís al cumple?</h2><p className="section-copy">Me encantaría celebrar con vos.</p></div></div>
      <form className="rsvp-form" onSubmit={confirm}>
        <label htmlFor="guest-name">Tu nombre</label>
        <input id="guest-name" name="name" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} autoComplete="name" placeholder="Nombre y apellido" maxLength={100} required disabled={!available} aria-describedby={error ? 'rsvp-error' : undefined} />
        <p className="name-feedback">{name.trim() ? `¡Qué alegría, ${name.trim().split(/\s+/)[0]}!` : ''}</p>
        <div className="guest-control"><div><label id="guest-count-label" htmlFor="guest-count">¿Cuántos vienen?</label><p>Incluyéndote a vos</p></div><div className="stepper" role="group" aria-labelledby="guest-count-label"><button type="button" onClick={() => { setGuests((count) => Math.max(1, count - 1)); chime('stone'); }} disabled={!available || guests === 1} aria-label="Quitar una persona" title="Quitar una persona"><Minus size={18} aria-hidden="true" /></button><output id="guest-count" aria-live="polite">{guests}</output><button type="button" onClick={() => { setGuests((count) => Math.min(config.rsvp.maxGuests, count + 1)); chime('stone'); }} disabled={!available || guests === config.rsvp.maxGuests} aria-label="Agregar una persona" title="Agregar una persona"><Plus size={18} aria-hidden="true" /></button></div></div>
        <GuestFlock guests={guests} jumping={sending} />
        {error && <p id="rsvp-error" className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="submit" disabled={!available || sending}><MessageCircle size={20} aria-hidden="true" /> Confirmar por WhatsApp</button>
        <p className="form-note">{available ? 'Tu respuesta se comparte por WhatsApp.' : 'La confirmación estará disponible pronto.'}</p>
      </form>
    </section>
  );
}