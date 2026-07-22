'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import Link from 'next/link';

export default function SuccessPage() {
  const { clear } = useCart();
  const [done, setDone] = useState(false);

  // 进入成功页即清空购物车，避免重复下单
  useEffect(() => {
    if (!done) {
      clear();
      setDone(true);
    }
  }, [done, clear]);

  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-2xl font-bold">下单成功！</h1>
      <p className="text-gray-600 mt-2">
        我们已收到你的订单，会尽快邮件确认并安排生产配送。
      </p>
      <p className="text-sm text-gray-400 mt-2">
        如需上传/补充 Logo，可回复我们的确认邮件。
      </p>
      <Link
        href="/products"
        className="inline-block mt-6 bg-accent text-[var(--accent-ink)] font-semibold px-5 py-3 rounded-lg hover:brightness-105 transition"
      >
        继续浏览
      </Link>
    </div>
  );
}
