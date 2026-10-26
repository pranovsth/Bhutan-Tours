import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { image } from './design-data';
import './prayer-flag-divider.css';

export default function PrayerFlagDivider({ desktop = false }) {
  const reducedMotion = useReducedMotion();
  const artwork = useRef(null);

  useEffect(() => {
    if (reducedMotion || !artwork.current) return;
    const flags = artwork.current;
    const intensity = desktop ? 1 : .55;
    const breeze = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } });
    breeze.to(flags, { y: -7 * intensity, rotation: .3 * intensity, skewX: .25 * intensity, scaleX: 1 + .003 * intensity, scaleY: 1 + .003 * intensity, duration: 3.2 })
      .to(flags, { y: 4 * intensity, rotation: -.22 * intensity, skewX: -.2 * intensity, scaleX: 1, scaleY: 1 - .001 * intensity, duration: 3.6 })
      .to(flags, { y: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1, duration: 3.3 });
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { flags.style.willChange = 'transform'; breeze.resume(); }
      else { breeze.pause(); flags.style.willChange = 'auto'; }
    });
    observer.observe(flags.parentElement);
    return () => { observer.disconnect(); breeze.kill(); flags.style.willChange = ''; gsap.set(flags, { clearProps: 'transform' }); };
  }, [reducedMotion, desktop]);

  return <div className={`prayer-flag-divider${desktop ? ' prayer-flag-divider-desktop' : ''}`} role="img" aria-label="Colorful Bhutanese prayer flags separating tour information from travel topics">
    <img ref={artwork} className="prayer-flag-art" src={image('455:1035')} alt="" width="1602" height="650" loading="lazy" decoding="async"/>
  </div>;
}
