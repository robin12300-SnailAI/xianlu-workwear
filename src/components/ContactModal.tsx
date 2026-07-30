'use client';

import { useEffect, useState } from 'react';
import { getMergedAbout } from '../lib/localContent';
import type { AboutData } from '../lib/types';
import defaultAbout from '../../data/about.json';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * About Us 弹窗。
 * 内容来自后台管理（localStorage 草稿）或仓库 data/about.json（已发布版本）。
 */
export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [data, setData] = useState<AboutData>(defaultAbout as unknown as AboutData);

  // 打开时读一次，保证后台刚保存的内容能立刻反映出来
  useEffect(() => {
    if (open) setData(getMergedAbout());
  }, [open]);

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

  const blocks = data?.blocks ?? [];

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
          {data?.heroImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={data.heroImage}
              alt="Xianlu Workwear"
              className="w-full rounded-xl border border-[var(--border)] object-cover max-h-64 mb-2"
            />
          ) : null}

          {blocks.map((b, i) =>
            b.type === 'heading' ? (
              <h3
                key={i}
                className="font-head font-bold text-[var(--ink)] text-base pt-1"
                dangerouslySetInnerHTML={{ __html: b.content }}
              />
            ) : (
              <p key={i} dangerouslySetInnerHTML={{ __html: b.content }} />
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          {data?.footerNote || 'Australia-wide delivery'}
        </div>
      </div>
    </div>
  );
}
