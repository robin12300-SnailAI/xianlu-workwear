'use client';

import { useState } from 'react';
import ContactModal from './ContactModal';
import ContactInfoModal from './ContactInfoModal';
import PolicyModal from './PolicyModal';

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [orderPolicyOpen, setOrderPolicyOpen] = useState(false);
  const [returnPolicyOpen, setReturnPolicyOpen] = useState(false);
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
      >
        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">How to Order</h3>
          <p>Browse our catalogue, select your items, choose sizes and colours, then add them to your cart. When you are ready, proceed to checkout and complete your billing and delivery details. An order confirmation will be sent to your email once payment is received.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Payment Methods</h3>
          <p>We accept major credit and debit cards (Visa, Mastercard, American Express) processed securely through Stripe. All prices are listed in Australian Dollars (AUD) and include GST unless otherwise stated.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Order Confirmation & Changes</h3>
          <p>Please review your order carefully before submitting. If you need to change or cancel an order, contact us as soon as possible. We will do our best to accommodate changes before the order is processed or dispatched.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Delivery Timeframes</h3>
          <p>Standard delivery across Australia typically takes 3–10 business days, depending on your location. Custom or bulk orders may require additional production time. Estimated delivery dates are provided at checkout and in your order confirmation.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Shipping Costs</h3>
          <p>Shipping charges are calculated at checkout based on order weight, dimensions and delivery location. Free shipping may be available for qualifying orders or promotions as advertised.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Contact Us</h3>
          <p>For questions about your order, payment or delivery, please use the Contact Us button or email us directly. We aim to respond within 1–2 business days.</p>
        </section>
      </PolicyModal>

      <PolicyModal
        open={returnPolicyOpen}
        onClose={() => setReturnPolicyOpen(false)}
        title="Return and Refund Policy"
      >
        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Australian Consumer Law Guarantees</h3>
          <p>Our products come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Faulty or Defective Items</h3>
          <p>If you receive an item that is faulty, defective or not as described, please contact us within 14 days of delivery with photos and your order details. We will arrange a replacement, repair or refund, including reasonable return postage costs.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Change of Mind Returns</h3>
          <p>For non-customised items, we accept change-of-mind returns within 14 days of delivery, provided the item is unused, unworn, unwashed and in original packaging with tags attached. Return postage for change-of-mind returns is at the customer&apos;s expense.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Items Not Eligible for Return</h3>
          <p>Customised, embroidered, printed or otherwise personalised products cannot be returned for change of mind unless faulty. Underwear, socks and items marked as final sale are also excluded from change-of-mind returns.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Return Process</h3>
          <p>To start a return, contact us with your order number and reason for return. Once approved, we will provide return instructions. We recommend using a tracked service, as we are not responsible for items lost in transit.</p>
        </section>

        <section>
          <h3 className="font-head font-bold text-[var(--ink)] text-base mb-2">Refunds</h3>
          <p>Approved refunds will be issued to the original payment method within 5–10 business days after the returned item is received and inspected. We will notify you by email once your refund has been processed.</p>
        </section>
      </PolicyModal>
    </footer>
  );
}
