import type { Product } from './types';
import defaultCategories from '../../data/categories.json';

const STORAGE_KEY = 'xianlu_products';
const CATEGORY_KEY = 'xianlu_categories';

// ===== 分类管理 =====
export function getLocalCategories(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CATEGORY_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

export function saveLocalCategories(categories: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

export function getMergedCategories(): string[] {
  if (typeof window === 'undefined') return defaultCategories as string[];
  const local = getLocalCategories();
  if (local.length > 0) return local;
  saveLocalCategories(defaultCategories as string[]);
  return defaultCategories as string[];
}

// 从 localStorage 读取产品；若没有则返回默认数据（从 products.json 导入）
export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {}
  return [];
}

export function saveLocalProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// 生成简单 slug
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function addLocalProduct(p: Omit<Product, 'id' | 'slug'>): Product {
  const products = getLocalProducts();
  const id = 'p' + Date.now().toString(36);
  const slug = slugify(p.name) + '-' + id.slice(-4);
  const np: Product = { ...p, id, slug };
  products.push(np);
  saveLocalProducts(products);
  return np;
}

export function updateLocalProduct(id: string, p: Partial<Product>): void {
  const products = getLocalProducts();
  const idx = products.findIndex((x) => x.id === id);
  if (idx === -1) return;
  products[idx] = { ...products[idx], ...p };
  saveLocalProducts(products);
}

export function deleteLocalProduct(id: string): void {
  const products = getLocalProducts().filter((x) => x.id !== id);
  saveLocalProducts(products);
}

// 合并默认数据 + localStorage 数据（localStorage 优先）
import defaultProducts from '../../data/products.json';

export function getMergedProducts(): Product[] {
  if (typeof window === 'undefined') return defaultProducts as Product[];
  const local = getLocalProducts();
  if (local.length > 0) return local;
  // 首次访问：把默认数据写入 localStorage
  saveLocalProducts(defaultProducts as Product[]);
  return defaultProducts as Product[];
}
