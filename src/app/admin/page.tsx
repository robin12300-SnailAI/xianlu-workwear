'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const ok = localStorage.getItem('xianlu_admin') === '1';
    setAuthed(ok);
    setChecked(true);
  }, []);

  // 登出
  function logout() {
    localStorage.removeItem('xianlu_admin');
    setAuthed(false);
  }

  if (!checked) return null; // 等待 hydration

  if (!authed) return <AdminLogin />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">后台管理</h1>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500">退出登录</button>
      </div>
      <AdminPanel />
    </div>
  );
}
