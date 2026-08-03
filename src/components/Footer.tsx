'use client';

import { useState, useEffect } from 'react';
import ContactModal from './ContactModal';
import ContactInfoModal from './ContactInfoModal';
import PolicyModal from './PolicyModal';
import { getMergedOrderPolicy, getMergedReturnPolicy } from '@/lib/localContent';

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [orderPolicyOpen, setOrderPolicyOpen] = useState(false);
  const [returnPolicyOpen, setReturnPolicyOpen] = useState(false);
  const [orderPolicyContent, setOrderPolicyContent] = useState('');
  const [returnPolicyContent, setReturnPolicyContent] = useState('');

  // 打开弹窗时读取（保证后台刚保存的内容立刻反映）
  useEffect(() => {
    if (orderPolicyOpen) setOrderPolicyContent(getMergedOrderPolicy().content);
  }, [orderPolicyOpen]);
  useEffect(() => {
    if (returnPolicyOpen) setReturnPolicyContent(getMergedReturnPolicy().content);
  }, [returnPolicyOpen]);
  return (
    <footer className="mt-20 bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="container-x py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--accent)] text-[var(--accent-ink)] font-head font-bold text-lg">
              X
            </span>
            <span className="font-head font-bold text-lg text-[var(--ink)]">
              Xianlu<span className="text-[var(--accent)]">.</span>
            </span>
          </div>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-xs">
            Australia&apos;s trusted workwear &amp; corporate apparel supplier. Premium garments,
            logo embroidery and Australia-wide delivery since 2024.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="chip">AS/NZS Certified</span>
          </div>
        </div>

        {/* Services */}
        <div>
          <h5 className="font-head font-semibold text-sm mb-4 text-[var(--ink)] uppercase tracking-wider">
            Services
          </h5>
          <div className="space-y-2.5">
            <button
              onClick={() => setContactOpen(true)}
              className="footer-link block text-left"
            >
              About Us
            </button>
            <button
              onClick={() => setContactInfoOpen(true)}
              className="footer-link block text-left"
            >
              Contact Us
            </button>
            <button
              onClick={() => setOrderPolicyOpen(true)}
              className="footer-link block text-left"
            >
              Order Policy
            </button>
            <button
              onClick={() => setReturnPolicyOpen(true)}
              className="footer-link block text-left"
            >
              Return and Refund Policy
            </button>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)]">
        <div className="container-x py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>&copy; {new Date().getFullYear()} Xianlu Workwear. All rights reserved.</span>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <ContactInfoModal open={contactInfoOpen} onClose={() => setContactInfoOpen(false)} />

      <PolicyModal
        open={orderPolicyOpen}
        onClose={() => setOrderPolicyOpen(false)}
        title="Order Policy"
        content={orderPolicyContent}
      />

      <PolicyModal
        open={returnPolicyOpen}
        onClose={() => setReturnPolicyOpen(false)}
        title="Return and Refund Policy"
        content={returnPolicyContent}
      />
    </footer>
  );
}
