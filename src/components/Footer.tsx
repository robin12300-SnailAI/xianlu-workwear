'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import categoriesData from '../../data/categories.json';

const CATS: string[] = categoriesData as string[];

export default function Footer() {
  return (
    <footer className="mt-20 bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="container-x py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--accent)] text-[var(--accent-ink)] font-head font-bold text-lg">
              X
            </span>
            <span className="font-head font-bold text-lg text-[var(--ink)]">
              Xianlu<span className="text-[var(--accent)]">.</span>
            </span>
          </div>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-xs">
            Australia&apos;s trusted workwear &amp; corporate apparel supplier. Premium garments,
            logo embroidery and Australia-wide delivery since 2024.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="chip">AS/NZS Certified</span>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h5 className="font-head font-semibold text-sm mb-4 text-[var(--ink)] uppercase tracking-wider">
            Shop
          </h5>
          <div className="space-y-2.5">
            <Link href="/products" className="footer-link block">All Products</Link>
            {CATS.map((c) => (
              <Link key={c} href={`/products?cat=${c}`} className="footer-link block">{c}</Link>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h5 className="font-head font-semibold text-sm mb-4 text-[var(--ink)] uppercase tracking-wider">
            Services
          </h5>
          <div className="space-y-2.5">
            <Link href="/products" className="footer-link block">Embroidery</Link>
            <Link href="/products" className="footer-link block">Screen Printing</Link>
            <Link href="/products" className="footer-link block">Dye Sublimation</Link>
            <Link href="/products?cat=Workwear" className="footer-link block">Indent Service</Link>
            <a href="mailto:info@xianlu.com.au" className="footer-link block">Contact Us</a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h5 className="font-head font-semibold text-sm mb-4 text-[var(--ink)] uppercase tracking-wider">
            Stay Connected
          </h5>
          <p className="text-sm text-[var(--ink-2)] mb-3 leading-relaxed">
            Be first to hear about new ranges, restocks &amp; offers.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 min-w-0 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button className="btn-primary px-4 py-2 text-sm">Join</button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)]">
        <div className="container-x py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>&copy; {new Date().getFullYear()} Xianlu Workwear. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <span>Paddy&apos;s Market, Sydney NSW · Australia-wide delivery</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
