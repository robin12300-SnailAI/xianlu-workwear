/**
 * Client-side order / quote delivery for a statically-exported site.
 *
 * The site is built with `output: 'export'` and hosted on GitHub Pages, so
 * there is no server and no API route at runtime. Orders are therefore
 * delivered straight from the browser:
 *
 *   1. If NEXT_PUBLIC_FORMSPREE_ID is configured -> POST to Formspree
 *      (silent, no user action required).
 *   2. Otherwise -> open the visitor's mail client with a pre-filled
 *      message addressed to ORDER_EMAIL.
 *
 * Either way the business receives the enquiry at ORDER_EMAIL.
 */

import type { CartItem } from '@/components/CartProvider';

/** Destination inbox for all orders and quote requests. */
export const ORDER_EMAIL =
  process.env.NEXT_PUBLIC_ORDER_EMAIL || 'admin@djausgroup.com.au';

/** Optional Formspree form id, e.g. "xnqweiop". Enables silent submission. */
export const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || '';

export type InquiryKind = 'order' | 'quote';

export interface InquiryCustomer {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export interface InquiryInput {
  kind: InquiryKind;
  customer: InquiryCustomer;
  items: CartItem[];
  total: number;
  paymentMethod?: string;
  notes?: string;
  logoFileName?: string;
  createdAt: string;
}

export interface DeliveryResult {
  method: 'formspree' | 'mailto';
  ok: boolean;
  ref: string;
  mailtoUrl: string;
}

/** Human-friendly reference, e.g. XW-20260802-4817 or Q-20260802-4817. */
export function generateRef(kind: InquiryKind): string {
  const d = new Date();
  const stamp =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `${kind === 'order' ? 'XW' : 'Q'}-${stamp}-${rand}`;
}

const money = (n: number) => `$${n.toFixed(2)}`;

/** Plain-text body used for both the mailto link and the Formspree payload. */
export function formatBody(o: InquiryInput & { ref: string }): string {
  const c = o.customer;
  const lines: string[] = [];

  lines.push(o.kind === 'order' ? 'NEW ORDER' : 'NEW QUOTE REQUEST');
  lines.push(`Reference: ${o.ref}`);
  lines.push(`Submitted: ${new Date(o.createdAt).toLocaleString('en-AU')}`);
  lines.push('');

  lines.push('--- CUSTOMER ---');
  lines.push(`Name:    ${c.name}`);
  lines.push(`Email:   ${c.email}`);
  if (c.phone) lines.push(`Phone:   ${c.phone}`);
  if (c.company) lines.push(`Company: ${c.company}`);
  if (c.address) {
    const loc = [c.city, c.state, c.postcode].filter(Boolean).join(' ');
    lines.push(`Address: ${c.address}`);
    if (loc) lines.push(`         ${loc}`);
    if (c.country) lines.push(`         ${c.country}`);
  }
  lines.push('');

  if (o.items.length > 0) {
    lines.push('--- ITEMS ---');
    o.items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name}`);
      const spec = [
        it.size ? `Size: ${it.size}` : '',
        it.color ? `Colour: ${it.color}` : '',
        `Qty: ${it.qty}`,
        `Unit: ${money(it.price)}`,
        `Line: ${money(it.price * it.qty)}`,
      ]
        .filter(Boolean)
        .join('  |  ');
      lines.push(`   ${spec}`);
    });
    lines.push('');
    lines.push(`TOTAL (ex GST): ${money(o.total)}`);
    lines.push('');
  }

  if (o.paymentMethod) {
    lines.push(`Payment method: ${o.paymentMethod}`);
  }
  if (o.logoFileName) {
    lines.push(`Logo file: ${o.logoFileName} (customer to email the file separately)`);
  }
  if (o.notes) {
    lines.push('');
    lines.push('--- NOTES ---');
    lines.push(o.notes);
  }

  lines.push('');
  lines.push('-- Sent from xianlu-workwear website --');

  return lines.join('\n');
}

/** Deliver the enquiry. Never throws; falls back to mailto on any failure. */
export async function deliverInquiry(input: InquiryInput): Promise<DeliveryResult> {
  const ref = generateRef(input.kind);
  const subject =
    input.kind === 'order'
      ? `New Order ${ref} - ${input.customer.name}`
      : `Quote Request ${ref} - ${input.customer.name}`;
  const body = formatBody({ ...input, ref });

  const mailtoUrl = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  if (FORMSPREE_ID) {
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: subject,
          _replyto: input.customer.email,
          reference: ref,
          message: body,
        }),
      });
      if (res.ok) return { method: 'formspree', ok: true, ref, mailtoUrl };
    } catch {
      // fall through to mailto
    }
  }

  if (typeof window !== 'undefined') {
    window.open(mailtoUrl, '_blank');
  }
  return { method: 'mailto', ok: true, ref, mailtoUrl };
}
