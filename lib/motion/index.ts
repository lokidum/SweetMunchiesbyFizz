import gsap from 'gsap';

// Motion tokens from docs/design.md section 7. app/globals.css mirrors them as --ease-* and --dur-*.
export const ease = { drop:'back.out(1.4)', pour:'power2.inOut', snap:'expo.out', soft:'sine.inOut', bite:'steps(3)' } as const;
export const dur = { micro:.18, base:.45, slow:.9, scene:1.4 } as const;
export type EaseName = keyof typeof ease;

// Intro beats, in seconds of intro time. The DOM sequence and the 3D stage both read this one clock.
// A slow opening reel: the pour fills the screen and the tagline lands and holds; as the drips lift they uncover the hero
// video, and the clock waits at reelHold until the video has played out. Its dark drip then hands off to the shelf reveal.
export const intro = {
  pourIn:[0,2.4], type:2.1, typeStep:.65, typeDur:1.2, lift:[5.6,8.2], nav:7.4,
  reel:5.3, reelHold:8.2,
  push:[8.3,9.3], burst:[8.3,9.4], catch:[8.4,10], open:[8.6,9.2], reveal:8.4, fade:[8.4,9.4], outro:9.2,
  end:10.4,
} as const;
// Tap anywhere speeds the intro up; repeat visits in a session play the same timeline as a short version of about 1.3s.
export const introSpeed = { tap:5, repeat:10 } as const;

const parsed = new Map<EaseName,(p:number)=>number>();
// Eased 0..1 progress of time t through the window [start, end].
export function beat(t:number, [start,end]:readonly [number,number], name:EaseName='pour'){
  let fn = parsed.get(name);
  if(!fn){ fn = gsap.parseEase(ease[name]); parsed.set(name,fn); }
  return fn(gsap.utils.clamp(0,1,(t-start)/(end-start)));
}
