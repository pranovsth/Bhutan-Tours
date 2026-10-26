import { BookOpenText, CloudSun } from 'lucide-react';
import './responsive-fonts.css';
import './journey-insights.css';

const essentials = [
  {
    number: '01',
    label: 'YOUR PEOPLE',
    icon: BookOpenText,
    title: 'Guides who bring Bhutan to life',
    description: 'Travel with licensed local guides who know the country’s history, culture, religion, and landscapes. Their insight gives each place a story beyond the view.',
    detail: 'English-speaking guides are available. Ask us about support in other languages when planning your journey.',
    tags: ['History', 'Culture', 'Nature'],
  },
  {
    number: '02',
    label: 'YOUR SEASONS',
    icon: CloudSun,
    title: 'Weather worth planning for',
    description: 'Spring and autumn often bring comfortable travel days. Winter mornings can be cold, while July and August usually bring more rain.',
    detail: 'Conditions change with altitude, so bring layers and leave some room in your plans for mountain weather.',
    tags: ['Spring & autumn', 'Winter layers', 'Summer rain'],
  },
];

export default function JourneyInsights({ desktop = false }) {
  return <section className={`journey-insights${desktop ? ' journey-insights-desktop' : ''}`} aria-label="Bhutan travel essentials">
    <div className="journey-essentials" aria-labelledby={desktop ? 'essentials-desktop-title' : 'essentials-mobile-title'}>
      <div className="journey-insights-inner">
        <header className="journey-essentials-header">
          <span className="journey-kicker">TRAVEL ESSENTIALS</span>
          <h2 id={desktop ? 'essentials-desktop-title' : 'essentials-mobile-title'}>Good to know before you go</h2>
          <p>Helpful details for a journey that feels considered from the start.</p>
        </header>
        <div className="journey-essentials-grid">
          {essentials.map(item => {
            const Icon = item.icon;
            return <article className="journey-essential-card" key={item.number}>
              <div className="journey-essential-top"><span className="journey-essential-icon"><Icon size={25} strokeWidth={1.7} aria-hidden="true"/></span><span className="journey-essential-index">{item.number} / {item.label}</span></div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>{item.detail}</p>
              <div className="journey-essential-tags" aria-label={`${item.title} topics`}>{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            </article>;
          })}
        </div>
      </div>
    </div>
  </section>;
}
