import { useLayoutEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { copy, image } from './design-data';
import { navigation } from './site-navigation';
import './responsive-fonts.css';
import './desktop-header.css';

export default function DesktopHeader({ scale }) {
  const [navHidden, setNavHidden] = useState(() => window.scrollY > 180);

  useLayoutEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    let direction = 0;
    let distance = 0;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;

      if (y <= 100) {
        direction = 0;
        distance = 0;
        setNavHidden(false);
        return;
      }
      if (Math.abs(delta) < 1) return;

      const nextDirection = Math.sign(delta);
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;

      if (nextDirection > 0 && y > 180 && distance > 18) setNavHidden(true);
      if (nextDirection < 0 && distance > 12) setNavHidden(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <header className="desktop-primary-header" style={{ transform: `translateX(-50%) scale(${scale})` }}>
    <div className="desktop-primary-top">
      <div className="desktop-primary-top-inner">
        <div className="desktop-registration">
          <span>{copy('3:300')}<strong>{copy('3:303')}</strong></span>
          <span>{copy('3:301')}<strong>{copy('3:304')}</strong></span>
          <span>{copy('3:302')}<strong>{copy('3:305')}</strong></span>
        </div>
        <img className="desktop-primary-brand" src={image('3:299')} alt="Bhutan Tours & Trek Operator" width="200" height="54"/>
        <div className="desktop-primary-contacts">
          <span><i aria-hidden="true"><Mail size={13}/></i><span>{copy('3:306')}<strong>{copy('3:309')}</strong></span></span>
          <span><i aria-hidden="true"><Phone size={13}/></i><span>{copy('3:307')}<strong>{copy('3:308')}</strong></span></span>
        </div>
      </div>
    </div>
    <nav className={`desktop-primary-nav${navHidden ? ' is-hidden' : ''}`} aria-label="Main navigation" aria-hidden={navHidden} inert={navHidden}>
      <div>{navigation.map(name => <button type="button" key={name}>{name}</button>)}</div>
    </nav>
  </header>;
}
