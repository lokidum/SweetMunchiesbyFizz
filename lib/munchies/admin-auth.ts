// One admin account, configured by environment variables only: ADMIN_EMAIL, ADMIN_PASSWORD_HASH (from
// scripts/hash-admin-password.mjs) and ADMIN_SESSION_SECRET (32+ random characters). Web Crypto only, so it runs on
// Node and on Workers alike. The password itself is never stored anywhere.
const enc = new TextEncoder();
const toB64 = (bytes:ArrayBuffer|Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromB64 = (s:string) => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));

export const SESSION_COOKIE = 'fizz_admin';
const SESSION_SECONDS = 12 * 60 * 60;

export const adminConfigured = () => Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32);

function same(a:Uint8Array, b:Uint8Array){ if(a.length !== b.length) return false; let diff = 0; for(let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]; return diff === 0; }

export async function hashPassword(password:string, salt:Uint8Array = crypto.getRandomValues(new Uint8Array(16)), iterations = 210000){
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', salt:salt as BufferSource, iterations}, key, 256);
  return `pbkdf2:${iterations}:${toB64(salt)}:${toB64(bits)}`;
}

export async function checkCredentials(email:string, password:string){
  if(!adminConfigured()) return false;
  const [kind, iterations, salt, expected] = process.env.ADMIN_PASSWORD_HASH!.split(":");
  if(kind !== 'pbkdf2' || !salt || !expected) return false;
  // Always derive, even for a wrong email, so timing does not reveal which part was wrong.
  const actual = (await hashPassword(password, fromB64(salt), Number(iterations))).split(":")[3];
  const emailMatches = same(enc.encode(email.trim().toLowerCase()), enc.encode(process.env.ADMIN_EMAIL!.trim().toLowerCase()));
  return same(fromB64(actual), fromB64(expected)) && emailMatches;
}

async function sign(data:string){
  const key = await crypto.subtle.importKey('raw', enc.encode(process.env.ADMIN_SESSION_SECRET!), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export async function createSession(){
  const payload = toB64(enc.encode(JSON.stringify({sub:process.env.ADMIN_EMAIL, exp:Date.now() + SESSION_SECONDS * 1000})));
  return `${payload}.${toB64(await sign(payload))}`;
}

export async function verifySession(token:string|null|undefined){
  if(!token || !adminConfigured()) return null;
  const [payload, signature] = token.split('.');
  if(!payload || !signature) return null;
  try{
    if(!same(fromB64(signature), await sign(payload))) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64(payload))) as {sub:string; exp:number};
    return data.exp > Date.now() && data.sub === process.env.ADMIN_EMAIL ? data : null;
  }catch{ return null; }
}

export function sessionCookie(value:string, maxAge = SESSION_SECONDS){
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function readSessionCookie(req:Request){
  return req.headers.get('cookie')?.split(/;\s*/).find(c => c.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1) ?? null;
}

// Admin writes must come from this site: SameSite=Strict already blocks cross-site cookies, this is a second check.
export function sameOrigin(req:Request){
  const origin = req.headers.get('origin');
  if(!origin) return true;
  try{ return new URL(origin).host === new URL(req.url).host; }catch{ return false; }
}
