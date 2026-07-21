import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  const heroSlides = [
    {
      img: 'https://placehold.co/1600x500/212529/ffffff?text=Hi-Vis+Workwear',
      title: 'Hi-Vis Workwear Collection',
      subtitle: 'Safety meets comfort — AS/NZS certified high visibility apparel',
    },
    {
      img: 'https://placehold.co/1600x500/0d6efd/ffffff?text=Corporate+Uniforms',
      title: 'Corporate Uniforms',
      subtitle: 'Elevate your brand with premium embroidered corporate wear',
    },
    {
      img: 'https://placehold.co/1600x500/198754/ffffff?text=Culinary+Chef+Wear',
      title: 'Culinary & Hospitality',
      subtitle: 'Professional chef jackets, aprons & hospitality uniforms',
    },
  ];

  const serviceSections = [
    {
      title: 'BOCINI NEW RANGE',
      text: 'Discover the latest additions to the Xianlu Workwear range. From workwear and corporate apparel to sportswear and promotional clothing, explore our newest styles, colours and innovations.',
      link: '/products',
      bg: 'bg-[#212529]',
      textColor: 'text-white',
    },
    {
      title: 'XIANLU RANGE',
      text: 'Explore the Xianlu Workwear Range, featuring high-quality corporate clothing, durable workwear, and professional sportswear designed for Australian businesses and teams.',
      link: '/products',
      bg: 'bg-[#343a40]',
      textColor: 'text-white',
    },
    {
      title: 'INDENT SERVICE',
      text: 'Xianlu Workwear offers indent services that enable customers to develop garments to their exact specification. We partner with trusted overseas manufacturers.',
      link: '/products?cat=Workwear',
      bg: 'bg-[#212529]',
      textColor: 'text-white',
    },
    {
      title: 'DYE SUBLIMATION',
      text: 'Our dye sublimation brings clothing to life with vibrant, long-lasting designs. Perfect for sportswear, uniforms, and promotions with bold colour that never fades.',
      link: '/products',
      bg: 'bg-[#343a40]',
      textColor: 'text-white',
    },
    {
      title: 'DECORATING SERVICES',
      text: 'Embroidery, screen printing, and digital transfer — from vibrant colours to detailed designs, we make your apparel stand out and last.',
      link: '/products',
      bg: 'bg-[#212529]',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="-mx-4 sm:mx-0">
      {/* ── Hero Carousel ──────────────────────────────────────── */}
      <div id="heroCarousel" className="carousel-section carousel slide carousel-fade mb-5" data-bs-ride="carousel">
        <div className="relative overflow-hidden rounded-none sm:rounded-lg" style={{ height: '340px' }}>
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === 0 ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url(${slide.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  {slide.title}
                </h1>
                <p className="text-lg text-white/80 max-w-2xl mb-6">{slide.subtitle}</p>
                <Link href="/products" className="btn-bocini text-base px-6 py-2.5">
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product Grid ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-5">
        <h2 className="section-heading text-center">Featured Products</h2>
        <p className="section-subheading text-center max-w-2xl mx-auto">
          Explore our curated selection of premium workwear and corporate essentials for Australian businesses.
        </p>
        <div className="product-grid mb-3 mt-6">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center mt-5">
          <Link href="/products" className="btn-bocini px-6 py-2">
            View Full Range
          </Link>
        </div>
      </div>

      {/* ── Category Quick Links ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 mb-5">
        <h2 className="section-heading text-center">Shop by Category</h2>
        <p className="section-subheading text-center max-w-xl mx-auto">
          Browse our range by industry
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/products?cat=${c}`}
              className="btn-bocini-outline px-5 py-2"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Service Sections (Bocini-style) ──────────────────── */}
      {serviceSections.map((sec, i) => (
        <section
          key={i}
          className={`${sec.bg} ${sec.textColor} ${i % 2 === 0 ? 'section-colored' : 'section-colored'}`}
          style={{ padding: '4rem 1.5rem' }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="section-heading text-white text-center">{sec.title}</h2>
            <p className="text-white/80 text-center max-w-2xl mx-auto mt-3 mb-6 text-lg leading-relaxed">
              {sec.text}
            </p>
            <div className="text-center">
              <Link href={sec.link} className="btn-bocini bg-white text-[#212529] px-6 py-2.5 hover:bg-gray-100">
                {i === 3 ? 'Get Started' : 'Read more'} &raquo;
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* ── About Us ─────────────────────────────────────────────── */}
      <section className="bg-[#212529] text-white section-colored" style={{ padding: '4rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-heading text-white">ABOUT US</h2>
          <p className="text-white/80 text-center max-w-2xl mx-auto mt-3 mb-6 text-lg leading-relaxed">
            Xianlu Workwear is an expert corporate clothing and workwear supplier with a passion for
            delivering quality garments to Australian businesses since 2024. Based in Sydney, we serve
            clients across Australia with premium workwear solutions.
          </p>
          <Link href="/products" className="btn-bocini bg-white text-[#212529] px-6 py-2.5 hover:bg-gray-100">
            Read more &raquo;
          </Link>
        </div>
      </section>
    </div>
  );
}
