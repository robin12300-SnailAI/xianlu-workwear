import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/products';
import ProductsView from '@/components/ProductsView';
import ProductsBrowser from '@/components/ProductsBrowser';
import {
  absUrl,
  breadcrumbJsonLd,
  itemListJsonLd,
  jsonLdScript,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'All Workwear Products',
  description:
    'Browse the full Xianlu Workwear range — hi-vis polos, work shirts, drill pants, shorts, jackets and vests. Australian workwear supplier with logo embroidery and printing.',
  alternates: { canonical: absUrl('/products') },
  openGraph: {
    title: 'All Workwear Products | Xianlu Workwear',
    description:
      'Hi-vis polos, work shirts, drill pants, shorts, jackets and vests. Australian workwear supplier with logo embroidery and printing.',
    url: absUrl('/products'),
    type: 'website',
  },
};

export default function ProductsPage() {
  const products = getProducts();
  const categories = getCategories();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd(products))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
          ])
        )}
      />

      <h1 className="text-2xl font-bold mb-4">All Products</h1>

      {/*
        The fallback is the complete, unfiltered grid. `ProductsBrowser` reads
        ?cat= via useSearchParams, which bails out of the static prerender —
        so this fallback is exactly what ends up in the exported HTML and what
        search engines index. Users then get the filtered view on hydration.
      */}
      <Suspense
        fallback={
          <ProductsView
            products={products}
            categories={categories}
            active={null}
          />
        }
      >
        <ProductsBrowser products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
