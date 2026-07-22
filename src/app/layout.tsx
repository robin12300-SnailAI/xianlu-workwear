import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Xianlu Workwear Australia | Corporate & Workwear Supplier',
    template: '%s | Xianlu Workwear',
  },
  description:
    'Australia\'s trusted workwear supplier. Shop Hi-Vis clothing, corporate uniforms, chef wear & hospitality apparel. Logo embroidery & printing available. Australia-wide delivery.',
  keywords: ['workwear', 'hi vis', 'corporate uniforms', 'chef uniform', 'Australia', 'Sydney', 'embroidery'],
  openGraph: {
    title: 'Xianlu Workwear Australia',
    description: 'Australia\'s trusted workwear supplier. Logo embroidery & Australia-wide delivery.',
    type: 'website',
  },
};

// Prevent theme flash: apply stored/system preference before first paint.
const noFlash = `(function(){try{var t=localStorage.getItem('theme');var d=t? t==='dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
