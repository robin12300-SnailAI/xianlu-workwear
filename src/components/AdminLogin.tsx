'use client';

import { useState } from 'react';

const ADMIN_PASSWORD = 'xianlu2024'; // 后台密码

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  function login() {
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem('xianlu_admin', '1');
      onLogin(); // 通知父组件更新状态
    } else {
      setErr('密码错误，请重试');
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white border rounded-xl p-6 shadow-sm">
      <h1 className="font-bold text-lg mb-1">仙路后台登录</h1>
      <p className="text-xs text-gray-400 mb-4">GitHub Pages 静态版 · 密码保护</p>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && login()}
        className="w-full border rounded px-3 py-2 text-sm"
        placeholder="输入后台密码"
        autoFocus
      />
      {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      <button
        onClick={login}
        className="w-full bg-brand text-white font-semibold py-2 rounded-lg mt-3 text-sm hover:bg-brand/90 transition"
      >
        登录
      </button>
      <p className="text-xs text-gray-400 mt-3 text-center">
        密码：<code className="bg-gray-100 px-1 rounded">xianlu2024</code>
      </p>
    </div>
  );
}
