'use client';

import { useEffect, useState, useRef } from 'react';
import type { Product, Category } from '@/lib/types';
import { getMergedProducts, addLocalProduct, updateLocalProduct, deleteLocalProduct, saveLocalProducts } from '@/lib/localProducts';
import { publishProducts, getGithubToken, saveGithubToken, ACTIONS_URL } from '@/lib/githubSync';

const CATS: Category[] = [
  'HiVis', 'Workwear', 'Corporate', 'Chef', 'Hospitality', 'Accessories',
];

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({ name: '', category: 'HiVis', description: '', price: 0, images: [], colors: [], sizes: [], inStock: true });
  const fileRef = useRef<HTMLInputElement>(null);

  // 发布相关状态
  const [tokenInput, setTokenInput] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pubMsg, setPubMsg] = useState('');
  const [pubErr, setPubErr] = useState('');
  const [dirty, setDirty] = useState(false);

  function load() {
    setProducts(getMergedProducts());
  }
  useEffect(() => {
    load();
    setHasToken(!!getGithubToken());
  }, []);

  function edit(p: Product) {
    setForm(p);
    setEditingId(p.id);
  }

  // 上传图片 → 先以 Base64 暂存，发布时自动上传到仓库
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
    setDirty(true);
    setPubMsg('');
    load();
  }

  function del(id: string) {
    if (!confirm('确定删除该产品？')) return;
    deleteLocalProduct(id);
    setDirty(true);
    setPubMsg('');
    load();
  }

  function resetForm() {
    setForm({ name: '', category: 'HiVis', description: '', price: 0, images: [], colors: [], sizes: [], inStock: true });
  }

  function saveToken() {
    saveGithubToken(tokenInput);
    setHasToken(!!tokenInput.trim());
    setTokenInput('');
    setPubErr('');
    alert(tokenInput.trim() ? 'Token 已保存在本机浏览器（不会上传）' : 'Token 已清除');
  }

  async function publish() {
    setPubErr('');
    setPubMsg('');
    if (!getGithubToken()) {
      setPubErr('请先展开下方「发布设置」，粘贴并保存 GitHub Token');
      return;
    }
    if (!confirm('确定把当前产品数据发布到线上网站吗？\n提交后约 2-3 分钟自动生效。')) return;
    setPublishing(true);
    try {
      const cleaned = await publishProducts(getMergedProducts(), (m) => setPubMsg(m));
      saveLocalProducts(cleaned);
      setDirty(false);
      setPubMsg('✅ 已提交到 GitHub！网站正在自动重建，约 2-3 分钟后刷新前台即可看到更新。');
      load();
    } catch (e) {
      setPubErr(e instanceof Error ? e.message : String(e));
      setPubMsg('');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">产品管理</h1>
        <button onClick={() => { resetForm(); setEditingId(null); }} className="text-xs text-gray-400 hover:text-brand">+ 新建</button>
      </div>

      {/* 发布到线上 */}
      <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-semibold text-sm">发布到线上网站</div>
            <div className="text-xs text-gray-500 mt-0.5">
              下方的增删改先保存在本机草稿，点「发布」才会提交到 GitHub 并更新网站（约 2-3 分钟生效）。
            </div>
          </div>
          <button
            onClick={publish}
            disabled={publishing}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {publishing ? '发布中…' : dirty ? '🚀 发布（有未发布改动）' : '🚀 发布到线上'}
          </button>
        </div>
        {pubMsg && <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{pubMsg}</div>}
        {pubErr && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">❌ {pubErr}</div>}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer select-none">发布设置（GitHub Token，每台电脑只需设置一次）{hasToken ? ' · ✅ 已设置' : ' · ⚠️ 未设置'}</summary>
          <div className="mt-2 space-y-2">
            <p>
              1. 打开 GitHub → Settings → Developer settings → <b>Fine-grained personal access tokens</b> → Generate new token；
              Repository access 只勾选 <b>xianlu-workwear</b>，Permissions 里把 <b>Contents</b> 设为 <b>Read and write</b>。
            </p>
            <p>2. 生成后把 Token 粘贴到下面并保存（只存在你这台电脑的浏览器里，不会上传）。</p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder={hasToken ? '已设置，可粘贴新 Token 覆盖' : '粘贴 GitHub Token（github_pat_... 或 ghp_...）'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="border rounded px-2 py-1 text-xs flex-1"
              />
              <button onClick={saveToken} className="border px-3 py-1 rounded text-xs hover:bg-gray-50">保存</button>
            </div>
            <p>
              发布后可到 <a href={ACTIONS_URL} target="_blank" rel="noreferrer" className="text-brand underline">GitHub Actions</a> 查看构建进度，绿色 ✓ 即已上线。
            </p>
          </div>
        </details>
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
