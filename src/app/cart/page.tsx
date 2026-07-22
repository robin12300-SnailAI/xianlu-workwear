'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import SmartImage from '@/components/SmartImage';

export default function CartPage() {
  const { items, total, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--muted)] mb-3">购物车是空的</p>
        <Link href="/products" className="text-accent font-medium">
          去选购 →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 items-center"
          >
            <div className="w-20 h-20 rounded overflow-hidden bg-[var(--surface-2)] shrink-0">
              <SmartImage src={it.image} seed={it.slug} alt={it.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[var(--ink)] truncate">{it.name}</div>
              <div className="text-sm text-[var(--muted)]">
                {[it.color, it.size].filter(Boolean).join(' / ')}
              </div>
              <div className="text-accent font-semibold">${it.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={it.qty}
                onChange={(e) =>
                  updateQty(it.slug, Number(e.target.value), it.color, it.size)
                }
                className="w-16 border border-[var(--border)] rounded px-2 py-1 bg-[var(--surface)] text-[var(--ink)]"
              />
              <button
                onClick={() => removeItem(it.slug, it.color, it.size)}
                className="text-red-500 text-sm"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 h-fit">
        <div className="flex justify-between font-bold text-lg text-[var(--ink)]">
          <span>合计</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="block text-center bg-accent text-[var(--accent-ink)] font-semibold py-3 rounded-lg mt-4 hover:brightness-105 transition"
        >
          去结账
        </Link>
      </div>
    </div>
  );
}
