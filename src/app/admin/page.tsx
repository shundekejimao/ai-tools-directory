'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/admin/api/login')
      .then(r => r.json())
      .then(d => { if (!d.authenticated) router.push('/admin/login'); else setAuth(true); });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    fetch('/api/feed?days=30').then(r => r.json()).then(setSummary);
  }, [auth]);

  if (auth === null) return <div className="max-w-4xl mx-auto px-4 py-12 text-slate-500">检查权限...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">仪表盘</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400">{summary?.length || 0}</div>
          <div className="text-sm text-slate-500 mt-1">近30天更新</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400">
            {summary?.filter((e: any) => e.entity_type === 'tool').length || 0}
          </div>
          <div className="text-sm text-slate-500 mt-1">工具更新</div>
        </div>
        <div className="card text-center">
          <a href="/admin/tools" className="block text-blue-400 hover:text-blue-300">
            <div className="text-3xl font-bold">管理</div>
            <div className="text-sm text-slate-500 mt-1">工具管理 →</div>
          </a>
        </div>
        <div className="card text-center">
          <a href="/" className="block text-slate-400 hover:text-slate-300">
            <div className="text-3xl font-bold">网站</div>
            <div className="text-sm text-slate-500 mt-1">查看网站 →</div>
          </a>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-300 mb-4">近期变更</h2>
      <div className="space-y-2">
        {summary?.slice(0, 20).map((entry: any) => (
          <div key={entry.id} className="card py-3 flex justify-between items-center">
            <span className="text-slate-300">{entry.change_desc}</span>
            <span className="text-xs text-slate-500">{entry.changed_at}</span>
          </div>
        ))}
        {(!summary || summary.length === 0) && (
          <p className="text-slate-500">暂无变更记录</p>
        )}
      </div>
    </div>
  );
}
