// 产品类型定义。新增字段时在这里加，后台表单也要同步加。
export type Category =
  | 'HiVis'
  | 'Workwear'
  | 'Corporate'
  | 'Chef'
  | 'Hospitality'
  | 'Accessories';

export interface Product {
  id: string;
  slug: string; // 网址里的产品名，如 hi-vis-polo
  name: string;
  category: Category;
  description: string;
  price: number; // 价格（澳元 AUD）
  images: string[]; // 图片地址，可先用水印占位图，后换真实照片
  colors: string[]; // 可选颜色
  sizes: string[]; // 可选尺码
  inStock: boolean; // 是否有货
  seoTitle?: string; // SEO 标题（留空则用 name）
  seoDescription?: string; // SEO 描述
}
