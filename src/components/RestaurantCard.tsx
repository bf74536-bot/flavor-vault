import { MapPin, MessageSquare } from 'lucide-react';
import type { Restaurant, CuisineType } from '../lib/supabase';
import { CUISINE_LABELS } from '../lib/supabase';
import StarRating from './StarRating';
import PriceRange from './PriceRange';
import CuisineBadge from './CuisineBadge';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  priority?: boolean;
}

const CUISINE_IMAGES: Record<string, string> = {
  italian: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=600',
  japanese: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600',
  mexican: 'https://images.pexels.com/photos/1126865/pexels-photo-1126865.jpeg?auto=compress&cs=tinysrgb&w=600',
  indian: 'https://images.pexels.com/photos/9580408/pexels-photo-9580408.jpeg?auto=compress&cs=tinysrgb&w=600',
  chinese: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=600',
  french: 'https://images.pexels.com/photos/3310097/pexels-photo-3310097.jpeg?auto=compress&cs=tinysrgb&w=600',
  thai: 'https://images.pexels.com/photos/10854178/pexels-photo-10854178.jpeg?auto=compress&cs=tinysrgb&w=600',
  american: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600',
  mediterranean: 'https://images.pexels.com/photos/4109119/pexels-photo-4109119.jpeg?auto=compress&cs=tinysrgb&w=600',
  korean: 'https://images.pexels.com/photos/2310641/pexels-photo-2310641.jpeg?auto=compress&cs=tinysrgb&w=600',
  other: 'https://images.pexels.com/photos/2608049/pexels-photo-2608049.jpeg?auto=compress&cs=tinysrgb&w=600',
};

export default function RestaurantCard({ restaurant, onClick, priority = false }: RestaurantCardProps) {
  const imageSrc = restaurant.image_url || CUISINE_IMAGES[restaurant.cuisine] || CUISINE_IMAGES.other;
  const cuisineLabel = CUISINE_LABELS[restaurant.cuisine] || 'Restaurant';

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-slate-300"
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-labelledby={`restaurant-${restaurant.id}-title`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageSrc}
          alt={`${restaurant.name} - ${cuisineLabel} restaurant in ${restaurant.address}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between">
            <CuisineBadge cuisine={restaurant.cuisine} />
            <div className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-md">
              <MessageSquare size={12} className="text-slate-400" />
              {restaurant.review_count}
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3
          id={`restaurant-${restaurant.id}-title`}
          className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight"
        >
          {restaurant.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={restaurant.average_rating} size={16} />
          <span className="text-sm font-semibold text-slate-700">{restaurant.average_rating.toFixed(1)}</span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500">{restaurant.review_count} reviews</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <address className="flex items-center gap-1.5 text-xs text-slate-500 not-italic truncate max-w-[70%]">
            <MapPin size={12} className="shrink-0 text-slate-400" />
            <span className="truncate">{restaurant.address}</span>
          </address>
          <PriceRange range={restaurant.price_range} />
        </div>
      </div>
    </article>
  );
}
