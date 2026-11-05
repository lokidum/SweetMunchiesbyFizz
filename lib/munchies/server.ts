import {readSessionCookie,verifySession} from './admin-auth';
import { desserts, type Dessert } from './data';
export const configured=()=>Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
export async function db(path:string,init:RequestInit={}){const url=process.env.SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Service is not connected yet'); const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation',...init.headers},cache:'no-store'});if(!r.ok)throw new Error('Database request failed');return r.status===204?null:r.json() as Promise<any>;}
export async function catalog():Promise<Dessert[]>{if(!configured())return desserts;try{const rows=await db('desserts?status=neq.hidden&order=sort_order');return rows.length?rows:desserts;}catch{return desserts;}}
// The signed-in admin, from the session cookie set by /api/admin/login. See admin-auth.ts.
export async function adminUser(req:Request){const session=await verifySession(readSessionCookie(req));return session?{email:session.sub}:null}
