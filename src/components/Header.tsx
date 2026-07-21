'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Header() {
  const { count } = useCart();
  const cats = ['HiVis', 'Workwear', 'Corporate', 'Chef', 'Hospitality', 'Accessories'];

  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg text-brand whitespace-nowrap">
          Xianlu Workwear
        </Link>

        <nav className="hidden md:flex gap-4 text-sm text-gray-600">
          {cats.map((c) => (
            <Link key={c} href={`/products?cat=${c}`} className="hover:text-brand">
              {c}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="relative text-sm font-medium bg-brand text-white px-3 py-2 rounded-lg hover:bg-brand-dark"
        >
          Cart
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* 手机端分类 */}
      <div className="md:hidden border-t flex gap-3 overflow-x-auto px-4 py-2 text-sm text-gray-600">
        {cats.map((c) => (
          <Link key={c} href={`/products?cat=${c}`}>
            {c}
          </Link>
        ))}
      </div>
    </header>
  );
}
