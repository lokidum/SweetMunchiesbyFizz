// Device tiers from docs/BUILD_PROMPT.md section 12. Client only.
export type Tier = 'high'|'mid'|'low'|'calm';
export type Device = { tier:Tier; webgl:boolean };

type Hints = Navigator & { deviceMemory?:number; connection?:{ saveData?:boolean } };

export function detectDevice():Device{
  let webgl = false;
  try{
    const context = document.createElement('canvas').getContext('webgl2');
    webgl = !!context;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }catch{}
  let calm = false;
  try{ calm = matchMedia('(prefers-reduced-motion: reduce)').matches }catch{}
  if(calm) return { tier:'calm', webgl };
  const nav = navigator as Hints, memory = nav.deviceMemory ?? 8;
  // Safari reports neither memory nor save-data, so recent iPhones land in high.
  if(!webgl || nav.connection?.saveData || memory <= 2) return { tier:'low', webgl };
  if(memory <= 4 || (nav.hardwareConcurrency ?? 8) <= 2) return { tier:'mid', webgl };
  return { tier:'high', webgl };
}

export const dprCap:Record<Tier,number> = { high:2, mid:1.5, low:1, calm:1.5 };
