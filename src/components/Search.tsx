'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import productsData from '../../data/products.json';
import { buildProductSeo } from '@/lib/productSeo';

const allProducts = productsData as Product[];

function normalize(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Every product used to store the identical SEO boilerplate, so terms like
 * "australia" or "quality" scored against all 12 records and polluted the
 * results. The generated text carries genuine per-product keywords instead
 * (fabric composition, normalised colours), so it is worth indexing.
 * Cached because the catalogue is static and this runs on every keystroke.
 */
const seoTextCache = new Map<string, { title: string; description: string }>();

function seoTextFor(product: Product) {
  const key = product.slug || product.id;
  let cached = seoTextCache.get(key);
  if (!cached) {
    const seo = buildProductSeo(product);
    cached = {
      title: normalize(seo.title),
      description: normalize(seo.description),
    };
    seoTextCache.set(key, cached);
  }
  return cached;
}

function calculateScore(product: Product, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  const name = normalize(product.name);
  const desc = normalize(product.description || '');
  const cat = normalize(product.category || '');
  const colors = normalize((product.colors || []).join(' '));
  const sizes = normalize((product.sizes || []).join(' '));
  const { title: seoTitle, description: seoDesc } = seoTextFor(product);

  let score = 0;

  // Full query match bonuses (stronger signal)
  if (name.includes(q)) score += 10;
  if (desc.includes(q)) score += 6;
  if (cat.includes(q)) score += 5;
  if (colors.includes(q)) score += 4;
  if (sizes.includes(q)) score += 4;
  if (seoTitle.includes(q)) score += 3;
  if (seoDesc.includes(q)) score += 2;

  // Per-term fuzzy/substring matching
  for (const term of terms) {
    if (name.includes(term)) score += 5;
    if (cat.includes(term)) score += 3;
    if (desc.includes(term)) score += 2;
    if (colors.includes(term)) score += 1;
    if (sizes.includes(term)) score += 1;
    if (seoTitle.includes(term)) score += 1;
    if (seoDesc.includes(term)) score += 1;
  }

  return score;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  // Debounced search: 300ms
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const timer = setTimeout(() => {
      performSearch(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function performSearch(trimmedQuery: string) {
    const scored = allProducts
      .map((p) => ({ product: p, score: calculateScore(p, trimmedQuery) }))
      .filter((x) => x.score > 0);
    scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
    setResults(scored.map((x) => x.product));
    setHasSearched(true);
  }

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    performSearch(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  function close() {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="搜索"
        title="搜索产品"
        className="grid place-items-center w-9 h-9 rounded-full border border-[var(--border)] text-[var(--ink-2)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-md">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索产品名称、描述、分类..."
              className="flex-1 min-w-0 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] text-sm font-semibold hover:brightness-105 transition whitespace-nowrap"
            >
              搜索
            </button>
          </div>

          {hasSearched && results.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-sm text-[var(--muted)]">未找到相关内容</div>
              <div className="text-xs text-[var(--ink-2)] mt-1">换个关键词试试</div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--accent-soft)]/30 transition-colors"
                >
                  {p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-[var(--surface-2)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-xs text-[var(--muted)]">无图</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-[var(--ink)]">{p.name}</div>
                    <div className="text-xs text-[var(--muted)]">{p.category} · ${p.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
