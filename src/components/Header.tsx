'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import Search from './Search';
import ContactModal from './ContactModal';
import ContactInfoModal from './ContactInfoModal';
import categoriesData from '../../data/categories.json';

const RAW_CATS: string[] = categoriesData as string[];
const CATS = RAW_CATS.filter((c) => c.toLowerCase() !== 'contact us');

export default function Header() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container-x h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--accent)] text-[var(--accent-ink)] font-head font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
            X
          </span>
          <span className="font-head font-bold text-[1.15rem] tracking-tight text-[var(--ink)] leading-none">
            Xianlu<span className="text-[var(--accent)]">.</span>
            <span className="block text-[0.62rem] font-medium tracking-[0.22em] uppercase text-[var(--muted)]">
              Workwear
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {CATS.map((c) => (
            <Link key={c} href={`/products?cat=${c}`} className="nav-link">
              {c}
            </Link>
          ))}
          <button
            onClick={() => setContactOpen(true)}
            className="nav-link uppercase tracking-wider text-[var(--accent)] hover:text-[var(--accent)]/80"
          >
            About Us
          </button>
          <button
            onClick={() => setContactInfoOpen(true)}
            className="nav-link uppercase tracking-wider text-[var(--accent)] hover:text-[var(--accent)]/80"
          >
            Contact Us
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Search />
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 bg-[var(--accent)] text-[var(--accent-ink)] text-sm font-semibold px-3.5 py-2 rounded-lg hover:brightness-105 transition shadow-sm"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#e11d48] text-white text-[0.7rem] font-bold w-5 h-5 rounded-full grid place-items-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile category rail */}
      <div className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-2">
          {CATS.map((c) => (
            <Link
              key={c}
              href={`/products?cat=${c}`}
              className="nav-link whitespace-nowrap"
            >
              {c}
            </Link>
          ))}
          <button
            onClick={() => setContactOpen(true)}
            className="nav-link whitespace-nowrap uppercase tracking-wider text-[var(--accent)]"
          >
            About Us
          </button>
          <button
            onClick={() => setContactInfoOpen(true)}
            className="nav-link whitespace-nowrap uppercase tracking-wider text-[var(--accent)]"
          >
            Contact Us
          </button>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <ContactInfoModal open={contactInfoOpen} onClose={() => setContactInfoOpen(false)} />
    </header>
  );
}
