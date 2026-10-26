import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './responsive-fonts.css';
import './travel-sections.css';

const travelTopics = [
  {
    label: 'Bhutan Festivals',
    heading: 'Bhutan has many festivals throughout the year.',
    image: '/assets/media/festival-card.webp',
    alt: 'A brightly dressed masked dancer at a Bhutanese festival',
    paragraphs: [
      'Monastery courtyards come alive with sacred mask dances, music and richly woven dress. Bhutan’s tshechus bring communities together in celebrations that carry generations of faith and tradition.',
      'Make a festival part of your journey, from a grand gathering in Paro to a smaller celebration in a mountain valley. Allow time to watch, listen and experience the occasion with respect.',
    ],
    action: 'View All Festivals',
  },
  {
    label: 'Tourist Visa',
    heading: 'The first step to your journey.',
    image: '/assets/media/punakha-card.webp',
    alt: 'Traditional Bhutanese architecture in a green mountain valley',
    paragraphs: [
      'Begin your journey by checking the visa or entry-permit process for your nationality. Applications can be made online, with a certified tour operator or hotel able to help with the arrangements.',
      'Keep your travel documents and intended dates ready, and confirm the latest requirements before departure. A little preparation leaves more time to look forward to Bhutan.',
    ],
    action: 'Plan Your Visit',
  },
  {
    label: 'Budget Tariff',
    heading: 'A journey planned around you.',
    image: '/assets/media/punakha-dzong-900.webp',
    alt: 'Punakha Dzong beside the river in Bhutan',
    paragraphs: [
      'Shape your trip around the places you want to explore, your preferred accommodation and the pace that suits you. Plan for your stay, transport, guide, meals and chosen experiences.',
      'Bhutan’s Sustainable Development Fee also contributes to the country’s future, supporting education, healthcare, cultural preservation and environmental conservation. Confirm current fees and your itinerary before travelling.',
    ],
    action: 'Explore Tour Options',
  },
  {
    label: 'How to get Bhutan',
    heading: 'Your Himalayan journey begins.',
    image: '/assets/media/punakha-card.webp',
    alt: 'A peaceful valley surrounded by Bhutan’s Himalayan mountains',
    paragraphs: [
      'Arrive by air into Paro, with services operated by Drukair and Bhutan Airlines, or plan an overland journey through an official border entry point from India.',
      'Continue through Bhutan with a local driver and guide, taking time for the valleys and mountain roads along the way. Check flight schedules and entry arrangements when planning your route.',
    ],
    action: 'Plan Your Journey',
  },
  {
    label: 'Accommodations',
    heading: 'Stay close to the heart of Bhutan.',
    image: '/assets/media/courtyard.webp',
    alt: 'Ornate Bhutanese architecture surrounding a quiet courtyard',
    paragraphs: [
      'Choose from characterful hotels, peaceful resorts and welcoming village homestays. Traditional architecture, natural surroundings and Bhutanese hospitality make each stay part of the experience.',
      'A homestay offers a closer connection to everyday life, from family meals to local routines. Find a setting that fits your journey, whether you prefer a quiet retreat or a base for exploring.',
    ],
    action: 'Explore Places to Stay',
  },
];

const glanceFacts = [
  { label: 'Capital city', value: 'Thimphu' },
  { label: 'Population', value: '784,043', note: '2025 projection' },
  { label: 'Currency', value: 'Ngultrum', note: 'Nu.' },
  { label: 'Dialling code', value: '+975' },
  { label: 'Time zone', value: 'UTC +06:00', note: 'Bhutan Time' },
  { label: 'Language', value: 'Dzongkha', note: 'Official · English widely used' },
  { label: 'Electricity', value: '230 V · 50 Hz', note: 'Plug types C, D and G' },
];

export default function TravelSections() {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef([]);
  const id = useId();
  const reduced = useReducedMotion();
  const topic = travelTopics[selected];

  function handleTabKey(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % travelTopics.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + travelTopics.length) % travelTopics.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = travelTopics.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
    tabRefs.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }

  return <div className="travel-additions">
    <section className="bhutan-glance" aria-labelledby={`${id}-glance-title`}>
      <div className="travel-container">
        <header className="glance-header">
          <div><span className="glance-kicker">THE KINGDOM, SIMPLY PUT</span><h2 className="section-heading" id={`${id}-glance-title`}>Bhutan in a Glance</h2></div>
          <p>A few essentials to know before you set out, and a glimpse of the places and people that make the journey memorable.</p>
        </header>
        <div className="glance-gallery" aria-label="Scenes from Bhutan">
          <figure className="glance-gallery-flag"><img src="/assets/media/flag-of-bhutan.svg" alt="Bhutan’s yellow and orange national flag with a white dragon" width="900" height="600" loading="lazy" decoding="async"/><figcaption>THE FLAG</figcaption></figure>
          <figure className="glance-gallery-place"><img src="/assets/media/punakha-dzong-900.webp" srcSet="/assets/media/punakha-dzong-900.webp 900w, /assets/media/punakha-dzong-1800.webp 1800w" sizes="(max-width: 699px) calc(100vw - 48px), (max-width: 1099px) 40vw, 640px" alt="Punakha Dzong beside the river in Bhutan" title="Photo by Bernard Gagnon, CC BY-SA 4.0" width="1800" height="1200" loading="lazy" decoding="async"/><figcaption>THE PLACES</figcaption></figure>
          <figure className="glance-gallery-person"><img src="/assets/media/bhutanese-people-600.webp" srcSet="/assets/media/bhutanese-people-600.webp 600w, /assets/media/bhutanese-people-1200.webp 1200w" sizes="(max-width: 699px) 50vw, (max-width: 1099px) 25vw, 350px" alt="A Bhutanese mother and daughter together in Tsakaling" title="Photo by Christopher J. Fynn, CC BY-SA 3.0" width="1200" height="1200" loading="lazy" decoding="async"/><figcaption>THE PEOPLE</figcaption></figure>
        </div>
        <dl className="glance-fact-grid" aria-label="Bhutan travel facts">{glanceFacts.map((fact, index) => <div className="glance-fact-card" key={fact.label}>
          <span className="glance-fact-index" aria-hidden="true">0{index + 1} / 07</span>
          <dt>{fact.label}</dt><dd>{fact.value}{fact.note && <small>{fact.note}</small>}</dd>
        </div>)}</dl>
      </div>
    </section>
    <section className="travel-planning travel-container" aria-label="Plan your Bhutan journey">
      <div className="travel-tab-strip">
        <div className="travel-tabs" role="tablist" aria-label="Bhutan travel information">
          {travelTopics.map((item, index) => <button
            key={item.label}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={selected === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            ref={element => { tabRefs.current[index] = element; }}
            onClick={() => setSelected(index)}
            onKeyDown={event => handleTabKey(event, index)}
          >{item.label}</button>)}
        </div>
      </div>
      <motion.div
        className="travel-panel"
        role="tabpanel"
        key={selected}
        id={`${id}-panel-${selected}`}
        aria-labelledby={`${id}-tab-${selected}`}
        tabIndex={0}
        initial={reduced ? false : { opacity: .4, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .36, ease: [.22, 1, .36, 1] }}
      >
        <div className="travel-panel-image"><img src={topic.image} alt={topic.alt} width="400" height="320" loading="lazy" decoding="async"/></div>
        <div className="travel-panel-copy">
          <h2 className="section-heading">{topic.heading}</h2>
          <div className="travel-panel-paragraphs">{topic.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
          <motion.button type="button" className="travel-action" {...(!reduced ? { whileHover: { y: -2 }, whileTap: { scale: .97 } } : {})}>
            {topic.action}<ArrowRight size={17} aria-hidden="true"/>
          </motion.button>
        </div>
      </motion.div>
      {travelTopics.map((item, index) => index !== selected && <div
        key={item.label}
        id={`${id}-panel-${index}`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${index}`}
        hidden
      />)}
    </section>
  </div>;
}
