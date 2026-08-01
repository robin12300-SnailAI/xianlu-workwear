import type { Product } from './types';

export const DEFAULT_SEO_TITLE = 'Xianlu Workwear | Quality Workwear & Safety Clothing Australia';
export const DEFAULT_SEO_DESCRIPTION =
  'Xianlu Workwear supplies premium workwear, hi-vis clothing, uniforms, PPE, and safety apparel across Australia. Quality products, competitive prices, reliable service, and fast shipping.';

export function normalizeProductSeo(p: Product): Product {
  return {
    ...p,
    seoTitle: p.seoTitle?.trim() || DEFAULT_SEO_TITLE,
    seoDescription: p.seoDescription?.trim() || DEFAULT_SEO_DESCRIPTION,
  };
}
