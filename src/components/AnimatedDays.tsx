import { useEffect, useRef, useState } from 'react';

export function AnimatedDays({ value }: { value: number }) {
  const element = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const [display, setDisplay] = useState(value);
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    let frame = 0;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (played.current || preference.matches) { setDisplay(value); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || played.current) return;
      played.current = true;
      observer.disconnect();
      const start = performance.now();
      function animate(now: number) {
        const progress = Math.min(1, (now - start) / 950);
        setDisplay(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1 && !preference.matches) frame = requestAnimationFrame(animate);
        else { setDisplay(value); setArrived(!preference.matches); }
      }
      frame = requestAnimationFrame(animate);
    }, { threshold: .6 });
    if (element.current) observer.observe(element.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={element} className={arrived ? 'days-arrived' : ''} aria-label={String(value)}><span aria-hidden="true">{String(display).padStart(2, '0')}</span></span>;
}