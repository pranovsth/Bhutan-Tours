import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const reports=[];
const prefix=process.argv.includes('--fixed')?'fixed-':'';
try{
 for(const dpr of [1,1.25,1.5,2]){
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:dpr,reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.screenshot({path:`design-reference/${prefix}scaling-${dpr}.png`,clip:{x:0,y:0,width:1600,height:900},scale:'css'});
  if(prefix)assert(await page.locator('.source-image').evaluateAll(els=>els.every(e=>e.width===e.naturalWidth&&e.height===e.naturalHeight)),'Images must retain their intrinsic box size');
  reports.push({dpr,images:await page.locator('.source-image').evaluateAll(els=>els.slice(0,7).map(e=>({src:e.src,cssWidth:getComputedStyle(e).width,rect:e.getBoundingClientRect().toJSON()})))});
  await page.close();
 }
 for(const zoom of [1.1,1.2,1.25]){
  const page=await browser.newPage({viewport:{width:1890,height:1100},deviceScaleFactor:1,reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.evaluate(zoom=>document.body.style.zoom=zoom,zoom);
  await page.waitForTimeout(100);
  const stage=await page.locator('.design-stage').boundingBox();
  await page.screenshot({path:`design-reference/${prefix}zoom-${zoom}.png`,clip:{x:stage.x,y:stage.y,width:stage.width,height:stage.width*900/1600},scale:'css'});
  await page.close();
 }
 const comparison=await sharp({create:{width:1600,height:900*4,channels:3,background:'#fff'}}).composite(await Promise.all([1,1.25,1.5,2].map(async(dpr,i)=>({input:await sharp(`design-reference/${prefix}scaling-${dpr}.png`).png().toBuffer(),top:900*i,left:0})))).png().toBuffer();
 await sharp(comparison).resize({width:800}).png().toFile(`design-reference/${prefix}scaling-comparison.png`);
 const baseline=await sharp(`design-reference/${prefix}scaling-1.png`).removeAlpha().raw().toBuffer();
 const differences=[];
 for(const zoom of [1.1,1.2,1.25]){
  const normalized=await sharp(`design-reference/${prefix}zoom-${zoom}.png`).resize(1600,900,{fit:'fill'}).removeAlpha().raw().toBuffer();
  let total=0;for(let i=0;i<baseline.length;i++)total+=Math.abs(baseline[i]-normalized[i]);
  const meanDifference=total/baseline.length;
  differences.push({zoom,meanDifference});
  if(prefix)assert(meanDifference<8,`Zoom ${zoom} changes image crops: mean pixel difference ${meanDifference}`);
 }
 fs.writeFileSync(`design-reference/${prefix}scaling-report.json`,JSON.stringify({reports,differences},null,2));
 console.log(JSON.stringify({displayScales:[1,1.25,1.5,2],zoomChecks:differences,passed:true},null,2));
}finally{await browser.close();}
