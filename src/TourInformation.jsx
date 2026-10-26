import { ChevronDown } from 'lucide-react';
import { copy, image } from './design-data';
import './responsive-fonts.css';
import './tour-information.css';

const topics = ['Communication in Bhutan', 'Bhutanese Food', 'Bhutanese Drink For Travellers', 'Electricity'];

export default function TourInformation({ desktop = false }) {
  const titleId = desktop ? 'tour-information-desktop-title' : 'tour-information-mobile-title';

  return <section className={`tour-information${desktop ? ' tour-information-desktop' : ''}`} aria-labelledby={titleId}>
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
          {topics.map(topic => <button type="button" key={topic}>{topic}<ChevronDown size={20} strokeWidth={1.8} aria-hidden="true"/></button>)}
        </div>
      </div>
    </div>
  </section>;
}
