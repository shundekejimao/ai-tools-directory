import Link from 'next/link';
import { searchTools } from '@/lib/data';

export default function SearchPage({ searchParams }: any) {
  const query = searchParams.q || '';
  const results = query ? searchTools(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">
        {query ? `搜索"${query}"的结果 (${results.length})` : '搜索AI工具'}
      </h1>

      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-3 max-w-xl">
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="输入关键词搜索AI工具..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          <button type="submit" className="btn-primary">搜索</button>
        </div>
      </form>

      {query && results.length === 0 && (
        <div className="card text-center text-slate-500 py-12">
          未找到与 &ldquo;{query}&rdquo; 相关的工具，试试其他关键词。
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(tool => (
          <Link key={tool.id} href={`/tools/${tool.slug}`} className="card group">
            <h2 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{tool.name}</h2>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{tool.description_short}</p>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{tool.category}</span>
              {tool.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
