import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeader({ title, subtitle, href }: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          全部 <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
