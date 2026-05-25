import { gradientColors } from '@/lib/constants';

type Size = 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  sm: 'w-7 h-7 rounded-lg text-xs',
  md: 'w-10 h-10 rounded-xl text-sm',
  lg: 'w-14 h-14 rounded-2xl text-xl',
};

export default function ToolIcon({ name, size = 'md', index = 0 }: {
  name: string;
  size?: Size;
  index?: number;
}) {
  return (
    <span className={`${sizeClasses[size]} bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name[0]}
    </span>
  );
}
