import sharp from 'sharp';
import fs from 'node:fs';

// Reuse the three photographic tiles from the user-supplied earlier design.
// This extracts the artwork only, without importing the old UI or its colors.
const reference=process.argv[2]||'C:/Users/prano/Downloads/home-BT-1 (1) 1.png';
const directory='public/assets/travel';
fs.mkdirSync(directory,{recursive:true});
for(const [name,region] of [
  ['bhutan-flag',{left:238,top:7772,width:428,height:428}],
  ['bhutan-dzong',{left:1098,top:7772,width:428,height:428}],
  ['bhutan-portrait',{left:667,top:8203,width:429,height:428}],
]){
  await sharp(reference).extract(region).png({compressionLevel:9}).toFile(`${directory}/${name}.png`);
  console.log(`${name}.png`);
}
