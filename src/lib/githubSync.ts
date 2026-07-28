import type { Product } from './types';

// ===== 配置 =====
const GH_OWNER = 'robin12300-SnailAI';
const GH_REPO = 'xianlu-workwear';
const GH_BRANCH = 'main';
const TOKEN_KEY = 'xianlu_gh_token';
const PAGES_BASE = 'https://robin12300-snailai.github.io/xianlu-workwear';

// ===== Token 管理（只存在当前浏览器，不会上传） =====
export function getGithubToken(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGithubToken(token: string): void {
  if (typeof window === 'undefined') return;
  const t = token.trim();
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

// ===== GitHub API 基础封装 =====
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ghFetch(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getGithubToken()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init && init.headers ? init.headers : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) throw new Error('Token 无效或已过期，请重新填写 GitHub Token');
    if (res.status === 404) throw new Error('找不到仓库，或 Token 没有此仓库的读写权限');
    if (res.status === 409) throw new Error('提交冲突，请刷新页面后重试');
    throw new Error(`GitHub API 错误 ${res.status}: ${text.slice(0, 160)}`);
  }
  return res.json();
}

async function getFileSha(path: string): Promise<string | undefined> {
  try {
    const data = await ghFetch(`contents/${path}?ref=${GH_BRANCH}&t=${Date.now()}`);
    return data && data.sha ? (data.sha as string) : undefined;
  } catch {
    return undefined;
  }
}

async function putFile(path: string, base64Content: string, message: string): Promise<void> {
  const sha = await getFileSha(path);
  await ghFetch(`contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: GH_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(bin);
}

// ===== 发布：把当前产品数据写回仓库 =====
// 1) 把 base64 图片上传到 public/images/products/，替换成线上 URL
// 2) 把整份产品数据提交到 data/products.json
// 提交后 GitHub Actions 会自动重新构建并部署，约 2-3 分钟生效
export async function publishProducts(
  products: Product[],
  onProgress?: (msg: string) => void,
): Promise<Product[]> {
  if (!getGithubToken()) {
    throw new Error('尚未设置 GitHub Token，请先在「发布设置」里粘贴并保存 Token');
  }
  const cleaned: Product[] = JSON.parse(JSON.stringify(products));
  for (const p of cleaned) {
    const imgs = p.images || [];
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (typeof img === 'string' && img.startsWith('data:')) {
        const match = img.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
        if (!match) throw new Error(`产品「${p.name}」的第 ${i + 1} 张图片格式无法识别，请删除后重新上传`);
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const fileName = `${p.id}-${i + 1}-${Date.now().toString(36)}.${ext}`;
        onProgress?.(`正在上传图片 ${fileName} ...`);
        await putFile(`public/images/products/${fileName}`, match[2], `chore(admin): 上传产品图片 ${fileName}`);
        imgs[i] = `${PAGES_BASE}/images/products/${fileName}`;
      }
    }
  }
  onProgress?.('正在提交产品数据 products.json ...');
  const json = JSON.stringify(cleaned, null, 2) + '\n';
  await putFile(
    'data/products.json',
    utf8ToBase64(json),
    `chore(admin): 后台更新产品数据（共 ${cleaned.length} 个产品）`,
  );
  return cleaned;
}

export const ACTIONS_URL = `https://github.com/${GH_OWNER}/${GH_REPO}/actions`;
