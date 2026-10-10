import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { InvitationConfig } from '../config/types';
import { calendarDaysUntil, countdownTo, eventInstant, formatEventDate } from '../lib/event';
import { Meadow } from './Meadow';
import { AnimatedDays } from './AnimatedDays';

export function Countdown({ config }: { config: InvitationConfig }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [config.event.time]);

  const remaining = countdownTo(eventInstant(config.event), now);
  const units = config.event.time
    ? [{ value: remaining.days, label: 'días' }, { value: remaining.hours, label: 'horas' }, { value: remaining.minutes, label: 'minutos' }]
    : [{ value: calendarDaysUntil(config.event, now), label: 'días' }];
  const finished = config.event.time ? remaining.finished : units[0].value === 0;

  return (
    <section id="countdown" className="countdown section" aria-labelledby="countdown-title">
      <div className={`countdown-heading ${config.event.time ? 'with-clock' : ''}`}><div><p className="section-label">La fecha se acerca</p><h2 id="countdown-title">{finished ? '¡Llegó el gran día!' : 'Ya faltan…'}</h2></div>
      {!finished && <div className={`countdown-units ${units.length === 1 ? 'single-unit' : ''}`}>
        {units.map((unit) => <div className="countdown-unit" key={unit.label}>{unit.label === 'días' ? <AnimatedDays value={unit.value} /> : <span>{String(unit.value).padStart(2, '0')}</span>}<span>{unit.label}</span></div>)}
      </div>}</div>
      {!finished && <div className="live-countdown" aria-label={`${remaining.hours} horas, ${remaining.minutes} minutos y ${remaining.seconds} segundos ${config.event.time ? 'hasta el cumpleaños' : 'hasta la fecha'}`}>
        <span className="live-countdown-label">{config.event.time ? 'Para el encuentro' : 'Hasta la fecha · horario a confirmar'}</span>
        <span className="live-countdown-clock" aria-hidden="true">{[remaining.hours, remaining.minutes, remaining.seconds].map((value, unit) => <span className="clock-unit" key={unit}>{unit > 0 && <span className="clock-colon">:</span>}{String(value).padStart(2, '0').split('').map((digit, position) => <span className="clock-slot" key={position}><span key={digit} className="clock-digit">{digit}</span></span>)}</span>)}</span>
      </div>}
      <div className="date-stamp"><CalendarDays size={15} aria-hidden="true" />{formatEventDate(config.event.date, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <Meadow />
      <p className="meadow-message">Valentía, amistad y mucho amor.</p>
    </section>
  );
}