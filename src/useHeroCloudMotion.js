import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';

// The clouds cross a few dozen design pixels over roughly a minute.
// Starting a quarter-way through each eased pass keeps the Figma composition
// almost unchanged on load while giving the drift immediate, gentle motion.
const clouds = [
  { id: '3:292', from: [-12, -2], to: [68, 12], duration: 56 },
  { id: '3:293', from: [-15, 2], to: [87, -12], duration: 66 },
  { id: '3:294', from: [14, -2], to: [-82, 12], duration: 62 },
  { id: '3:295', from: [-9, 2], to: [51, -12], duration: 81 },
];

export default function useHeroCloudMotion(scopeRef) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || reducedMotion) return;

    const animated = clouds.flatMap(({ id, from, to, duration }) => {
      const surface = scope.querySelector(`[data-node-id="${id}"] > .layer-content`);
      if (!surface) return [];
      const tween = gsap.fromTo(surface,
        { x: from[0], y: from[1] },
        { x: to[0], y: to[1], duration, repeat: -1, yoyo: true, ease: 'sine.inOut', force3D: true },
      );
      tween.progress(.25);
      return [{ surface, tween }];
    });

    const hero = scope.querySelector('[data-node-id="3:290"]') || scope;
    const observer = new IntersectionObserver(([entry]) => {
      animated.forEach(({ tween }) => entry.isIntersecting ? tween.resume() : tween.pause());
    });
    observer.observe(hero);

    return () => {
      observer.disconnect();
      animated.forEach(({ surface, tween }) => {
        tween.kill();
        gsap.set(surface, { clearProps: 'transform' });
      });
    };
  }, [scopeRef, reducedMotion]);
}
