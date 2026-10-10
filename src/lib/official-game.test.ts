import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SCENE, advanceShot, clampStretch, disposeShot, fallPose, makeShot, previewShot } from './official-game';

describe('official sprite game', () => {
  it('keeps the giant visibly 2.8 times taller', () => {
    assert.equal(SCENE.goliathHeight / SCENE.davidHeight, 2.8);
  });
  it('limits the pull while preserving its direction', () => {
    const pull = clampStretch({ x: -100, y: 100 });
    assert.ok(Math.hypot(pull.x, pull.y) <= 70.001);
    assert.ok(pull.x < 0 && pull.y > 0);
    assert.deepEqual(clampStretch({ x: 0, y: 0 }), { x: 0, y: 0 });
  });
  it('freezes on impact and accelerates the fall before changing to the ground sprite', () => {
    assert.equal(fallPose(79).phase, 'impact');
    assert.equal(fallPose(200).phase, 'stagger');
    assert.equal(fallPose(1149).phase, 'falling');
    assert.equal(fallPose(1150).phase, 'ground');
    const early = fallPose(520).angle - fallPose(420).angle;
    const late = fallPose(1020).angle - fallPose(920).angle;
    assert.ok(late > early * 3);
    assert.equal(fallPose(1500).phase, 'victory');
  });
  it('continues the projectile after a torso collision', () => {
    const shot = makeShot({ x: 445, y: 280 }, { x: -35, y: 0 });
    for (let index = 0; index < 60 && !shot.bodyHits; index++) advanceShot(shot);
    assert.ok(shot.bodyHits > 0);
    assert.equal(shot.headHit, false);
    const impactX = shot.stone.position.x;
    for (let index = 0; index < 20; index++) advanceShot(shot);
    assert.ok(shot.stone.position.x < impactX);
    disposeShot(shot);
  });
  it('makes the accessible shot reach the head using the same physics as its preview', () => {
    assert.equal(previewShot({ x: 193, y: 324 }, { x: -34, y: 28 }).hit, true);
  });
});