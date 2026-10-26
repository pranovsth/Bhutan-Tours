import './responsive-fonts.css';
import './trust-showcase.css';

const reasons = [
  {
    number: '01',
    label: 'MADE FOR YOU',
    title: 'Thoughtful value',
    description: 'Our Bhutan-based team and local guides shape each itinerary around your interests and pace, with clear options for cultural tours and a hike to Tiger’s Nest.',
  },
  {
    number: '02',
    label: 'LOCAL KNOWLEDGE',
    title: 'People who know Bhutan',
    description: 'Experienced travelers and local partners bring practical knowledge of the routes, places to stay, and details that make a journey feel effortless.',
  },
  {
    number: '03',
    label: 'SINCE 2004',
    title: 'Travel with confidence',
    description: 'Our English-speaking guides share Bhutan’s valleys, towns, and remote villages through the lens of local culture, making every day feel personal.',
  },
];

export default function TrustShowcase({ desktop = false }) {
  return <section className={`trust-showcase${desktop ? ' trust-showcase-desktop' : ''}`} aria-label="Why travel with us">
    <div className="trust-showcase-inner">
      <div className="trust-showcase-intro">THE PEOPLE BEHIND YOUR JOURNEY</div>
      <div className="trust-showcase-grid">
        {reasons.map(reason => <article className="trust-showcase-card" key={reason.number}>
          <div className="trust-card-top"><span className="trust-crest" aria-hidden="true">✦</span><span className="trust-card-index">{reason.number} / {reason.label}</span></div>
          <h2>{reason.title}</h2>
          <p>{reason.description}</p>
        </article>)}
      </div>
    </div>
  </section>;
}
