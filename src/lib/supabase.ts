import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CuisineType =
  | 'italian'
  | 'japanese'
  | 'mexican'
  | 'indian'
  | 'chinese'
  | 'french'
  | 'thai'
  | 'american'
  | 'mediterranean'
  | 'korean'
  | 'other';

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisine: CuisineType;
  price_range: number;
  address: string;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  average_rating: number;
  review_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_popular: boolean;
  created_at: string;
}

export interface OperatingHours {
  id: string;
  restaurant_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface RestaurantPhoto {
  id: string;
  restaurant_id: string;
  url: string;
  caption: string | null;
  uploaded_at: string;
}

export const CUISINE_LABELS: Record<CuisineType, string> = {
  italian: 'Italian',
  japanese: 'Japanese',
  mexican: 'Mexican',
  indian: 'Indian',
  chinese: 'Chinese',
  french: 'French',
  thai: 'Thai',
  american: 'American',
  mediterranean: 'Mediterranean',
  korean: 'Korean',
  other: 'Other',
};
