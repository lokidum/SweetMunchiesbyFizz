'use client';
import {useEffect,useRef,useState} from 'react';

// Teaser lines from design.md. Fizz to approve final wording.
const lines=['Warming the milk','Crushing pistachios','Tell mum we said salaam'];
// Petal, pistachio sliver, milk chocolate crumb, saffron thread.
const palette=[['#cf2a52','#f6a198'],['#a2961e','#d6dc8c'],['#954e2f','#c27a52'],['#efcc6a','#f7dd94']];
type Crumb={x:number;y:number;vx:number;vy:number;angle:number;spin:number;speed:number;orbit:number;kind:number;size:number;rot:number};

// The first thing anyone sees: crumbs drift in from the edges, orbit the roundel along the swirl, lean toward
// the pointer and spring back. Progress tightens the orbit and fills the logo from the bottom; leaving bursts them out.
export function Loader({percent,leaving,dense=true}:{percent:number;leaving:boolean;dense?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),state=useRef({progress:0,leaving:false});const [line,setLine]=useState(0);
 useEffect(()=>{state.current={progress:percent/100,leaving}},[percent,leaving]);
 useEffect(()=>{const id=window.setInterval(()=>setLine(n=>(n+1)%lines.length),1700);return()=>clearInterval(id)},[]);
 useEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  let w=0,h=0,frame=0,last=performance.now(),burst=false;const pointer={x:-1e4,y:-1e4};
  const resize=()=>{const r=el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,2);w=r.width;h=r.height;el.width=w*dpr;el.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};resize();
  const count=dense?96:60;const crumbs:Crumb[]=Array.from({length:count},(_,i)=>{const edge=Math.random()*Math.PI*2,far=Math.hypot(w,h)*.6;return {x:w/2+Math.cos(edge)*far,y:h*.45+Math.sin(edge)*far,vx:0,vy:0,angle:i/count*Math.PI*2,spin:(Math.random()-.5)*3,speed:.25+Math.random()*.35,orbit:1+Math.random()*.55,kind:i%4,size:.7+Math.random()*.6,rot:Math.random()*6}});
  const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top};const away=()=>{pointer.x=pointer.y=-1e4};
  window.addEventListener('pointermove',move);window.addEventListener('pointerdown',move);window.addEventListener('pointerleave',away);window.addEventListener('resize',resize);
  const tilt=-25*Math.PI/180,cos=Math.cos(tilt),sin=Math.sin(tilt);
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const {progress,leaving}=state.current;const cx=w/2,cy=h*.45,base=Math.min(w,h)*.21;
   if(leaving&&!burst){burst=true;crumbs.forEach(c=>{const a=Math.atan2(c.y-cy,c.x-cx),v=500+Math.random()*700;c.vx+=Math.cos(a)*v;c.vy+=Math.sin(a)*v})}
   ctx.clearRect(0,0,w,h);
   for(const c of crumbs){
    if(!burst){c.angle+=c.speed*dt*(1+progress*1.5);
     // Swirl path: a tilted ellipse that tightens toward the roundel as loading completes.
     const r=base*(c.orbit-(c.orbit-.82)*progress*progress),ex=Math.cos(c.angle)*r*1.3,ey=Math.sin(c.angle)*r*.82;let tx=cx+ex*cos-ey*sin,ty=cy+ex*sin+ey*cos;
     const dx=pointer.x-tx,dy=pointer.y-ty,dist=Math.hypot(dx,dy);if(dist<260){const lean=(1-dist/260)*.38;tx+=dx*lean;ty+=dy*lean}
     c.vx+=((tx-c.x)*14-c.vx*5.5)*dt;c.vy+=((ty-c.y)*14-c.vy*5.5)*dt}
    else{c.vy+=260*dt;c.vx*=1-1.2*dt}
    c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=c.spin*dt*(burst?4:1);
    const [fill,shine]=palette[c.kind],s=c.size*(dense?1:.85);ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.globalAlpha=burst?Math.max(0,1-Math.hypot(c.x-cx,c.y-cy)/(Math.max(w,h)*.7)):.95;ctx.fillStyle=fill;ctx.beginPath();
    if(c.kind===0){ctx.ellipse(0,0,5*s,9*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=shine;ctx.globalAlpha*=.5;ctx.beginPath();ctx.ellipse(-1.5*s,-2*s,1.6*s,5*s,0,0,Math.PI*2)}
    else if(c.kind===1){ctx.ellipse(0,0,2.6*s,8*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=shine;ctx.beginPath();ctx.ellipse(.8*s,0,.8*s,6*s,0,0,Math.PI*2)}
    else if(c.kind===2){ctx.moveTo(-4*s,-3*s);ctx.lineTo(4.5*s,-2*s);ctx.lineTo(2*s,4*s);ctx.lineTo(-3.5*s,3*s)}
    else{ctx.strokeStyle=fill;ctx.lineWidth=1.3*s;ctx.lineCap='round';ctx.moveTo(-6*s,0);ctx.quadraticCurveTo(0,-3*s,6*s,1*s);ctx.stroke();ctx.restore();continue}
    ctx.fill();ctx.restore()}
   frame=requestAnimationFrame(tick)};
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move);window.removeEventListener('pointerleave',away);window.removeEventListener('resize',resize)}},[dense]);
 return <div className={`lux-loader ${leaving?'leaving':''}`} style={{'--p':percent/100} as React.CSSProperties}>
  <div className="loader-halo"/><canvas ref={canvas} className="crumb-canvas" aria-hidden="true"/>
  <div className="loader-roundel" aria-hidden="true"><img className="roundel-ghost" src="/brand/logo-roundel.webp" alt="" width={360} height={360}/><img className="roundel-fill" src="/brand/logo-roundel.webp" alt="" width={360} height={360}/></div>
  <div className="loader-words"><span className="eyebrow">SWEET MUNCHIES BY FIZZ</span><p className="script" key={line}>{lines[line]}</p><small>{percent}%</small></div>
 </div>
}
