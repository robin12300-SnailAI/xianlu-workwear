import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/products';
import AddToCartButton from '@/components/AddToCartButton';
import SmartImage from '@/components/SmartImage';
import {
  absUrl,
  breadcrumbJsonLd,
  jsonLdScript,
  productImage,
  productJsonLd,
} from '@/lib/seo';
import { buildProductSeo } from '@/lib/productSeo';

// 静态导出：预生成所有产品页面
export async function generateStaticParams() {
  const products = getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };

  const url = absUrl(`/products/${product.slug}`);
  const image = productImage(product);

  // Unique per product, derived from fabric / colours / sizes / price.
  // The root layout template appends " | Xianlu Workwear" to `title`.
  const seo = buildProductSeo(product);

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: seo.fullTitle,
      description: seo.description,
      url,
      type: 'website',
      ...(image ? { images: [{ url: image, alt: seo.imageAlt }] } : {}),
    },
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const seo = buildProductSeo(product);

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(productJsonLd(product))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            { name: product.name, path: `/products/${product.slug}` },
          ])
        )}
      />

      <div className="card overflow-hidden aspect-square w-full max-w-sm md:max-w-md mx-auto md:mx-0">
        <SmartImage
          src={product.images[0]}
          seed={product.slug}
          alt={seo.imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {product.category}{product.code ? ` · Code: ${product.code}` : ''}
        </div>
        <h1 className="font-head font-bold text-3xl mt-1.5 text-[var(--ink)]">{product.name}</h1>
        <div className="text-3xl font-bold text-[var(--accent)] mt-3">${product.price.toFixed(2)}</div>
        <p className="text-[var(--ink-2)] mt-5 leading-relaxed">{product.description}</p>

        <div className="mt-7">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
