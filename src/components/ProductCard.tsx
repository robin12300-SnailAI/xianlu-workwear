import Link from 'next/link';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl border overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-gray-100">
        {/* 用普通 img 即可，避免图床域名配置；后期接 Cloudflare R2 再换 next/image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.seoDescription || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-400">{product.category}</div>
        <div className="font-medium text-gray-800">{product.name}</div>
        <div className="text-brand font-semibold mt-1">${product.price.toFixed(2)}</div>
      </div>
    </Link>
  );
}
