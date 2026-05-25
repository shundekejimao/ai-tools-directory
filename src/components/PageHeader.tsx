import { type LucideIcon } from 'lucide-react';

export default function PageHeader({ icon: Icon, title, subtitle }: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </span>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>
      {subtitle && <p className="text-zinc-500">{subtitle}</p>}
    </div>
  );
}
