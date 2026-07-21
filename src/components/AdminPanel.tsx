'use client';

import { useEffect, useState, useRef } from 'react';
import type { Product, Category } from '@/lib/types';
import { getMergedProducts, addLocalProduct, updateLocalProduct, deleteLocalProduct } from '@/lib/localProducts';

const CATS: Category[] = [
  'HiVis', 'Workwear', 'Corporate', 'Chef', 'Hospitality', 'Accessories',
];

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({ name: '', category: 'HiVis', description: '', price: 0, images: [], colors: [], sizes: [], inStock: true });
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setProducts(getMergedProducts());
  }
  useEffect(() => { load(); }, []);

  function edit(p: Product) {
    setForm(p);
    setEditingId(p.id);
  }

  // 上传图片 → 存 Base64 到 localStorage
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setForm((prev) => ({ ...prev, images: [url, ...(prev.images || [])] }));
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removeImage(idx: number) {
    setForm((prev) => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }));
  }

  function save() {
    const { name, category, description, price, images, colors, sizes, inStock, seoTitle, seoDescription } = form;
    if (!name || !price) return alert('请填写产品名称和价格');
    const payload: Partial<Product> = { name, category, description, price, images, colors, sizes, inStock, seoTitle, seoDescription };
    if (editingId) {
      updateLocalProduct(editingId, payload);
    } else {
      addLocalProduct(payload as Omit<Product, 'id' | 'slug'>);
    }
    setEditingId(null);
    resetForm();
    load();
  }

  function del(id: string) {
    if (!confirm('确定删除该产品？')) return;
    deleteLocalProduct(id);
    load();
  }

  function resetForm() {
    setForm({ name: '', category: 'HiVis', description: '', price: 0, images: [], colors: [], sizes: [], inStock: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">产品管理</h1>
        <button onClick={() => { resetForm(); setEditingId(null); }} className="text-xs text-gray-400 hover:text-brand">+ 新建</button>
      </div>

      {/* 编辑/新增 表单 */}
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-2 gap-3 shadow-sm">
        <input placeholder="产品名" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="border rounded px-2 py-1 text-sm">
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="价格 AUD" type="number" step="0.01" value={form.price || 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="border rounded px-2 py-1 text-sm" />

        {/* 图片上传 */}
        <div className="md:col-span-2 space-y-2">
          <label className="inline-flex items-center gap-1 cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded px-3 py-1 text-sm transition-colors">
            📷 选择图片上传
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImageUpload} className="hidden" />
          </label>
          {(form.images || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form.images || []).map((url, idx) => (
                <div key={idx} className="relative group border rounded overflow-hidden w-16 h-16">
                  <img src={url} alt={`图${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <input placeholder="颜色(逗号分隔)" value={(form.colors || []).join(',')} onChange={(e) => setForm({ ...form, colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="border rounded px-2 py-1 text-sm" />
        <input placeholder="尺码(逗号分隔)" value={(form.sizes || []).join(',')} onChange={(e) => setForm({ ...form, sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="border rounded px-2 py-1 text-sm" />
        <textarea placeholder="描述" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-2 py-1 text-sm md:col-span-2" rows={2} />
        <input placeholder="SEO 标题" value={form.seoTitle || ''} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className="border rounded px-2 py-1 text-sm" />
        <input placeholder="SEO 描述" value={form.seoDescription || ''} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className="border rounded px-2 py-1 text-sm" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} /> 有货
        </label>
        <div className="md:col-span-2 flex gap-2">
          <button onClick={save} className="px-4 py-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 transition">
            {editingId ? '保存修改' : '新增产品'}
          </button>
          {editingId && (
            <button onClick={() => { resetForm(); setEditingId(null); }} className="border px-4 py-2 rounded-lg text-sm">取消</button>
          )}
        </div>
      </div>

      {/* 产品列表 */}
      <div className="bg-white border rounded-xl divide-y shadow-sm">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            {p.images[0] ? (
              <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded bg-gray-100" />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">无图</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-sm">{p.name}</div>
              <div className="text-xs text-gray-400">{p.category} · ${p.price.toFixed(2)}</div>
            </div>
            <button onClick={() => edit(p)} className="text-brand text-xs whitespace-nowrap">编辑</button>
            <button onClick={() => del(p.id)} className="text-red-500 text-xs whitespace-nowrap">删除</button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">暂无产品，用上方表单添加第一个吧</div>
        )}
      </div>
    </div>
  );
}
