import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/products';
import AddToCartButton from '@/components/AddToCartButton';

export const dynamic = 'force-dynamic';

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
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.seoDescription || product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <div className="text-sm text-gray-400">{product.category}</div>
        <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
        <div className="text-2xl text-brand font-semibold mt-2">
          ${product.price.toFixed(2)}
        </div>
        <p className="text-gray-600 mt-4">{product.description}</p>

        <div className="mt-6">
          <AddToCartButton product={product} />
        </div>

        <div className="mt-6 text-sm text-gray-500">
          {product.inStock ? '✅ 现货，全澳配送' : '⏳ 需预订'}
        </div>
      </div>
    </div>
  );
}
