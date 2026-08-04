import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/products';
import { absUrl } from '@/lib/seo';

/**
 * Generated at build time from data/products.json so newly published products
 * are always in the sitemap. Replaces the old hand-maintained
 * public/sitemap.xml, which had drifted to 7 of 12 products.
 *
 * Deliberately excluded:
 *  - /products?cat=... — query-string variants now serve the same static HTML
 *    as /products, so listing them would be duplicate content.
 *  - /cart, /checkout, /checkout/success, /admin — transactional / private.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const products = getProducts();

  return [
    {
      url: absUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absUrl('/products'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...products.map((p) => ({
      url: absUrl(`/products/${p.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
