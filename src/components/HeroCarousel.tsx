'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
};

const SLIDES: Slide[] = [
  {
    img: 'https://loremflickr.com/1600/720/workwear,uniform?lock=11',
    eyebrow: 'Hi-Vis Collection',
    title: 'Safety Meets Comfort',
    subtitle: 'AS/NZS-certified high-visibility workwear built for Australian job sites.',
    cta: 'Shop Hi-Vis',
    href: '/products?cat=HiVis',
    gradient: 'linear-gradient(120deg,#0a2540 0%,#0a66c2 100%)',
  },
  {
    img: 'https://loremflickr.com/1600/720/corporate,shirt,uniform?lock=22',
    eyebrow: 'Corporate Uniforms',
    title: 'Elevate Your Brand',
    subtitle: 'Premium embroidered corporate wear that looks sharp and lasts.',
    cta: 'Shop Corporate',
    href: '/products?cat=Corporate',
    gradient: 'linear-gradient(120deg,#10131a 0%,#2b3a55 100%)',
  },
  {
    img: 'https://loremflickr.com/1600/720/chef,kitchen,uniform?lock=33',
    eyebrow: 'Chef & Hospitality',
    title: 'Built for the Floor',
    subtitle: 'Professional chef jackets, aprons & hospitality uniforms, ready to brand.',
    cta: 'Shop Hospitality',
    href: '/products?cat=Chef',
    gradient: 'linear-gradient(120deg,#1a1208 0%,#8a5a1e 100%)',
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(380px, 62vh, 560px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: s.gradient }}
          aria-hidden={i !== active}
        >
          {!failed[i] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.img}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setFailed((f) => ({ ...f, [i]: true }))}
            />
          )}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        </div>
      ))}

      {/* Content (only for active slide) */}
      <div className="container-x relative h-full flex items-center">
        <div className="max-w-2xl text-white">
          <span className="eyebrow !text-white/90" style={{ color: '#fff' }}>
            {SLIDES[active].eyebrow}
          </span>
          <h1
            className="font-head font-extrabold text-white mt-4 leading-[1.05]"
            style={{ fontSize: 'clamp(2.1rem, 1.2rem + 4vw, 3.6rem)', textShadow: '0 2px 18px rgba(0,0,0,0.35)' }}
          >
            {SLIDES[active].title}
          </h1>
          <p className="text-white/90 mt-4 text-lg max-w-xl" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.3)' }}>
            {SLIDES[active].subtitle}
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href={SLIDES[active].href} className="btn-primary">
              {SLIDES[active].cta}
            </Link>
            <Link
              href="/products"
              className="btn-ghost !text-white !border-white/40 hover:!bg-white/10 hover:!border-white"
            >
              View Full Range
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
