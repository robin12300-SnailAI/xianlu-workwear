import Link from 'next/link';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

/**
 * Presentational product listing (chips + grid).
 *
 * Deliberately has NO 'use client' directive so the same component can be
 * rendered by the static server pass (full, crawlable HTML) and re-rendered
 * on the client with an active category filter.
 */
export default function ProductsView({
  products,
  categories,
  active,
}: {
  products: Product[];
  categories: string[];
  active: string | null;
}) {
  const filtered = active
    ? products.filter((p) => p.category === active)
    : products;

  return (
    <div>
      <nav aria-label="Product categories" className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/products"
          aria-current={!active ? 'page' : undefined}
          className={`px-4 py-2 border rounded-full text-sm transition ${
            !active
              ? 'bg-accent text-[var(--accent-ink)] border-accent'
              : 'bg-surface text-ink border-[var(--border)] hover:opacity-80'
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/products?cat=${encodeURIComponent(c)}`}
            aria-current={active === c ? 'page' : undefined}
            className={`px-4 py-2 border rounded-full text-sm capitalize transition ${
              active === c
                ? 'bg-accent text-[var(--accent-ink)] border-accent'
                : 'bg-surface text-ink border-[var(--border)] hover:opacity-80'
            }`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="text-[var(--muted)]">
          No products in this category yet. Please check back soon or{' '}
          <Link href="/products" className="underline">
            browse all workwear
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
