import {catalog} from '@/lib/munchies/server';
import {Package} from '@/components/munchies/art';
import {DessertAction} from '@/components/munchies/site';
import {statusLabel} from '@/lib/munchies/data';
export const metadata={title:'Our desserts',description:'Explore all 13 Sweet Munchies desserts, from this week’s kheer to the next sweet thing in Fizz’s kitchen.',alternates:{canonical:'/desserts'}};
// The first row is on screen at load, so it loads straight away (the first image is the page's largest paint).
export default async function Page(){const desserts=await catalog();return <main id="main" className="content-page"><div className="breadcrumbs"><a href="/">Home</a><span>/</span><span>Our desserts</span></div><span className="eyebrow">THE WHOLE SWEET FAMILY</span><h1 className="page-title">Pick your next obsession.</h1><p className="page-intro">One or two stars each week. Plenty more to fall for. If your favourite is taking a break, we’ll tell you when it’s back.</p><div className="catalog-grid">{desserts.map((d,i)=><article key={d.slug}><a href={`/desserts/${d.slug}`} className="preview-art" style={{background:d.colour}}><span className="stamp">{statusLabel(d.status)}</span><Package dessert={d} eager={i<3} priority={i===0}/></a><h2><a href={`/desserts/${d.slug}`}>{d.name}</a></h2><p>{d.fun}</p><DessertAction dessert={d}/></article>)}</div></main>}
