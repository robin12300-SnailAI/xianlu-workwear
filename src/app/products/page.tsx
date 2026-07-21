import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const all = await getProducts();
  const categories = await getCategories();
  const active = searchParams.cat;
  const filtered = active ? all.filter((p) => p.category === active) : all;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">所有产品</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/products"
          className={`px-4 py-2 border rounded-full text-sm ${
            !active ? 'bg-brand text-white' : 'bg-white'
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/products?cat=${c}`}
            className={`px-4 py-2 border rounded-full text-sm ${
              active === c ? 'bg-brand text-white' : 'bg-white'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">该分类暂无产品，去后台 /admin 添加吧。</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
