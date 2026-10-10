import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Hand, RotateCcw } from 'lucide-react';
import { SCENE, SPRITES, HEAD, STEP, DEFAULT_STRETCH, advanceShot, clampStretch, disposeShot, fallPose, makeShot, previewShot, type Point, type ScenePhase, type Shot, type SpriteName } from '../lib/official-game';
import { useAdventure } from './AdventureProvider';
import './slingshot.css';

type Asset = { image: HTMLImageElement; bounds: { left: number; top: number; right: number; bottom: number; height: number } };
type Assets = Record<SpriteName | 'background', Asset>;
type PlayState = { phase: ScenePhase; stretch: Point; shot: Shot | null; impactAt: number | null; flightAt: number; resetAt: number; recoilAt: number; bodyHits: number; preview: Point[]; lastTick: number; accumulator: number; phaseStarted: number; celebrated: boolean };
const newState = (): PlayState => ({ phase: 'ready', stretch: { x: 0, y: 0 }, shot: null, impactAt: null, flightAt: 0, resetAt: 0, recoilAt: 0, bodyHits: 0, preview: [], lastTick: 0, accumulator: 0, phaseStarted: 0, celebrated: false });

async function loadAsset(file: string): Promise<Asset> {
  const image = new Image();
  image.src = `${import.meta.env.BASE_URL}assets/characters/${file}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d')!;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width;
  let right = 0;
  let top = canvas.height;
  let bottom = 0;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (pixels[(y * canvas.width + x) * 4 + 3] < 100) continue;
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  return { image, bounds: { left, right, top, bottom, height: bottom - top } };
}

function geometry(assets: Assets, name: SpriteName, center: number, height: number) {
  const asset = assets[name];
  const scale = height / asset.bounds.height;
  const footX = SPRITES[name].foot.x * asset.image.naturalWidth;
  const left = center - footX * scale;
  const top = SCENE.ground - asset.bounds.bottom * scale;
  return { scale, left, top, footX };
}

function forkPoints(assets: Assets, name: 'ready' | 'pulling', angle = 0): Point[] {
  const asset = assets[name];
  const box = geometry(assets, name, 148, SCENE.davidHeight);
  return SPRITES[name].forks.map((fork) => {
    const x = (fork.x * asset.image.naturalWidth - box.footX) * box.scale;
    const y = (fork.y * asset.image.naturalHeight - asset.bounds.bottom) * box.scale;
    return { x: 148 + x * Math.cos(angle) - y * Math.sin(angle), y: SCENE.ground + x * Math.sin(angle) + y * Math.cos(angle) };
  });
}

function pouchPoint(assets: Assets, name: 'ready' | 'pulling', angle = 0) {
  const forks = forkPoints(assets, name, angle);
  return { x: (forks[0].x + forks[1].x) / 2, y: (forks[0].y + forks[1].y) / 2 + 9 };
}

export function SlingshotGame({ childName, embedded = false }: { childName: string; embedded?: boolean }) {
  const { chime } = useAdventure();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [phase, setPhase] = useState<ScenePhase>('ready');
  const [handlePosition, setHandlePosition] = useState<Point>({ x: 190, y: 325 });
  const [hintVisible, setHintVisible] = useState(true);
  const [viewport, setViewport] = useState({ height: SCENE.height, offset: 0, zoom: 1 });
  const view = useRef({ height: SCENE.height, offset: 0, zoom: 1 });
  const assets = useRef<Assets | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef<PlayState>(newState());
  const pointer = useRef<{ id: number; start: Point } | null>(null);
  const reduced = useRef(false);
  const sound = useRef(chime);
  const area = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLSpanElement>(null);
  const active = phase === 'ready' || phase === 'aiming';
  useEffect(() => { sound.current = chime; }, [chime]);

  function reset() {
    const captured = pointer.current;
    pointer.current = null;
    if (captured && handle.current?.hasPointerCapture(captured.id)) handle.current.releasePointerCapture(captured.id);
    if (state.current.shot) disposeShot(state.current.shot);
    state.current = newState();
    setPhase('ready');
    if (assets.current) setHandlePosition(pouchPoint(assets.current, 'ready'));
  }

  useEffect(() => {
    let cancelled = false;
    let animation = 0;
    let resizeObserver: ResizeObserver | null = null;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => { reduced.current = preference.matches; };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    const entries = [...Object.entries(SPRITES).map(([name, sprite]) => [name, sprite.file] as const), ['background', 'fondo-juego.jpg'] as const];
    Promise.all(entries.map(async ([name, file]) => [name, await loadAsset(file)] as const)).then((loaded) => {
      if (cancelled) return;
      assets.current = Object.fromEntries(loaded) as Assets;
      setHandlePosition(pouchPoint(assets.current, 'ready'));
      setLoading(false);
      const element = canvas.current!;
      const context = element.getContext('2d')!;
      let ratio = 1;
      function resize() {
        if (!element.clientWidth || !element.clientHeight) return;
        const height = embedded ? element.clientHeight / element.clientWidth * SCENE.width : SCENE.height;
        const groundRatio = Number(getComputedStyle(area.current!).getPropertyValue('--ground-ratio')) || .84;
        const offset = embedded ? height * groundRatio - SCENE.ground : 0;
        const zoom = embedded ? Number(getComputedStyle(area.current!).getPropertyValue('--game-zoom')) || 1.3 : 1;
        const dpr = window.devicePixelRatio || 1;
        ratio = dpr * element.clientWidth / SCENE.width;
        view.current = { height, offset, zoom };
        setViewport({ height, offset, zoom });
        element.width = Math.round(element.clientWidth * dpr);
        element.height = Math.round(element.clientHeight * dpr);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
      }
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element);
      function loop(now: number) {
        if (cancelled) return;
        const play = state.current;
        const delta = play.lastTick ? Math.min(50, now - play.lastTick) : 0;
        play.lastTick = now;
        if (play.shot && !play.shot.finished) {
          const hitStop = play.impactAt !== null && now - play.impactAt < 80;
          if (!hitStop) {
            play.accumulator += delta;
            while (play.accumulator >= STEP && !play.shot.finished) {
              advanceShot(play.shot);
              play.accumulator -= STEP;
              if (play.shot.headHit && play.impactAt === null) {
                play.impactAt = now;
                play.accumulator = 0;
                sound.current('bell');
                break;
              }
            }
          }
          if (play.shot.bodyHits > play.bodyHits) {
            play.bodyHits = play.shot.bodyHits;
            play.recoilAt = now;
            sound.current('stone');
          }
        }
        if (play.impactAt !== null) {
          const elapsed = reduced.current ? 1500 : now - play.impactAt;
          play.phase = fallPose(elapsed).phase;
          if (play.phase === 'victory' && !play.celebrated) { play.celebrated = true; sound.current('success'); }
        } else if (play.shot?.finished) {
          if (!play.resetAt) play.resetAt = now + 450;
          if (now >= play.resetAt) reset();
        }
        if (phaseRef.current !== state.current.phase) { phaseRef.current = state.current.phase; setPhase(state.current.phase); }
        draw(context, assets.current!, state.current, now, ratio, reduced.current, view.current, embedded);
        if (area.current) {
          area.current.dataset.phase = state.current.phase;
          area.current.dataset.elapsed = String(state.current.impactAt === null ? 0 : Math.round(now - state.current.impactAt));
          area.current.dataset.bodyHits = String(state.current.bodyHits);
        }
        animation = requestAnimationFrame(loop);
      }
      animation = requestAnimationFrame(loop);
    }).catch(() => { if (!cancelled) { setError(true); setLoading(false); } });
    return () => {
      cancelled = true;
      cancelAnimationFrame(animation);
      resizeObserver?.disconnect();
      preference.removeEventListener('change', updatePreference);
      if (state.current.shot) disposeShot(state.current.shot);
      state.current = newState();
    };
  }, [embedded]);
  const phaseRef = useRef<ScenePhase>('ready');

  function position(event: PointerEvent<HTMLElement>) {
    const bounds = canvas.current!.getBoundingClientRect();
    const current = view.current;
    return { x: ((event.clientX - bounds.left) / bounds.width * SCENE.width + 57) / current.zoom - 57, y: ((event.clientY - bounds.top) / bounds.height * current.height - current.offset - SCENE.ground) / current.zoom + SCENE.ground };
  }

  function aim(stretch: Point) {
    if (!assets.current) return;
    const play = state.current;
    play.phase = 'aiming';
    play.stretch = clampStretch(stretch);
    const lean = reduced.current ? 0 : -Math.hypot(play.stretch.x, play.stretch.y) / 70 * .045;
    const anchor = pouchPoint(assets.current, 'pulling', lean);
    const stone = { x: anchor.x + play.stretch.x, y: anchor.y + play.stretch.y };
    play.preview = previewShot(stone, play.stretch).points;
    setHandlePosition(stone);
    setPhase('aiming');
  }

  function fire() {
    if (!assets.current || !['ready', 'aiming'].includes(state.current.phase)) return;
    const play = state.current;
    const stretch = Math.hypot(play.stretch.x, play.stretch.y) < 10 ? DEFAULT_STRETCH : play.stretch;
    const lean = reduced.current ? 0 : -Math.hypot(stretch.x, stretch.y) / 70 * .045;
    const anchor = pouchPoint(assets.current, 'pulling', lean);
    play.shot = makeShot({ x: anchor.x + stretch.x, y: anchor.y + stretch.y }, stretch);
    play.phase = 'flying';
    play.flightAt = performance.now();
    play.preview = [];
    play.lastTick = performance.now();
    setPhase('flying');
    sound.current('stone');
  }

  function start(event: PointerEvent<HTMLSpanElement>) {
    if (!active || pointer.current || event.button !== 0 || loading) return;
    event.preventDefault();
    setHintVisible(false);
    pointer.current = { id: event.pointerId, start: position(event) };
    event.currentTarget.setPointerCapture(event.pointerId);
    aim({ x: 0, y: 0 });
  }
  function move(event: PointerEvent<HTMLSpanElement>) {
    const grab = pointer.current;
    if (!grab || event.pointerId !== grab.id) return;
    event.preventDefault();
    const point = position(event);
    aim({ x: point.x - grab.start.x, y: point.y - grab.start.y });
  }
  function end(event: PointerEvent<HTMLSpanElement>, cancelled = false) {
    if (pointer.current?.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled) reset(); else fire();
  }
  function keyboard(event: KeyboardEvent<HTMLSpanElement>) {
    setHintVisible(false);
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fire(); }
    if (event.key === 'Escape') { event.preventDefault(); reset(); }
    const direction = { ArrowLeft: [-6, 0], ArrowRight: [6, 0], ArrowUp: [0, -6], ArrowDown: [0, 6] }[event.key];
    if (direction && active) { event.preventDefault(); const pull = state.current.phase === 'ready' ? DEFAULT_STRETCH : state.current.stretch; aim({ x: pull.x + direction[0], y: pull.y + direction[1] }); }
  }

  return <div className={`official-game ${embedded ? 'official-game--embedded' : ''} official-state-${phase}`} ref={area} id="game" role="region" aria-label="La gomera de David" data-phase={phase}>
    <div className="official-game-scene">
      <canvas ref={canvas} className="official-game-canvas" aria-hidden="true" />
      {loading && <p className="game-loading" role="status">Cargando…</p>}
      {error && <p className="game-loading" role="alert">No se pudieron cargar las imágenes.</p>}
      {!loading && !error && <span ref={handle} role="button" tabIndex={active ? 0 : -1} aria-label="Apuntar y soltar la piedra" aria-disabled={!active} className="official-stone-handle" style={{ left: `${((handlePosition.x + 57) * viewport.zoom - 57) / SCENE.width * 100}%`, top: `${((handlePosition.y - SCENE.ground) * viewport.zoom + SCENE.ground + viewport.offset) / viewport.height * 100}%`, visibility: active ? 'visible' : 'hidden' }} onPointerDown={start} onPointerMove={move} onPointerUp={(event) => end(event)} onPointerCancel={(event) => end(event, true)} onLostPointerCapture={(event) => { if (pointer.current?.id === event.pointerId) reset(); }} onKeyDown={keyboard} />}
    </div>
    {embedded && hintVisible && !loading && !error && <p className="game-gesture-hint"><Hand size={20} aria-hidden="true" /><span>Estirá la gomera y derribá a Goliat</span></p>}
    <div className={`game-victory ${phase === 'victory' ? 'is-visible' : ''}`} inert={phase !== 'victory'}>
      <p role={phase === 'victory' ? 'status' : undefined} aria-label={`¡Lo lograste! Te espero en el cumple de ${childName}`}>¡Lo lograste! 🎉</p>
      <button type="button" onClick={reset} aria-label="Volver a jugar" title="Volver a jugar"><RotateCcw size={17} aria-hidden="true" /></button>
    </div>
  </div>;
}

function draw(context: CanvasRenderingContext2D, assets: Assets, play: PlayState, now: number, ratio: number, reduced: boolean, viewport: { height: number; offset: number; zoom: number }, embedded: boolean) {
  const { width, height, ground } = SCENE;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, viewport.height);
  context.save();
  context.translate(-57, viewport.offset + ground);
  context.scale(viewport.zoom, viewport.zoom);
  context.translate(57, -ground);
  const elapsed = play.impactAt === null ? 0 : now - play.impactAt;
  const pose = fallPose(reduced && play.impactAt !== null ? 1500 : elapsed);
  if (!reduced && play.impactAt !== null && elapsed > 1150 && elapsed < 1290) context.translate(Math.sin(elapsed * .15) * 2, Math.cos(elapsed * .12) * 1.5);
  if (!embedded) {
    const image = assets.background.image;
    const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const cropWidth = width / cover;
    const cropHeight = height / cover;
    context.drawImage(image, (image.naturalWidth - cropWidth) / 2, image.naturalHeight - cropHeight, cropWidth, cropHeight, 0, 0, width, height);
  }

  function sprite(name: SpriteName, center: number, size: number, angle = 0, mirror = false, offset = 0) {
    const asset = assets[name];
    const box = geometry(assets, name, center, size);
    context.save();
    context.translate(center, ground + offset);
    context.rotate(angle);
    if (mirror) context.scale(-1, 1);
    context.drawImage(asset.image, -box.footX * box.scale, -asset.bounds.bottom * box.scale, asset.image.naturalWidth * box.scale, asset.image.naturalHeight * box.scale);
    context.restore();
  }
  context.fillStyle = '#4d57262b';
  for (const [center, radius] of [[148, 27], [510, 67]]) { context.beginPath(); context.ellipse(center, ground + 2, radius, 7, 0, 0, Math.PI * 2); context.fill(); }
  if (play.impactAt === null) {
    const recoil = play.recoilAt && now - play.recoilAt < 400 ? Math.sin((now - play.recoilAt) / 400 * Math.PI * 2) * .025 : 0;
    sprite('standing', 510, SCENE.goliathHeight, recoil, true);
  } else if (pose.phase === 'ground' || pose.phase === 'victory') {
    const asset = assets.fallen;
    const displayWidth = embedded ? 250 : 305;
    const displayLeft = embedded ? 430 : 487;
    const scale = displayWidth / (asset.bounds.right - asset.bounds.left);
    context.drawImage(asset.image, displayLeft - asset.bounds.left * scale, ground + pose.bounce - asset.bounds.bottom * scale, asset.image.naturalWidth * scale, asset.image.naturalHeight * scale);
  } else sprite('hit', 510 + pose.step, SCENE.goliathHeight, pose.angle, true);

  const pulling = play.phase === 'aiming';
  const name = play.phase === 'victory' ? 'celebrating' : pulling ? 'pulling' : 'ready';
  const lean = reduced ? 0 : pulling ? -Math.hypot(play.stretch.x, play.stretch.y) / 70 * .045 : play.flightAt && now - play.flightAt < 300 ? Math.sin((now - play.flightAt) / 300 * Math.PI * 2) * .04 : 0;
  sprite(name, 148, SCENE.davidHeight, lean);
  if (name !== 'celebrating') {
    const forks = forkPoints(assets, pulling ? 'pulling' : 'ready', lean);
    const anchor = pouchPoint(assets, pulling ? 'pulling' : 'ready', lean);
    const rebound = play.flightAt && now - play.flightAt < 430 ? Math.sin((now - play.flightAt) / 35) * 10 * (1 - (now - play.flightAt) / 430) : 0;
    const stone = pulling ? { x: anchor.x + play.stretch.x, y: anchor.y + play.stretch.y } : { x: anchor.x, y: anchor.y + rebound };
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.strokeStyle = '#89532e';
    for (const fork of forks) { context.beginPath(); context.moveTo(fork.x, fork.y); context.quadraticCurveTo((fork.x + stone.x) / 2, stone.y + 4, stone.x, stone.y); context.stroke(); }
    if (!play.shot) {
      context.fillStyle = '#7b482d'; context.beginPath(); context.ellipse(stone.x, stone.y + 4, 10, 5, 0, 0, Math.PI * 2); context.fill();
      drawStone(context, stone);
      if (play.phase === 'ready') { context.setLineDash([3, 7]); context.strokeStyle = '#fff8cbaa'; context.lineWidth = 2; context.beginPath(); context.arc(stone.x, stone.y, 19 + Math.sin(now / 700) * (reduced ? 0 : 2), 0, Math.PI * 2); context.stroke(); context.setLineDash([]); }
    }
  }
  if (pulling) {
    for (const [index, point] of play.preview.entries()) { if (point.y < -viewport.offset || point.y > ground) continue; context.fillStyle = '#fff7de'; context.globalAlpha = Math.max(.25, .9 - index * .03); context.beginPath(); context.arc(point.x, point.y, 3.2, 0, Math.PI * 2); context.fill(); } context.globalAlpha = 1;
  }
  if (play.shot && !play.shot.finished) drawStone(context, play.shot.stone.position);
  if (play.impactAt !== null && elapsed < 420) {
    const impact = play.shot!.impact;
    context.strokeStyle = '#fff4b8'; context.lineWidth = 4;
    for (let index = 0; index < 7; index++) { const angle = index / 7 * Math.PI * 2; context.beginPath(); context.moveTo(impact.x + Math.cos(angle) * 12, impact.y + Math.sin(angle) * 12); context.lineTo(impact.x + Math.cos(angle) * 27, impact.y + Math.sin(angle) * 27); context.stroke(); }
  }
  if (play.impactAt !== null && elapsed > 1150) {
    if (!reduced && elapsed >= 1500 && elapsed < 2400) {
      const progress = (elapsed - 1500) / 900;
      const colors = ['#bf6547', '#f6ce52', '#79a93b'];
      for (let index = 0; index < 26; index++) {
        const seed = Math.sin(index * 12.9898) * 43758.5453;
        const spread = seed - Math.floor(seed);
        const x = 370 + (spread - .5) * 260 * progress;
        const y = ground - 30 - (90 + spread * 60) * progress + 180 * progress * progress;
        context.save(); context.translate(x, y); context.rotate(index + progress * 8);
        context.globalAlpha = 1 - progress; context.fillStyle = colors[index % 3]; context.fillRect(-3, -2, 6, 4); context.restore();
      }
    }
    const dustTime = elapsed - 1150;
    if (dustTime < 520 && !reduced) {
      context.fillStyle = '#e6d7a3'; context.globalAlpha = .4 * (1 - dustTime / 520);
      for (let index = 0; index < 7; index++) { context.beginPath(); context.arc(525 + index * 37 + Math.sin(index) * dustTime / 35, ground - dustTime / 28, 13 + dustTime / 35, 0, Math.PI * 2); context.fill(); } context.globalAlpha = 1;
    }
    for (let index = 0; index < 3; index++) { const angle = now / (reduced ? 1e8 : 850) + index * Math.PI * 2 / 3; star(context, 740 + Math.cos(angle) * 30, ground - 96 + Math.sin(angle) * 9, 7); }
  }
  context.restore();
}

function drawStone(context: CanvasRenderingContext2D, point: Point) {
  const gradient = context.createRadialGradient(point.x - 3, point.y - 3, 1, point.x, point.y, 9);
  gradient.addColorStop(0, '#f2e9d2'); gradient.addColorStop(1, '#7d8971');
  context.fillStyle = gradient; context.beginPath(); context.ellipse(point.x, point.y, 8, 7, -.25, 0, Math.PI * 2); context.fill();
}
function star(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.fillStyle = '#ffdf69'; context.beginPath();
  for (let index = 0; index < 10; index++) { const angle = index * Math.PI / 5 - Math.PI / 2; const radius = index % 2 ? size * .45 : size; const pointX = x + Math.cos(angle) * radius; const pointY = y + Math.sin(angle) * radius; if (index) context.lineTo(pointX, pointY); else context.moveTo(pointX, pointY); } context.closePath(); context.fill();
}