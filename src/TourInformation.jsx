import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { copy, image } from './design-data';
import './responsive-fonts.css';
import './tour-information.css';

const topics = [
  {
    title: 'Communication in Bhutan',
    body: 'Your guide can help with everyday conversations, local greetings, and questions along the way. Take your time, ask freely, and enjoy meeting the people behind each place.',
  },
  {
    title: 'Bhutanese Food',
    body: 'Meals are a chance to slow down and share the day. Try a comforting local dish, ask for a milder option, or choose familiar favourites whenever you prefer.',
  },
  {
    title: 'Bhutanese Drink For Travellers',
    body: 'Make room for a tea break between mountain views and village walks. Your guide can suggest a welcoming place to pause and enjoy a warm or refreshing drink.',
  },
  {
    title: 'Electricity',
    body: 'Keep your camera and phone ready for the next stop. A universal travel adapter and a small power bank are handy additions to your day bag.',
  },
];

export default function TourInformation({ desktop = false, onHeightChange }) {
  const titleId = desktop ? 'tour-information-desktop-title' : 'tour-information-mobile-title';
  const idPrefix = desktop ? 'desktop-tour-topic' : 'mobile-tour-topic';
  const section = useRef(null);
  const [openTopic, setOpenTopic] = useState(null);

  useLayoutEffect(() => {
    if (!desktop || !onHeightChange) return;
    const observer = new ResizeObserver(([entry]) => onHeightChange(Math.ceil(entry.contentRect.height)));
    observer.observe(section.current);
    return () => observer.disconnect();
  }, [desktop, onHeightChange]);

  return <section ref={section} className={`tour-information${desktop ? ' tour-information-desktop' : ''}`} aria-labelledby={titleId}>
    <div className="tour-information-inner">
      <img className="tour-information-photo" src={image('455:1015')} alt="A monk crossing a bridge lined with prayer flags" width="347" height="508" loading="lazy" decoding="async"/>
      <div className="tour-information-content">
        <h2 id={titleId}>{copy('455:1018')}</h2>
        <div className="tour-information-culture">
          <h3>{copy('455:1019')}</h3>
          <div className="tour-information-columns">
            <p>Our government-trained and licensed guides know Bhutan’s history, culture, religion, and landscapes.</p>
            <p>Friendly and fluent in English, they can also help arrange guides who speak Chinese, French, Italian, or Spanish.</p>
          </div>
        </div>
        <div className="tour-information-rows" aria-label="More Bhutan tour information">
          {topics.map((topic, index) => {
            const isOpen = openTopic === index;
            const buttonId = `${idPrefix}-button-${index}`;
            const panelId = `${idPrefix}-panel-${index}`;
            return <div className="tour-information-item" key={topic.title}>
              <h3 className="tour-information-item-heading">
                <button id={buttonId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenTopic(isOpen ? null : index)}>
                  <span>{topic.title}</span><ChevronDown size={20} strokeWidth={1.8} aria-hidden="true"/>
                </button>
              </h3>
              <div id={panelId} className="tour-information-panel" data-open={isOpen} role="region" aria-labelledby={buttonId} aria-hidden={!isOpen} inert={!isOpen}>
                <div className="tour-information-panel-inner"><p>{topic.body}</p></div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  </section>;
}
