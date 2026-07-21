'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function Header() {
  const { count } = useCart();
  const cats = ['HiVis', 'Workwear', 'Corporate', 'Chef', 'Hospitality', 'Accessories'];

  return (
    <header className="bg-[#212529] text-white sticky top-0 z-20 shadow-sm">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-wide text-white hover:text-gray-300 transition" style={{ fontFamily: 'var(--font-heading)' }}>
          Xianlu Workwear
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {cats.map((c) => (
            <Link key={c} href={`/products?cat=${c}`} className="nav-cat-link text-white/80 hover:text-white px-2 py-1">
              {c}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative text-sm font-medium bg-[#0d6efd] text-white px-3 py-1.5 rounded hover:bg-blue-600 transition"
          >
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile category scroll */}
      <div className="md:hidden bg-white border-t border-gray-200 flex gap-3 overflow-x-auto px-4 py-2 text-sm">
        {cats.map((c) => (
          <Link key={c} href={`/products?cat=${c}`} className="text-gray-600 hover:text-[#0d6efd] whitespace-nowrap">
            {c}
          </Link>
        ))}
      </div>
    </header>
  );
}
