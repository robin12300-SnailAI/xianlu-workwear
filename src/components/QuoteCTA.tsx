'use client';

import { useState } from 'react';
import Reveal from '@/components/Reveal';
import QuoteRequestModal from '@/components/QuoteRequestModal';

export default function QuoteCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="container-x py-16">
        <Reveal>
          <div
            className="rounded-[var(--radius)] px-8 py-12 text-center text-white overflow-hidden relative"
            style={{ background: 'linear-gradient(120deg,#0a2540 0%,#0a66c2 100%)' }}
          >
            <h2 className="font-head font-extrabold text-3xl md:text-4xl">Need a bulk order or custom logo?</h2>
            <p className="text-white/85 mt-3 max-w-xl mx-auto">
              Get a tailored quote for your team. Embroidery, printing and indent service available.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-7">
              <button
                onClick={() => setOpen(true)}
                className="btn-primary !bg-white !text-[#0a2540] hover:!bg-white/90"
              >
                Request a Quote
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      <QuoteRequestModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
