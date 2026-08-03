'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import SmartImage from '@/components/SmartImage';

export default function CartPage() {
  const { items, total, updateQty, removeItem, clear } = useCart();

  // ── Empty state ────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
        </div>
        <h2 className="cart-empty-title">Your cart is empty</h2>
        <p className="cart-empty-sub">Browse our workwear collection and find what you need.</p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="cart-header">
        <h1 className="cart-title">Your Shopping Cart</h1>
        <span className="cart-count-badge">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Desktop: side-by-side layout ─────────────────── */}
      <div className="cart-layout">
        {/* ── Items Table ─────────────────────────────── */}
        <div className="cart-items-section">
          {/* Column headers (desktop only) */}
          <div className="cart-table-header">
            <span className="col-product">Product</span>
            <span className="col-price">Price</span>
            <span className="col-qty">Qty</span>
            <span className="col-subtotal">Sub Total</span>
            <span className="col-action"></span>
          </div>

          {/* Item rows */}
          <div className="cart-item-list">
            {items.map((it, i) => {
              const subTotal = it.price * it.qty;
              const variantText = [it.color, it.size].filter(Boolean).join(' / ');

              return (
                <div key={`${it.slug}-${it.color ?? ''}-${it.size ?? ''}-${i}`} className="cart-item-row">
                  {/* Product: image + name + variant */}
                  <div className="cell-product">
                    <div className="item-image-wrap">
                      <SmartImage src={it.image} seed={it.slug} alt={it.name} className="item-thumb" />
                    </div>
                    <div className="item-info">
                      <span className="item-name">{it.name}</span>
                      {variantText && <span className="item-variant">{variantText}</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="cell-price">
                    <span className="price-value">${it.price.toFixed(2)}</span>
                  </div>

                  {/* Quantity stepper */}
                  <div className="cell-qty">
                    <div className="qty-stepper">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQty(it.slug, Math.max(1, it.qty - 1), it.color, it.size)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={it.qty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v >= 1 && v <= 99) updateQty(it.slug, v, it.color, it.size);
                        }}
                        className="qty-input"
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQty(it.slug, Math.min(99, it.qty + 1), it.color, it.size)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Sub Total */}
                  <div className="cell-subtotal">
                    <span className="subtotal-value">${subTotal.toFixed(2)}</span>
                  </div>

                  {/* Action: delete */}
                  <div className="cell-action">
                    <button
                      onClick={() => removeItem(it.slug, it.color, it.size)}
                      className="delete-btn"
                      aria-label={`Remove ${it.name}`}
                      title="Remove item"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4m2 0v9.33a1.33 1.33 0 0 1-1.33 1.34H4.33A1.33 1.33 0 0 1 3 13.33V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="cart-bottom-actions">
            <Link href="/products" className="btn-continue-shopping">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              Continue Shopping
            </Link>
            <button onClick={clear} className="btn-clear-cart" type="button">
              Clear Cart
            </button>
          </div>
        </div>

        {/* ── Cart Total & Checkout ───────────────────── */}
        <div className="cart-summary-bottom">
          <div className="summary-total">
            <span>Total</span>
            <span className="total-amount">${total.toFixed(2)}</span>
          </div>

          <div className="summary-note">
            Prices are in AUD. Shipping calculated at checkout.
          </div>

          <Link href="/checkout" className="btn-checkout">
            Proceed to Checkout
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Styles ─────────────────────────────────────────── */}
      <style jsx>{`
        .cart-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.25rem 4rem;
        }

        /* ── Empty State ─────────────────────────────── */
        .cart-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 1.5rem;
          text-align: center;
        }
        .cart-empty-icon {
          color: var(--muted);
          opacity: 0.45;
          margin-bottom: 1.25rem;
        }
        .cart-empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 0.5rem;
        }
        .cart-empty-sub {
          color: var(--muted);
          font-size: 0.95rem;
          margin-bottom: 1.75rem;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--accent);
          color: var(--accent-ink);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        /* ── Header ─────────────────────────────────── */
        .cart-header {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border);
        }
        .cart-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .cart-count-badge {
          display: inline-flex;
          align-items: center;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
        }

        /* ── Layout ─────────────────────────────────── */
        .cart-layout {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* ── Items Section ──────────────────────────── */
        .cart-items-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        /* Table header */
        .cart-table-header {
          display: grid;
          grid-template-columns: 1fr 90px 130px 100px 48px;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted);
        }
        @media (max-width: 768px) {
          .cart-table-header {
            display: none;
          }
        }
        .col-product { text-align: left; }
        .col-price { text-align: right; }
        .col-qty { text-align: center; }
        .col-subtotal { text-align: right; }
        .col-action { text-align: center; }

        /* Item list */
        .cart-item-list {
          divide-y: divide-y var(--border);
        }
        .cart-item-list > :not([hidden]) ~ :not([hidden]) {
          border-top: 1px solid var(--border);
        }

        /* Item row */
        .cart-item-row {
          display: grid;
          grid-template-columns: 1fr 90px 130px 100px 48px;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          align-items: center;
          transition: background 0.15s ease;
        }
        .cart-item-row:hover {
          background: var(--surface-2);
        }
        @media (max-width: 768px) {
          .cart-item-row {
            grid-template-columns: 1fr auto auto;
            grid-template-areas:
              "product product product"
              "price qty action";
            gap: 0.5rem;
            padding: 1rem;
          }
        }

        /* Cell: Product */
        .cell-product {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .cell-product {
            grid-area: product;
            margin-bottom: 0.5rem;
          }
        }
        .item-image-wrap {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface-2);
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .item-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .item-name {
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--ink);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .item-variant {
          font-size: 0.8rem;
          color: var(--muted);
        }

        /* Cell: Price */
        .cell-price {
          text-align: right;
        }
        @media (max-width: 768px) {
          .cell-price {
            grid-area: price;
            text-align: left;
          }
        }
        .price-value {
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--ink);
        }

        /* Cell: Qty */
        .cell-qty {
          display: flex;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .cell-qty {
            grid-area: qty;
            justify-content: flex-start;
          }
        }
        .qty-stepper {
          display: inline-flex;
          align-items: center;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--surface);
        }
        .qty-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          color: var(--ink);
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.15s ease;
          flex-shrink: 0;
        }
        .qty-btn:hover {
          background: var(--surface-2);
        }
        .qty-input {
          width: 42px;
          height: 32px;
          text-align: center;
          border: none;
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
          font-size: 0.88rem;
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

        /* Cell: Sub Total */
        .cell-subtotal {
          text-align: right;
        }
        @media (max-width: 768px) {
          .cell-subtotal {
            display: none;
          }
        }
        .subtotal-value {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--ink);
        }

        /* Cell: Action */
        .cell-action {
          display: flex;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .cell-action {
            grid-area: action;
            justify-content: flex-end;
          }
        }
        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: 1.5px solid transparent;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .delete-btn:hover {
          color: #e11d48;
          background: #fef2f2;
          border-color: #fecdd3;
        }

        /* ── Bottom Actions ──────────────────────────── */
        .cart-bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border);
          background: var(--surface-2);
        }
        .btn-continue-shopping {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--accent);
          transition: gap 0.2s ease;
        }
        .btn-continue-shopping:hover {
          gap: 0.65rem;
        }
        .btn-clear-cart {
          font-size: 0.82rem;
          color: var(--muted);
          background: transparent;
          border: 1px solid var(--border);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .btn-clear-cart:hover {
          color: #e11d48;
          border-color: #fecdd3;
          background: #fef2f2;
        }

        /* ── Cart Total & Checkout ───────────────────── */
        .cart-summary-bottom {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          max-width: 420px;
          margin-left: auto;
        }
        @media (max-width: 900px) {
          .cart-summary-bottom {
            max-width: 100%;
          }
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--ink);
        }
        .total-amount {
          color: var(--accent);
        }
        .summary-note {
          font-size: 0.78rem;
          color: var(--muted);
          margin-top: 0.6rem;
          line-height: 1.4;
        }
        .btn-checkout {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          background: var(--accent);
          color: var(--accent-ink);
          font-weight: 700;
          font-size: 1rem;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          margin-top: 1.25rem;
          transition: all 0.22s ease;
        }
        .btn-checkout:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  );
}
