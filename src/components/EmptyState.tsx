import { type LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, message, subtitle }: {
  icon: LucideIcon;
  message: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
      <Icon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
      <p className="text-slate-400">{message}</p>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  );
}
