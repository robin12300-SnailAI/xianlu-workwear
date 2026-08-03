'use client';

import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * 轻量富文本编辑器（contentEditable + execCommand 工具栏）。
 * 不依赖任何第三方库，输出 HTML 字符串，与后台其它富文本保持一致。
 */
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 仅挂载时把初始内容写入编辑器（避免受控更新时光标跳动）
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function emit() {
    if (ref.current) onChangeRef.current(ref.current.innerHTML);
  }

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    emit();
  }

  function addLink() {
    const url = window.prompt('链接地址（https://...）', 'https://');
    if (url && url.trim() && url.trim() !== 'https://') {
      exec('createLink', url.trim());
    }
  }

  const btn =
    'px-2.5 py-1 rounded text-sm font-medium text-[var(--ink-2)] hover:bg-[var(--surface-3)] hover:text-[var(--ink)] transition select-none';

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-[var(--border)] bg-[var(--surface-2)]">
        <button type="button" className={btn} title="加粗" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" className={btn} title="斜体" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" className={btn} title="下划线" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')}><u>U</u></button>
        <span className="w-px h-5 bg-[var(--border)] mx-1" />
        <button type="button" className={btn} title="小标题" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'h3')}><b>H</b></button>
        <button type="button" className={btn} title="正文段落" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'p')}><b>¶</b></button>
        <span className="w-px h-5 bg-[var(--border)] mx-1" />
        <button type="button" className={btn} title="项目符号列表" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertUnorderedList')}>• 列表</button>
        <button type="button" className={btn} title="编号列表" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertOrderedList')}>1. 列表</button>
        <span className="w-px h-5 bg-[var(--border)] mx-1" />
        <button type="button" className={btn} title="插入链接" onMouseDown={(e) => e.preventDefault()} onClick={addLink}>🔗 链接</button>
        <button type="button" className={btn} title="清除格式" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('removeFormat')}>清除</button>
      </div>

      {/* 编辑区 */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        className="policy-editor min-h-[360px] p-4 text-sm leading-relaxed text-[var(--ink-2)] focus:outline-none"
      />
    </div>
  );
}
