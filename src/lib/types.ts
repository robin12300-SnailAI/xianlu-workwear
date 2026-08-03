// 产品类型定义。新增字段时在这里加，后台表单也要同步加。
// Category 现在由 data/categories.json 管理，不再是写死的联合类型。
export type Category = string;

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
  code?: string; // 产品码（每个商品唯一，如 SKU）
  seoTitle?: string; // SEO 标题（留空则用 name）
  seoDescription?: string; // SEO 描述
}

// ===== 关于我们 / 联系我们 内容管理 =====
export interface AboutBlock {
  type: 'paragraph' | 'heading';
  content: string; // 支持 HTML 富文本
}

export interface AboutData {
  blocks: AboutBlock[];
  heroImage?: string; // 公司展示图片（Base64 或 URL）
  footerNote?: string; // 弹窗底部一行小字
}

export interface ContactData {
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string; // Google Maps 嵌入 URL
  additionalInfo: string;
}

// ===== Policy 页面内容（Order Policy / Return and Refund Policy）=====
// 整篇为一段 HTML 富文本，由后台富文本编辑器维护。
export interface PolicyData {
  content: string; // 支持 HTML 富文本
}
