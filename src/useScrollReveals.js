import { useLayoutEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sharedGroups = [
  { trigger: '.trust-showcase-intro', targets: '.trust-showcase-intro' },
  { trigger: '.trust-showcase-grid', targets: '.trust-showcase-card', stagger: .11 },
  { trigger: '.feature-showcase-header', targets: '.feature-showcase-header' },
  { trigger: '.feature-showcase-grid', targets: '.feature-journey', stagger: .12 },
  { trigger: '.feature-showcase-more', targets: '.feature-showcase-more', distance: 12 },
  { trigger: '.journey-essentials-header', targets: '.journey-essentials-header' },
  { trigger: '.journey-essentials-grid', targets: '.journey-essential-card', stagger: .14 },
  { trigger: '.testimonial-intro', targets: '.testimonial-intro' },
  { trigger: '.tour-information-photo', targets: '.tour-information-photo' },
  { trigger: '.tour-information-content', targets: '.tour-information-content' },
  { trigger: '.travel-planning', targets: '.travel-planning' },
  { trigger: '.glance-header', targets: '.glance-header' },
  { trigger: '.glance-gallery', targets: '.glance-gallery figure', stagger: .12 },
  { trigger: '.glance-fact-grid', targets: '.glance-fact-card', stagger: .07, distance: 12 },
];

const desktopGroups = [
  { trigger: '[data-node-id="3:390"]', targets: '[data-node-id="3:390"] > .layer-content, [data-node-id="3:388"] > .layer-content, [data-node-id="3:389"] > .layer-content', stagger: .11 },
  { trigger: '[data-node-id="8:1008"]', targets: '[data-node-id="8:1008"] > .layer-content, [data-node-id="8:1006"] > .layer-content', stagger: .13 },
  { trigger: '[data-node-id="7:667"]', targets: '[data-node-id="7:667"] > .layer-content, [data-node-id="7:668"] > .layer-content, [data-node-id="58:72"] > .layer-content', stagger: .12 },
  { trigger: '[data-node-id="59:283"]', targets: '[data-node-id="59:283"] > .layer-content, [data-node-id="59:281"] > .layer-content', stagger: .13 },
  { trigger: '[data-node-id="455:1036"]', targets: '[data-node-id="455:1077"] > .layer-content, [data-node-id="455:1042"] > .layer-content, [data-node-id="455:1050"] > .layer-content, [data-node-id="455:1062"] > .layer-content', stagger: .1, distance: 0 },
];

const responsiveGroups = [
  { trigger: '.intro-composition', targets: '.intro-composition' },
  { trigger: '.responsive-intro-copy', targets: '.responsive-intro-copy' },
  { trigger: '.responsive-why-copy', targets: '.responsive-why-copy' },
  { trigger: '.why-composition', targets: '.why-composition' },
  { trigger: '.responsive-footer', targets: '.footer-content > div', stagger: .1, distance: 14 },
];

export default function useScrollReveals(scopeRef, desktop = false) {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || reducedMotion) return;

    const animations = [];
    for (const group of [...(desktop ? desktopGroups : responsiveGroups), ...sharedGroups]) {
      const trigger = scope.querySelector(group.trigger);
      const targets = [...scope.querySelectorAll(group.targets)];
      if (!trigger || !targets.length) continue;
      targets.forEach(target => target.classList.add('scroll-reveal-active'));

      const animation = gsap.fromTo(targets,
        { opacity: 0, y: group.distance ?? 18 },
        {
          opacity: 1,
          y: 0,
          duration: .9,
          stagger: group.stagger ?? 0,
          ease: 'power3.out',
          scrollTrigger: { trigger, start: 'top 86%', once: true },
          onStart: () => targets.forEach(target => { target.style.willChange = 'transform, opacity'; }),
          onComplete: () => {
            gsap.set(targets, { clearProps: 'transform' });
            targets.forEach(target => { target.classList.remove('scroll-reveal-active'); target.style.willChange = ''; });
          },
        },
      );
      animations.push({ animation, targets });
    }

    let refreshFrame;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    resizeObserver.observe(scope);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(refreshFrame);
      animations.forEach(({ animation, targets }) => {
        animation.scrollTrigger?.kill();
        animation.kill();
        gsap.set(targets, { clearProps: 'opacity,transform' });
        targets.forEach(target => { target.classList.remove('scroll-reveal-active'); target.style.willChange = ''; });
      });
    };
  }, [scopeRef, reducedMotion, desktop]);
}
