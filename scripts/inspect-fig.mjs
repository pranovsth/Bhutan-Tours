import fs from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import { decodeBinarySchema, compileSchema } from 'kiwi-schema';
import { decompress } from 'fzstd';

const data=fs.readFileSync('.fig-source/canvas.fig');
const chunks=[];
for(let offset=12;offset+4<data.length;){const length=data.readUInt32LE(offset);offset+=4;chunks.push(data.subarray(offset,offset+length));offset+=length;}
const schema=decodeBinarySchema(inflateRawSync(chunks[0]));
const decoder=compileSchema(schema);
const bytes=chunks[1].readUInt32LE(0)===0xfd2fb528?decompress(chunks[1]):inflateRawSync(chunks[1]);
const message=decoder.decodeMessage(bytes);
fs.mkdirSync('design-reference',{recursive:true});
fs.writeFileSync('design-reference/document.json',JSON.stringify(message,(k,v)=>v instanceof Uint8Array?Array.from(v):v,2));
const id=n=>`${n.sessionID}:${n.localID}`;
console.log('keys',Object.keys(message),'nodes',message.nodeChanges?.length);
console.log(message.nodeChanges.filter(n=>n.name?.toLowerCase().includes('desktop')).map(n=>({id:id(n.guid),name:n.name,size:n.size,transform:n.transform})));
console.log(JSON.stringify(message.nodeChanges.find(n=>id(n.guid)==='3:289'),null,2));
