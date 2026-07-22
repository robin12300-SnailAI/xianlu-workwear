'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import type { Product } from '@/lib/types';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0] ?? '');
  const [size, setSize] = useState(product.sizes[0] ?? '');
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-4">
      {product.colors.length > 0 && (
        <div>
          <div className="text-sm text-[var(--muted)] mb-1">颜色</div>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`px-3 py-1 border rounded transition ${
                  color === c ? 'border-accent text-accent' : 'border-[var(--border)] text-[var(--ink)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div>
          <div className="text-sm text-[var(--muted)] mb-1">尺码</div>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1 border rounded transition ${
                  size === s ? 'border-accent text-accent' : 'border-[var(--border)] text-[var(--ink)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">数量</span>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="w-20 border rounded px-2 py-1"
        />
      </div>

      <button
        onClick={() => {
          addItem({
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0],
            color,
            size,
            qty,
          });
          router.push('/cart');
        }}
        className="w-full bg-accent text-[var(--accent-ink)] font-semibold py-3 rounded-lg hover:brightness-105 transition"
      >
        加入购物车
      </button>
    </div>
  );
}
