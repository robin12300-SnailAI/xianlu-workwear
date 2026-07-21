import { promises as fs } from 'fs';
import path from 'path';
import type { Product } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

// 读取全部产品（后台 / 前台共用）
export async function getProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug);
}

// 取去重后的分类列表（用于导航与筛选）
export async function getCategories(): Promise<string[]> {
  const all = await getProducts();
  return Array.from(new Set(all.map((p) => p.category)));
}

// 写回整个产品列表（后台新增/编辑/删除后调用）
export async function saveProducts(products: Product[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
}
