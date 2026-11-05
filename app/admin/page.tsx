import {cookies} from 'next/headers';
import {Admin,AdminLogin} from '@/components/munchies/admin';
import {catalog,configured} from '@/lib/munchies/server';
import {adminConfigured,SESSION_COOKIE,verifySession} from '@/lib/munchies/admin-auth';
export const metadata={title:'Fizz’s kitchen',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
// Nothing in the kitchen renders until the session cookie checks out on the server.
export default async function Page(){const session=await verifySession((await cookies()).get(SESSION_COOKIE)?.value);if(!session)return <AdminLogin ready={adminConfigured()}/>;return <Admin initial={await catalog()} connected={configured()} email={session.sub}/>}
