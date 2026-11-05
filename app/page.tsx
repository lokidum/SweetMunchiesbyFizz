import { Shelf } from '@/components/munchies/shelf';
import { catalog } from '@/lib/munchies/server';
export default async function Home(){return <Shelf desserts={await catalog()}/>}
