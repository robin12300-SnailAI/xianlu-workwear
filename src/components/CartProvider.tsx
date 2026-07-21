'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, color?: string, size?: string) => void;
  updateQty: (slug: string, qty: number, color?: string, size?: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'xianlu_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 打开网站时从浏览器本地读取购物车
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  // 购物车变化时存回本地，刷新不丢
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.slug === item.slug && i.color === item.color && i.size === item.size,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
  };

  const removeItem = (slug: string, color?: string, size?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.slug === slug && i.color === color && i.size === size)),
    );
  };

  const updateQty = (slug: string, qty: number, color?: string, size?: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.slug === slug && i.color === color && i.size === size
            ? { ...i, qty: Math.max(1, qty) }
            : i,
        ),
    );
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart 必须在 CartProvider 内使用');
  return ctx;
}
