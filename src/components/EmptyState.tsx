import { type LucideIcon } from 'lucide-react';

export default function EmptyState({ icon: Icon, message, subtitle }: {
  icon: LucideIcon;
  message: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-12 text-center">
      <Icon className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
      <p className="text-zinc-400">{message}</p>
      {subtitle && <p className="text-sm text-zinc-600 mt-1">{subtitle}</p>}
    </div>
  );
}
