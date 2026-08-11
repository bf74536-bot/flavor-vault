import { DollarSign } from 'lucide-react';

interface PriceRangeProps {
  range: number;
  size?: number;
  variant?: 'default' | 'light';
}

export default function PriceRange({ range, size = 14, variant = 'default' }: PriceRangeProps) {
  const activeColor = variant === 'light' ? 'text-white' : 'text-emerald-600';
  const inactiveColor = variant === 'light' ? 'text-white/40' : 'text-slate-300';

  return (
    <div className="flex items-center gap-0" role="img" aria-label={`Price range: ${'$'.repeat(range)}`}>
      {[1, 2, 3, 4].map((n) => (
        <DollarSign
          key={n}
          size={size}
          className={`${n <= range ? activeColor : inactiveColor}`}
        />
      ))}
    </div>
  );
}
