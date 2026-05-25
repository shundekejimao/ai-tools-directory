import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <span className="text-6xl block mb-6">🔍</span>
      <h1 className="text-2xl font-bold text-white mb-3">页面未找到</h1>
      <p className="text-slate-400 mb-8">您访问的页面不存在或已被移除</p>
      <Link href="/" className="btn-primary">返回首页</Link>
    </div>
  );
}
