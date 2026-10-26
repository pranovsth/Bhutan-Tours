import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// The resting page remains the original Figma composition. Pointer movement
// briefly adds depth to the same monastery cutout, then returns exactly to rest.
export default function HeroDepth({layer}){
  const host=useRef(null);
  useEffect(()=>{
    const element=host.current;
    let renderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,premultipliedAlpha:false});}catch{return;}
    renderer.setSize(layer.w,layer.h);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);camera.position.z=2;
    let disposed=false,scheduleFrame=()=>{};
    const texture=new THREE.TextureLoader().load(layer.image.src,()=>scheduleFrame());texture.colorSpace=THREE.SRGBColorSpace;
    const material=new THREE.ShaderMaterial({transparent:true,uniforms:{map:{value:texture},amount:{value:0}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D map;uniform float amount;varying vec2 vUv;void main(){vec2 p=vec2(vUv.x,1.-vUv.y);p.x+=amount*sin(p.y*3.14159);vec2 q=vec2(.79871326685*p.x,.32904410362*p.y+.28125);gl_FragColor=texture2D(map,vec2(q.x,1.-q.y));\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`
    });
    const geometry=new THREE.PlaneGeometry(2,2),plane=new THREE.Mesh(geometry,material);scene.add(plane);
    let frame=0,target=0,value=0,lastTime=0,visible=true;
    const renderFrame=time=>{
      frame=0;
      if(!visible)return;
      const elapsed=lastTime?Math.min((time-lastTime)/1000,.05):1/60;
      lastTime=time;
      value+=(target-value)*(1-Math.exp(-elapsed/.18));
      if(Math.abs(target-value)<.000001)value=target;
      material.uniforms.amount.value=value;
      const opacity=Math.min(1,Math.abs(value)*600);
      element.style.opacity=String(opacity);
      if(opacity>0)renderer.render(scene,camera);
      if(value!==target)frame=requestAnimationFrame(renderFrame);
      else lastTime=0;
    };
    scheduleFrame=()=>{if(!disposed&&visible&&!frame)frame=requestAnimationFrame(renderFrame)};
    const stage=element.closest('.design-stage');
    const move=e=>{if(e.pointerType==='touch')return;const r=stage.getBoundingClientRect();const y=(e.clientY-r.top)/r.width*1600;target=y<900?(e.clientX-r.left-r.width*.5)/r.width*.0025:0;scheduleFrame();};
    const leave=()=>{target=0;scheduleFrame()};
    let listening=false;
    const listen=()=>{if(listening)return;stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);listening=true;};
    const unlisten=()=>{if(!listening)return;stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);listening=false;};
    const observer=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible){listen();scheduleFrame();}
      else{unlisten();cancelAnimationFrame(frame);frame=0;lastTime=0;target=0;value=0;element.style.opacity='0';}
    });
    observer.observe(element);
    return()=>{disposed=true;observer.disconnect();unlisten();cancelAnimationFrame(frame);geometry.dispose();material.dispose();texture.dispose();renderer.dispose();element.removeChild(renderer.domElement)};
  },[layer]);
  return <div className="hero-depth" ref={host} aria-hidden="true" style={{width:layer.w,height:layer.h}}/>;
}
