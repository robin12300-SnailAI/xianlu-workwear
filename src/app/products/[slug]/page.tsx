import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug, getProducts } from '@/lib/products';
import AddToCartButton from '@/components/AddToCartButton';
import SmartImage from '@/components/SmartImage';

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
  if (!product) return { title: '产品未找到' };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="card overflow-hidden aspect-square">
        <SmartImage
          src={product.images[0]}
          seed={product.slug}
          alt={product.seoDescription || product.name}
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

        <div className="mt-5 text-sm font-medium text-[var(--ink-2)]">
          {product.inStock ? '✅ In stock · Australia-wide delivery' : '⏳ Made to order'}
        </div>
      </div>
    </div>
  );
}
