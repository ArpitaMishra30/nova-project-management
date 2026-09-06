import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata={title:'NOVA — Plan. Collaborate. Deliver.',description:'Full-stack team project management platform'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>}
