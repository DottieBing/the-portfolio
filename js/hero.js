(function(){
'use strict';

/* CURSOR */
const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function rl(){rx+=(mx-rx)*0.1;ry+=(my-ry)*0.1;const dx=mx-rx,dy=my-ry,d=Math.sqrt(dx*dx+dy*dy),s=Math.min(1+d*0.022,2.3),a=Math.atan2(dy,dx)*180/Math.PI;ring.style.left=rx+'px';ring.style.top=ry+'px';ring.style.transform=`translate(-50%,-50%) rotate(${a}deg) scaleX(${s}) scaleY(${1/s*0.87})`;requestAnimationFrame(rl);})();

/* THREE.JS — PARTICLE WAVE FIELD
   An undulating grid of particles rippling like a sine surface.
   Cyan accent (#2DE2E6), additive glow, slow drift + mouse parallax. */
const canvas=document.getElementById('three-canvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0x080808,1);

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x080808,0.0017);
const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,2000);
camera.position.set(0,150,360);
camera.lookAt(0,-10,0);

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

/* Build the grid of particles on the XZ plane */
const GRID_X=72,GRID_Z=72,SPACING=9;
const COUNT=GRID_X*GRID_Z;
const halfW=(GRID_X-1)*SPACING/2;
const halfD=(GRID_Z-1)*SPACING/2;

const waveGeo=new THREE.BufferGeometry();
const wavePos=new Float32Array(COUNT*3);
const waveColor=new Float32Array(COUNT*3);
const gridX=new Float32Array(COUNT);
const gridZ=new Float32Array(COUNT);

let gi=0;
for(let ix=0;ix<GRID_X;ix++){
  for(let iz=0;iz<GRID_Z;iz++){
    const x=ix*SPACING-halfW;
    const z=iz*SPACING-halfD;
    gridX[gi]=x;gridZ[gi]=z;
    wavePos[gi*3]=x;wavePos[gi*3+1]=0;wavePos[gi*3+2]=z;
    gi++;
  }
}
waveGeo.setAttribute('position',new THREE.BufferAttribute(wavePos,3).setUsage(THREE.DynamicDrawUsage));
waveGeo.setAttribute('color',new THREE.BufferAttribute(waveColor,3).setUsage(THREE.DynamicDrawUsage));

const waveMat=new THREE.PointsMaterial({
  size:2.4,vertexColors:true,transparent:true,opacity:0.92,
  sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending
});
const wave=new THREE.Points(waveGeo,waveMat);
scene.add(wave);

/* Cyan base — #2DE2E6 normalized */
const baseR=45/255,baseG=226/255,baseB=230/255;
const AMP=22; /* total wave amplitude for brightness mapping */

/* Mouse parallax */
let targetRotY=0,targetRotX=0,curRotY=0,curRotX=0;
document.addEventListener('mousemove',e=>{
  targetRotY=((e.clientX/window.innerWidth)-0.5)*0.45;
  targetRotX=((e.clientY/window.innerHeight)-0.5)*0.18;
});

const clock=new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  curRotY+=(targetRotY-curRotY)*0.04;
  curRotX+=(targetRotX-curRotX)*0.04;
  wave.rotation.y=curRotY+t*0.03;

  /* Vertical parallax via camera */
  camera.position.y=150-curRotX*220;
  camera.lookAt(0,-10,0);

  for(let i=0;i<COUNT;i++){
    const x=gridX[i],z=gridZ[i];
    const d=Math.sqrt(x*x+z*z);
    const y=Math.sin(x*0.025+t*0.9)*8
           +Math.cos(z*0.03+t*0.7)*8
           +Math.sin(d*0.03-t*1.2)*6;
    wavePos[i*3+1]=y;
    /* Brightness rides the crest of the wave */
    const h=(y+AMP)/(AMP*2);
    const b=0.32+h*0.68;
    waveColor[i*3]=baseR*b;
    waveColor[i*3+1]=baseG*b;
    waveColor[i*3+2]=baseB*b;
  }
  waveGeo.attributes.position.needsUpdate=true;
  waveGeo.attributes.color.needsUpdate=true;

  renderer.render(scene,camera);
}
animate();

/* MARQUEE */
const words=['AI Voice Agents','LangChain','n8n Automation','React & Next.js','Python','Make & Zapier','Full-Stack Dev','WebGL','TypeScript','AI Receptionists'];
const mtrack=document.getElementById('mtrack');
if(mtrack){
  [...words,...words,...words].forEach(w=>{
    const d=document.createElement('div');
    d.className='mitem';
    d.innerHTML=`${w}<span class="mdot"></span>`;
    mtrack.appendChild(d);
  });
}

/* REVEAL */
function revealHero(){
  document.getElementById('logo')?.classList.add('in');
  document.getElementById('nav')?.classList.add('in');
  document.getElementById('avail')?.classList.add('in');
  setTimeout(()=>document.getElementById('l1')?.classList.add('in'),200);
  setTimeout(()=>document.getElementById('l2')?.classList.add('in'),360);
  setTimeout(()=>document.getElementById('l3')?.classList.add('in'),520);
  setTimeout(()=>document.getElementById('sub')?.classList.add('in'),800);
  setTimeout(()=>{
    document.getElementById('mstrip')?.classList.add('in');
    document.getElementById('bl')?.classList.add('in');
    document.getElementById('br')?.classList.add('in');
    document.getElementById('bc')?.classList.add('in');
  },1000);
}

document.addEventListener('site:ready', revealHero);
setTimeout(revealHero, 2500);

})();
