import { useEffect, useState } from 'react';
import { ArrowDown, CalendarDays, MapPin, Music2 } from 'lucide-react';
import type { InvitationConfig } from '../config/types';
import { SlingshotGame } from './OfficialSlingshot';
import { useAdventure } from './AdventureProvider';
import { formatEventDate } from '../lib/event';

export function Hero({ config }: { config: InvitationConfig }) {
  const { musicPlaying } = useAdventure();
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntering(false);
      return;
    }
    const timer = window.setTimeout(() => setEntering(false), 2100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <header className="hero hero--cover">
      <picture className="hero-scenery" aria-hidden="true"><source media="(min-aspect-ratio: 1/1)" srcSet={`${import.meta.env.BASE_URL}assets/characters/fondo-juego.jpg`} /><img src={`${import.meta.env.BASE_URL}assets/characters/fondo-hero.jpg`} alt="" fetchPriority="high" /></picture>
      <div className="bunting" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
      <div className={`music-indicator ${musicPlaying ? 'is-playing' : ''}`} role="status" aria-label={musicPlaying ? 'Música sonando' : 'Música de fondo'} title={musicPlaying ? 'Música sonando' : 'Música de fondo'}>
        <Music2 size={17} aria-hidden="true" />
        <span className="music-indicator-bars" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className={`hero-top ${entering ? 'is-entering' : ''}`}>
        <p className="hero-intro">{config.theme.headline}</p>
        <h1 className="hero-title" aria-label={config.child.name}>
          {[...config.child.name.toUpperCase()].map((letter, index) => <span className={`title-letter title-letter-${index + 1}`} aria-hidden="true" key={`${letter}-${index}`}>{letter}</span>)}
        </h1>
        <div className="hero-crest" role="img" aria-label={`Escudo de guerrero: El pequeño guerrero cumple ${config.child.age}`}>
          <span className="warrior-shield" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <defs>
                <linearGradient id="shield-steel" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5e4b0" /><stop offset=".4" stopColor="#a8a28e" /><stop offset=".7" stopColor="#e7d6a4" /><stop offset="1" stopColor="#827865" /></linearGradient>
                <radialGradient id="shield-wood" cx=".35" cy=".28" r=".82"><stop stopColor="#a97142" /><stop offset="1" stopColor="#633c27" /></radialGradient>
              </defs>
              <circle cx="50" cy="50" r="47" fill="url(#shield-steel)" stroke="#614b36" strokeWidth="2" />
              <circle cx="50" cy="50" r="40" fill="url(#shield-wood)" stroke="#4a3023" strokeWidth="2.5" />
              <path d="M50 13 C42 28 58 39 50 50 C42 62 58 74 50 87 M19 50 C34 43 42 57 50 50 C60 40 70 59 82 50" fill="none" stroke="#d6a66b" strokeOpacity=".35" strokeWidth="3" />
              <circle cx="50" cy="11" r="3.4" fill="#f1deb1" stroke="#685844" />
              <circle cx="89" cy="50" r="3.4" fill="#f1deb1" stroke="#685844" />
              <circle cx="50" cy="89" r="3.4" fill="#f1deb1" stroke="#685844" />
              <circle cx="11" cy="50" r="3.4" fill="#f1deb1" stroke="#685844" />
            </svg>
            <strong>{config.child.age}</strong>
          </span>
          <span className="crest-ribbon" aria-hidden="true">El pequeño guerrero<br />cumple</span>
        </div>
        <div className="hero-meta" aria-label="Fecha y lugar">
          <span><CalendarDays size={14} aria-hidden="true" />{formatEventDate(config.event.date, { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '').replace(/^./, (letter) => letter.toUpperCase())}</span>
          <i aria-hidden="true">·</i>
          <span><MapPin size={14} aria-hidden="true" />{config.event.venue}</span>
        </div>
      </div>
      <SlingshotGame childName={config.child.name} embedded />
      <a className="explore-link hero-scroll" href={config.sections.countdown ? '#countdown' : config.sections.details ? '#details' : config.sections.rsvp ? '#rsvp' : '#closing'} aria-label="Ver los datos del cumpleaños"><ArrowDown size={20} aria-hidden="true" /></a>
    </header>
  );
}