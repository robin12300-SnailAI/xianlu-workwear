'use client';

import { useSearchParams } from 'next/navigation';
import type { Product } from '@/lib/types';
import ProductsView from './ProductsView';

/**
 * Client half of the product listing.
 *
 * `useSearchParams()` opts this subtree out of the static prerender, so in the
 * exported HTML the parent <Suspense> fallback is emitted instead. The parent
 * deliberately uses the *complete* product grid as that fallback, which means
 * crawlers get every product in the static HTML while real users still get
 * live ?cat= filtering after hydration.
 */
export default function ProductsBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const active = searchParams.get('cat');

  return (
    <ProductsView products={products} categories={categories} active={active} />
  );
}
