import { useEffect, useState, type CSSProperties } from 'react';
import { MessageCircle } from 'lucide-react';
import { invitation } from './config/invitation';
import { Hero } from './components/Hero';
import { Countdown } from './components/Countdown';
import { EventDetails } from './components/EventDetails';
import { Rsvp } from './components/Rsvp';
import { formatEventDate } from './lib/event';
import { AdventureProvider } from './components/AdventureProvider';
import { Closing } from './components/Closing';

export function App() {
  const [rsvpVisible, setRsvpVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const { colors } = invitation.theme;
  const theme = {
    '--primary': colors.primary,
    '--accent': colors.accent,
    '--ink': colors.ink,
    '--background': colors.background,
    '--sky': colors.sky,
    '--terrain': colors.terrain,
    '--water': colors.water,
    '--banner': colors.banner,
    '--surface': colors.surface ?? '#ffffff',
    '--muted': colors.muted ?? '#4f6257',
    '--border': colors.border ?? '#cfddce',
  } as CSSProperties;

  useEffect(() => {
    document.title = `El cumple de ${invitation.child.name}`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.primary);
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${invitation.theme.eyebrow}. Estás invitado a celebrar el cumpleaños de ${invitation.child.name}.`);
  }, [colors.primary]);

  useEffect(() => {
    const section = document.getElementById('rsvp');
    if (!section) return;
    const hero = document.querySelector('.hero');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.target === section) setRsvpVisible(entry.isIntersecting);
      if (entry.target === hero) setHeroVisible(entry.isIntersecting);
    }), { threshold: 0.15 });
    observer.observe(section);
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('story-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.section, .closing').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <AdventureProvider colors={[colors.primary, colors.accent, '#ef7764', '#77cddd']}>
    <main className={`invitation ${invitation.sections.rsvp ? 'has-rsvp' : ''}`} style={theme}>
      <Hero config={invitation} />
      {invitation.sections.countdown && <Countdown config={invitation} />}
      {invitation.sections.details && <EventDetails config={invitation} />}
      {invitation.sections.rsvp && <Rsvp config={invitation} />}
      <Closing config={invitation} />
      {invitation.sections.rsvp && <nav className={`mobile-rsvp ${rsvpVisible || heroVisible ? 'is-hidden' : ''}`} aria-label="Confirmación rápida" inert={rsvpVisible || heroVisible}>
        <div><strong>{invitation.child.name}</strong><span>{formatEventDate(invitation.event.date, { day: 'numeric', month: 'short' })}</span></div>
        <a className="button button-primary" href="#rsvp"><MessageCircle size={18} aria-hidden="true" /> Confirmar asistencia</a>
      </nav>}
    </main>
    </AdventureProvider>
  );
}