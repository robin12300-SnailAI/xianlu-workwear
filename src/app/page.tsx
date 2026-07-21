import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

// 每次请求都读最新产品（文件数据，方便后台改完立即生效）
export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-10">
      <section className="bg-brand text-white rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold">澳洲工作服，在线一键采购</h1>
        <p className="mt-3 max-w-xl text-blue-100">
          Hi-Vis 高可视服、工装、企业制服、餐饮制服，支持 Logo 刺绣印花，全澳配送。
        </p>
        <Link
          href="/products"
          className="inline-block mt-5 bg-white text-brand font-semibold px-5 py-3 rounded-lg"
        >
          浏览产品
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">按行业选购</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              href={`/products?cat=${c}`}
              className="px-4 py-2 bg-white border rounded-full text-sm hover:border-brand hover:text-brand"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">热门产品</h2>
          <Link href="/products" className="text-sm text-brand">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
