import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, max = 5, size = 18, interactive = false, onRate }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
          >
            <Star
              size={size}
              className={`transition-colors duration-150 ${
                filled ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
