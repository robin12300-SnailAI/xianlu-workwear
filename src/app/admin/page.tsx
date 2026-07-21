'use client';

import { useState } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  // 首次加载检查登录态
  function checkAuth() {
    const ok = typeof window !== 'undefined' && localStorage.getItem('xianlu_admin') === '1';
    setAuthed(ok);
    setChecked(true);
  }

  // 登录成功回调
  function handleLogin() {
    setAuthed(true);
  }

  // 登出
  function logout() {
    localStorage.removeItem('xianlu_admin');
    setAuthed(false);
  }

  // 客户端 hydration 后检查登录态
  if (typeof window !== 'undefined' && !checked) {
    checkAuth();
  }

  if (!checked) return null; // 等待 hydration

  if (!authed) return <AdminLogin onLogin={handleLogin} />;

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
