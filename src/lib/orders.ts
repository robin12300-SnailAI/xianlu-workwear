import { promises as fs } from 'fs';
import path from 'path';
import type { CartItem } from '@/components/CartProvider';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export interface Order {
  id: string;
  createdAt: string;
  customer: { name: string; email: string; address: string; phone?: string };
  items: CartItem[];
  total: number;
  logoUrl?: string;
  notes?: string;
  paymentMethod?: string;
}

export async function saveOrder(order: Order): Promise<void> {
  let all: Order[] = [];
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf-8');
    all = JSON.parse(raw);
  } catch {
    all = [];
  }
  all.push(order);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(all, null, 2), 'utf-8');
}

export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf-8');
    const all = JSON.parse(raw) as Order[];
    return all.find((o) => o.id === id);
  } catch {
    return undefined;
  }
}
