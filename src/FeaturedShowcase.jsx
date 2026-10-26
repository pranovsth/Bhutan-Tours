import { ArrowRight, ArrowUpRight, Clock3 } from 'lucide-react';
import { image } from './design-data';
import './responsive-fonts.css';
import './featured-showcase.css';

const journeys = [
  {
    category: 'FESTIVALS',
    title: 'Paro Festival Journey',
    description: 'See the vibrant masked dances of Paro Tshechu, then explore the valley’s monasteries, landscapes, and everyday life.',
    image: image('5:503'),
    alt: 'A colourful masked dancer at a Bhutanese festival',
  },
  {
    category: 'CULTURE',
    title: 'Bhutan Culture Tour',
    description: 'Travel through central and western Bhutan, discovering the people, crafts, and living traditions that shape each valley.',
    image: image('5:504'),
    alt: 'Children dressed for a Bhutanese cultural celebration',
  },
  {
    category: 'PILGRIMAGE',
    title: 'Sacred Bhutan Pilgrimage',
    description: 'Take a slower path through sacred landscapes and monasteries, with time to hear the stories behind Bhutan’s spiritual traditions.',
    image: image('5:505'),
    alt: 'Traditional Bhutanese monastery architecture',
  },
];

export default function FeaturedShowcase({ desktop = false }) {
  return <section className={`feature-showcase${desktop ? ' feature-showcase-desktop' : ''}`} aria-labelledby={desktop ? 'featured-journeys-desktop' : 'featured-journeys-mobile'}>
    <div className="feature-showcase-inner">
      <header className="feature-showcase-header">
        <span className="feature-kicker">CURATED JOURNEYS</span>
        <h2 id={desktop ? 'featured-journeys-desktop' : 'featured-journeys-mobile'}>Featured journeys through Bhutan</h2>
        <p>Festivals, living culture, and sacred places. Find the journey that speaks to you.</p>
      </header>
      <div className="feature-showcase-grid">
        {journeys.map((journey, index) => <article className="feature-journey" key={journey.category}>
          <div className="feature-journey-photo">
            <img src={journey.image} alt={journey.alt} width="400" height="240" loading="lazy" decoding="async"/>
            <span className="feature-category">{journey.category}</span>
            <span className="feature-number" aria-hidden="true">0{index + 1}</span>
          </div>
          <div className="feature-journey-body">
            <h3>{journey.title}</h3>
            <p>{journey.description}</p>
            <div className="feature-journey-bottom">
              <span className="feature-duration"><Clock3 size={16} aria-hidden="true"/>3 days</span>
              <button type="button" aria-label={`Explore ${journey.title}`}>Explore tour<ArrowUpRight size={18} aria-hidden="true"/></button>
            </div>
          </div>
        </article>)}
      </div>
      <button type="button" className="feature-showcase-more">View More Packages<ArrowRight size={18} aria-hidden="true"/></button>
    </div>
  </section>;
}
