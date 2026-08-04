import type { Product } from './types';
import {
  LEGACY_SEO_TITLE,
  LEGACY_SEO_DESCRIPTION,
  isCustomSeoValue,
} from './productSeo';

/**
 * These constants used to be FORCED onto every product, which is exactly why
 * all 12 pages shipped an identical title and description. They are kept only
 * so we can recognise (and discard) the legacy value on existing records.
 *
 * Per-product SEO is now derived at render time by `buildProductSeo()` — see
 * src/lib/productSeo.ts. Nothing needs to be stored.
 */
export const DEFAULT_SEO_TITLE = LEGACY_SEO_TITLE;
export const DEFAULT_SEO_DESCRIPTION = LEGACY_SEO_DESCRIPTION;

/**
 * Strip the legacy site-wide boilerplate so the generator takes over, while
 * preserving any genuinely hand-written override.
 *
 * Previously this did the opposite: it overwrote whatever was there with the
 * shared default on every load, create and update, so bespoke copy could never
 * survive and every new product inherited the duplicate snippet.
 */
export function normalizeProductSeo(p: Product): Product {
  const next: Product = { ...p };

  if (!isCustomSeoValue(next.seoTitle, LEGACY_SEO_TITLE)) {
    delete next.seoTitle;
  }
  if (!isCustomSeoValue(next.seoDescription, LEGACY_SEO_DESCRIPTION)) {
    delete next.seoDescription;
  }

  return next;
}
