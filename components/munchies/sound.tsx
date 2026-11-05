'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';

// Background music: off until someone asks for it, then a slow fade up to a very low level. It lives in the root layout,
// so it keeps playing across page changes and never restarts with the looping hero video.
const KEY='fizz-sound',TRACK='/audio/sweet-dream.mp3',LEVEL=.08,FADE_IN=4,FADE_OUT=.9;
type Mixer={context:AudioContext;gain:GainNode};

export function SoundToggle(){
 const [on,setOn]=useState(false);const audio=useRef<HTMLAudioElement|null>(null),mixer=useRef<Mixer|null>(null),wanted=useRef(false);
 // Gain goes through Web Audio because iOS ignores HTMLMediaElement.volume, which would play the track at full level.
 const ensure=()=>{if(audio.current)return audio.current;const a=new Audio(TRACK);a.loop=true;a.preload='auto';audio.current=a;
  try{const Context=window.AudioContext??(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;const context=new Context(),gain=context.createGain();gain.gain.value=0;context.createMediaElementSource(a).connect(gain).connect(context.destination);mixer.current={context,gain}}catch{a.volume=0}
  return a};
 const fade=(level:number,seconds:number)=>{const m=mixer.current;if(m){const g=m.gain.gain,t=m.context.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(level,t+seconds);return}
  const a=audio.current;if(!a)return;const from=a.volume,start=performance.now();const step=()=>{const k=Math.min(1,(performance.now()-start)/(seconds*1000));a.volume=from+(level-from)*k;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
 const play=async()=>{const a=ensure();try{await mixer.current?.context.resume();await a.play();fade(LEVEL,FADE_IN);return true}catch{return false}};
 const pause=()=>{fade(0,FADE_OUT);window.setTimeout(()=>{if(!wanted.current)audio.current?.pause()},FADE_OUT*1000+60)};
 const remember=(value:boolean)=>{try{sessionStorage.setItem(KEY,value?'1':'0')}catch{}};
 async function toggle(){const next=!wanted.current;wanted.current=next;setOn(next);remember(next);if(next)await play();else pause()}
 useEffect(()=>{
  // A full page load cannot start audio by itself. If sound was on earlier in this visit, resume on the next tap or key.
  let resume:(()=>void)|null=null;let stored=false;try{stored=sessionStorage.getItem(KEY)==='1'}catch{}
  if(stored){wanted.current=true;setOn(true);resume=()=>{if(wanted.current)play();detach()};window.addEventListener('pointerdown',resume,{once:true});window.addEventListener('keydown',resume,{once:true})}
  function detach(){if(!resume)return;window.removeEventListener('pointerdown',resume);window.removeEventListener('keydown',resume);resume=null}
  // Quiet down when the tab is hidden and come back softly when it returns.
  const visibility=()=>{if(!wanted.current||!audio.current)return;if(document.hidden){fade(0,.4);window.setTimeout(()=>{if(document.hidden)audio.current?.pause()},450)}else play()};
  document.addEventListener('visibilitychange',visibility);
  return()=>{detach();document.removeEventListener('visibilitychange',visibility);audio.current?.pause();mixer.current?.context.close()}},[]);
 return <button type="button" className={`sound-toggle ${on?'is-on':''}`} onClick={toggle} aria-pressed={on} aria-label={on?'Turn background music off':'Turn background music on'}>
  {on?<><span className="sound-bars" aria-hidden="true"><i/><i/><i/></span>Sound off</>:<>Sound on <span aria-hidden="true">♫</span></>}
 </button>}

// Internal links become App Router navigations, so the layout (and the music) survives moving between pages.
export function ClientLinks(){const router=useRouter();
 useEffect(()=>{const click=(e:MouseEvent)=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   const link=(e.target as Element|null)?.closest?.('a');if(!link||(link.target&&link.target!=='_self')||link.hasAttribute('download'))return;
   const url=new URL(link.href,location.href);if(url.origin!==location.origin||/^\/(api|admin)(\/|$)/.test(url.pathname)||/\.[a-z0-9]+$/i.test(url.pathname))return;
   if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
   e.preventDefault();router.push(url.pathname+url.search+url.hash)};
  document.addEventListener('click',click);return()=>document.removeEventListener('click',click)},[router]);
 return null}
