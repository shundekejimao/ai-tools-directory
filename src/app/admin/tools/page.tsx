'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Tool {
  id: string; slug: string; name: string;
  category: string; pricing_tier: string;
  date_updated: string;
}

export default function AdminToolsPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [editTool, setEditTool] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/admin/api/login')
      .then(r => r.json())
      .then(d => { if (!d.authenticated) router.push('/admin/login'); else setAuth(true); });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    fetch('/admin/api/tools').then(r => r.json()).then(d => setTools(d.tools || []));
  }, [auth]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    const data: any = {};
    form.forEach((v, k) => {
      if (k === 'tags' || k === 'features') {
        data[k] = (v as string).split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (k === 'china_accessible' || k === 'beginner_friendly' || k === 'ecommerce_relevant') {
        data[k] = v === 'true';
      } else {
        data[k] = v;
      }
    });
    const res = await fetch('/admin/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowForm(false);
      setEditTool(null);
      const r = await fetch('/admin/api/tools').then(r => r.json());
      setTools(r.tools || []);
    } else {
      const err = await res.json();
      alert(err.error || '保存失败');
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm('确定删除？')) return;
    await fetch(`/admin/api/tools?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
    setTools(tools.filter(t => t.slug !== slug));
  }

  function edit(tool: Tool) {
    setEditTool(tool);
    setShowForm(true);
  }

  if (auth === null) return <div className="max-w-6xl mx-auto px-4 py-12 text-slate-500">检查权限...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-200">工具管理 ({tools.length})</h1>
        <button onClick={() => { setEditTool(null); setShowForm(true); }} className="btn-primary">
          + 新增工具
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-blue-900/30">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            {editTool ? `编辑: ${editTool.name}` : '新增工具'}
          </h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">名称 *</label>
                <input name="name" defaultValue={editTool?.name || ''} required
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Slug *</label>
                <input name="slug" defaultValue={editTool?.slug || ''} required
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">分类</label>
                <select name="category" defaultValue={editTool?.category || 'other'}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                  {['browser','image','code','voice','video','model','office','ecommerce','design','other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">价格</label>
                <select name="pricing_tier" defaultValue={editTool?.pricing_tier || 'unknown'}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                  {['completely_free','freemium','paid','open_source','unknown'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">简介</label>
              <input name="description_short" defaultValue={editTool?.description_short || ''}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">详细介绍</label>
              <textarea name="description" defaultValue={editTool?.description || ''} rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">不足分析</label>
              <textarea name="shortcomings" defaultValue={editTool?.shortcomings || ''} rows={2}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">标签（逗号分隔）</label>
                <input name="tags" defaultValue={editTool?.tags?.join(', ') || ''}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">功能点（逗号分隔）</label>
                <input name="features" defaultValue={editTool?.features?.join(', ') || ''}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">官方网址</label>
                <input name="url" defaultValue={editTool?.url || ''}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-4 items-end pb-2">
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input type="checkbox" name="china_accessible" value="true" defaultChecked={editTool?.china_accessible} /> 国内可用
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input type="checkbox" name="beginner_friendly" value="true" defaultChecked={editTool?.beginner_friendly} /> 小白友好
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-400">
                  <input type="checkbox" name="ecommerce_relevant" value="true" defaultChecked={editTool?.ecommerce_relevant} /> 电商相关
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">保存</button>
              <button type="button" onClick={() => { setShowForm(false); setEditTool(null); }}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600">取消</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-700">
              <th className="py-2 pr-4">名称</th>
              <th className="py-2 pr-4">分类</th>
              <th className="py-2 pr-4">价格</th>
              <th className="py-2 pr-4">更新</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {tools.map(tool => (
              <tr key={tool.id} className="border-b border-slate-800">
                <td className="py-2 pr-4 text-slate-200">{tool.name}</td>
                <td className="py-2 pr-4 text-slate-400">{tool.category}</td>
                <td className="py-2 pr-4 text-slate-400 text-xs">{tool.pricing_tier}</td>
                <td className="py-2 pr-4 text-slate-500 text-xs">{tool.date_updated}</td>
                <td className="py-2 space-x-2">
                  <button onClick={() => edit(tool)} className="text-blue-400 hover:text-blue-300 text-xs">编辑</button>
                  <button onClick={() => handleDelete(tool.slug)} className="text-red-400 hover:text-red-300 text-xs">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
