import Matter from 'matter-js';

export const SCENE = { width: 900, height: 500, ground: 390, davidHeight: 100, goliathHeight: 280 };
export const SPRITES = {
  ready: { file: 'david-listo.png', foot: { x: .5, y: .945 }, forks: [{ x: .808, y: .374 }, { x: .928, y: .374 }] },
  pulling: { file: 'david-tirando.png', foot: { x: .55, y: .944 }, forks: [{ x: .747, y: .347 }, { x: .814, y: .34 }] },
  celebrating: { file: 'david-festejo.png', foot: { x: .5, y: .945 }, forks: [] },
  standing: { file: 'goliat-pie.png', foot: { x: .53, y: .896 }, forks: [] },
  hit: { file: 'goliat-golpeado.png', foot: { x: .567, y: .941 }, forks: [] },
  fallen: { file: 'goliat-caido.png', foot: { x: .22, y: .757 }, forks: [] },
} as const;
export type SpriteName = keyof typeof SPRITES;
export type Point = { x: number; y: number };
export type ScenePhase = 'ready' | 'aiming' | 'flying' | 'impact' | 'stagger' | 'falling' | 'ground' | 'victory';
export const HEAD = { x: 500, y: 174, radius: 35 };
export const STEP = 1000 / 120;
export const DEFAULT_STRETCH = { x: -34, y: 28 };

export function clampStretch(stretch: Point) {
  const horizontal = Math.min(0, stretch.x);
  const vertical = Math.max(-10, stretch.y);
  const distance = Math.hypot(horizontal, vertical);
  const scale = distance > 70 ? 70 / distance : 1;
  return { x: horizontal * scale, y: vertical * scale };
}

export function makeShot(origin: Point, stretch: Point) {
  const engine = Matter.Engine.create({ gravity: { x: 0, y: .8, scale: .001 } });
  const stone = Matter.Bodies.circle(origin.x, origin.y, 8, { restitution: .62, friction: .06, frictionAir: .002 });
  const head = Matter.Bodies.circle(HEAD.x, HEAD.y, HEAD.radius, { isStatic: true, isSensor: true });
  const body = Matter.Bodies.rectangle(510, 295, 95, 160, { isStatic: true, restitution: .65 });
  const floor = Matter.Bodies.rectangle(450, SCENE.ground + 15, 1100, 30, { isStatic: true, restitution: .4 });
  Matter.Composite.add(engine.world, [stone, head, body, floor]);
  const pull = clampStretch(stretch);
  Matter.Body.setVelocity(stone, { x: -pull.x * .28, y: -pull.y * .32 });
  const shot = { engine, stone, head, body, headHit: false, bodyHits: 0, steps: 0, finished: false, impact: { ...origin } };
  Matter.Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      if (pair.bodyA !== stone && pair.bodyB !== stone) continue;
      const other = pair.bodyA === stone ? pair.bodyB : pair.bodyA;
      if (other === head && !shot.headHit) {
        shot.headHit = true;
        shot.impact = { ...stone.position };
        head.collisionFilter.mask = 0;
        body.collisionFilter.mask = 0;
        Matter.Body.setVelocity(stone, { x: -Math.abs(stone.velocity.x) * .32, y: -3 });
      } else if (other === body && !shot.headHit) shot.bodyHits++;
    }
  });
  return shot;
}
export type Shot = ReturnType<typeof makeShot>;

export function advanceShot(shot: Shot) {
  if (shot.finished) return;
  Matter.Engine.update(shot.engine, STEP);
  shot.steps++;
  shot.finished = shot.steps > 600 || shot.stone.position.x < -60 || shot.stone.position.x > 970 || shot.stone.position.y > 560 || (shot.steps > 100 && shot.stone.position.y > 376 && shot.stone.speed < .5);
}

export function disposeShot(shot: Shot) {
  Matter.Events.off(shot.engine, 'collisionStart');
  Matter.Composite.clear(shot.engine.world, false);
  Matter.Engine.clear(shot.engine);
}

export function previewShot(origin: Point, stretch: Point) {
  const shot = makeShot(origin, stretch);
  const points: Point[] = [];
  for (let index = 0; index < 600 && !shot.finished && !shot.headHit && !shot.bodyHits; index++) {
    advanceShot(shot);
    if (index % 10 === 0) points.push({ ...shot.stone.position });
  }
  const hit = shot.headHit;
  disposeShot(shot);
  return { points, hit };
}

export function fallPose(elapsed: number) {
  if (elapsed < 80) return { phase: 'impact' as const, angle: -.35, step: 0, bounce: 0 };
  if (elapsed < 320) {
    const progress = (elapsed - 80) / 240;
    return { phase: 'stagger' as const, angle: -.35 + Math.sin(progress * Math.PI) * .16, step: 18 * progress, bounce: 0 };
  }
  if (elapsed < 1150) {
    const progress = (elapsed - 320) / 830;
    return { phase: 'falling' as const, angle: -.35 + 1.52 * progress * progress * progress, step: 18 + 8 * progress, bounce: 0 };
  }
  const progress = Math.min(1, (elapsed - 1150) / 350);
  return { phase: elapsed < 1500 ? 'ground' as const : 'victory' as const, angle: 0, step: 26, bounce: -Math.abs(Math.sin(progress * Math.PI * 2)) * 9 * (1 - progress) };
}