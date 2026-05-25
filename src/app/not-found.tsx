import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-700 mb-4">404</h1>
      <p className="text-slate-400 text-lg mb-8">页面未找到</p>
      <Link href="/" className="btn-primary">返回首页</Link>
    </div>
  );
}
