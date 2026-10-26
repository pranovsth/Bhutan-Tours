import { useLayoutEffect, useRef, useState } from 'react';
import { sourceNode } from './design-data';

const eagerArtwork=new Set(['3:290','3:292','3:293','3:294','3:295','3:296','3:297','3:299','3:345','7:748','7:768','8:799']);
const demoContactArtwork=new Set(['3:303','3:304','3:305','3:308','3:309','455:1052','455:1055','455:1056','455:1057']);

export function LayerArt({layer}){
  if(demoContactArtwork.has(layer.id)) return <span className="demo-contact-art" style={{fontFamily:`'${layer.font.family}',serif`,fontSize:layer.font.size,fontWeight:layer.font.style==='Bold'?700:400,lineHeight:layer.h>20?'15px':`${layer.h}px`,color:layer.id.startsWith('455:')?'#fff':layer.id==='3:308'||layer.id==='3:309'?'#353535':'#8d8d8d'}}>{layer.text}</span>;
  const hero=layer.id==='3:290';
  const eager=eagerArtwork.has(layer.id);
  if(layer.image){
    // Intrinsic image boxes preserve the source crop under browser zoom.
    const {w,h,m}=layer.image;
    const transform=[m[0]/w,m[1]/w,m[2]/h,m[3]/h,m[4],m[5]];
    return <div className="image-mask" style={{clipPath:`path('${layer.clipPath}')`}}>
      <img className="source-image" src={layer.image.src} {...(hero?{srcSet:'/assets/media/hero-1600.webp 1600w, /assets/media/hero-2200.webp 2200w, /assets/media/hero-3400.webp 3400w',sizes:'(max-width: 1099px) 100vw, 1600px',fetchPriority:'high'}:{})} alt="" draggable="false" width={w} height={h} loading={eager?'eager':'lazy'} decoding="async" style={{width:w,height:h,transform:`matrix(${transform.join(',')})`}}/>
    </div>;
  }
  if(layer.src){const p=layer.artPadding||0;return <img className="source-art" src={layer.src} alt="" aria-hidden="true" draggable="false" loading={eager?'eager':'lazy'} decoding="async" style={{left:-p,top:-p}} width={Math.max(layer.w,1)+p*2} height={Math.max(layer.h,1)+p*2}/>;}
  return null;
}

function StaticLayer({layer}){
  return <div className="design-layer" data-node-id={layer.id} style={{width:layer.w,height:layer.h,transform:`matrix(${layer.m.join(',')})`,opacity:layer.opacity,filter:layer.filter||undefined,overflow:layer.clip?'hidden':undefined}}>
    <div className="layer-content"><LayerArt layer={layer}/>{layer.children?.map(child=><StaticLayer layer={child} key={child.id}/>)}</div>
  </div>;
}

// Only decorative compositions retain their original local geometry. All
// responsive text and page sections use normal document flow.
export function Composition({ids,viewBox,className='',label}){
  const host=useRef(null),[scale,setScale]=useState(0);
  const [x,y,w,h]=viewBox;
  useLayoutEffect(()=>{const observer=new ResizeObserver(([entry])=>setScale(entry.contentRect.width/w));observer.observe(host.current);return()=>observer.disconnect();},[w]);
  return <div className={`source-composition ${className}`} ref={host} style={{aspectRatio:`${w}/${h}`}} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true}>
    <div className="composition-scale" style={{width:w,height:h,transform:`scale(${scale})`}}>
      <div className="composition-offset" style={{transform:`translate(${-x}px,${-y}px)`}}>{ids.map(id=><StaticLayer key={id} layer={sourceNode(id)}/>)}</div>
    </div>
  </div>;
}
