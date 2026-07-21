import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// 全站默认的 SEO 信息（策划书第十条：所有页面默认符合 SEO 最佳实践）
export const metadata: Metadata = {
  title: {
    default: 'Xianlu Workwear Australia | 澳洲工作服在线采购',
    template: '%s | Xianlu Workwear',
  },
  description:
    '澳洲悉尼工作服供应商，在线选购 Hi-Vis 高可视服、工装、企业制服、餐饮制服，支持 Logo 刺绣与印花，全澳配送。',
  keywords: ['workwear', 'hi vis', '澳洲工作服', '企业制服', 'chef uniform', 'Sydney'],
  openGraph: {
    title: 'Xianlu Workwear Australia',
    description: '澳洲工作服在线采购平台，支持 Logo 定制与全澳配送。',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* CartProvider 让全站都能读写购物车（存在浏览器本地） */}
        <CartProvider>
          <Header />
          <main className="min-h-screen max-w-6xl mx-auto px-4 py-6">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
