import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 简易后台登录：口令对了就种一个 cookie，访问 /admin 时凭它放行
export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('xianlu_admin', '1', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: '口令错误' }, { status: 401 });
}
