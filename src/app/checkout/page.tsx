'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { deliverInquiry } from '@/lib/orderSubmit';

// ── Types ───────────────────────────────────────────────────
interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

type PaymentMethod = 'bank_transfer' | 'quote_request';

const INITIAL_SHIPPING: ShippingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  city: '',
  state: '',
  postcode: '',
  country: 'Australia',
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const [shipping, setShipping] = useState<ShippingInfo>(INITIAL_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('quote_request');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Empty cart guard ─────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Add some items before checking out.</p>
        <Link href="/products" className="btn-link-accent">Browse Products →</Link>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────
  function updateField<K extends keyof ShippingInfo>(key: K, value: ShippingInfo[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!shipping.firstName || !shipping.lastName) {
      setError('Please enter your first and last name.');
      setLoading(false);
      return;
    }
    if (!shipping.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!shipping.address || !shipping.city || !shipping.state || !shipping.postcode) {
      setError('Please complete your shipping address.');
      setLoading(false);
      return;
    }

    try {
      // No online card payment yet — this is a simulated / offline payment flow.
      // The enquiry is delivered to the business inbox, then we confirm to the user.
      const result = await deliverInquiry({
        kind: 'order',
        customer: {
          name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          email: shipping.email,
          phone: shipping.phone || undefined,
          company: shipping.company || undefined,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          postcode: shipping.postcode,
          country: shipping.country,
        },
        items,
        total,
        paymentMethod:
          paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Quote Request',
        notes: notes.trim() || undefined,
        logoFileName: logoFile?.name,
        createdAt: new Date().toISOString(),
      });

      try {
        sessionStorage.setItem('xianlu_last_ref', result.ref);
        sessionStorage.setItem('xianlu_last_mailto', result.mailtoUrl);
      } catch {
        // sessionStorage unavailable (private mode) — non-fatal
      }

      // The success page clears the cart on mount, which avoids an
      // "empty cart" flash here before the route transition completes.
      router.push('/checkout/success');
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  // ── Payment option descriptions ────────────────────────────
  const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; desc: string }[] = [
    {
      id: 'quote_request',
      label: 'Request a Quote',
      desc: 'Receive a formal quote via email. No payment required now — ideal for bulk or custom orders.',
    },
    {
      id: 'bank_transfer',
      label: 'Bank Transfer',
      desc: 'Pay via direct bank transfer. We\'ll send account details after you place the order.',
    },
  ];

  return (
    <div className="checkout-page">
      {/* Breadcrumb */}
      <nav className="checkout-breadcrumb">
        <Link href="/cart">Cart</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Checkout</span>
      </nav>

      <h1 className="checkout-title">Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-main">

          {/* ── Section: Contact Information ─────────── */}
          <fieldset className="field-section">
            <legend className="section-legend">Contact Information</legend>
              <div className="form-row two-col">
                <div className="field-group">
                  <label htmlFor="firstName" className="field-label">First Name <span className="required">*</span></label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={shipping.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="field-input"
                    placeholder="John"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="lastName" className="field-label">Last Name <span className="required">*</span></label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={shipping.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="field-input"
                    placeholder="Smith"
                  />
                </div>
              </div>
              <div className="form-row two-col">
                <div className="field-group">
                  <label htmlFor="email" className="field-label">Email Address <span className="required">*</span></label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="field-input"
                    placeholder="you@company.com.au"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="phone" className="field-label">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="field-input"
                    placeholder="+61 400 000 000"
                  />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="company" className="field-label">Company Name</label>
                <input
                  id="company"
                  type="text"
                  value={shipping.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="field-input"
                  placeholder="Your company (optional)"
                />
              </div>
            </fieldset>

            {/* ── Section: Shipping Address ───────────── */}
            <fieldset className="field-section">
              <legend className="section-legend">Shipping Address</legend>
              <div className="field-group">
                <label htmlFor="address" className="field-label">Street Address <span className="required">*</span></label>
                <textarea
                  id="address"
                  required
                  rows={2}
                  value={shipping.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="field-input"
                  placeholder="Unit / Building / Street name"
                />
              </div>
              <div className="form-row three-col">
                <div className="field-group">
                  <label htmlFor="city" className="field-label">City / Suburb <span className="required">*</span></label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="field-input"
                    placeholder="Sydney"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="state" className="field-label">State <span className="required">*</span></label>
                  <select
                    id="state"
                    required
                    value={shipping.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="field-input field-select"
                  >
                    <option value="">Select…</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="QLD">QLD</option>
                    <option value="SA">SA</option>
                    <option value="WA">WA</option>
                    <option value="TAS">TAS</option>
                    <option value="NT">NT</option>
                    <option value="ACT">ACT</option>
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="postcode" className="field-label">Postcode <span className="required">*</span></label>
                  <input
                    id="postcode"
                    type="text"
                    required
                    value={shipping.postcode}
                    onChange={(e) => updateField('postcode', e.target.value)}
                    className="field-input"
                    placeholder="2000"
                  />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="country" className="field-label">Country</label>
                <select
                  id="country"
                  value={shipping.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="field-input field-select"
                >
                  <option value="Australia">Australia</option>
                  <option value="New Zealand">New Zealand</option>
                </select>
              </div>
            </fieldset>

            {/* ── Section: Logo Upload (Workwear Custom) ─ */}
            <fieldset className="field-section">
              <legend className="section-legend">Logo &amp; Customisation</legend>
              <div className="field-group">
                <label htmlFor="logoUpload" className="field-label">Logo File</label>
                <p className="field-hint">
                  Tell us which logo file you&apos;ll be using. Accepted formats: PNG, JPG, SVG, PDF, EPS, AI.
                  We&apos;ll reply to your email so you can attach the artwork directly.
                </p>
                <div className="file-upload-area">
                  <input
                    id="logoUpload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.pdf,.eps,.ai"
                    onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                    className="file-input"
                  />
                  <div className="file-upload-label">
                    {logoFile ? (
                      <span className="file-selected">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 5L6.5 11.5L3 8" /></svg>
                        {logoFile.name}
                      </span>
                    ) : (
                      <>
                        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 13V3m0 0L4 7m4-4l4 4" /><path d="M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
                        </svg>
                        <span>Click to select your logo file</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="orderNotes" className="field-label">Special Instructions</label>
                <textarea
                  id="orderNotes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="field-input"
                  placeholder='E.g. "Left chest embroidery, height 8cm", "Add name tags on each item", etc.'
                />
              </div>
            </fieldset>

            {/* ── Section: Payment Method ──────────────── */}
            <fieldset className="field-section">
              <legend className="section-legend">Payment Method</legend>
              <div className="payment-options">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`payment-option ${paymentMethod === opt.id ? 'payment-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="payment-radio"
                    />
                    <div className="payment-info">
                      <span className="payment-label">{opt.label}</span>
                      <span className="payment-desc">{opt.desc}</span>
                    </div>
                    {paymentMethod === opt.id && (
                      <div className="payment-check">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 4L6 11.5 3 8.5" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
              <p className="payment-note">
                Online card payment is not enabled yet. No card details are collected
                on this site and no charge is made when you submit this form.
              </p>
            </fieldset>

            {/* Error message */}
            {error && (
              <div className="checkout-error">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3.5M8 10.8v.2" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit-order"
            >
              {loading ? (
                <span className="submit-loading">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="spin">
                    <path d="M14 8a6 6 0 11-3.5-5.47" strokeLinecap="round" />
                  </svg>
                  Processing…
                </span>
              ) : (
                <>
                  {paymentMethod === 'quote_request' && 'Submit Quote Request'}
                  {paymentMethod === 'bank_transfer' && 'Place Order'}
                </>
              )}
            </button>

            <p className="submit-disclaimer">
              By placing this order you agree to our terms of service.
              Your information is secure and will never be shared.
            </p>
          </div>
        </form>

      {/* ── Styles ─────────────────────────────────────────── */}
      <style jsx>{`
        .checkout-page {
          max-width: 1160px;
          margin: 0 auto;
          padding: 1.75rem 1.25rem 4rem;
        }

        /* Breadcrumb */
        .checkout-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 1rem;
        }
        .checkout-breadcrumb a {
          color: var(--accent);
          font-weight: 500;
          transition: opacity 0.15s;
        }
        .checkout-breadcrumb a:hover { opacity: 0.75; }
        .breadcrumb-current { color: var(--ink); font-weight: 600; }

        /* Title */
        .checkout-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
          margin-bottom: 1.75rem;
        }

        /* Empty */
        .checkout-empty {
          text-align: center;
          padding: 5rem 1.5rem;
        }
        .checkout-empty h2 { font-size: 1.5rem; color: var(--ink); margin-bottom: 0.5rem; }
        .checkout-empty p { color: var(--muted); margin-bottom: 1.25rem; }
        .btn-link-accent {
          display: inline-block;
          color: var(--accent);
          font-weight: 600;
          font-size: 0.95rem;
        }
        .btn-link-accent:hover { text-decoration: underline; }

        /* Form Layout */
        .checkout-form { margin-top: 0; }
        .checkout-main {
          max-width: 760px;
          margin: 0 auto;
        }

        /* Field Sections */
        .field-section {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          background: var(--surface);
        }
        .field-section:last-child { margin-bottom: 0; }
        .section-legend {
          font-size: 1rem;
          font-weight: 700;
          color: var(--ink);
          padding: 0;
          margin-bottom: 1rem;
          display: block;
        }

        /* Form Rows */
        .form-row { display: flex; gap: 1rem; }
        .form-row.two-col > * { flex: 1; }
        .form-row.three-col > * { flex: 1; }
        @media (max-width: 600px) {
          .form-row { flex-direction: column; gap: 0; }
        }

        /* Fields */
        .field-group { margin-bottom: 1rem; }
        .field-group:last-child { margin-bottom: 0; }
        .field-label {
          display: block;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 0.35rem;
        }
        .required { color: #e11d48; }
        .field-hint {
          font-size: 0.78rem;
          color: var(--muted);
          margin-bottom: 0.45rem;
          line-height: 1.4;
        }
        .field-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--ink);
          font-size: 0.9rem;
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .field-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .field-input::placeholder { color: var(--muted); opacity: 0.7; }
        .field-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2rem;
        }

        /* File Upload */
        .file-upload-area {
          position: relative;
          border: 2px dashed var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface-2);
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease;
        }
        .file-upload-area:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .file-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 1.25rem;
          font-size: 0.85rem;
          color: var(--muted);
          text-align: center;
        }
        .file-selected {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #16a34a;
          font-weight: 600;
          font-size: 0.88rem;
        }

        /* Payment Options */
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .payment-option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.1rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.18s ease;
          position: relative;
        }
        .payment-option:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .payment-selected {
          border-color: var(--accent);
          background: var(--accent-soft);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .payment-radio {
          margin-top: 0.15rem;
          accent-color: var(--accent);
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .payment-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          flex: 1;
        }
        .payment-label {
          font-weight: 650;
          font-size: 0.92rem;
          color: var(--ink);
        }
        .payment-desc {
          font-size: 0.8rem;
          color: var(--muted);
          line-height: 1.4;
        }
        .payment-check {
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .payment-note {
          font-size: 0.76rem;
          color: var(--muted);
          line-height: 1.45;
          margin-top: 0.8rem;
        }

        /* Error */
        .checkout-error {
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
          padding: 0.7rem 0.85rem;
          background: #fef2f2;
          border: 1px solid #fecdd3;
          border-radius: var(--radius-sm);
          color: #dc2626;
          font-size: 0.84rem;
          line-height: 1.4;
          margin-top: 0.75rem;
        }
        .checkout-error svg { flex-shrink: 0; margin-top: 1px; color: #e11d48; }

        /* Submit Button */
        .btn-submit-order {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.9rem 1.5rem;
          background: var(--accent);
          color: var(--accent-ink);
          font-weight: 750;
          font-size: 1.02rem;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          margin-top: 1.25rem;
          transition: all 0.22s ease;
        }
        .btn-submit-order:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        .btn-submit-order:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .submit-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 0.8s linear infinite; }

        .submit-disclaimer {
          font-size: 0.72rem;
          color: var(--muted);
          text-align: center;
          margin-top: 0.75rem;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
