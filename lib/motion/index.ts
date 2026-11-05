import gsap from 'gsap';

// Motion tokens from docs/design.md section 7. app/globals.css mirrors them as --ease-* and --dur-*.
export const ease = { drop:'back.out(1.4)', pour:'power2.inOut', snap:'expo.out', soft:'sine.inOut', bite:'steps(3)' } as const;
export const dur = { micro:.18, base:.45, slow:.9, scene:1.4 } as const;
export type EaseName = keyof typeof ease;

// Intro beats, in seconds of intro time. The DOM sequence and the 3D stage both read this one clock.
export const intro = {
  type:.8, lift:1.8,
  drop:[2,2.8], land:[2.45,2.9], open:[2.9,3.5], push:[3,3.7],
  burst:[3.6,4.4], catch:[3.9,4.9], exit:[4,4.8], reveal:4.4, fade:[4.4,5],
  end:5.2,
} as const;
// Tap anywhere speeds the intro up; repeat visits in a session play the same timeline as a 1s version.
export const introSpeed = { tap:4, repeat:5 } as const;

const parsed = new Map<EaseName,(p:number)=>number>();
// Eased 0..1 progress of time t through the window [start, end].
export function beat(t:number, [start,end]:readonly [number,number], name:EaseName='pour'){
  let fn = parsed.get(name);
  if(!fn){ fn = gsap.parseEase(ease[name]); parsed.set(name,fn); }
  return fn(gsap.utils.clamp(0,1,(t-start)/(end-start)));
}
