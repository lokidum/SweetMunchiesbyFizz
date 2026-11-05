import type { Metadata } from 'next';
import './globals.css';
import { SiteProvider } from '@/components/munchies/site';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://sweet-munchies-fizz.kloki.chatgpt.site'),title:{default:'Sweet Munchies by Fizz | Pakistani Desserts, Guildford',template:'%s | Sweet Munchies by Fizz'},description:'Pakistani-inspired desserts, made for the sweetest moments. Discover this week’s kheer and explore the Sweet Munchies dessert collection in Guildford.',robots:{index:process.env.PUBLIC_LAUNCH==='true',follow:true},openGraph:{siteName:'Sweet Munchies by Fizz',locale:'en_AU',type:'website'},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-AU"><body><SiteProvider>{children}</SiteProvider></body></html>}
