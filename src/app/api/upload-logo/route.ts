import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// 接收顾客上传的 Logo 文件，存到 public/uploads，返回可访问路径
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('logo') as File | null;
  if (!file) return NextResponse.json({ error: '没有收到文件' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const safeExt = ['png', 'jpg', 'jpeg', 'svg', 'pdf', 'eps', 'ai'].includes(ext)
    ? ext
    : 'png';
  const name = `logo-${Date.now()}.${safeExt}`;

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${name}` });
}
