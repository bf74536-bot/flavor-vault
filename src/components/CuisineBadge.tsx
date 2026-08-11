import { CUISINE_LABELS, type CuisineType } from '../lib/supabase';

const CUISINE_COLORS: Record<CuisineType, string> = {
  italian: 'bg-red-500/90 text-white',
  japanese: 'bg-pink-500/90 text-white',
  mexican: 'bg-orange-500/90 text-white',
  indian: 'bg-amber-500/90 text-white',
  chinese: 'bg-rose-500/90 text-white',
  french: 'bg-blue-500/90 text-white',
  thai: 'bg-emerald-500/90 text-white',
  american: 'bg-sky-500/90 text-white',
  mediterranean: 'bg-teal-500/90 text-white',
  korean: 'bg-violet-500/90 text-white',
  other: 'bg-slate-500/90 text-white',
};

interface CuisineBadgeProps {
  cuisine: CuisineType;
}

export default function CuisineBadge({ cuisine }: CuisineBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-sm ${CUISINE_COLORS[cuisine]}`}
    >
      {CUISINE_LABELS[cuisine]}
    </span>
  );
}
