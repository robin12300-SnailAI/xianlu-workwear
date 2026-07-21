import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// 接收后台上传的产品图片，存到 public/images/products/，返回可访问路径
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('image') as File | null;
  if (!file) return NextResponse.json({ error: '没有收到文件' }, { status: 400 });

  // 限制大小：最大 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: '图片不能超过 5MB' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeExt = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  // 用时间戳+随机数避免文件名冲突
  const name = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${safeExt}`;

  const dir = path.join(process.cwd(), 'public', 'images', 'products');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(bytes));

  // 返回浏览器可直接访问的相对路径（/images/products/xxx.jpg）
  return NextResponse.json({ url: `/images/products/${name}` });
}
