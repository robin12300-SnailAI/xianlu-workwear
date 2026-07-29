import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import Reveal from '@/components/Reveal';
import SmartImage from '@/components/SmartImage';

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  const values = [
    { icon: 'truck', title: 'Australia-Wide Delivery', sub: 'Fast, tracked shipping to every state.' },
    { icon: 'shield', title: 'AS/NZS Certified', sub: 'Compliant hi-vis for job sites.' },
    { icon: 'stitch', title: 'Embroidery & Print', sub: 'Your logo, done in-house.' },
    { icon: 'map', title: 'Sydney Based', sub: 'Local support, real people.' },
  ];

  const BP = '/xianlu-workwear';

  const features = [
    {
      eyebrow: 'DECORATING SERVICES',
      title: 'Embroidery, Print & Custom Branding',
      text: 'Xianlu Workwear offers professional embroidery, screen printing, and heat transfer services. Our expert team turns plain garments into branded apparel that makes your business stand out. From vibrant logos to detailed designs, we ensure your workwear looks professional and long-lasting. Perfect for corporate uniforms, team wear, or everyday work apparel. Whether you need a small order or bulk quantities, we provide fast, friendly, and professional service. We offer competitive prices and premium-quality products. Contact us for a free quote.',
      img: `${BP}/images/decorating-services.png`,
    },
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── Value props ──────────────────────────────────────── */}
      <section className="container-x">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-10 relative z-10">
          {values.map((v) => (
            <div key={v.title} className="card p-5 flex items-start gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                <ValueIcon name={v.icon} />
              </span>
              <div>
                <div className="font-head font-semibold text-[var(--ink)] text-sm leading-tight">{v.title}</div>
                <div className="text-xs text-[var(--muted)] mt-1 leading-snug">{v.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="container-x py-16">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">Featured</span>
          <h2 className="section-title mt-3">Popular this season</h2>
          <p className="section-lead mx-auto mt-3 text-center">
            A curated selection of premium workwear and corporate essentials trusted by Australian businesses.
          </p>
        </Reveal>

        <div className="product-grid mt-10">
          {products.slice(0, 8).map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" className="btn-primary">
            View Full Range →
          </Link>
        </div>
      </section>

      {/* ── Shop by Category ─────────────────────────────────── */}
      <section className="bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="container-x py-14 text-center">
          <Reveal>
            <span className="eyebrow">Browse</span>
            <h2 className="section-title mt-3">Shop by Category</h2>
            <p className="section-lead mx-auto mt-3 text-center">Find the right gear for your industry.</p>
          </Reveal>
          <Reveal className="flex flex-wrap justify-center gap-3 mt-7">
            {categories.map((c) => (
              <Link key={c} href={`/products?cat=${c}`} className="btn-ghost">
                {c}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Feature rows ─────────────────────────────────────── */}
      <section className="container-x py-16 space-y-16">
        {features.map((f, i) => (
          <Reveal key={f.eyebrow}>
            <div className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
              <div>
                <span className="eyebrow">{f.eyebrow}</span>
                <h3 className="section-title mt-3">{f.title}</h3>
                <p className="section-lead mt-4">{f.text}</p>
              </div>
              <div className="card overflow-hidden aspect-[4/3]">
                <SmartImage
                  src={f.img}
                  seed={f.eyebrow}
                  alt={f.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── CTA band ─────────────────────────────────────────── */}
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
              <a
                href="mailto:info@xianlu.com.au"
                className="btn-primary !bg-white !text-[#0a2540] hover:!bg-white/90"
              >
                Request a Quote
              </a>
              <Link href="/products" className="btn-ghost !text-white !border-white/40 hover:!bg-white/10 hover:!border-white">
                Browse Products
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function ValueIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'truck':
      return <svg {...common}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>;
    case 'shield':
      return <svg {...common}><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" /><path d="M9 12l2 2 4-4" /></svg>;
    case 'stitch':
      return <svg {...common}><path d="M12 20h9M3 20h3M12 4v16M8 8l4-4 4 4" /></svg>;
    case 'map':
      return <svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    default:
      return null;
  }
}
