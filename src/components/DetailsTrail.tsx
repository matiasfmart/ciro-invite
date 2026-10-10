import { useEffect, useRef } from 'react';
import { PartySheep } from './PartySheep';

export function DetailsTrail() {
  const trail = useRef<HTMLDivElement>(null);
  const sheep = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const section = trail.current!.closest('section')!;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;
    function update() {
      frame = 0;
      if (!visible && !preference.matches) return;
      const bounds = section.getBoundingClientRect();
      const rows = [...section.querySelectorAll('.event-row')];
      const button = section.querySelector('.button')!.getBoundingClientRect();
      const start = rows[0].getBoundingClientRect().top - bounds.top + 20;
      const finish = button.top - bounds.top + button.height / 2;
      const progress = preference.matches ? 1 : Math.max(0, Math.min(1, (window.innerHeight * .66 - bounds.top - start) / (finish - start)));
      const marks = [...trail.current!.querySelectorAll<HTMLElement>('.sandal-print')];
      marks.forEach((mark, index) => {
        const fraction = index / (marks.length - 1);
        const x = 19 + Math.sin(fraction * Math.PI * 4) * 12;
        mark.style.transform = `translate(${x}px, ${start + fraction * (finish - start)}px) rotate(${index % 2 ? 18 : -18}deg)`;
        mark.style.opacity = fraction <= progress ? '.35' : '0';
      });
      rows.forEach((row) => {
        const reached = progress * (finish - start) + start >= row.getBoundingClientRect().top - bounds.top + 18;
        if (reached) row.classList.add('trail-reached');
      });
      if (sheep.current) {
        const bounce = preference.matches || progress === 1 ? 0 : Math.abs(Math.sin(progress * Math.PI * 12)) * 3;
        sheep.current.style.transform = `translate(${progress === 1 ? 14 : 9 + Math.sin(progress * Math.PI * 4) * 9}px, ${start + progress * (finish - start) - 18 - bounce}px)`;
        sheep.current.style.opacity = '1';
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    preference.addEventListener('change', schedule);
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); preference.removeEventListener('change', schedule); };
  }, []);
  return <div ref={trail} className="details-trail" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} className="sandal-print" />)}<span ref={sheep} className="trail-sheep"><PartySheep /></span></div>;
}