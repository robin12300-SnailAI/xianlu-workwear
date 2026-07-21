import type { Metadata } from 'next';
import AdminLogin from '@/components/AdminLogin';

export const metadata: Metadata = { title: '后台管理 | Xianlu Workwear' };

export default function AdminPage() {
  // GitHub Pages 静态托管，无后端 cookie 验证，直接展示登录页
  return <AdminLogin />;
}
