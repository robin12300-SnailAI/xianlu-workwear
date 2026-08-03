import type { AboutData, ContactData, AboutBlock, PolicyData } from './types';
import defaultAbout from '../../data/about.json';
import defaultContact from '../../data/contact.json';
import defaultOrderPolicy from '../../data/order-policy.json';
import defaultReturnPolicy from '../../data/return-refund-policy.json';

const ABOUT_KEY = 'xianlu_about';
const CONTACT_KEY = 'xianlu_contact';
const ORDER_POLICY_KEY = 'xianlu_order_policy';
const RETURN_POLICY_KEY = 'xianlu_return_policy';

// ===== 关于我们 =====
export function getLocalAbout(): AboutData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ABOUT_KEY);
    if (raw) return JSON.parse(raw) as AboutData;
  } catch {}
  return null;
}

export function saveLocalAbout(data: AboutData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ABOUT_KEY, JSON.stringify(data));
}

// 只读合并：优先本地草稿，没有就用仓库里的 JSON。
// 注意：这里绝不回写 localStorage —— 否则访客一旦缓存，后续发布的新内容就永远看不到。
export function getMergedAbout(): AboutData {
  const fallback = defaultAbout as unknown as AboutData;
  if (typeof window === 'undefined') return fallback;
  return getLocalAbout() ?? fallback;
}

// ===== 联系我们 =====
export function getLocalContact(): ContactData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    if (raw) return JSON.parse(raw) as ContactData;
  } catch {}
  return null;
}

export function saveLocalContact(data: ContactData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONTACT_KEY, JSON.stringify(data));
}

export function getMergedContact(): ContactData {
  const fallback = defaultContact as unknown as ContactData;
  if (typeof window === 'undefined') return fallback;
  return getLocalContact() ?? fallback;
}

// 后台"重置为线上版本"用
export function resetLocalAbout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ABOUT_KEY);
}

export function resetLocalContact(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONTACT_KEY);
}

// ===== Policy 页面内容（Order Policy / Return and Refund Policy）=====
export function getLocalOrderPolicy(): PolicyData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ORDER_POLICY_KEY);
    if (raw) return JSON.parse(raw) as PolicyData;
  } catch {}
  return null;
}

export function saveLocalOrderPolicy(data: PolicyData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDER_POLICY_KEY, JSON.stringify(data));
}

export function getMergedOrderPolicy(): PolicyData {
  const fallback = defaultOrderPolicy as unknown as PolicyData;
  if (typeof window === 'undefined') return fallback;
  return getLocalOrderPolicy() ?? fallback;
}

export function getLocalReturnPolicy(): PolicyData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RETURN_POLICY_KEY);
    if (raw) return JSON.parse(raw) as PolicyData;
  } catch {}
  return null;
}

export function saveLocalReturnPolicy(data: PolicyData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RETURN_POLICY_KEY, JSON.stringify(data));
}

export function getMergedReturnPolicy(): PolicyData {
  const fallback = defaultReturnPolicy as unknown as PolicyData;
  if (typeof window === 'undefined') return fallback;
  return getLocalReturnPolicy() ?? fallback;
}

export function resetLocalOrderPolicy(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ORDER_POLICY_KEY);
}

export function resetLocalReturnPolicy(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RETURN_POLICY_KEY);
}

// ===== 内容块操作辅助 =====
export function addAboutBlock(blocks: AboutBlock[], block: AboutBlock): AboutBlock[] {
  return [...blocks, block];
}

export function updateAboutBlock(blocks: AboutBlock[], index: number, content: string): AboutBlock[] {
  return blocks.map((b, i) => (i === index ? { ...b, content } : b));
}

export function deleteAboutBlock(blocks: AboutBlock[], index: number): AboutBlock[] {
  return blocks.filter((_, i) => i !== index);
}
