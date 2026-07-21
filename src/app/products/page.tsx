'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { getProducts, getCategories } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
  }, []);

  const active = searchParams.get('cat');
  const filtered = active ? products.filter((p) => p.category === active) : products;

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-gray-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
