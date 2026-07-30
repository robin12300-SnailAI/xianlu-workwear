'use client';

import { useEffect, useState } from 'react';
import { getMergedContact } from '../lib/localContent';
import type { ContactData } from '../lib/types';
import defaultContact from '../../data/contact.json';

interface ContactInfoModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Contact Us 弹窗。
 * 内容来自后台管理（localStorage 草稿）或仓库 data/contact.json（已发布版本）。
 */
export default function ContactInfoModal({ open, onClose }: ContactInfoModalProps) {
  const [data, setData] = useState<ContactData>(defaultContact as unknown as ContactData);

  useEffect(() => {
    if (open) setData(getMergedContact());
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

  const telHref = `tel:${(data?.phone || '').replace(/\s+/g, '')}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Contact Xianlu Workwear"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md max-h-[85vh] mt-8 sm:mt-12 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
          <h2 className="font-head font-bold text-lg text-[var(--ink)] uppercase tracking-wider">
            Contact Us
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
        <div className="overflow-y-auto p-6 sm:p-8 space-y-5 text-[var(--ink-2)]">
          {data?.additionalInfo ? (
            <p className="text-sm leading-relaxed">{data.additionalInfo}</p>
          ) : null}

          <div className="space-y-3 text-sm">
            {data?.address ? (
              <div className="flex gap-3">
                <span className="font-semibold text-[var(--ink)] min-w-[4rem]">Address</span>
                <span>{data.address}</span>
              </div>
            ) : null}

            {data?.phone ? (
              <div className="flex gap-3">
                <span className="font-semibold text-[var(--ink)] min-w-[4rem]">Phone</span>
                <a href={telHref} className="text-[var(--accent)] hover:underline">
                  {data.phone}
                </a>
              </div>
            ) : null}

            {data?.email ? (
              <div className="flex gap-3">
                <span className="font-semibold text-[var(--ink)] min-w-[4rem]">Email</span>
                <a
                  href={`mailto:${data.email}`}
                  className="text-[var(--accent)] hover:underline break-all"
                >
                  {data.email}
                </a>
              </div>
            ) : null}

            {data?.hours ? (
              <div className="flex gap-3">
                <span className="font-semibold text-[var(--ink)] min-w-[4rem]">Hours</span>
                <span>{data.hours}</span>
              </div>
            ) : null}
          </div>

          {/* 地图位置标注 */}
          {data?.mapEmbedUrl ? (
            <div className="rounded-xl overflow-hidden border border-[var(--border)]">
              <iframe
                src={data.mapEmbedUrl}
                title="Xianlu Workwear location"
                width="100%"
                height="200"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          We typically reply within 24 hours during business days.
        </div>
      </div>
    </div>
  );
}
