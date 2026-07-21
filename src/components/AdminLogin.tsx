'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function login() {
    const r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const d = await r.json();
    if (d.ok) router.refresh();
    else setErr(d.error || '失败');
  }

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white border rounded-xl p-6">
      <h1 className="font-bold text-lg mb-3">后台登录</h1>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && login()}
        className="w-full border rounded px-3 py-2"
        placeholder="输入 ADMIN_PASSWORD"
      />
      {err && <p className="text-red-500 text-sm mt-2">{err}</p>}
      <button
        onClick={login}
        className="w-full bg-brand text-white font-semibold py-2 rounded-lg mt-3"
      >
        登录
      </button>
    </div>
  );
}
