import Link from 'next/link';
import type { Product } from '@/lib/types';
import SmartImage from './SmartImage';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="card group block overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-[var(--surface-2)]">
        <SmartImage
          src={product.images[0]}
          seed={product.slug}
          alt={product.seoDescription || product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {product.inStock ? (
          <span className="absolute top-3 left-3 chip">In Stock</span>
        ) : (
          <span className="absolute top-3 left-3 chip" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
            Made to Order
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[var(--accent)] text-[var(--accent-ink)] text-center text-sm font-semibold py-2.5">
          View Product →
        </span>
      </div>

      <div className="p-4">
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {product.category}
        </div>
        <div className="font-head font-semibold text-[1.02rem] text-[var(--ink)] mt-1 leading-snug">
          {product.name}
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[var(--accent)] font-bold text-lg">${product.price.toFixed(2)}</span>
          <span className="text-[var(--muted)] text-xs">inc. GST</span>
        </div>
      </div>
    </Link>
  );
}
