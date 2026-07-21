import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-bocini group block"
    >
      <div className="aspect-square bg-[#f4f6f8] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.seoDescription || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</div>
        <div className="font-medium text-[#212529] mt-0.5">{product.name}</div>
        <div className="text-[#0d6efd] font-semibold mt-1">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}
