'use client';
import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {ease} from '@/lib/motion';

const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

function scatter(x:number,y:number,count:number,spread:number){for(let i=0;i<count;i++){const c=document.createElement('i');c.className=`crumb crumb-${i%3}`;c.setAttribute('aria-hidden','true');document.body.appendChild(c);const a=Math.random()*Math.PI*2,r=spread*(.5+Math.random()*.6);
 gsap.fromTo(c,{x,y,opacity:1,scale:1},{x:x+Math.cos(a)*r,y:y+Math.sin(a)*r+spread*.4,rotate:Math.random()*300,opacity:0,scale:.4,duration:.7,ease:'power2.out',onComplete:()=>c.remove()})}}

// Add to box: the dessert's colour arcs from the button into the cart, crumbs scatter and the cart wiggles.
export function flyToBox(from:Element,to:HTMLElement,colour:string){return new Promise<void>(done=>{if(calm()){done();return}
 const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),x0=a.left+a.width/2,y0=a.top+a.height/2,x1=b.left+b.width/2,y1=b.top+b.height/2,cx=(x0+x1)/2,cy=Math.min(y0,y1)-160;
 const dot=document.createElement('div');dot.className='fly-treat';dot.setAttribute('aria-hidden','true');dot.style.background=colour;document.body.appendChild(dot);const p={t:0};
 gsap.to(p,{t:1,duration:.75,ease:ease.pour,onUpdate(){const t=p.t,u=1-t;gsap.set(dot,{x:u*u*x0+2*u*t*cx+t*t*x1,y:u*u*y0+2*u*t*cy+t*t*y1,scale:1-t*.55,rotate:t*240})},
  onComplete(){dot.remove();scatter(x1,y1,8,45);to.classList.remove('wiggle');void to.offsetWidth;to.classList.add('wiggle');window.setTimeout(done,220)}})})}

// Desktop only: a small chocolate dot lags behind the cursor and fast moves shed a few crumbs.
export function CursorDot(){const dot=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=dot.current;if(!el||!matchMedia('(pointer: fine)').matches||calm())return;el.style.display='block';
  const x=gsap.quickTo(el,'x',{duration:.35,ease:'power3'}),y=gsap.quickTo(el,'y',{duration:.35,ease:'power3'});let last={x:0,y:0,t:0},crumb=0;
  const move=(e:PointerEvent)=>{x(e.clientX);y(e.clientY);const now=performance.now(),speed=Math.hypot(e.clientX-last.x,e.clientY-last.y)/Math.max(1,now-last.t);last={x:e.clientX,y:e.clientY,t:now};
   if(speed>1.6&&now-crumb>90&&document.querySelectorAll('.crumb').length<3){crumb=now;scatter(e.clientX,e.clientY,1,26)}};
  window.addEventListener('pointermove',move);return()=>window.removeEventListener('pointermove',move)},[]);
 return <div ref={dot} className="cursor-dot" aria-hidden="true"/>}

// The 12s hero reel: muted, looping and inline, fetched and played only while it is on screen. Reduced motion gets controls instead.
export function ReelVideo(){const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const v=ref.current;if(!v)return;if(calm()){v.controls=true;return}
  const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){v.preload='auto';v.play().catch(()=>{})}else v.pause()},{threshold:.35});io.observe(v);return()=>io.disconnect()},[]);
 return <div className="reel-frame"><video ref={ref} src="/reel/sweet-munchies-reel.mp4" poster="/reel/poster.webp" muted loop playsInline preload="none" width={720} height={720} aria-label="Twelve second reel of Sweet Munchies packages opening: kheer, brown butter brownies and Biscoff cups. Concept renders, not photos of Fizz's food."/></div>}
