import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, useReducedMotion } from 'framer-motion';
import design from './design/desktop-2.json';
import { LayerArt } from './Artwork';
import TravelSections from './TravelSections';
import TrustShowcase from './TrustShowcase';
import FeaturedShowcase from './FeaturedShowcase';
import JourneyInsights from './JourneyInsights';
import TestimonialsShowcase from './TestimonialsShowcase';
import PrayerFlagDivider from './PrayerFlagDivider';
import TourInformation from './TourInformation';
import DesktopHeader from './DesktopHeader';
import useHeroCloudMotion from './useHeroCloudMotion';
import useScrollReveals from './useScrollReveals';
import './styles.css';

const HeroDepth=lazy(()=>import('./HeroDepth.jsx'));
const ResponsiveExperience=lazy(()=>import('./ResponsiveExperience.jsx'));
const heroTagline=design.children.find(layer=>layer.id==='8:799');

// Every layer uses the original node's local transform. The 1600 × 6406
// composition scales as one unit, just like Figma's scale-down-width prototype.
const controls=new Map([
  ['3:432','Read More'],['7:669','Read More'],['453:183','Read more'],
  ['3:335','Next holidays'],['3:338','Previous holidays'],
  ['7:659','Next packages'],['7:662','Previous packages'],
  ['455:191','Next testimonial'],['455:1017','Previous testimonial'],
  ['3:343','Bhutan Tour short duration for 2020'],
  ['7:746','Bhutan Tours from Singapore 2020'],['7:766','Bhutan Culture Tour'],
  ['5:569','Paro Festival Tour 2020'],['5:566','Bhutan Culture Tour'],
  ['5:568','Bhutan spiritual pilgrimage tour'],
  ['3:333','View More Holidays'],['7:657','View More Packages'],
  ['455:1025','Communication in Bhutan'],['455:1026','Bhutanese Food'],
  ['455:1027','Bhutanese Drink For Travellers'],
  ['455:1065','Instagram'],['455:1066','Facebook'],['455:1068','Twitter'],
]);
const headings=new Set(['3:296','3:390','3:404','7:667','80:282','455:1018']);
const navNames=new Set(['Home','Bhutan Cultural Tours','Festival Tours','Trekking','Bhutan Info','Testimonials','About','FAQs','Blog','Contact','About us','Services','Our Team','Our Mission']);
const redesignedSourceNodes=new Set(['4:435','3:403','7:659','7:662','7:656','7:657','3:404','5:528','5:566','5:569','5:568','5:567','453:154','455:1013','80:271','453:184','455:152','455:170','80:282','453:183','455:191','455:1017','455:1035','455:1018','455:1030','455:1032','455:1033','455:1034','455:1015','455:1019','455:1025','455:1026','455:1027','455:1022','455:1024','455:1028','455:1029','3:298','3:299','3:300','3:301','3:302','3:303','3:304','3:305','3:306','3:307','3:308','3:309','3:310','3:317','3:318','3:319','3:320','3:325','3:326','3:327','3:328','3:329','3:330','3:331','3:332','8:799']);

function Layer({layer,insideButton=false}){
  const reduced=useReducedMotion();
  const interactive=!insideButton&&(controls.has(layer.id)||navNames.has(layer.text));
  const Tag=interactive?motion.button:'div';
  const style={width:layer.w,height:layer.h,transform:`matrix(${layer.m.join(',')})`,opacity:layer.opacity,filter:layer.filter||undefined,overflow:layer.clip?'hidden':undefined};
  const level=layer.id==='3:296'?1:2;
  return <Tag className={`design-layer ${interactive?'dummy-control':''}`} style={style} data-node-id={layer.id} data-layer-name={layer.name}
    aria-hidden={redesignedSourceNodes.has(layer.id)?true:undefined}
    data-replaced={redesignedSourceNodes.has(layer.id)||undefined}
    {...(interactive?{type:'button','aria-label':controls.get(layer.id)||layer.text}:headings.has(layer.id)?{role:'heading','aria-level':level}:{})}>
    <motion.div className="layer-content" {...(interactive&&!reduced?{whileHover:{y:-1.5},whileTap:{scale:.985},transition:{duration:.22,ease:[.22,1,.36,1]}}:{})}>
      <LayerArt layer={layer}/>
      {layer.id==='3:297'&&!reduced&&<Suspense fallback={null}><HeroDepth layer={layer}/></Suspense>}
      {layer.text&&<span className="accessible-copy">{layer.text}</span>}
      {layer.children?.map(child=><Layer key={child.id} layer={child} insideButton={insideButton||interactive}/>)}
    </motion.div>
  </Tag>;
}

function DesktopExperience(){
  const host=useRef(null),stage=useRef(null),extension=useRef(null);
  useHeroCloudMotion(stage);
  useScrollReveals(stage,true);
  const [scale,setScale]=useState(()=>Math.min(1,document.documentElement.clientWidth/design.w));
  const [email,setEmail]=useState('');
  const [travelShift,setTravelShift]=useState(1276);
  const [infoHeight,setInfoHeight]=useState(460);
  const infoExpansion=Math.max(0,infoHeight-460);
  const footerShift=travelShift+infoExpansion;
  useLayoutEffect(()=>{
    const observer=new ResizeObserver(([entry])=>setScale(Math.min(1,entry.contentRect.width/design.w)));
    observer.observe(host.current);return()=>observer.disconnect();
  },[]);
  useLayoutEffect(()=>{
    // The tighter testimonial section moves all following sections up 279px.
    // The original footer starts at 6030; travel content starts at 5776.
    const observer=new ResizeObserver(([entry])=>setTravelShift(Math.ceil(entry.contentRect.height)+25-279));
    observer.observe(extension.current);return()=>observer.disconnect();
  },[]);
  return <main className="prototype" ref={host} aria-label="Bhutan Tours & Trek Operator">
    <DesktopHeader scale={scale}/>
    <div className="prototype-viewport" style={{height:(design.h+footerShift)*scale,width:design.w*scale}}>
      <div className="design-stage" ref={stage} data-extension-height={footerShift} style={{width:design.w,height:design.h+footerShift,transform:`scale(${scale})`}}>
        {design.children.map(layer=>{
          const shifted=layer.id==='455:1035'||layer.m[5]>=6030;
          const placed=shifted?{...layer,m:[...layer.m.slice(0,5),layer.m[5]+footerShift]}:layer;
          return <Layer layer={placed} key={layer.id}/>;
        })}
        <p className="desktop-hero-tagline"><LayerArt layer={heroTagline}/><span className="accessible-copy">{heroTagline.text}</span></p>
        <div className="desktop-trust-extension"><TrustShowcase desktop/></div>
        <div className="desktop-feature-extension"><FeaturedShowcase desktop/></div>
        <div className="desktop-journey-extension"><JourneyInsights desktop/></div>
        <div className="desktop-testimonial-extension"><TestimonialsShowcase desktop/></div>
        <div className="desktop-info-extension"><TourInformation desktop onHeightChange={setInfoHeight}/></div>
        <div className="desktop-prayer-divider" style={{top:5200+infoExpansion}}><PrayerFlagDivider desktop/></div>
        <div className="desktop-travel-extension" style={{top:5776+infoExpansion}} ref={extension}><TravelSections/></div>
        <form className={`email-demo ${email?'has-value':''}`} style={{top:6256+footerShift}} onSubmit={e=>e.preventDefault()} aria-label="Newsletter demonstration">
          <input type="email" aria-label="Enter your e-mail" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your e-mail"/>
          <button type="submit" aria-label="Subscribe to email alerts"/>
        </form>
      </div>
    </div>
  </main>;
}

function App(){
  const [compact,setCompact]=useState(()=>window.matchMedia('(max-width: 1099px)').matches);
  useEffect(()=>{const query=window.matchMedia('(max-width: 1099px)');const update=()=>setCompact(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  return compact?<Suspense fallback={<div className="responsive-loading" aria-label="Loading Bhutan Tours"/>}><ResponsiveExperience/></Suspense>:<DesktopExperience/>;
}

createRoot(document.getElementById('root')).render(<App/>);
