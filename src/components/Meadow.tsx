import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { sheepPose, sheepRoute } from '../lib/meadow';

function Sheep({ index, beat, reduced }: { index: number; beat: number; reduced: boolean }) {
  const [jumping, setJumping] = useState(false);
  const [bubble, setBubble] = useState(false);
  const element = useRef<HTMLButtonElement>(null);
  const motion = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const animation = useRef(0);
  const running = useRef(false);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function jump(manual: boolean) {
    if (manual) {
      setBubble(true);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      bubbleTimer.current = setTimeout(() => setBubble(false), 1400);
    }
    if (reduced || running.current || !element.current || !motion.current) return;
    running.current = true;
    setJumping(true);
    const bounds = element.current.getBoundingClientRect();
    const fence = element.current.parentElement!.querySelector('.meadow-fence')!.getBoundingClientRect();
    const route = sheepRoute(bounds.width, bounds.height, fence.height, fence.width);
    const start = performance.now();
    function animate(now: number) {
      if (!element.current || !motion.current) return;
      const elapsed = now - start;
      const pose = index === 1 ? sheepPose(elapsed, route) : sheepPose(elapsed, { ...route, distance: 0, height: bounds.height * .65 });
      const finished = index === 1 ? elapsed >= 3250 : elapsed >= 1350;
      const returning = pose.phase === 'return';
      element.current.dataset.motion = finished ? 'idle' : pose.phase;
      element.current.dataset.routeHeight = String(route.height);
      motion.current.style.transform = finished ? '' : `translate(${pose.x}px, ${pose.y}px) scale(${pose.scaleX}, ${pose.scaleY})`;
      if (shadow.current) {
        shadow.current.style.transform = finished ? '' : `translate(${pose.x}px, ${Math.max(0, pose.y)}px) scale(${pose.y < 0 ? .65 : 1})`;
        shadow.current.style.opacity = pose.y < 0 ? '.45' : '1';
      }
      element.current.style.setProperty('--sheep-facing', returning ? '-1' : '1');
      if (finished) { running.current = false; setJumping(false); }
      else animation.current = requestAnimationFrame(animate);
    }
    animation.current = requestAnimationFrame(animate);
  }
  useEffect(() => {
    if (beat > 0 && index === 1 && !reduced) jump(false);
  }, [beat, index, reduced]);
  useEffect(() => () => { cancelAnimationFrame(animation.current); if (bubbleTimer.current) clearTimeout(bubbleTimer.current); }, []);
  useEffect(() => { if (reduced) { cancelAnimationFrame(animation.current); running.current = false; setJumping(false); if (motion.current) motion.current.style.transform = ''; } }, [reduced]);

  return <button ref={element} type="button" className={`meadow-sheep sheep-${index} ${jumping ? 'is-jumping' : ''}`} style={{ '--idle-delay': `${index * -1.1}s` } as CSSProperties} onClick={() => jump(true)} aria-label={`Hacer saltar la oveja ${index + 1}`} data-jumping={jumping}>
    {bubble && <span className="sheep-bubble" role="status">¡Beee!</span>}
    <span ref={shadow} className="sheep-ground-shadow" aria-hidden="true" /><span ref={motion} className="sheep-motion"><span className="sheep-idle"><svg className={`sheep-art ${index === 2 ? 'is-mirrored' : ''}`} viewBox="73 437 637 571" aria-hidden="true"><image href={`${import.meta.env.BASE_URL}assets/characters/oveja.png`} width="768" height="1366" /></svg></span></span>
  </button>;
}

export function Meadow() {
  const [beat, setBeat] = useState(0);
  const [reduced, setReduced] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; });
    if (area.current) observer.observe(area.current);
    const interval = setInterval(() => { if (visible.current && !preference.matches) setBeat((value) => value + 1); }, 4500);
    return () => { preference.removeEventListener('change', update); observer.disconnect(); clearInterval(interval); };
  }, []);
  return <div className="meadow-scene" ref={area}>
    <span className="meadow-hill meadow-hill-back" aria-hidden="true" /><span className="meadow-hill meadow-hill-front" aria-hidden="true" />
    <img className="meadow-pastor" src={`${import.meta.env.BASE_URL}assets/characters/david-pastor.png`} alt="David pastor con su cayado" loading="lazy" />
    <span className="meadow-fence" aria-hidden="true"><i /><i /><span /><span /></span>
    {[0, 1, 2, 3].map((index) => <Sheep key={index} index={index} beat={beat} reduced={reduced} />)}
  </div>;
}