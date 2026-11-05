import gsap from 'gsap';

// Motion tokens from docs/design.md section 7. app/globals.css mirrors them as --ease-* and --dur-*.
export const ease = { drop:'back.out(1.4)', pour:'power2.inOut', snap:'expo.out', soft:'sine.inOut', bite:'steps(3)' } as const;
export const dur = { micro:.18, base:.45, slow:.9, scene:1.4 } as const;
export type EaseName = keyof typeof ease;

// Intro beats, in seconds of intro time. The DOM sequence and the 3D stage both read this one clock.
// Paced as a slow opening reel: the pour fills the screen, the tagline lands line by line and holds, then the sheet
// drips away before the box drops. Fizz asked for cinematic, so this runs well past design.md's 5s target.
export const intro = {
  pourIn:[0,2.4], type:2.1, typeStep:.65, typeDur:1.2, lift:[5.6,8.2], nav:7.4,
  drop:[7.6,8.9], land:[8.5,9.1], open:[9.3,10.3], push:[9.4,11], burst:[10.2,11.5], catch:[10.6,12.2], exit:[10.6,11.9], reveal:11.2, fade:[11.2,12.2], outro:11.9,
  end:13,
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
