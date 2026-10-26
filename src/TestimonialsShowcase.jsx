import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Star } from 'lucide-react';
import { copy } from './design-data';
import './responsive-fonts.css';
import './testimonials-showcase.css';

export default function TestimonialsShowcase({ desktop = false }) {
  const reducedMotion = useReducedMotion();
  const titleId = desktop ? 'testimonial-title-desktop' : 'testimonial-title-mobile';

  return <section className={`testimonial-showcase${desktop ? ' testimonial-showcase-desktop' : ''}`} aria-labelledby={titleId}>
    <div className="testimonial-showcase-inner">
      <div className="testimonial-intro">
        <span className="testimonial-kicker">TRAVELLER STORIES</span>
        <h2 id={titleId}>{copy('80:282')}</h2>
        <p>Every journey leaves a story. Here is one shared by a traveller who explored Bhutan with us.</p>
        <button type="button" className="testimonial-more">Read more<ArrowUpRight size={18} strokeWidth={1.8} aria-hidden="true"/></button>
      </div>

      <motion.figure className="testimonial-featured"
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: .72, ease: [.22, 1, .36, 1] }}>
        <div className="testimonial-featured-top">
          <span>IN THEIR WORDS</span>
          <span className="testimonial-review-stars" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={17} fill="currentColor" strokeWidth={1} aria-hidden="true"/>)}</span>
        </div>
        <span className="testimonial-quote-mark" aria-hidden="true">“</span>
        <blockquote>{copy('453:178')}</blockquote>
        <figcaption><span className="testimonial-avatar" aria-hidden="true">DH</span><span><strong>{copy('453:179')}</strong><small>Bhutan traveller</small></span></figcaption>
      </motion.figure>
    </div>
  </section>;
}
