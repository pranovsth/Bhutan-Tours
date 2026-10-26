import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const design=JSON.parse(fs.readFileSync('src/design/desktop-2.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
const errors=[];
const failedRequests=[];
page.on('response',response=>{if(response.status()>=400)failedRequests.push({url:response.url(),status:response.status()});});
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
// Force deferred images to load for this asset integrity check. Production
// browsing retains native lazy loading below the fold.
await page.locator('img').evaluateAll(els=>els.forEach(image=>{image.loading='eager';}));
await page.waitForFunction(()=>[...document.images].every(image=>image.complete),undefined,{timeout:15000});
await page.screenshot({path:'design-reference/browser-desktop.png',fullPage:true});
const result={title:await page.title(),errors,size:await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight})),images:await page.locator('img').evaluateAll(els=>els.map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0})))};
fs.writeFileSync('design-reference/browser-report.json',JSON.stringify(result,null,2));
const extensionHeight=Number(await page.locator('.design-stage').getAttribute('data-extension-height')||0);
assert.equal(result.size.w,1600);assert.equal(result.size.h,6406+extensionHeight);
assert.equal(result.images.filter(i=>!i.loaded).length,0);
const flat=[];
const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
function visit(n,parent=[1,0,0,1,0,0],topLevel=false){const local=[...n.m];if(topLevel&&(n.id==='455:1035'||local[5]>=6030))local[5]+=extensionHeight;const m=multiply(parent,local);if(n.id!==design.id){const ps=[[0,0],[n.w,0],[0,n.h],[n.w,n.h]].map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);flat.push({id:n.id,text:n.text,src:n.src,image:n.image,rect:{x:Math.min(...ps.map(p=>p[0])),y:Math.min(...ps.map(p=>p[1])),w:Math.max(...ps.map(p=>p[0]))-Math.min(...ps.map(p=>p[0])),h:Math.max(...ps.map(p=>p[1]))-Math.min(...ps.map(p=>p[1]))}});}n.children?.forEach(c=>visit(c,m,n.id===design.id));}
visit(design);
const actual=await page.locator('.design-layer').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return{id:el.dataset.nodeId,rect:{x:r.x,y:r.y,w:r.width,h:r.height}}}));
assert.equal(actual.length,flat.length);
let maxGeometryError=0;
for(const n of flat){const r=actual.find(a=>a.id===n.id);assert(r,`Missing layer ${n.id}`);for(const k of ['x','y','w','h']){const delta=Math.abs(r.rect[k]-n.rect[k]);maxGeometryError=Math.max(maxGeometryError,delta);assert(delta<.025,`${n.id} ${k}: ${r.rect[k]} versus ${n.rect[k]}`);}}
for(const n of flat.filter(n=>n.text&&n.src)){const stat=await sharp(`public${n.src}`).stats();assert(stat.channels[3].max>0,`Empty text export ${n.id}`);}
const url=page.url();const count=(await browser.contexts()[0].pages()).length;
await page.getByRole('button',{name:'Read More',exact:true}).first().click();
await page.waitForTimeout(400);assert.equal(page.url(),url);assert.equal((await browser.contexts()[0].pages()).length,count);
await page.mouse.move(800,300);await page.waitForTimeout(200);assert.equal(await page.locator('.hero-depth canvas').count(),1);
await page.mouse.move(1590,950);await page.waitForTimeout(700);
await page.getByRole('textbox',{name:'Enter your e-mail'}).fill('portfolio@example.com');
await page.getByRole('button',{name:'Subscribe to email alerts'}).click();assert.equal(page.url(),url);
const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce'});
await mobile.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await mobile.screenshot({path:'design-reference/browser-mobile.png',fullPage:true});
const mobileSize=await mobile.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,viewport:document.documentElement.clientWidth}));
assert(await mobile.locator('.responsive-site').isVisible(),'Mobile layout must use the responsive composition');
assert.equal(mobileSize.width,390);assert(mobileSize.width<=mobileSize.viewport,'Mobile layout has horizontal overflow');
assert.equal(await mobile.locator('.hero-depth canvas').count(),0);
assert.equal(errors.length,0,JSON.stringify({errors,failedRequests}));
const summary={title:result.title,errors,size:result.size,layers:actual.length,maxGeometryError,imageCount:result.images.length,broken:result.images.filter(i=>!i.loaded),dummyButtons:'passed',emailDemo:'passed',threeCanvas:'passed',mobile:mobileSize};
fs.writeFileSync('design-reference/verification.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
}finally{await browser.close();}
