'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { items, total, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-3">购物车是空的</p>
        <Link href="/products" className="text-brand font-medium">
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
            className="flex gap-4 bg-white border rounded-xl p-3 items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.image}
              alt={it.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-500">
                {[it.color, it.size].filter(Boolean).join(' / ')}
              </div>
              <div className="text-brand font-semibold">${it.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={it.qty}
                onChange={(e) =>
                  updateQty(it.slug, Number(e.target.value), it.color, it.size)
                }
                className="w-16 border rounded px-2 py-1"
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

      <div className="bg-white border rounded-xl p-4 h-fit">
        <div className="flex justify-between font-bold text-lg">
          <span>合计</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="block text-center bg-brand text-white font-semibold py-3 rounded-lg mt-4 hover:bg-brand-dark"
        >
          去结账
        </Link>
      </div>
    </div>
  );
}
