'use client';

import { useEffect } from 'react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ABOUT_PARAGRAPHS = [
  'Welcome to Xianlu Workwear.',
  'At Xianlu Workwear, we are committed to providing high-quality workwear that combines durability, comfort, and professional style. Whether you work in construction, warehousing, hospitality, healthcare, manufacturing, or other industries, our goal is to help you perform at your best with reliable clothing designed for everyday work.',
  'We carefully select products that meet the demands of modern workplaces, offering practical designs, quality materials, and excellent value. From work shirts and pants to hi-vis safety wear, jackets, footwear, and accessories, every product is chosen with performance and comfort in mind.',
  'Customer satisfaction is at the heart of everything we do. We strive to provide outstanding service, fast shipping, competitive pricing, and a smooth online shopping experience for individuals, businesses, and teams across Australia.',
  'At Xianlu Workwear, we believe that quality workwear is more than just clothing—it is protection, confidence, and professionalism. We are proud to support hardworking people by delivering dependable products they can trust every day.',
  'Thank you for choosing Xianlu Workwear. We look forward to serving you.',
];

export default function ContactModal({ open, onClose }: ContactModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="About Xianlu Workwear"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mt-8 sm:mt-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h2 className="font-head font-bold text-lg text-[var(--ink)] uppercase tracking-wider">
            About Us
          </h2>
          <button
            onClick={onClose}
            className="grid place-items-center w-8 h-8 rounded-full text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-3)] transition"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-4 text-[var(--ink-2)] leading-relaxed">
          {ABOUT_PARAGRAPHS.map((p, i) => (
            <p key={i} className={i === 0 ? 'font-semibold text-[var(--ink)]' : ''}>
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          Paddy&apos;s Market, Sydney NSW · Australia-wide delivery · info@xianlu.com.au
        </div>
      </div>
    </div>
  );
}
