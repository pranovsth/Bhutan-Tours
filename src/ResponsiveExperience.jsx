import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Mail, Menu, Phone, X } from 'lucide-react';
import { Composition } from './Artwork';
import { copy, image } from './design-data';
import TravelSections from './TravelSections';
import TrustShowcase from './TrustShowcase';
import FeaturedShowcase from './FeaturedShowcase';
import JourneyInsights from './JourneyInsights';
import TestimonialsShowcase from './TestimonialsShowcase';
import PrayerFlagDivider from './PrayerFlagDivider';
import TourInformation from './TourInformation';
import { navigation } from './site-navigation';
import useHeroCloudMotion from './useHeroCloudMotion';
import useScrollReveals from './useScrollReveals';
import './responsive-fonts.css';
import '@fontsource/inter/latin-700.css';
import './responsive.css';

const holidays=[
  {title:'3:346',image:'3:345',price:'3:350',days:'3:351',description:'An inviting introduction to Bhutan’s landmarks and mountain scenery.'},
  {title:'7:749',image:'7:748',price:'7:752',days:'7:753',description:'A Bhutan journey planned for travellers starting from Singapore.'},
  {title:'7:769',image:'7:768',price:'7:772',days:'7:773',description:'Discover living traditions, warm hospitality, and Himalayan culture.'},
];
function DummyButton({children,outline=false,className='',...props}){
  const reduced=useReducedMotion();
  return <motion.button type="button" className={`responsive-button ${outline?'outline':''} ${className}`} {...(!reduced?{whileTap:{scale:.97},whileHover:{y:-2},transition:{duration:.22,ease:[.22,1,.36,1]}}:{})} {...props}>{children}</motion.button>;
}

function Header(){
  const [open,setOpen]=useState(false);
  const header=useRef(null),toggle=useRef(null);
  const reduced=useReducedMotion();
  useEffect(()=>{
    if(!open)return;
    const key=e=>{if(e.key==='Escape'){setOpen(false);toggle.current?.focus();}};
    const outside=e=>{if(!header.current?.contains(e.target))setOpen(false);};
    document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
    return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
  },[open]);
  return <header className="responsive-header" ref={header}>
    <div className="header-bar responsive-container">
      <img className="responsive-brand" src={image('3:299')} alt="Bhutan Tours & Trek Operator" width="200" height="54" decoding="async"/>
      <div className="header-actions">
        <button type="button" className="contact-shortcut" aria-label="Contact Bhutan Tours"><Phone size={19}/><span>{copy('3:308')}</span></button>
        <button type="button" className="menu-toggle" ref={toggle} aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}>{open?<X size={24}/>:<Menu size={24}/>}</button>
      </div>
    </div>
    <AnimatePresence>{open&&<motion.nav id="mobile-navigation" className="mobile-navigation" aria-label="Main navigation" initial={reduced?false:{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={reduced?undefined:{opacity:0,y:-8}} transition={{duration:.25,ease:[.22,1,.36,1]}}>
      <div className="responsive-container">{navigation.map(name=><button type="button" key={name} onClick={()=>setOpen(false)}>{name}<ArrowRight size={16}/></button>)}</div>
    </motion.nav>}</AnimatePresence>
  </header>;
}

function Hero(){
  const cover=useRef(null);
  const holidayRail=useRef(null);
  const [activeHoliday,setActiveHoliday]=useState(0);
  const reduced=useReducedMotion();
  useHeroCloudMotion(cover);
  const showHoliday=index=>holidayRail.current?.scrollTo({left:holidayRail.current.clientWidth*index,behavior:reduced?'instant':'smooth'});
  const onHolidayScroll=event=>setActiveHoliday(Math.min(holidays.length-1,Math.round(event.currentTarget.scrollLeft/event.currentTarget.clientWidth)));
  return <section className="responsive-hero" aria-label="Discover Bhutan">
    <div className="hero-cover" ref={cover}>
      <Composition className="hero-backdrop" ids={['3:290','3:291','3:292','3:293','3:294','3:295']} viewBox={[0,90,1600,810]} label="Tiger's Nest monastery on the Himalayan mountainside"/>
      <div className="hero-cover-shade"/>
      <div className="responsive-hero-copy responsive-container"><p>{copy('8:799')}</p><h1>{copy('3:296')}</h1></div>
      <Composition className="hero-foreground" ids={['3:297']} viewBox={[0,90,1600,810]}/>
    </div>
    <div className="holiday-section"><div className="responsive-container">
      <h2>{copy('7:785')}</h2>
      <div className="holiday-list" ref={holidayRail} tabIndex="0" aria-label="Best selling holidays. Swipe or use the arrow keys to see all tours" onScroll={onHolidayScroll} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showHoliday(Math.max(0,Math.min(holidays.length-1,activeHoliday+(event.key==='ArrowRight'?1:-1))));}}}>{holidays.map(tour=><article className="holiday-card" key={tour.title}>
        <img src={image(tour.image)} alt="" width="155" height="108" decoding="async"/>
        <div><h3><button type="button">{copy(tour.title)}</button></h3><p className="holiday-card-description">{tour.description}</p><div className="holiday-meta"><span>{copy(tour.price)}</span><span>{copy(tour.days)}</span></div></div>
      </article>)}</div>
      <div className="holiday-bottom-row">
        <div className="holiday-pagination" aria-label="Choose a holiday card">{holidays.map((tour,index)=><button key={tour.title} type="button" aria-label={`Show holiday ${index+1} of ${holidays.length}`} aria-current={activeHoliday===index?'true':undefined} onClick={()=>showHoliday(index)}/>)}</div>
        <button type="button" className="holiday-more">{copy('3:333')}<ArrowRight size={16}/></button>
      </div>
    </div></div>
  </section>;
}

function Introduction(){
  return <section className="responsive-intro responsive-container responsive-section">
    <Composition className="intro-composition" ids={['8:1006','8:1010','8:1008']} viewBox={[170,1000,550,640]} label="A Bhutanese monk beside traditional monastery architecture"/>
    <div className="responsive-intro-copy"><h2>{copy('3:390')}</h2><p className="intro-greeting">{copy('3:388')}</p>{copy('3:389').split(/\r?\n\r?\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}<DummyButton>{copy('3:393')}</DummyButton></div>
  </section>;
}

function Trust(){
  return <TrustShowcase/>;
}

function Featured(){return <FeaturedShowcase/>;}

function Why(){return <>
  <section className="responsive-why responsive-container responsive-section">
    <Composition className="why-composition" ids={['59:284','59:281','59:283']} viewBox={[765,2970,650,510]} label="A Bhutanese festival dancer in front of traditional architecture"/>
    <div className="responsive-why-copy"><h2>{copy('7:667')}</h2><p>{copy('7:668')}</p><p>{copy('58:72')}</p><DummyButton>{copy('7:671')}</DummyButton></div>
  </section>
  <JourneyInsights/>
</>;}

function Footer(){
  const [email,setEmail]=useState('');
  return <footer className="responsive-footer"><div className="responsive-container footer-content">
      <div className="footer-about"><h2>{copy('455:1076')}</h2><p>{copy('455:1040')}</p><p>{copy('455:1041')}</p></div>
      <div><h3>{copy('455:1043')}</h3><nav aria-label="Footer navigation">{['455:1044','455:1045','455:1046','455:1047','455:1048','455:1049'].map(id=><button type="button" key={id}>{copy(id)}</button>)}</nav></div>
      <div className="footer-contact"><h3>{copy('455:1051')}</h3><p>{copy('455:1052')}</p><p><Phone size={15}/>{copy('455:1055')}</p><p><Mail size={15}/>{copy('455:1057')}</p></div>
      <div className="footer-social"><h3>{copy('455:1063')}</h3><div className="social-links">{[{name:'Twitter',id:'455:1068',viewBox:[0,30,21,21]},{name:'Facebook',id:'455:1066',viewBox:[36,29,21,21]},{name:'Instagram',id:'455:1065',viewBox:[72,29,20,20]}].map(social=><button type="button" key={social.name} aria-label={social.name}><Composition ids={[social.id]} viewBox={social.viewBox}/></button>)}</div>
        <form onSubmit={e=>e.preventDefault()}><label htmlFor="responsive-email">{copy('455:1064')}</label><div className="responsive-newsletter"><input id="responsive-email" type="email" aria-label="Enter your e-mail" placeholder={copy('455:1073')} value={email} onChange={e=>setEmail(e.target.value)}/><button type="submit" aria-label="Subscribe to email alerts"><ArrowRight size={19}/></button></div></form>
      </div>
      <dl className="responsive-registration"><div><dt>{copy('3:300')}</dt><dd>{copy('3:303')}</dd></div><div><dt>{copy('3:301')}</dt><dd>{copy('3:304')}</dd></div><div><dt>{copy('3:302')}</dt><dd>{copy('3:305')}</dd></div></dl>
    </div></footer>;
}

export default function ResponsiveExperience(){
  const site=useRef(null);
  useScrollReveals(site);
  return <div className="responsive-site" ref={site}><Header/><main><Hero/><Introduction/><Trust/><Featured/><Why/><TestimonialsShowcase/><TourInformation/><PrayerFlagDivider/><TravelSections/></main><Footer/></div>;
}
