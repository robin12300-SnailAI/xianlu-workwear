'use client';

import { useEffect, useState, useRef } from 'react';
import type { Product, Category } from '@/lib/types';

const CATS: Category[] = [
  'HiVis',
  'Workwear',
  'Corporate',
  'Chef',
  'Hospitality',
  'Accessories',
];

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    category: 'HiVis',
    description: '',
    price: 0,
    images: [],
    colors: [],
    sizes: [],
    inStock: true,
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch('/api/products');
    if (r.ok) setProducts(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  function edit(p: Product) {
    setForm(p);
    setEditingId(p.id);
  }

  // 上传产品图片 → 存到 public/images/products/ → 返回本地路径
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await fetch('/api/upload-product-image', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.url) {
        // 新上传的图追加到 images 数组最前面（作为主图）
        setForm((prev) => ({ ...prev, images: [d.url, ...(prev.images || [])] }));
      } else {
        alert(d.error || '上传失败');
      }
    } finally {
      setUploading(false);
      // 重置 file input，允许重复选同一文件
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // 删除某一张已选的图片
  function removeImage(idx: number) {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idx),
    }));
  }

  async function save() {
    const body = { ...form };
    const res = editingId
      ? await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, id: editingId }),
        })
      : await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
    if (res.ok) {
      setEditingId(null);
      resetForm();
      await load();
    }
  }

  async function del(id: string) {
    if (!confirm('确定删除该产品？')) return;
    await fetch('/api/products?id=' + id, { method: 'DELETE' });
    await load();
  }

  function resetForm() {
    setForm({
      name: '',
      category: 'HiVis',
      description: '',
      price: 0,
      images: [],
      colors: [],
      sizes: [],
      inStock: true,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">产品管理</h1>

      {/* ===== 编辑/新增 表单 ===== */}
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-2 gap-3">
        {/* 第一行：名称 + 分类 */}
        <input
          placeholder="产品名"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded px-2 py-1"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
          className="border rounded px-2 py-1"
        >
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* 第二行：价格 */}
        <input
          placeholder="价格 AUD"
          type="number"
          step="0.01"
          value={form.price || 0}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="border rounded px-2 py-1"
        />

        {/* 第三行：图片上传 + 预览（替代原来的 URL 文本框） */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-1 cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded px-3 py-1 text-sm transition-colors">
              📷 选择图片上传
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {uploading && <span className="text-sm text-blue-500 animate-pulse">上传中…</span>}
            {!uploading && (form.images?.length ?? 0) > 0 && (
              <span className="text-xs text-gray-400">已选 {(form.images || []).length} 张</span>
            )}
          </div>

          {/* 已上传/已有图片预览 */}
          {(form.images || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form.images || []).map((url, idx) => (
                <div key={idx} className="relative group border rounded overflow-hidden w-20 h-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`图${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-1">
                      主图
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 兼容旧方式：也支持手动粘贴 URL（收起，高级用户用） */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-600">或手动填写图片 URL（高级）</summary>
            <input
              placeholder="图片(逗号分隔 URL)"
              value={(form.images || []).join(',')}
              onChange={(e) =>
                setForm({
                  ...form,
                  images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className="border rounded px-2 py-1 mt-1 w-full"
            />
          </details>
        </div>

        {/* 第四行：颜色 + 尺码 */}
        <input
          placeholder="颜色(逗号分隔)"
          value={(form.colors || []).join(',')}
          onChange={(e) =>
            setForm({
              ...form,
              colors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="尺码(逗号分隔)"
          value={(form.sizes || []).join(',')}
          onChange={(e) =>
            setForm({
              ...form,
              sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          className="border rounded px-2 py-1"
        />

        {/* 第五行：描述 */}
        <textarea
          placeholder="描述"
          value={form.description || ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border rounded px-2 py-1 md:col-span-2"
          rows={2}
        />

        {/* 第六行：SEO */}
        <input
          placeholder="SEO 标题"
          value={form.seoTitle || ''}
          onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          className="border rounded px-2 py-1"
        />
        <input
          placeholder="SEO 描述"
          value={form.seoDescription || ''}
          onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          className="border rounded px-2 py-1"
        />

        {/* 第七行：有货 + 按钮 */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.inStock}
            onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
          />
          有货
        </label>
        <div className="md:col-span-2 flex gap-2">
          <button
            onClick={save}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg ${uploading ? 'bg-gray-300' : 'bg-brand text-white'} font-semibold`}
          >
            {editingId ? '保存修改' : '新增产品'}
          </button>
          {editingId && (
            <button onClick={() => { resetForm(); setEditingId(null); }} className="border px-4 py-2 rounded-lg">
              取消
            </button>
          )}
        </div>
      </div>

      {/* ===== 产品列表 ===== */}
      <div className="bg-white border rounded-xl divide-y">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-12 h-12 object-cover rounded bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-gray-400">
                {p.category} · ${p.price}
              </div>
            </div>
            <button onClick={() => edit(p)} className="text-brand text-sm whitespace-nowrap">
              编辑
            </button>
            <button onClick={() => del(p.id)} className="text-red-500 text-sm whitespace-nowrap">
              删除
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="p-6 text-center text-gray-400">暂无产品，用上方表单添加第一个吧</div>
        )}
      </div>
    </div>
  );
}
