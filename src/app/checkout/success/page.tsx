'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function SuccessPage() {
  const { clear } = useCart();
  const [done, setDone] = useState(false);

  // Clear cart on mount to prevent re-ordering
  useEffect(() => {
    if (!done) {
      clear();
      setDone(true);
    }
  }, [done, clear]);

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon-wrap">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="success-heading">Order Received!</h1>

        <div className="success-body">
          <p className="success-primary-msg">
            Thank you for your order. We&apos;ve received your request and will get back to you shortly.
          </p>

          <div className="success-details">
            <div className="detail-item">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M8 5v4M8 9h.01" />
              </svg>
              <span><strong>Confirmation email</strong> will be sent to your registered email address.</span>
            </div>
            <div className="detail-item">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="12" height="9" rx="1" /><path d="M14 7H2" /><path d="M5 4V2h6v2" />
              </svg>
              <span><strong>Logo / customisation</strong> details can be added by replying to the confirmation email.</span>
            </div>
            <div className="detail-item">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 5L6.5 11.5 3 8.5" /><circle cx="8" cy="8" r="6.5" />
              </svg>
              <span>We&apos;ll review your order and provide an <strong>estimated production timeline</strong>.</span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/products" className="btn-action btn-action-primary">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-action btn-action-secondary">
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .success-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem 1.25rem;
        }
        .success-card {
          max-width: 520px;
          text-align: center;
        }
        .success-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          margin-bottom: 1.5rem;
        }
        .success-heading {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .success-primary-msg {
          color: var(--muted);
          font-size: 0.98rem;
          line-height: 1.6;
          margin-bottom: 1.75rem;
        }
        .success-details {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          text-align: left;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem 1.35rem;
          margin-bottom: 2rem;
        }
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.86rem;
          color: var(--ink-2, var(--ink));
          line-height: 1.5;
        }
        .detail-item svg {
          flex-shrink: 0;
          color: var(--accent);
          margin-top: 1px;
        }
        .detail-item strong {
          color: var(--ink);
        }
        .success-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-action {
          display: inline-flex;
          align-items: center;
          padding: 0.72rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.92rem;
          transition: all 0.18s ease;
        }
        .btn-action-primary {
          background: var(--accent);
          color: var(--accent-ink);
        }
        .btn-action-primary:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .btn-action-secondary {
          background: transparent;
          color: var(--ink);
          border: 1.5px solid var(--border);
        }
        .btn-action-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
