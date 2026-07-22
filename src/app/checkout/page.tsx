'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <p className="text-gray-500">
        购物车为空，<a className="text-accent" href="/products">去选购 →</a>
      </p>
    );
  }

  async function submit() {
    setLoading(true);
    setError('');
    try {
      if (!name || !email || !address) throw new Error('请填好姓名、邮箱、地址');

      let logoUrl = '';
      if (logo) {
        const fd = new FormData();
        fd.append('logo', logo);
        const up = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        if (!up.ok) throw new Error('Logo 上传失败');
        logoUrl = (await up.json()).url;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: { name, email, address },
          logoUrl,
          notes,
        }),
      });
      if (!res.ok) throw new Error('创建订单失败');
      const { url } = await res.json();
      window.location.href = url; // 跳到 Stripe 或成功页
    } catch (e) {
      setError((e as Error).message || '出错了');
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold">收货与联系信息</h2>
        <div>
          <label className="text-sm text-gray-500">姓名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">邮箱</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">收货地址</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Logo 文件（刺绣/印花用）</label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.pdf,.eps,.ai"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500">Logo 备注（位置/尺寸）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            rows={2}
            placeholder="例如：左胸刺绣，高 8cm"
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 h-fit">
        <h2 className="text-lg font-bold mb-3">订单摘要</h2>
        <div className="space-y-2 text-sm">
          {items.map((it, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {it.name} {[it.color, it.size].filter(Boolean).join('/')} ×{it.qty}
              </span>
              <span>${(it.price * it.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold">
          <span>合计</span>
          <span>${total.toFixed(2)}</span>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-accent text-[var(--accent-ink)] font-semibold py-3 rounded-lg mt-4 hover:brightness-105 disabled:opacity-60 transition"
        >
          {loading ? '处理中…' : '用 Stripe 付款'}
        </button>
        <p className="text-xs text-gray-400 mt-2">
          没有 Stripe 也能走通流程：未配置时会进入演示成功页。
        </p>
      </div>
    </div>
  );
}
