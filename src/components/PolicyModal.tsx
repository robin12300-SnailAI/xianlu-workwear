'use client';

import { useEffect } from 'react';

interface PolicyModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string; // HTML 富文本
}

/**
 * Policy 弹窗。内容由后台维护并实时同步。
 */
export default function PolicyModal({ open, onClose, title, content }: PolicyModalProps) {
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
      aria-label={title}
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
            {title}
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
        <div className="overflow-y-auto p-6 sm:p-8 text-[var(--ink-2)] leading-relaxed">
          <div
            className="policy-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          Last updated: August 2026
        </div>
      </div>
    </div>
  );
}
