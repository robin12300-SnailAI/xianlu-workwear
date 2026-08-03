'use client';

import { useState, useEffect } from 'react';
import { deliverInquiry, ORDER_EMAIL } from '@/lib/orderSubmit';

interface QuoteRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const WORKWEAR_TYPES = [
  'Hi-Vis Safety Vest',
  'Work Shirts',
  'Work Pants / Trousers',
  'Safety Footwear',
  'Protective Gloves',
  'Hi-Vis Jackets',
  'Polo Shirts',
  'Coveralls / Bib & Brace',
  'Fleece / Jumpers',
  'Headwear / Caps',
  'Custom Branded Apparel',
  'Other',
];

const QUANTITY_RANGES = [
  '1 – 10 items',
  '11 – 25 items',
  '26 – 50 items',
  '51 – 100 items',
  '101 – 250 items',
  '251 – 500 items',
  '500+ items',
];

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  workwearType: string;
  quantity: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  workwearType: '',
  quantity: '',
  notes: '',
};

export default function QuoteRequestModal({ open, onClose }: QuoteRequestModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /* Reset form when modal opens */
  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setErrors({});
      setStatus('idle');
    }
  }, [open]);

  /* Escape key + body scroll lock */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  /* ── Validation ──────────────────────────────────── */
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.company.trim()) errs.company = 'Company name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.workwearType) errs.workwearType = 'Please select a workwear type';
    if (!form.quantity) errs.quantity = 'Please select a quantity range';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit ─────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    try {
      /* Persist to localStorage */
      const submissions = JSON.parse(localStorage.getItem('xianlu-quote-requests') || '[]');
      const record = {
        ...form,
        id: Date.now(),
        submittedAt: new Date().toISOString(),
      };
      submissions.push(record);
      localStorage.setItem('xianlu-quote-requests', JSON.stringify(submissions));

      /* Deliver the enquiry to the business inbox */
      await deliverInquiry({
        kind: 'quote',
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
        },
        items: [],
        total: 0,
        notes: [
          `Workwear type: ${form.workwearType}`,
          `Quantity range: ${form.quantity}`,
          form.notes.trim() ? `Notes: ${form.notes.trim()}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        createdAt: new Date().toISOString(),
      });

      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    /* Clear error on edit */
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /* ── Input styles ────────────────────────────────── */
  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl bg-[var(--surface)] border text-sm transition-colors outline-none ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
        : 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20'
    } placeholder:text-[var(--muted)] text-[var(--ink)]`;

  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-[var(--ink-2)] mb-1.5';
  const errCls = 'text-xs text-red-500 mt-1 font-medium';

  /* ── Success state ──────────────────────────────── */
  if (status === 'success') {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Quote Request Submitted"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg mt-20 sm:mt-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 sm:p-10 text-center animate-[fadeIn_.25s_ease-out]">
          {/* Checkmark */}
          <div className="grid place-items-center w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-head font-bold text-xl text-[var(--ink)]">Quote Request Received!</h3>
          <p className="text-[var(--ink-2)] mt-3 leading-relaxed">
            Thank you, <strong>{form.name}</strong>. Our team will review your request and get back to you
            at <strong>{form.email}</strong> within 1 business day.
          </p>
          <button
            onClick={onClose}
            className="btn-primary mt-7"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Request a Quote"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-lg max-h-[90vh] mt-6 sm:mt-10 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-y-auto animate-[fadeIn_.2s_ease-out]">
        {/* Header — gradient to match CTA band */}
        <div
          className="px-6 py-5 border-b border-white/10 sticky top-0 z-10"
          style={{ background: 'linear-gradient(135deg,#0a2540 0%,#0a66c2 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-head font-bold text-lg text-white">Request a Quote</h2>
              <p className="text-white/70 text-xs mt-0.5">Get a tailored quote for your team</p>
            </div>
            <button
              onClick={onClose}
              className="grid place-items-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/15 transition"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name + Company row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quote-name" className={labelCls}>Full Name *</label>
              <input
                id="quote-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputCls('name')}
                placeholder="John Smith"
              />
              {errors.name && <p className={errCls}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="quote-company" className={labelCls}>Company Name *</label>
              <input
                id="quote-company"
                type="text"
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                className={inputCls('company')}
                placeholder="Acme Pty Ltd"
              />
              {errors.company && <p className={errCls}>{errors.company}</p>}
            </div>
          </div>

          {/* Email + Phone row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quote-email" className={labelCls}>Email *</label>
              <input
                id="quote-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={inputCls('email')}
                placeholder="you@company.com"
              />
              {errors.email && <p className={errCls}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="quote-phone" className={labelCls}>Phone *</label>
              <input
                id="quote-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={inputCls('phone')}
                placeholder="04XX XXX XXX"
              />
              {errors.phone && <p className={errCls}>{errors.phone}</p>}
            </div>
          </div>

          {/* Workwear type */}
          <div>
            <label htmlFor="quote-type" className={labelCls}>Workwear Type *</label>
            <select
              id="quote-type"
              value={form.workwearType}
              onChange={(e) => updateField('workwearType', e.target.value)}
              className={inputCls('workwearType')}
            >
              <option value="">Select a type…</option>
              {WORKWEAR_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.workwearType && <p className={errCls}>{errors.workwearType}</p>}
          </div>

          {/* Quantity range */}
          <div>
            <label htmlFor="quote-qty" className={labelCls}>Quantity Range *</label>
            <select
              id="quote-qty"
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              className={inputCls('quantity')}
            >
              <option value="">Select a range…</option>
              {QUANTITY_RANGES.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {errors.quantity && <p className={errCls}>{errors.quantity}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="quote-notes" className={labelCls}>Additional Notes</label>
            <textarea
              id="quote-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className={`${inputCls('notes')} resize-none`}
              placeholder="Logo requirements, colours, delivery deadline, etc."
            />
          </div>

          {/* Submit error banner */}
          {status === 'error' && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              Something went wrong while submitting. Please try again or email us at
              {' '}{ORDER_EMAIL}.
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
              disabled={status === 'submitting'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending…
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
