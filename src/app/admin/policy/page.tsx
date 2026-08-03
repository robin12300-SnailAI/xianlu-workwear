'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import {
  getMergedOrderPolicy,
  saveLocalOrderPolicy,
  getMergedReturnPolicy,
  saveLocalReturnPolicy,
} from '@/lib/localContent';
import { publishPolicy, getGithubToken } from '@/lib/githubSync';

type PolicyType = 'order' | 'return';

const META: Record<PolicyType, { title: string; storageKeyLabel: string }> = {
  order: { title: 'Order Policy', storageKeyLabel: 'Order Policy' },
  return: { title: 'Return and Refund Policy', storageKeyLabel: 'Return and Refund Policy' },
};

// 去掉 HTML 标签后判断是否为空
function isEmptyHtml(html: string): boolean {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, '')
    .trim();
  return text.length === 0;
}

export default function PolicyEditorPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [type, setType] = useState<PolicyType>('order');
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const ok = typeof window !== 'undefined' && localStorage.getItem('xianlu_admin') === '1';
    if (!ok) {
      router.replace('/admin');
      return;
    }
    const t = new URLSearchParams(window.location.search).get('type');
    const policyType: PolicyType = t === 'return' ? 'return' : 'order';
    setType(policyType);
    const data = policyType === 'order' ? getMergedOrderPolicy() : getMergedReturnPolicy();
    setContent(data.content);
    setAuthed(true);
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleChange(html: string) {
    setContent(html);
    setDirty(true);
    setMsg('');
    setErr('');
  }

  function saveDraft() {
    setErr('');
    setMsg('');
    if (isEmptyHtml(content)) {
      setErr('内容不能为空，请先输入 Policy 内容后再保存。');
      return;
    }
    if (type === 'order') {
      saveLocalOrderPolicy({ content });
    } else {
      saveLocalReturnPolicy({ content });
    }
    setDirty(false);
    setMsg('✅ 已保存到本机草稿，前台 Policy 弹窗（同一浏览器）将立即同步显示最新内容。');
  }

  async function publish() {
    setErr('');
    setMsg('');
    if (isEmptyHtml(content)) {
      setErr('内容不能为空，无法发布。');
      return;
    }
    if (!getGithubToken()) {
      setErr('请先在「产品管理 → 发布设置」里粘贴并保存 GitHub Token 后再发布。');
      return;
    }
    if (!confirm(`确定把最新的 ${META[type].title} 内容发布到线上网站吗？\n提交后约 2-3 分钟自动生效。`)) return;
    setPublishing(true);
    try {
      await publishPolicy(type, { content }, (m) => setMsg(m));
      setDirty(false);
      setMsg(`✅ ${META[type].title} 已发布！约 2-3 分钟后所有访客都能看到更新。`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishing(false);
    }
  }

  if (!checked) return null;
  if (!authed) return null;

  const meta = META[type];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={() => router.push('/admin')}
            className="text-xs text-gray-400 hover:text-brand mb-1 inline-block"
          >
            ← 返回后台
          </button>
          <h1 className="text-2xl font-bold">{meta.title} — 内容编辑</h1>
        </div>
      </div>

      {/* 提示区 */}
      {msg && <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3">{msg}</div>}
      {err && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">❌ {err}</div>}

      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-gray-500">
            编辑下方 {meta.title} 内容（支持富文本：加粗、标题、列表、链接等）。保存即同步到前台；发布才会更新给所有访客。
          </div>
        </div>

        <RichTextEditor
          value={content}
          onChange={handleChange}
          placeholder="在此输入 Policy 内容…"
        />

        <div className="flex gap-2 pt-1">
          <button
            onClick={saveDraft}
            className="px-4 py-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 transition"
          >
            💾 保存
          </button>
          <button
            onClick={publish}
            disabled={publishing}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50"
          >
            {publishing ? '发布中…' : dirty ? '🚀 发布（有未发布改动）' : '🚀 发布到线上'}
          </button>
        </div>
      </div>
    </div>
  );
}
