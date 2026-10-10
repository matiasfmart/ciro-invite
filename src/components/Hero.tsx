import { ArrowDown, CalendarDays, MapPin, Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { InvitationConfig } from '../config/types';
import { SlingshotGame } from './OfficialSlingshot';
import { useAdventure } from './AdventureProvider';
import { formatEventDate } from '../lib/event';

export function Hero({ config }: { config: InvitationConfig }) {
  const { soundEnabled, toggleSound, celebrate } = useAdventure();

  return (
    <header className="hero hero--cover">
      <picture className="hero-scenery" aria-hidden="true"><source media="(min-aspect-ratio: 1/1)" srcSet={`${import.meta.env.BASE_URL}assets/characters/fondo-juego.jpg`} /><img src={`${import.meta.env.BASE_URL}assets/characters/fondo-hero.jpg`} alt="" fetchPriority="high" /></picture>
      <div className="bunting" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
      <button className="sound-toggle icon-button" onClick={toggleSound} aria-label={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'} aria-pressed={soundEnabled} title={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}>{soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
      <div className="hero-top">
        <p className="eyebrow"><Sparkles size={14} aria-hidden="true" /> {config.theme.name}</p>
        <p className="hero-intro">{config.theme.headline}</p>
        <h1>{config.child.name}</h1>
        <button className="birthday-badge" onClick={() => celebrate()} aria-label={`Celebrar los ${config.child.age} años de ${config.child.name}`} title="¡A celebrar!">
          <span>Cumplo</span><strong>{config.child.age}</strong><span>añitos</span>
        </button>
        <div className="hero-meta"><span><CalendarDays size={16} aria-hidden="true" />{formatEventDate(config.event.date, { day: 'numeric', month: 'long' })}</span><span><MapPin size={16} aria-hidden="true" />{config.event.venue}</span></div>
        <p className="hero-description">{config.theme.description}</p>
      </div>
      <SlingshotGame childName={config.child.name} embedded />
      <a className="explore-link hero-scroll" href={config.sections.countdown ? '#countdown' : config.sections.details ? '#details' : config.sections.rsvp ? '#rsvp' : '#closing'} aria-label="Ver los datos del cumpleaños"><ArrowDown size={20} aria-hidden="true" /></a>
    </header>
  );
}