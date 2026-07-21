import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: '后台管理 | Xianlu Workwear' };

export default function AdminPage() {
  const authed = cookies().get('xianlu_admin')?.value === '1';
  if (!authed) return <AdminLogin />;
  return <AdminPanel />;
}
