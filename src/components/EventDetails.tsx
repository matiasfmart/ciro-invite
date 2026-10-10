import { ArrowUpRight, CalendarDays, Clock3, MapPin } from 'lucide-react';
import type { InvitationConfig } from '../config/types';
import { formatEventDate, mapsUrl } from '../lib/event';
import { DetailsTrail } from './DetailsTrail';

export function EventDetails({ config }: { config: InvitationConfig }) {
  const { event } = config;
  const time = event.time ? `${event.time}${event.endTime ? ` a ${event.endTime}` : ''} hs` : 'A confirmar';

  return (
    <section id="details" className="details section" aria-labelledby="details-title">
      <DetailsTrail />
      <p className="section-label">El cumple de {config.child.name}</p>
      <h2 id="details-title">Cuándo y dónde</h2>
      <dl className="event-list">
        <div className="event-row"><dt><span className="detail-icon" aria-hidden="true"><CalendarDays size={22} /></span>Fecha</dt><dd className="capitalize">{formatEventDate(event.date, { weekday: 'long', day: 'numeric', month: 'long' })}<span className="detail-secondary">{formatEventDate(event.date, { year: 'numeric' })}</span></dd></div>
        <div className="event-row"><dt><span className="detail-icon" aria-hidden="true"><Clock3 size={22} /></span>Hora</dt><dd>{time}</dd></div>
        <div className="event-row"><dt><span className="detail-icon" aria-hidden="true"><MapPin size={22} /></span>Lugar</dt><dd>{event.venue}<span className="detail-secondary">{event.address}<br />{event.city}</span></dd></div>
      </dl>
      <a className="button button-outline" href={mapsUrl(event)} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" /> Ver ubicación <ArrowUpRight size={17} aria-hidden="true" /></a>
      {event.notes && <p className="event-note">{event.notes}</p>}
    </section>
  );
}