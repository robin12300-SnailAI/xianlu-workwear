'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import type { Product } from '@/lib/types';

/* ════════════════════════════════════════════════════════════════
   Product Variant Selector — Premium Interactive Component
   Supports: color dropdown · size dropdown · qty stepper ·
   color→size dependency · out-of-stock states · cart integration
   ════════════════════════════════════════════════════════════════ */

// ── Types ───────────────────────────────────────────────────────

interface VariantStock {
  [color: string]: string[] | undefined; // color → available sizes
}

interface ProductSelectorProps {
  product: Product;
  variantStock?: VariantStock; // optional: per-color size availability
}

// ── Dropdown Component ──────────────────────────────────────────

function Dropdown({
  label,
  value,
  options,
  disabledOptions,
  placeholder,
  onChange,
  isOpen,
  onToggle,
}: {
  label: string;
  value: string;
  options: string[];
  disabledOptions?: Set<string>;
  placeholder?: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onToggle]);

  const isDisabled = (opt: string) => disabledOptions?.has(opt) ?? false;

  return (
    <div className="variant-select-group" ref={ref}>
      <label className="variant-label">{label}</label>
      <div className="variant-dropdown-wrapper">
        <button
          type="button"
          className={`variant-dropdown-trigger ${isOpen ? 'variant-dropdown-open' : ''} ${!value ? 'variant-dropdown-placeholder' : ''}`}
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <span className="variant-dropdown-value">{value || placeholder || `Select ${label}`}</span>
          <svg
            className={`variant-dropdown-chevron ${isOpen ? 'variant-chevron-rotated' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isOpen && (
          <ul className="variant-dropdown-menu" role="listbox">
            {options.map((opt) => {
              const disabled = isDisabled(opt);
              const selected = opt === value;
              return (
                <li
                  key={opt}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={disabled}
                  className={`variant-option ${selected ? 'variant-option-selected' : ''} ${disabled ? 'variant-option-disabled' : ''}`}
                  onClick={() => {
                    if (!disabled) {
                      onChange(opt);
                      onToggle();
                    }
                  }}
                  onMouseDown={(e) => {
                    // Prevent blur from closing before click registers
                    if (!disabled) e.preventDefault();
                  }}
                >
                  <span className="option-text">{opt}</span>
                  {selected && (
                    <svg className="option-check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {disabled && <span className="option-badge-unavailable">Unavailable</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Quantity Stepper ────────────────────────────────────────────

function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="qty-stepper-group">
      <label className="variant-label">Quantity</label>
      <div className="qty-stepper">
        <button
          type="button"
          className="qty-btn qty-btn-minus"
          onClick={decrement}
          disabled={value <= min}
          aria-label="Decrease quantity"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="qty-input"
          aria-label="Quantity"
        />
        <button
          type="button"
          className="qty-btn qty-btn-plus"
          onClick={increment}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────

export default function AddToCartButton({ product, variantStock }: ProductSelectorProps) {
  const { addItem } = useCart();
  const router = useRouter();

  // Selection state
  const [color, setColor] = useState(product.colors[0] ?? '');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);

  // Dropdown open state
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);

  // Success animation state
  const [added, setAdded] = useState(false);

  // ── Derived: available sizes for current color ───────────────
  const getAvailableSizes = useCallback((): string[] => {
    if (variantStock && color && variantStock[color]) {
      return variantStock[color] ?? [];
    }
    // No dependency data → all sizes available
    return product.sizes;
  }, [variantStock, color, product.sizes]);

  const availableSizes = getAvailableSizes();
  const disabledSizes = new Set(
    product.sizes.filter((s) => !availableSizes.includes(s)),
  );

  // ── Auto-select first available size when color changes ──────
  useEffect(() => {
    if (color) {
      const sizes = getAvailableSizes();
      if (sizes.length > 0 && (!sizes.includes(size) || !size)) {
        setSize(sizes[0]);
      } else if (sizes.length === 0) {
        setSize('');
      }
    }
  }, [color]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Can add to cart? ────────────────────────────────────────
  const canAdd =
    product.colors.length === 0 ||
    (product.colors.length > 0 && color && (product.sizes.length === 0 || size));

  // Stock message
  const stockMessage = product.inStock
    ? 'In stock · Australia-wide delivery'
    : 'Made to order';

  // ── Add to cart handler ─────────────────────────────────────
  const handleAddToCart = () => {
    if (!canAdd) return;

    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: product.colors.length > 0 ? color : undefined,
      size: product.sizes.length > 0 ? size : undefined,
      qty,
    });

    // Brief success feedback
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      router.push('/cart');
    }, 600);
  };

  return (
    <div className="product-selector">
      {/* ── Color Selector ─────────────────────────────────── */}
      {product.colors.length > 0 && (
        <Dropdown
          label="Colour"
          value={color}
          options={product.colors}
          placeholder="Choose a colour"
          onChange={(c) => {
            setColor(c);
            setSize(''); // Reset size when color changes
          }}
          isOpen={colorOpen}
          onToggle={() => {
            setColorOpen(!colorOpen);
            if (sizeOpen) setSizeOpen(false);
          }}
        />
      )}

      {/* ── Size Selector ──────────────────────────────────── */}
      {product.sizes.length > 0 && (
        <Dropdown
          label="Size"
          value={size}
          options={product.sizes}
          disabledOptions={disabledSizes.size > 0 ? disabledSizes : undefined}
          placeholder="Choose a size"
          onChange={setSize}
          isOpen={sizeOpen}
          onToggle={() => {
            setSizeOpen(!sizeOpen);
            if (colorOpen) setColorOpen(false);
          }}
        />
      )}

      {/* ── Size unavailability notice ─────────────────────── */}
      {color && availableSizes.length < product.sizes.length && availableSizes.length > 0 && (
        <p className="variant-notice">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 4v3.5M7 9.8v.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Only {availableSizes.join(', ')} available in {color}
        </p>
      )}

      {/* ── Quantity Stepper ───────────────────────────────── */}
      <QtyStepper value={qty} onChange={setQty} />

      {/* ── Add to Cart Button ──────────────────────────────── */}
      <button
        type="button"
        className={`add-to-cart-btn ${added ? 'atc-success' : ''} ${!canAdd ? 'atc-disabled' : ''}`}
        onClick={handleAddToCart}
        disabled={!canAdd}
      >
        {added ? (
          <span className="atc-success-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10l4 4L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added!
          </span>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="atc-cart-icon">
              <path d="M2.5 4.5h2.4l2.3 8.4a1 1 0 001 .75h6.4a1 1 0 001-.75L17 6.5H4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="13.5" cy="15.5" r="1.25" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Add to Cart
          </>
        )}
      </button>

      {/* ── Stock Status ────────────────────────────────────── */}
      <div className={`stock-status ${product.inStock ? 'stock-in' : 'stock-order'}`}>
        {product.inStock ? (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M3 7.5l3 3L12 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7.5 4.5v4M7.5 10v.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}
        {stockMessage}
      </div>

      {/* ── Inline Styles ──────────────────────────────────── */}
      <style jsx>{`
        /* ── Container ─────────────────────────────────── */
        .product-selector {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* ── Shared Label ───────────────────────────────── */
        .variant-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted);
          margin-bottom: 0.45rem;
        }

        /* ── Dropdown ───────────────────────────────────── */
        .variant-dropdown-wrapper {
          position: relative;
        }

        .variant-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.72rem 1rem;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--ink);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .variant-dropdown-trigger:hover {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .variant-dropdown-trigger:focus-visible {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .variant-dropdown-open {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }

        .variant-dropdown-placeholder {
          color: var(--muted);
        }

        .variant-dropdown-value {
          flex: 1;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .variant-dropdown-chevron {
          flex-shrink: 0;
          margin-left: 0.5rem;
          color: var(--muted);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .variant-chevron-rotated {
          transform: rotate(180deg);
        }

        /* ── Dropdown Menu ───────────────────────────────── */
        .variant-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 50;
          max-height: 220px;
          overflow-y: auto;
          padding: 0.35rem 0;
          background: var(--surface);
          border: 1.5px solid var(--accent);
          border-top: none;
          border-radius: 0 0 var(--radius-sm) var(--radius-sm);
          box-shadow: var(--shadow);
          list-style: none;
          animation: menuSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes menuSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Option Items ────────────────────────────────── */
        .variant-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.89rem;
          font-weight: 500;
          color: var(--ink);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .variant-option:hover:not(.variant-option-disabled):not(.variant-option-selected) {
          background: var(--surface-2);
        }

        .variant-option-selected {
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 600;
        }

        .variant-option-selected:hover {
          background: color-mix(in srgb, var(--accent) 15%, transparent);
        }

        .variant-option-disabled {
          color: var(--muted);
          cursor: not-allowed;
          opacity: 0.55;
        }

        .option-text {
          flex: 1;
        }

        .option-check {
          flex-shrink: 0;
          color: var(--accent);
        }

        .option-badge-unavailable {
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.12rem 0.4rem;
          border-radius: 999px;
          background: var(--surface-2);
          color: var(--muted);
        }

        /* ── Notice ──────────────────────────────────────── */
        .variant-notice {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #d97706; /* amber-600 */
          background: rgba(217, 119, 6, 0.07);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(217, 119, 6, 0.18);
        }

        /* ── Quantity Stepper ────────────────────────────── */
        .qty-stepper {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface);
          transition: border-color 0.2s ease;
        }

        .qty-stepper:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .qty-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: transparent;
          border: none;
          color: var(--ink);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: var(--surface-2);
          color: var(--accent);
        }

        .qty-btn:active:not(:disabled) {
          transform: scale(0.92);
        }

        .qty-btn:disabled {
          color: var(--muted);
          cursor: not-allowed;
          opacity: 0.45;
        }

        .qty-input {
          width: 52px;
          height: 42px;
          text-align: center;
          border: none;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--ink);
          background: transparent;
          outline: none;
          -moz-appearance: textfield;
        }

        .qty-input::-webkit-inner-spin-button,
        .qty-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* ── Add to Cart Button ──────────────────────────── */
        .add-to-cart-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: var(--accent);
          color: var(--accent-ink);
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }

        .add-to-cart-btn:hover:not(:disabled):not(.atc-success) {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          filter: brightness(1.08);
        }

        .add-to-cart-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .add-to-cart-btn:disabled,
        .atc-disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
          filter: none !important;
        }

        /* Success state */
        .atc-success {
          background: #059669; /* emerald-600 */
          color: #fff;
        }

        .atc-success-content {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          animation: successPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes successPop {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }

        .atc-cart-icon {
          flex-shrink: 0;
        }

        /* ── Stock Status ────────────────────────────────── */
        .stock-status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .stock-in {
          color: #059669;
        }

        .stock-order {
          color: #d97706;
        }

        /* ── Scrollbar for dropdown ──────────────────────── */
        .variant-dropdown-menu::-webkit-scrollbar {
          width: 5px;
        }

        .variant-dropdown-menu::-webkit-scrollbar-track {
          background: transparent;
        }

        .variant-dropdown-menu::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 999px;
        }

        .variant-dropdown-menu::-webkit-scrollbar-thumb:hover {
          background: var(--muted);
        }
      `}</style>
    </div>
  );
}
