'use client';

import { useEffect, useState, useRef } from 'react';
import type { Product, Category, AboutData, ContactData, AboutBlock } from '@/lib/types';
import { getMergedProducts, addLocalProduct, updateLocalProduct, deleteLocalProduct, saveLocalProducts, getMergedCategories, saveLocalCategories } from '@/lib/localProducts';
import { DEFAULT_SEO_TITLE, DEFAULT_SEO_DESCRIPTION, normalizeProductSeo } from '@/lib/seoDefaults';
import { getMergedAbout, saveLocalAbout, getMergedContact, saveLocalContact, addAboutBlock as addBlock, updateAboutBlock as updateBlockFn, deleteAboutBlock as removeBlock } from '@/lib/localContent';
import { publishProducts, publishCategories, publishAbout, publishContact, getGithubToken, saveGithubToken, ACTIONS_URL } from '@/lib/githubSync';

type AdminTab = 'products' | 'about' | 'contact';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>({ name: '', category: 'HiVis', description: '', price: 0, images: [], colors: [], sizes: [], inStock: true, code: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  // 发布相关状态
  const [tokenInput, setTokenInput] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pubMsg, setPubMsg] = useState('');
  const [pubErr, setPubErr] = useState('');
  const [dirty, setDirty] = useState(false);

  // 分类管理状态
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');
  const [catDirty, setCatDirty] = useState(false);

  // ===== 关于我们状态 =====
  const [aboutData, setAboutData] = useState<AboutData>({ blocks: [] });
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);
  const [blockEditorContent, setBlockEditorContent] = useState('');
  const [newBlockType, setNewBlockType] = useState<'paragraph' | 'heading'>('paragraph');
  const [newBlockContent, setNewBlockContent] = useState('');
  const [aboutDirty, setAboutDirty] = useState(false);
  const aboutImageRef = useRef<HTMLInputElement>(null);

  // ===== 联系我们状态 =====
  const [contactData, setContactData] = useState<ContactData>({
    address: '', phone: '', email: '', hours: '', mapEmbedUrl: '', additionalInfo: '',
  });
  const [contactDirty, setContactDirty] = useState(false);

  function load() {
    setProducts(getMergedProducts());
    setCategories(getMergedCategories().filter((c) => c.toLowerCase() !== 'contact us'));
    setAboutData(getMergedAbout());
    setContactData(getMergedContact());
  }
  useEffect(() => {
    load();
    setHasToken(!!getGithubToken());
  }, []);

  function edit(p: Product) {
    setForm(p);
    setEditingId(p.id);
  }

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
    const { name, category, description, price, images, colors, sizes, inStock, code, seoTitle, seoDescription } = form;
    if (!name || !price) return alert('请填写产品名称和价格');
    const trimmedCode = (code || '').trim();
    if (trimmedCode) {
      const conflict = getMergedProducts().some(
        (p) => p.id !== editingId && (p.code || '').trim().toLowerCase() === trimmedCode.toLowerCase(),
      );
      if (conflict) return alert(`产品码「${trimmedCode}」已存在于其它产品，请使用不同的码`);
    }
    const payload: Partial<Product> = { name, category, description, price, images, colors, sizes, inStock, code: trimmedCode, seoTitle, seoDescription };
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

  function batchApplySeo() {
    const all = getMergedProducts();
    const updated = all.map(normalizeProductSeo);
    const changedCount = updated.filter((p, i) =>
      p.seoTitle !== all[i].seoTitle || p.seoDescription !== all[i].seoDescription,
    ).length;
    if (changedCount === 0) {
      alert('所有产品的 SEO 标题/描述已经是默认内容，无需更新。');
      return;
    }
    if (!confirm(`将把 ${changedCount} 个产品的 SEO 标题和描述统一设为默认内容。确定继续？`)) return;
    saveLocalProducts(updated);
    setDirty(true);
    setPubMsg('');
    load();
    if (editingId) {
      const current = updated.find((p) => p.id === editingId);
      if (current) setForm((prev) => ({ ...prev, seoTitle: current.seoTitle, seoDescription: current.seoDescription }));
    }
  }

  function resetForm() {
    setForm({ name: '', category: categories[0] || 'HiVis', description: '', price: 0, images: [], colors: [], sizes: [], inStock: true, code: '', seoTitle: DEFAULT_SEO_TITLE, seoDescription: DEFAULT_SEO_DESCRIPTION });
  }

  // ===== 分类 CRUD =====
  function addCategory() {
    const name = newCat.trim();
    if (!name) return alert('请输入分类名称');
    if (categories.includes(name)) return alert('该分类已存在');
    const next = [...categories, name];
    setCategories(next);
    saveLocalCategories(next);
    setNewCat('');
    setCatDirty(true);
  }

  function startEditCategory(idx: number) {
    setEditingCatIdx(idx);
    setEditingCatValue(categories[idx]);
  }

  function saveEditCategory() {
    if (editingCatIdx === null) return;
    const oldName = categories[editingCatIdx];
    const newName = editingCatValue.trim();
    if (!newName) return alert('分类名称不能为空');
    if (newName !== oldName && categories.includes(newName)) return alert('该分类名称已存在');

    const next = categories.map((c, i) => (i === editingCatIdx ? newName : c));
    setCategories(next);
    saveLocalCategories(next);

    const updated = getMergedProducts().map((p) =>
      p.category === oldName ? { ...p, category: newName } : p,
    );
    saveLocalProducts(updated);
    setProducts(updated);

    setEditingCatIdx(null);
    setEditingCatValue('');
    setCatDirty(true);
  }

  function deleteCategory(idx: number) {
    const name = categories[idx];
    const used = getMergedProducts().filter((p) => p.category === name).length;
    if (used > 0) {
      return alert(`「${name}」分类下还有 ${used} 个产品，请先修改这些产品到其它分类后再删除。`);
    }
    if (!confirm(`确定删除分类「${name}」吗？`)) return;
    const next = categories.filter((_, i) => i !== idx);
    setCategories(next);
    saveLocalCategories(next);
    setEditingCatIdx(null);
    setEditingCatValue('');
    setCatDirty(true);
  }

  function saveToken() {
    try {
      saveGithubToken(tokenInput);
      setHasToken(!!tokenInput.trim());
      setTokenInput('');
      setPubErr('');
      alert(tokenInput.trim() ? 'Token 已保存在本机浏览器（不会上传）' : 'Token 已清除');
    } catch (e) {
      setPubErr(e instanceof Error ? e.message : String(e));
      setPubMsg('');
    }
  }

  function clearToken() {
    if (!confirm('确定清空本机保存的 GitHub Token 吗？')) return;
    saveGithubToken('');
    setHasToken(false);
    setTokenInput('');
    setPubErr('');
  }

  async function publishProductsAndCategories() {
    setPubErr('');
    setPubMsg('');
    if (!getGithubToken()) {
      setPubErr('请先展开下方「发布设置」，粘贴并保存 GitHub Token');
      return;
    }
    if (!confirm('确定把当前产品和分类数据发布到线上网站吗？\n提交后约 2-3 分钟自动生效。')) return;
    setPublishing(true);
    try {
      const cleaned = await publishProducts(getMergedProducts(), (m) => setPubMsg(m));
      saveLocalProducts(cleaned);
      await publishCategories(categories, (m) => setPubMsg(m));
      setDirty(false);
      setCatDirty(false);
      setPubMsg('✅ 已提交到 GitHub！网站正在自动重建，约 2-3 分钟后刷新前台即可看到更新。');
      load();
    } catch (e) {
      setPubErr(e instanceof Error ? e.message : String(e));
      setPubMsg('');
    } finally {
      setPublishing(false);
    }
  }

  // ===== 关于我们：内容块操作 =====
  function startEditBlock(idx: number) {
    setEditingBlockIdx(idx);
    setBlockEditorContent(aboutData.blocks[idx].content);
  }

  function saveBlockEdit() {
    if (editingBlockIdx === null) return;
    const updated = updateBlockFn(aboutData.blocks, editingBlockIdx, blockEditorContent);
    const newData = { ...aboutData, blocks: updated };
    setAboutData(newData);
    saveLocalAbout(newData);
    setEditingBlockIdx(null);
    setBlockEditorContent('');
    setAboutDirty(true);
  }

  function cancelBlockEdit() {
    setEditingBlockIdx(null);
    setBlockEditorContent('');
  }

  function handleAddBlock() {
    const content = newBlockContent.trim();
    if (!content) return alert('请输入内容');
    const block: AboutBlock = { type: newBlockType, content };
    const updated = addBlock(aboutData.blocks, block);
    const newData = { ...aboutData, blocks: updated };
    setAboutData(newData);
    saveLocalAbout(newData);
    setNewBlockContent('');
    setAboutDirty(true);
  }

  function handleDeleteBlock(idx: number) {
    if (!confirm('确定删除这个内容块？')) return;
    const updated = removeBlock(aboutData.blocks, idx);
    const newData = { ...aboutData, blocks: updated };
    setAboutData(newData);
    saveLocalAbout(newData);
    setAboutDirty(true);
  }

  function handleAboutImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const newData = { ...aboutData, heroImage: url };
      setAboutData(newData);
      saveLocalAbout(newData);
      setAboutDirty(true);
    };
    reader.readAsDataURL(file);
    if (aboutImageRef.current) aboutImageRef.current.value = '';
  }

  function removeAboutImage() {
    const newData = { ...aboutData, heroImage: undefined };
    setAboutData(newData);
    saveLocalAbout(newData);
    setAboutDirty(true);
  }

  async function publishAboutContent() {
    setPubErr('');
    setPubMsg('');
    if (!getGithubToken()) {
      setPubErr('请先设置 GitHub Token（在产品管理的「发布设置」中）');
      return;
    }
    if (!confirm('确定发布关于我们内容到线上网站吗？')) return;
    setPublishing(true);
    try {
      const cleaned = await publishAbout(aboutData, (m) => setPubMsg(m));
      saveLocalAbout(cleaned);
      setAboutDirty(false);
      setPubMsg('✅ 关于我们内容已发布！约 2-3 分钟后生效。');
      load();
    } catch (e) {
      setPubErr(e instanceof Error ? e.message : String(e));
      setPubMsg('');
    } finally {
      setPublishing(false);
    }
  }

  // ===== 联系我们：表单操作 =====
  function handleContactChange(field: keyof ContactData, value: string) {
    const newData = { ...contactData, [field]: value };
    setContactData(newData);
    saveLocalContact(newData);
    setContactDirty(true);
  }

  async function publishContactContent() {
    setPubErr('');
    setPubMsg('');
    if (!getGithubToken()) {
      setPubErr('请先设置 GitHub Token（在产品管理的「发布设置」中）');
      return;
    }
    if (!confirm('发布联系我们信息到线上网站吗？')) return;
    setPublishing(true);
    try {
      await publishContact(contactData, (m) => setPubMsg(m));
      setContactDirty(false);
      setPubMsg('✅ 联系我们信息已发布！约 2-3 分钟后生效。');
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
      {/* ── Tab Navigation ──────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {[
          { key: 'products' as const, label: '产品管理', icon: '📦' },
          { key: 'about' as const, label: '关于我们', icon: '🏢' },
          { key: 'contact' as const, label: '联系我们', icon: '📞' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white text-[var(--ink)] shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════ */}
      {/* ── Products Tab ────────────────────────── */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <>
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
            onClick={publishProductsAndCategories}
            disabled={publishing}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {publishing ? '发布中…' : (dirty || catDirty) ? '🚀 发布（有未发布改动）' : '🚀 发布到线上'}
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
              {hasToken && (
                <button onClick={clearToken} className="border px-3 py-1 rounded text-xs hover:bg-red-50 text-red-600">清除</button>
              )}
            </div>
            <p>
              发布后可到 <a href={ACTIONS_URL} target="_blank" rel="noreferrer" className="text-brand underline">GitHub Actions</a> 查看构建进度，绿色 ✓ 即已上线。
            </p>
          </div>
        </details>
      </div>

      {/* 批量 SEO 设置 */}
      <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="font-semibold text-sm">批量设置 SEO</div>
            <div className="text-xs text-gray-500 mt-0.5">
              一键把当前所有产品的 SEO 标题/描述替换为默认内容；后续新增产品会自动预填。
            </div>
          </div>
          <button
            onClick={batchApplySeo}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-ink)] font-semibold text-sm hover:opacity-90 transition whitespace-nowrap"
          >
            🔧 批量应用默认 SEO
          </button>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 border rounded px-3 py-2">
          标题：{DEFAULT_SEO_TITLE}<br />
          描述：{DEFAULT_SEO_DESCRIPTION}
        </div>
      </div>

      {/* 分类管理 */}
      <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">分类管理</h2>
          <span className="text-xs text-gray-400">增删改后同样需要点「发布到线上」才会生效</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="新分类名称"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            className="border rounded px-2 py-1 text-xs flex-1"
          />
          <button onClick={addCategory} className="border px-3 py-1 rounded text-xs hover:bg-gray-50">新增</button>
        </div>
        <div className="divide-y border rounded">
          {categories.map((c, idx) => (
            <div key={c} className="flex items-center justify-between px-3 py-2">
              {editingCatIdx === idx ? (
                <>
                  <input
                    type="text"
                    value={editingCatValue}
                    onChange={(e) => setEditingCatValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEditCategory()}
                    className="border rounded px-2 py-1 text-xs flex-1"
                  />
                  <div className="flex gap-2 ml-2">
                    <button onClick={saveEditCategory} className="text-green-600 text-xs">保存</button>
                    <button onClick={() => { setEditingCatIdx(null); setEditingCatValue(''); }} className="text-gray-400 text-xs">取消</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-sm">{c}</span>
                  <div className="flex gap-3">
                    <button onClick={() => startEditCategory(idx)} className="text-brand text-xs">编辑</button>
                    <button onClick={() => deleteCategory(idx)} className="text-red-500 text-xs">删除</button>
                  </div>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-xs">暂无分类</div>
          )}
        </div>
      </div>

      {/* 编辑/新增 表单 */}
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-2 gap-3 shadow-sm">
        <input placeholder="产品名" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1 text-sm" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="border rounded px-2 py-1 text-sm">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="价格 AUD" type="number" step="0.01" value={form.price || 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="border rounded px-2 py-1 text-sm" />
        <input placeholder="产品码（SKU）" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} className="border rounded px-2 py-1 text-sm" />

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
              <div className="text-xs text-gray-400">{p.category} · ${p.price.toFixed(2)}{p.code ? ` · 码:${p.code}` : ''}</div>
            </div>
            <button onClick={() => edit(p)} className="text-brand text-xs whitespace-nowrap">编辑</button>
            <button onClick={() => del(p.id)} className="text-red-500 text-xs whitespace-nowrap">删除</button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="p-6 text-center text-gray-400 text-sm">暂无产品，用上方表单添加第一个吧</div>
        )}
      </div>
        </>
      )}

      {/* ════════════════════════════════════════ */}
      {/* ── About Us Tab ───────────────────────── */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'about' && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">关于我们 — 内容管理</h1>
          </div>

          {/* 发布按钮 */}
          <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold text-sm">发布关于我们内容</div>
                <div className="text-xs text-gray-500 mt-0.5">修改后点发布才会在线上显示（约 2-3 分钟生效）。</div>
              </div>
              <button
                onClick={publishAboutContent}
                disabled={publishing}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {publishing ? '发布中…' : aboutDirty ? '🚀 发布（有未发布改动）' : '🚀 发布到线上'}
              </button>
            </div>
            {pubMsg && <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{pubMsg}</div>}
            {pubErr && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">❌ {pubErr}</div>}
          </div>

          {/* 展示图片管理 */}
          <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
            <h2 className="font-semibold text-sm">公司展示图片</h2>
            <p className="text-xs text-gray-500">显示在 About Us 弹窗顶部的图片（建议尺寸 800×300 以上）。</p>
            {aboutData.heroImage && (
              <div className="relative inline-block border rounded-xl overflow-hidden max-w-md">
                <img src={aboutData.heroImage} alt="Company hero" className="w-full h-40 object-cover" />
                <button onClick={removeAboutImage} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">删除图片</button>
              </div>
            )}
            <label className="inline-flex items-center gap-1 cursor-pointer bg-gray-100 hover:bg-gray-200 border rounded px-3 py-1.5 text-sm transition-colors">
              📷 {aboutData.heroImage ? '更换图片' : '上传展示图片'}
              <input ref={aboutImageRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleAboutImageUpload} className="hidden" />
            </label>
          </div>

          {/* 内容块列表 */}
          <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">内容段落（支持 HTML 富文本）</h2>
              <span className="text-xs text-gray-400">按顺序显示在 About Us 弹窗中</span>
            </div>

            <div className="space-y-2">
              {aboutData.blocks.map((block, idx) => (
                <div key={idx} className={`border rounded-lg p-3 ${editingBlockIdx === idx ? 'border-[var(--accent)] bg-blue-50/30' : 'bg-gray-50'}`}>
                  {editingBlockIdx === idx ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${block.type === 'heading' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {block.type === 'heading' ? '📌 标题' : '📝 段落'}
                        </span>
                        <span className="text-xs text-gray-400">#{idx + 1}</span>
                      </div>
                      <textarea
                        value={blockEditorContent}
                        onChange={(e) => setBlockEditorContent(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                        rows={4}
                        placeholder="支持 HTML 标签，如 <b>粗体</b> 或 <br/> 换行"
                      />
                      <div className="flex gap-2">
                        <button onClick={saveBlockEdit} className="px-3 py-1 rounded bg-brand text-white text-xs hover:bg-brand/90">保存</button>
                        <button onClick={cancelBlockEdit} className="px-3 py-1 rounded border text-xs hover:bg-gray-50">取消</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${block.type === 'heading' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {block.type === 'heading' ? '📌 标题' : '📝 段落'}
                          </span>
                          <span className="text-xs text-gray-400">#{idx + 1}</span>
                        </div>
                        <div
                          className="text-sm text-[var(--ink-2)] line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => startEditBlock(idx)} className="text-brand text-xs">编辑</button>
                        <button onClick={() => handleDeleteBlock(idx)} className="text-red-500 text-xs">删除</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {aboutData.blocks.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-sm">暂无内容块，请在下方添加</div>
              )}
            </div>

            {/* 新增内容块 */}
            <div className="border-t pt-3 mt-3">
              <h3 className="text-xs font-semibold text-gray-500 mb-2">+ 新增内容块</h3>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setNewBlockType('paragraph')}
                  className={`px-3 py-1 rounded text-xs border transition ${newBlockType === 'paragraph' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  📝 段落
                </button>
                <button
                  onClick={() => setNewBlockType('heading')}
                  className={`px-3 py-1 rounded text-xs border transition ${newBlockType === 'heading' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'hover:bg-gray-50'}`}
                >
                  📌 标题
                </button>
              </div>
              <textarea
                value={newBlockContent}
                onChange={(e) => setNewBlockContent(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="输入内容（支持 HTML 标签）..."
              />
              <button onClick={handleAddBlock} className="mt-2 px-4 py-1.5 rounded-lg bg-brand text-white text-sm hover:bg-brand/90 transition">
                添加{newBlockType === 'heading' ? '标题' : '段落'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════ */}
      {/* ── Contact Us Tab ──────────────────────── */}
      {/* ════════════════════════════════════════ */}
      {activeTab === 'contact' && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">联系我们 — 信息管理</h1>
          </div>

          {/* 发布按钮 */}
          <div className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold text-sm">发布联系信息</div>
                <div className="text-xs text-gray-500 mt-0.5">修改后点发布才会在线上显示（约 2-3 分钟生效）。</div>
              </div>
              <button
                onClick={publishContactContent}
                disabled={publishing}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
              >
                {publishing ? '发布中…' : contactDirty ? '🚀 发布（有未发布改动）' : '🚀 发布到线上'}
              </button>
            </div>
            {pubMsg && <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{pubMsg}</div>}
            {pubErr && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">❌ {pubErr}</div>}
          </div>

          {/* 联系信息表单 */}
          <div className="bg-white border rounded-xl p-4 grid md:grid-cols-2 gap-4 shadow-sm">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">📍 公司地址</label>
              <input
                value={contactData.address}
                onChange={(e) => handleContactChange('address', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="例如：Parklea Markets Stall #298, Parklea NSW 2768, Australia"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">📞 电话号码</label>
              <input
                value={contactData.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="例如：0406 669 868"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">📧 邮箱地址</label>
              <input
                value={contactData.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="例如：info@xianlu.com.au"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">🕐 营业时间</label>
              <input
                value={contactData.hours}
                onChange={(e) => handleContactChange('hours', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="例如：Mon–Sat: 9:00 AM – 5:00 PM | Sun: Closed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">🗺️ Google Maps 嵌入 URL</label>
              <input
                value={contactData.mapEmbedUrl}
                onChange={(e) => handleContactChange('mapEmbedUrl', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-xs"
                placeholder="粘贴 Google Maps 嵌入 iframe 的 src 地址..."
              />
              <p className="text-[10px] text-gray-400 mt-1">
                获取方式：Google Maps → 搜索地点 → 分享 → 嵌入地图 → 复制 iframe src 属性值
              </p>
              {contactData.mapEmbedUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <iframe
                    src={contactData.mapEmbedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="地图预览"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">📋 补充信息</label>
              <textarea
                value={contactData.additionalInfo}
                onChange={(e) => handleContactChange('additionalInfo', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={2}
                placeholder="例如：Australia-wide delivery available. Bulk order discounts..."
              />
            </div>
          </div>

          {/* 实时预览卡片 */}
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-sm mb-3">👁 实时预览（前台显示效果）</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 grid place-items-center shrink-0 text-sm">📍</div>
                  <div><div className="text-xs font-semibold">Address</div><div className="text-xs text-gray-500">{contactData.address || '—'}</div></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-green-100 text-green-600 grid place-items-center shrink-0 text-sm">📞</div>
                  <div><div className="text-xs font-semibold">Phone</div><div className="text-xs text-[var(--accent)]">{contactData.phone || '—'}</div></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-orange-100 text-orange-600 grid place-items-center shrink-0 text-sm">📧</div>
                  <div><div className="text-xs font-semibold">Email</div><div className="text-xs text-[var(--accent)]">{contactData.email || '—'}</div></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 grid place-items-center shrink-0 text-sm">🕐</div>
                  <div><div className="text-xs font-semibold">Hours</div><div className="text-xs text-gray-500">{contactData.hours || '—'}</div></div>
                </div>
              </div>
              {contactData.additionalInfo && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold mb-1">ℹ 补充信息</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{contactData.additionalInfo}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
