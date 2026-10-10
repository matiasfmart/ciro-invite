export function sheepRoute(sheepWidth: number, sheepHeight: number, fenceHeight: number, fenceWidth: number) {
  const margin = Math.max(8, sheepHeight * .15);
  return { distance: sheepWidth + fenceWidth + margin * 2, height: fenceHeight + sheepHeight * .32 + margin, detour: sheepHeight * .3 + fenceHeight * .35 };
}

export function sheepPose(elapsed: number, route: ReturnType<typeof sheepRoute>) {
  if (elapsed < 180) return { phase: 'impulse', x: 0, y: 0, scaleX: 1.07, scaleY: .86 };
  if (elapsed < 1080) {
    const progress = (elapsed - 180) / 900;
    return { phase: 'jump', x: route.distance * progress, y: -4 * route.height * progress * (1 - progress), scaleX: 1, scaleY: 1 };
  }
  if (elapsed < 1350) {
    const progress = (elapsed - 1080) / 270;
    return { phase: 'landing', x: route.distance, y: 0, scaleX: 1 + .1 * (1 - progress), scaleY: .83 + .17 * progress };
  }
  if (elapsed < 1750) {
    const progress = (elapsed - 1350) / 400;
    return { phase: 'return', x: route.distance, y: route.detour * progress, scaleX: 1, scaleY: 1 };
  }
  if (elapsed < 2850) {
    const progress = (elapsed - 1750) / 1100;
    return { phase: 'return', x: route.distance * (1 - progress), y: route.detour - Math.abs(Math.sin(progress * Math.PI * 5)) * 3, scaleX: 1, scaleY: 1 };
  }
  if (elapsed < 3250) {
    const progress = (elapsed - 2850) / 400;
    return { phase: 'return', x: 0, y: route.detour * (1 - progress), scaleX: 1, scaleY: 1 };
  }
  return { phase: 'idle', x: 0, y: 0, scaleX: 1, scaleY: 1 };
}