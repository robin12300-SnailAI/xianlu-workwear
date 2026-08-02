import type { Product } from './types';

export const DEFAULT_SEO_TITLE = 'Xianlu Workwear | Quality Workwear & Safety Clothing Australia';
export const DEFAULT_SEO_DESCRIPTION =
  'Xianlu Workwear supplies premium workwear, hi-vis clothing, uniforms, PPE, and safety apparel across Australia. Quality products, competitive prices, reliable service, and fast shipping.';

// 强制把每个产品的 SEO 统一为站点默认值（覆盖任何已存在的旧值）。
// 用于：首次加载合并、读取 localStorage、新增/编辑产品时统一 SEO。
export function normalizeProductSeo(p: Product): Product {
  return {
    ...p,
    seoTitle: DEFAULT_SEO_TITLE,
    seoDescription: DEFAULT_SEO_DESCRIPTION,
  };
}
