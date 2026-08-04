import type { Product } from './types';
import contact from '../../data/contact.json';

/**
 * Canonical origin + basePath for the deployed site.
 * GitHub Pages serves the app under /xianlu-workwear, so every absolute URL
 * we hand to crawlers has to include that prefix. Next's `metadataBase`
 * resolution is ambiguous when the base itself carries a path, so we build
 * absolute URLs explicitly instead of relying on it.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://robin12300-snailai.github.io';

export const SITE_BASE_PATH =
  process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? '/xianlu-workwear';

export const SITE_URL = `${SITE_ORIGIN}${SITE_BASE_PATH}`;

export const SITE_NAME = 'Xianlu Workwear Australia';

/** Turn an app-relative path ("/products/foo") into a crawlable absolute URL. */
export function absUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`;
}

/** Product images are already stored as absolute URLs, but be defensive. */
export function productImage(product: Product): string | undefined {
  const first = product.images?.[0];
  return first ? absUrl(first) : undefined;
}

/* ------------------------------------------------------------------ */
/* JSON-LD builders                                                    */
/* ------------------------------------------------------------------ */

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absUrl('/'),
    email: contact.email,
    telephone: contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressCountry: 'AU',
    },
    areaServed: 'AU',
    description:
      "Australia's trusted workwear supplier. Hi-Vis clothing, corporate uniforms, chef wear and hospitality apparel with logo embroidery and printing.",
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absUrl('/'),
  };
}

export function productJsonLd(product: Product) {
  const image = productImage(product);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seoDescription || product.description,
    ...(product.code ? { sku: product.code, mpn: product.code } : {}),
    ...(image ? { image: [image] } : {}),
    category: product.category,
    brand: { '@type': 'Brand', name: 'Xianlu Workwear' },
    ...(product.colors?.length ? { color: product.colors.join(', ') } : {}),
    ...(product.sizes?.length ? { size: product.sizes.join(', ') } : {}),
    offers: {
      '@type': 'Offer',
      url: absUrl(`/products/${product.slug}`),
      priceCurrency: 'AUD',
      price: product.price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

export function itemListJsonLd(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Workwear Products',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: absUrl(`/products/${p.slug}`),
    })),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absUrl(crumb.path),
    })),
  };
}

/** Renders a JSON-LD <script> without React escaping the payload. */
export function jsonLdScript(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  };
}
