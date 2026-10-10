import { useEffect, useRef, useState } from 'react';
import { PartySheep } from './PartySheep';

export function GuestFlock({ guests, jumping }: { guests: number; jumping: boolean }) {
  const [visible, setVisible] = useState(Math.min(guests, 8));
  const [leaving, setLeaving] = useState<number | null>(null);
  const shown = useRef(visible);
  useEffect(() => {
    const next = Math.min(guests, 8);
    if (next < shown.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLeaving(next);
      const timer = setTimeout(() => { shown.current = next; setVisible(next); setLeaving(null); }, 220);
      return () => clearTimeout(timer);
    }
    shown.current = next;
    setVisible(next);
    setLeaving(null);
  }, [guests]);
  return <div className={`guest-flock ${jumping ? 'flock-celebrating' : ''}`} aria-hidden="true">{Array.from({ length: visible }, (_, index) => <span key={index} className={`guest-sheep ${leaving !== null && index >= leaving ? 'is-leaving' : ''}`}><PartySheep hat /></span>)}{guests > 8 && <span className="guest-overflow">+{guests - 8}</span>}</div>;
}