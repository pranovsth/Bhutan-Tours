import design from './design/desktop-2.json';

const nodes=new Map();
function visit(node){nodes.set(node.id,node);node.children?.forEach(visit);}
visit(design);
export function sourceNode(id){const node=nodes.get(id);if(!node)throw new Error(`Missing design node ${id}`);return node;}
export const copy=id=>sourceNode(id).text;
export const image=id=>sourceNode(id).image.src;
export {design};
