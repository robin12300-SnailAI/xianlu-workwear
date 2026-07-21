import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveOrder } from '@/lib/orders';
import type { CartItem } from '@/components/CartProvider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, customer, logoUrl, notes } = body as {
    items: CartItem[];
    customer: { name: string; email: string; address: string };
    logoUrl?: string;
    notes?: string;
  };

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const orderId = 'ORD-' + Date.now();
  await saveOrder({
    id: orderId,
    createdAt: new Date().toISOString(),
    customer,
    items,
    total,
    logoUrl,
    notes,
    status: 'pending',
  });

  const key = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 没配 Stripe：进入演示模式，直接跳成功页（方便你先学会整个流程）
  if (!key || !key.startsWith('sk_')) {
    return NextResponse.json({
      url: `${siteUrl}/checkout/success?order_id=${orderId}&demo=1`,
    });
  }

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map((i) => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name:
            i.name +
            (i.color ? ` (${i.color})` : '') +
            (i.size ? ` / ${i.size}` : ''),
          images: i.image?.startsWith('http')
            ? [i.image]
            : [`${siteUrl}${i.image}`],
        },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.qty,
    })),
    customer_email: customer.email,
    success_url: `${siteUrl}/checkout/success?order_id=${orderId}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: {
      orderId,
      logoUrl: logoUrl || '',
      notes: notes || '',
    },
  });

  return NextResponse.json({ url: session.url });
}
