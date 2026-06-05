(function(){
'use strict';

/* CURSOR */
const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function rl(){rx+=(mx-rx)*0.1;ry+=(my-ry)*0.1;const dx=mx-rx,dy=my-ry,d=Math.sqrt(dx*dx+dy*dy),s=Math.min(1+d*0.022,2.3),a=Math.atan2(dy,dx)*180/Math.PI;ring.style.left=rx+'px';ring.style.top=ry+'px';ring.style.transform=`translate(-50%,-50%) rotate(${a}deg) scaleX(${s}) scaleY(${1/s*0.87})`;requestAnimationFrame(rl);})();

/* THREE.JS NEURAL NETWORK */
const canvas=document.getElementById('three-canvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0x080808,1);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.z=280;

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

const NODE_COUNT=180;
const CONNECT_DIST=80;
const nodes=[];
const nodePositions=[];

for(let i=0;i<NODE_COUNT;i++){
  const theta=Math.random()*Math.PI*2;
  const phi=Math.acos(2*Math.random()-1);
  const r=60+Math.random()*120;
  nodePositions.push(new THREE.Vector3(
    r*Math.sin(phi)*Math.cos(theta),
    r*Math.sin(phi)*Math.sin(theta)*0.7,
    r*Math.cos(phi)
  ));
  nodes.push({
    vel:new THREE.Vector3(
      (Math.random()-0.5)*0.06,
      (Math.random()-0.5)*0.06,
      (Math.random()-0.5)*0.04
    ),
    pulse:Math.random()*Math.PI*2
  });
}

const dotGeo=new THREE.BufferGeometry();
const dotPos=new Float32Array(NODE_COUNT*3);
nodePositions.forEach((p,i)=>{
  dotPos[i*3]=p.x;
  dotPos[i*3+1]=p.y;
  dotPos[i*3+2]=p.z;
});
dotGeo.setAttribute('position',new THREE.BufferAttribute(dotPos,3));

const dotMat=new THREE.PointsMaterial({color:0xAAFF4D,size:2.8,transparent:true,opacity:0.85,sizeAttenuation:true});
const dots=new THREE.Points(dotGeo,dotMat);
scene.add(dots);

const lineGeo=new THREE.BufferGeometry();
const maxLines=NODE_COUNT*NODE_COUNT;
const linePositions=new Float32Array(maxLines*6);
const lineColors=new Float32Array(maxLines*6);
lineGeo.setAttribute('position',new THREE.BufferAttribute(linePositions,3).setUsage(THREE.DynamicDrawUsage));
lineGeo.setAttribute('color',new THREE.BufferAttribute(lineColors,3).setUsage(THREE.DynamicDrawUsage));

const lineMat=new THREE.LineSegments(lineGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.4}));
scene.add(lineMat);

let targetRotX=0,targetRotY=0,currentRotX=0,currentRotY=0;
document.addEventListener('mousemove',e=>{
  targetRotY=((e.clientX/window.innerWidth)-0.5)*0.5;
  targetRotX=((e.clientY/window.innerHeight)-0.5)*0.3;
});

const pulses=[];
function spawnPulse(){
  for(let attempt=0;attempt<30;attempt++){
    const a=Math.floor(Math.random()*NODE_COUNT);
    const b=Math.floor(Math.random()*NODE_COUNT);
    if(a===b)continue;
    const dist=nodePositions[a].distanceTo(nodePositions[b]);
    if(dist<CONNECT_DIST){
      pulses.push({a,b,t:0,speed:0.012+Math.random()*0.01});
      break;
    }
  }
}
setInterval(spawnPulse,300);

const pulseDotGeo=new THREE.BufferGeometry();
pulseDotGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(3),3));
const pulseDots=new THREE.Points(pulseDotGeo,new THREE.PointsMaterial({color:0xffffff,size:4.5,transparent:true,opacity:0}));
scene.add(pulseDots);

const clock=new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  currentRotX+=(targetRotX-currentRotX)*0.04;
  currentRotY+=(targetRotY-currentRotY)*0.04;

  const group=new THREE.Euler(
    currentRotX+Math.sin(t*0.08)*0.04,
    currentRotY+t*0.025,
    Math.sin(t*0.05)*0.02
  );

  for(let i=0;i<NODE_COUNT;i++){
    nodePositions[i].add(nodes[i].vel);
    const len=nodePositions[i].length();
    if(len>190||len<30) nodes[i].vel.negate();
    const p=nodePositions[i].clone().applyEuler(group);
    dotPos[i*3]=p.x;
    dotPos[i*3+1]=p.y;
    dotPos[i*3+2]=p.z;
  }
  dotGeo.attributes.position.needsUpdate=true;

  let lineIdx=0;
  for(let i=0;i<NODE_COUNT;i++){
    for(let j=i+1;j<NODE_COUNT;j++){
      const dist=nodePositions[i].distanceTo(nodePositions[j]);
      if(dist<CONNECT_DIST){
        const alpha=1-(dist/CONNECT_DIST);
        const pa=nodePositions[i].clone().applyEuler(group);
        const pb=nodePositions[j].clone().applyEuler(group);
        linePositions[lineIdx*6]=pa.x;linePositions[lineIdx*6+1]=pa.y;linePositions[lineIdx*6+2]=pa.z;
        linePositions[lineIdx*6+3]=pb.x;linePositions[lineIdx*6+4]=pb.y;linePositions[lineIdx*6+5]=pb.z;
        const r=0.667*alpha,g=1.0*alpha,b=0.302*alpha;
        lineColors[lineIdx*6]=r;lineColors[lineIdx*6+1]=g;lineColors[lineIdx*6+2]=b;
        lineColors[lineIdx*6+3]=r;lineColors[lineIdx*6+4]=g;lineColors[lineIdx*6+5]=b;
        lineIdx++;
      }
    }
  }
  lineGeo.attributes.position.needsUpdate=true;
  lineGeo.attributes.color.needsUpdate=true;
  lineGeo.setDrawRange(0,lineIdx*2);

  if(pulses.length>0){
    const pulse=pulses[0];
    pulse.t+=pulse.speed;
    if(pulse.t>=1){
      pulses.shift();
      pulseDots.material.opacity=0;
    } else {
      const pa=nodePositions[pulse.a].clone().applyEuler(group);
      const pb=nodePositions[pulse.b].clone().applyEuler(group);
      const pp=pa.lerp(pb,pulse.t);
      const pd=pulseDotGeo.attributes.position.array;
      pd[0]=pp.x;pd[1]=pp.y;pd[2]=pp.z;
      pulseDotGeo.attributes.position.needsUpdate=true;
      pulseDots.material.opacity=Math.sin(pulse.t*Math.PI)*0.95;
    }
  }

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