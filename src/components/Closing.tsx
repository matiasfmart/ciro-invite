import { useEffect, useId, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { InvitationConfig } from '../config/types';
import { useAdventure } from './AdventureProvider';

export function Closing({ config }: { config: InvitationConfig }) {
  const [phase, setPhase] = useState<'lit' | 'blowing' | 'out'>('lit');
  const [canRelight, setCanRelight] = useState(false);
  const flame = useRef<HTMLSpanElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { celebrate } = useAdventure();
  const gradient = useId().replace(/:/g, '');
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function blow() {
    if (phase !== 'lit') return;
    setPhase('blowing');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timers.current.push(setTimeout(() => {
      setPhase('out');
      const bounds = flame.current!.getBoundingClientRect();
      celebrate({ origin: { x: (bounds.left + bounds.width / 2) / window.innerWidth, y: bounds.bottom / window.innerHeight }, colors: ['#bf6547', config.theme.colors.accent, '#79a93b'], sound: 'applause' });
    }, reduced ? 200 : 460));
    timers.current.push(setTimeout(() => setCanRelight(true), 3200));
  }
  function relight() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setCanRelight(false);
    setPhase('lit');
  }

  return <footer id="closing" className={`closing candle-closing closing-${phase}`}>
    <div className="bunting" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
    <div className="closing-heading"><p>{config.theme.closing}</p><strong>{config.child.name}</strong></div>
    <button className="cake-button" onClick={blow} disabled={phase !== 'lit'} aria-label="Soplar la vela de cumpleaños" title="Soplar la vela">
      <svg className="cake-art" viewBox="0 220 768 940" aria-hidden="true"><image href={`${import.meta.env.BASE_URL}assets/characters/torta.png`} width="768" height="1369" /></svg>
      <span ref={flame} className="candle-flame" aria-hidden="true"><svg viewBox="0 0 28 48"><defs><radialGradient id={gradient} cx="45%" cy="70%" r="65%"><stop offset="0" stopColor="#fffad8" /><stop offset=".48" stopColor="#ffdc56" /><stop offset="1" stopColor="#f29a36" /></radialGradient></defs><path d="M14 1C10 13 2 18 2 31c0 9 5 15 12 15s12-6 12-15C26 18 17 11 14 1Z" fill={`url(#${gradient})`} /><path d="M14 22c-3 7-6 9-6 15 0 5 3 8 6 8s6-3 6-8c0-6-3-8-6-15Z" fill="#fff9ce" /></svg></span>
      {phase === 'out' && <svg className="candle-smoke" viewBox="0 0 40 95" aria-hidden="true"><path d="M20 92C3 75 36 67 19 52S5 25 22 6" fill="none" stroke="#a1a8a0" strokeWidth="3" strokeLinecap="round" /></svg>}
    </button>
    <p className="candle-hint">Tocá la vela para soplarla</p>
    {phase === 'out' && <p className="closing-thanks is-visible" role="status">¡Gracias por venir a mi cumple!</p>}
    {canRelight && <button type="button" className="relight-button" onClick={relight}><RotateCcw size={15} aria-hidden="true" /> Volver a encender</button>}
  </footer>;
}