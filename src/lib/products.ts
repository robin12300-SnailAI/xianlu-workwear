import type { Product } from './types';

// 静态导出：直接 import JSON，避免 fs 依赖
// 后台写回功能在静态托管下不可用，仅保留读取
import productsData from '../../data/products.json';

export function getProducts(): Product[] {
  return productsData as Product[];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getCategories(): string[] {
  const all = getProducts();
  return Array.from(new Set(all.map((p) => p.category)));
}

// Stub: static export cannot write back to the filesystem at runtime.
// Use this only if you later move to a Node.js server or serverless deployment.
export async function saveProducts(_products: Product[]): Promise<void> {
  throw new Error('saveProducts is not available in static export mode');
}
