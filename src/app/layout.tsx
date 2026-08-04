import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  SITE_NAME,
  SITE_URL,
  absUrl,
  jsonLdScript,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Xianlu Workwear Australia | Corporate & Workwear Supplier',
    template: '%s | Xianlu Workwear',
  },
  description:
    'Australia\'s trusted workwear supplier. Shop Hi-Vis clothing, corporate uniforms, chef wear & hospitality apparel. Logo embroidery & printing available. Australia-wide delivery.',
  keywords: ['workwear', 'hi vis', 'corporate uniforms', 'chef uniform', 'Australia', 'Sydney', 'embroidery'],
  alternates: { canonical: absUrl('/') },
  openGraph: {
    siteName: SITE_NAME,
    title: 'Xianlu Workwear Australia',
    description: 'Australia\'s trusted workwear supplier. Logo embroidery & Australia-wide delivery.',
    url: absUrl('/'),
    locale: 'en_AU',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Prevent theme flash: default to light; only go dark if user explicitly toggled it.
const noFlash = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(websiteJsonLd())}
        />
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
