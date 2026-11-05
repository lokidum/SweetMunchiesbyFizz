'use client';
import {useEffect,useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type {Dessert} from '@/lib/munchies/data';
import {ease} from '@/lib/motion';
import {Package} from './art';
import {DessertAction} from './site';

// Lenis smooth scroll for the dessert page only, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock.
export function SmoothScroll(){
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;gsap.registerPlugin(ScrollTrigger);
  const lenis=new Lenis({lerp:.11});lenis.on('scroll',ScrollTrigger.update);const raf=(time:number)=>lenis.raf(time*1000);gsap.ticker.add(raf);gsap.ticker.lagSmoothing(0);
  return()=>{gsap.ticker.remove(raf);gsap.ticker.lagSmoothing(500,33);lenis.destroy()}},[]);
 return null}

// Ingredients drifting at three depths around the Hero Card; deeper layers move less as you scroll.
export function Floaters(){return <div className="floaters" aria-hidden="true">{[0,1,2].map(depth=><div key={depth} className="floater-layer" data-depth={depth}>{[0,1,2].map(i=><i key={i} className={`floater floater-${(depth+i)%3}`} style={{'--i':i,'--d':depth} as React.CSSProperties}/>)}</div>)}</div>}

// The dessert page storyboard after the Hero Card: story, the curved name band, the details passed in, then the package returns.
export function Story({dessert:d,children}:{dessert:Dessert;children:React.ReactNode}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=root.current;if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;gsap.registerPlugin(ScrollTrigger);
  const context=gsap.context(()=>{
   gsap.utils.toArray<HTMLElement>('.floater-layer').forEach(layer=>{const depth=Number(layer.dataset.depth);gsap.to(layer,{yPercent:-(60-depth*22),ease:'none',scrollTrigger:{trigger:'.product-hero',start:'top top',end:'bottom top',scrub:true}})});
   gsap.from('.story-line>span',{yPercent:110,rotate:3,duration:.9,ease:ease.drop,stagger:.12,scrollTrigger:{trigger:'.story',start:'top 75%'}});
   gsap.from('.story-copy',{opacity:0,y:30,duration:.9,ease:ease.snap,scrollTrigger:{trigger:'.story',start:'top 60%'}});
   gsap.fromTo('.arc-ring',{rotate:-30},{rotate:90,ease:'none',scrollTrigger:{trigger:'.arc-band',start:'top bottom',end:'bottom top',scrub:.6}});
   gsap.fromTo('.arc-package',{yPercent:30,rotate:-14,scale:.8},{yPercent:-10,rotate:6,scale:1,ease:'none',scrollTrigger:{trigger:'.arc-band',start:'top bottom',end:'bottom top',scrub:.6}});
   gsap.from('.returns-package',{xPercent:60,rotate:18,opacity:0,duration:1.1,ease:ease.drop,scrollTrigger:{trigger:'.returns',start:'top 70%'}});
   gsap.from('.returns-copy>*',{y:24,opacity:0,duration:.8,ease:ease.snap,stagger:.1,scrollTrigger:{trigger:'.returns',start:'top 65%'}});
  },el.closest('main')??el);
  return()=>context.revert()},[]);
 const band=Array.from({length:9},()=>d.name.toUpperCase()).join('  ✦  ')+'  ✦  ';
 return <div ref={root} className="story-flow" style={{'--world':d.colour} as React.CSSProperties}>
  <section className="story" aria-labelledby="story-heading">
   <h2 id="story-heading" className="story-heading"><span className="story-line"><span>{d.name}.</span></span>{' '}<span className="story-line"><span className="script">{d.fun}</span></span></h2>
   <div className="story-copy"><p>{d.description}</p><p>Made in small batches by Sweet Munchies by Fizz, a family-run dessert truck in Guildford, Western Sydney.</p></div>
  </section>
  <div className="arc-band" aria-hidden="true">
   <svg className="arc-ring" viewBox="0 0 1000 1000"><defs><path id={`arc-${d.slug}`} d="M500,500 m-420,0 a420,420 0 1,1 840,0 a420,420 0 1,1 -840,0"/></defs><text><textPath href={`#arc-${d.slug}`} textLength={2638} lengthAdjust="spacingAndGlyphs">{band}</textPath></text></svg>
   <div className="arc-package"><Package dessert={d}/></div>
  </div>
  {children}
  <section className="returns" aria-labelledby="returns-heading">
   <div className="returns-package" aria-hidden="true"><Package dessert={d}/></div>
   <div className="returns-copy"><span className="eyebrow">SAVE ROOM FOR SWEET</span><h2 id="returns-heading">Make room for {d.name.toLowerCase()}.</h2><p>{d.status==='live'?'Add it to your box and collect it from the truck.':'Join the list and we will tell you the moment it is ready.'}</p><DessertAction dessert={d} large/></div>
  </section>
 </div>
}
