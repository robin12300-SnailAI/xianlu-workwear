import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const products = await getProducts();
  const productUrls = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    ...productUrls,
  ];
}
