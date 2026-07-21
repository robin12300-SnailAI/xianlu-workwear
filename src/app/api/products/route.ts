import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProducts, saveProducts } from '@/lib/products';
import type { Product, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

// 所有写操作都要先验证后台登录 cookie
function authed() {
  return cookies().get('xianlu_admin')?.value === '1';
}

export async function GET() {
  if (!authed()) return NextResponse.json({ error: '未登录' }, { status: 401 });
  return NextResponse.json(await getProducts());
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(req: NextRequest) {
  if (!authed()) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const b = await req.json();
  const products = await getProducts();
  const product: Product = {
    id: 'p' + Date.now(),
    slug: toSlug(b.name),
    name: b.name,
    category: b.category as Category,
    description: b.description ?? '',
    price: Number(b.price) || 0,
    images: splitList(b.images),
    colors: splitList(b.colors),
    sizes: splitList(b.sizes),
    inStock: b.inStock !== false,
    seoTitle: b.seoTitle || '',
    seoDescription: b.seoDescription || '',
  };
  products.push(product);
  await saveProducts(products);
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest) {
  if (!authed()) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const b = await req.json();
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === b.id);
  if (idx < 0) return NextResponse.json({ error: '找不到' }, { status: 404 });
  products[idx] = {
    ...products[idx],
    name: b.name,
    category: b.category,
    description: b.description ?? '',
    price: Number(b.price) || 0,
    images: splitList(b.images),
    colors: splitList(b.colors),
    sizes: splitList(b.sizes),
    inStock: b.inStock !== false,
    seoTitle: b.seoTitle || '',
    seoDescription: b.seoDescription || '',
  };
  await saveProducts(products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(req: NextRequest) {
  if (!authed()) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  const products = await getProducts();
  const next = products.filter((p) => p.id !== id);
  await saveProducts(next);
  return NextResponse.json({ ok: true });
}

// 把逗号分隔的字符串拆成数组（用于 images/colors/sizes）
function splitList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string')
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}
