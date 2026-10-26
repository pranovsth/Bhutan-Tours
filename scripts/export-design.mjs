import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Export the original local Figma node geometry, without approximating layout.
const doc=JSON.parse(fs.readFileSync('design-reference/document.json','utf8'));
const key=n=>`${n.sessionID}:${n.localID}`;
const nodes=new Map(doc.nodeChanges.map(n=>[key(n.guid),n]));
const children=new Map();
for(const n of doc.nodeChanges){if(!n.parentIndex)continue;const p=key(n.parentIndex.guid);if(!children.has(p))children.set(p,[]);children.get(p).push(n);}
for(const list of children.values())list.sort((a,b)=>a.parentIndex.position<b.parentIndex.position?-1:1);
const output='public/assets/figma';
fs.mkdirSync(output,{recursive:true});fs.mkdirSync('src/design',{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const num=x=>Math.round(x*1e6)/1e6;
const rgb=c=>`rgb(${num(c.r*255)},${num(c.g*255)},${num(c.b*255)})`;
const rgba=c=>`rgba(${num(c.r*255)},${num(c.g*255)},${num(c.b*255)},${c.a??1})`;
const matrix=m=>`matrix(${m.m00} ${m.m10} ${m.m01} ${m.m11} ${m.m02} ${m.m12})`;
const paths=new Map();
function decode(index){if(paths.has(index))return paths.get(index);const b=Buffer.from(doc.blobs[index].bytes);let p='';for(let o=0;o<b.length;){const op=b[o++],count=[0,2,2,4,6][op];if(count===undefined)throw Error(`Invalid path ${index} opcode ${op}`);const a=[];for(let j=0;j<count;j++,o+=4)a.push(num(b.readFloatLE(o)));if(op!==0||p)p+=['Z','M','L','Q','C'][op]+a.join(' ');}paths.set(index,p);return p;}
function solid(p){return p?.visible!==false&&p?.type==='SOLID'?rgba({...p.color,a:(p.color.a??1)*(p.opacity??1)}):'none';}
function textSvg(n){
 const glyphs=n.derivedTextData.glyphs;const used=[...new Set(glyphs.map(g=>g.commandsBlob).filter(i=>i!==undefined))];
 const defs=used.map(i=>`<path id="g${i}" d="${decode(i)}"/>`).join('');
 const markup=glyphs.map(g=>{if(g.commandsBlob===undefined)return '';const override=n.textData.styleOverrideTable?.find(s=>s.styleID===n.textData.characterStyleIDs?.[g.firstCharacter]);const paint=(override?.fillPaints||n.fillPaints||[]).find(p=>p.visible!==false);const f=g.fontSize||n.fontSize;return `<use href="#g${g.commandsBlob}" fill="${solid(paint)}" transform="translate(${g.position.x} ${g.position.y}) ${g.rotation?`rotate(${g.rotation*180/Math.PI})`:''} scale(${f} ${-f})"/>`;}).join('');
 const p=n.fontSize*2;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${n.size.x+p*2}" height="${n.size.y+p*2}" viewBox="${-p} ${-p} ${n.size.x+p*2} ${n.size.y+p*2}"><defs>${defs}</defs>${markup}</svg>`;
}
function shapeSvg(n){
 const w=n.size?.x||0,h=n.size?.y||0;let defs='',markup='',serial=0;
 function paints(geometries,paints,prefix){let out='';for(const geometry of geometries||[]){const d=decode(geometry.commandsBlob);for(const paint of paints||[]){if(paint.visible===false)continue;let fill=solid(paint);
 if(paint.type==='GRADIENT_LINEAR'){
  const id=`${prefix}${serial++}`,t=paint.transform,det=t.m00*t.m11-t.m01*t.m10;
  const inv=(x,y)=>({x:((x-t.m02)*t.m11-(y-t.m12)*t.m01)/det*w,y:((y-t.m12)*t.m00-(x-t.m02)*t.m10)/det*h});
  const a=inv(0,.5),b=inv(1,.5);defs+=`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}">${paint.stops.map(s=>`<stop offset="${s.position}" stop-color="${rgb(s.color)}" stop-opacity="${s.color.a*(paint.opacity??1)}"/>`).join('')}</linearGradient>`;fill=`url(#${id})`;
 }
 out+=`<path d="${d}" fill="${fill}" fill-rule="${geometry.windingRule==='EVENODD'?'evenodd':'nonzero'}"/>`;
 }}return out;}
 markup+=paints(n.fillGeometry,n.fillPaints,'f');
 const strokes=paints(n.strokeGeometry,n.strokePaints,'s');
 if(strokes&&n.strokeAlign==='INSIDE'&&n.fillGeometry?.length){defs+=`<clipPath id="inside">${n.fillGeometry.map(g=>`<path d="${decode(g.commandsBlob)}"/>`).join('')}</clipPath>`;markup+=`<g clip-path="url(#inside)">${strokes}</g>`;}
 else if(strokes&&n.strokeAlign==='OUTSIDE'&&n.fillGeometry?.length){defs+=`<mask id="outside" maskUnits="userSpaceOnUse" x="-100" y="-100" width="${w+200}" height="${h+200}"><rect x="-100" y="-100" width="${w+200}" height="${h+200}" fill="white"/>${n.fillGeometry.map(g=>`<path d="${decode(g.commandsBlob)}" fill="black"/>`).join('')}</mask>`;markup+=`<g mask="url(#outside)">${strokes}</g>`;}
 else markup+=strokes;
 const p=Math.max(2,(n.strokeWeight||0)*2);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(w,1)+p*2}" height="${Math.max(h,1)+p*2}" viewBox="${-p} ${-p} ${Math.max(w,1)+p*2} ${Math.max(h,1)+p*2}"><defs>${defs}</defs>${markup}</svg>`;
}
const imageFiles=new Map(),imageReport=[];
async function imageAsset(p){const hash=Buffer.from(p.image.hash).toString('hex');if(!imageFiles.has(hash)){const file=path.join('.fig-source/images',hash);const meta=await sharp(file).metadata();const ext=meta.format==='jpeg'?'jpg':meta.format;const filename=`${hash}.${ext}`;fs.copyFileSync(file,path.join(output,filename));imageFiles.set(hash,{src:`/assets/figma/${filename}`,w:meta.width,h:meta.height});}return imageFiles.get(hash);}
function effects(n){const e=n.effects?.filter(e=>e.visible!==false)||[];const filters=[];for(const v of e){if(v.type==='DROP_SHADOW')filters.push(`drop-shadow(${v.offset.x}px ${v.offset.y}px ${v.radius/2}px ${rgba(v.color)})`);if(v.type==='FOREGROUND_BLUR')filters.push(`blur(${v.radius/2}px)`);}return filters.join(' ');}
async function convert(n,virtualId){
 if(n.visible===false)return null;
 const id=virtualId||key(n.guid),t=n.transform||{m00:1,m01:0,m02:0,m10:0,m11:1,m12:0};
 const layer={id,name:n.name,type:n.type,w:n.size?.x||0,h:n.size?.y||0,m:[t.m00,t.m10,t.m01,t.m11,t.m02,t.m12],opacity:n.opacity??1};
 const filter=effects(n);if(filter)layer.filter=filter;
 const image=(n.fillPaints||[]).find(p=>p.type==='IMAGE'&&p.visible!==false);
 if(image){const file=await imageAsset(image);const m=image.transform;const det=m.m00*m.m11-m.m01*m.m10;
  layer.image={...file,m:[layer.w*m.m11/det,-layer.h*m.m10/det,-layer.w*m.m01/det,layer.h*m.m00/det,layer.w*(m.m01*m.m12-m.m11*m.m02)/det,layer.h*(m.m10*m.m02-m.m00*m.m12)/det]};
  layer.clipPath=n.fillGeometry?.map(g=>decode(g.commandsBlob)).join(' ')||`M0 0H${layer.w}V${layer.h}H0Z`;
  imageReport.push({node:id,name:n.name,source:file.src,width:layer.w,height:layer.h,transform:layer.m,crop:layer.image.m});
 }else if(n.type==='TEXT'){
  const file=`text-${id.replaceAll(':','-')}.svg`;fs.writeFileSync(path.join(output,file),textSvg(n));layer.src=`/assets/figma/${file}`;layer.artPadding=n.fontSize*2;layer.text=n.textData.characters;layer.font={...n.fontName,size:n.fontSize};
 }else if(n.fillGeometry?.length||n.strokeGeometry?.length){const file=`shape-${id.replaceAll(':','-')}.svg`;fs.writeFileSync(path.join(output,file),shapeSvg(n));layer.src=`/assets/figma/${file}`;layer.artPadding=Math.max(2,(n.strokeWeight||0)*2);}
 let descendants=children.get(key(n.guid))||[];
 if(n.type==='INSTANCE'){
  const symbol=nodes.get(key(n.symbolData.symbolID));
  const ov=n.symbolData.symbolOverrides||[],derived=n.derivedSymbolData||[];
  function expand(source,trail){const sourceId=key(source.guid),p=[...trail,sourceId];const matches=x=>x.guidPath?.guids?.map(key).join('/')===p.join('/');let value={...source,...ov.find(matches),...derived.find(matches)};value.virtualChildren=(children.get(sourceId)||[]).map(c=>expand(c,p));return value;}
  descendants=(children.get(key(symbol.guid))||[]).map(c=>expand(c,[]));
 }
 if(n.virtualChildren)descendants=n.virtualChildren;
 if(descendants.length){layer.children=(await Promise.all(descendants.map(c=>convert(c,virtualId||n.type==='INSTANCE'?`${id}-${key(c.guid)}`:undefined)))).filter(Boolean);layer.clip=n.frameMaskDisabled===false;}
 return layer;
}
const root=await convert(nodes.get('3:289'));
root.m=[1,0,0,1,0,0];root.clip=true;
fs.writeFileSync('src/design/desktop-2.json',JSON.stringify(root));
fs.writeFileSync('design-reference/asset-report.json',JSON.stringify(imageReport,null,2));
const count=n=>1+(n.children||[]).reduce((a,c)=>a+count(c),0);
console.log(JSON.stringify({frame:'3:289',width:root.w,height:root.h,renderedLayers:count(root),uniqueImages:imageFiles.size,imageLayers:imageReport.length,paths:paths.size},null,2));
