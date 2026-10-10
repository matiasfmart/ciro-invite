import { it } from 'node:test';
import assert from 'node:assert/strict';
import { sheepPose, sheepRoute } from './meadow';

it('clears the fence with the belly and returns around its foreground', () => {
  const route = sheepRoute(54, 48, 28, 22);
  const apex = sheepPose(630, route);
  assert.ok(-apex.y - 48 * .32 > 28 + 6);
  assert.equal(apex.x, route.distance / 2);
  assert.equal(sheepPose(1120, route).phase, 'landing');
  assert.ok(sheepPose(2200, route).y > 28 * .35);
  assert.equal(sheepPose(3250, route).x, 0);
});
it('scales jump clearance with the actual fence and sheep dimensions', () => {
  assert.ok(sheepRoute(70, 60, 40, 30).height > sheepRoute(50, 40, 20, 20).height);
});