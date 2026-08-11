import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, ChefHat, X, Sparkles, TrendingUp, MapPin } from 'lucide-react';
import { supabase, type Restaurant, type CuisineType, CUISINE_LABELS } from '../lib/supabase';
import RestaurantCard from '../components/RestaurantCard';
import StarRating from '../components/StarRating';
import PriceRange from '../components/PriceRange';

interface HomePageProps {
  onSelectRestaurant: (id: string) => void;
  onAddRestaurant: () => void;
}

export default function HomePage({ onSelectRestaurant, onAddRestaurant }: HomePageProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<CuisineType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'newest'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    // Update document title and meta for SEO
    document.title = 'FlavorVault - Discover & Review the Best Restaurants Near You';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Find top-rated restaurants, read authentic reviews, explore menus, and share your dining experiences. Discover Italian, Japanese, Mexican, and more cuisines.');
    }
  }, []);

  async function fetchRestaurants() {
    setLoading(true);
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .order('average_rating', { ascending: false });
    if (data) setRestaurants(data as Restaurant[]);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    let result = restaurants;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    }

    if (cuisineFilter !== 'all') {
      result = result.filter((r) => r.cuisine === cuisineFilter);
    }

    switch (sortBy) {
      case 'rating':
        result = [...result].sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'reviews':
        result = [...result].sort((a, b) => b.review_count - a.review_count);
        break;
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [restaurants, search, cuisineFilter, sortBy]);

  const cuisineCounts = useMemo(() => {
    const counts: Partial<Record<CuisineType, number>> = {};
    restaurants.forEach((r) => {
      counts[r.cuisine] = (counts[r.cuisine] || 0) + 1;
    });
    return counts;
  }, [restaurants]);

  const topRated = useMemo(() => {
    return [...restaurants].sort((a, b) => b.average_rating - a.average_rating).slice(0, 3);
  }, [restaurants]);

  // Generate Schema.org structured data for restaurant list
  const restaurantListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top Restaurants on FlavorVault',
    description: 'Curated list of restaurants with ratings and reviews',
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 10).map((r, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Restaurant',
        name: r.name,
        url: `https://flavorvault.app/restaurant/${r.id}`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: r.average_rating,
          reviewCount: r.review_count,
        },
        address: r.address,
        servesCuisine: CUISINE_LABELS[r.cuisine],
        priceRange: '$'.repeat(r.price_range),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantListSchema) }}
      />

      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-white focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/25">
                <ChefHat size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">FlavorVault</h1>
                <p className="text-xs text-slate-500 font-medium">Discover & rate restaurants</p>
              </div>
            </div>
            <nav aria-label="Primary navigation">
              <button
                onClick={onAddRestaurant}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:brightness-110 active:scale-95"
                aria-label="Add a new restaurant"
              >
                Add Restaurant
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-4" aria-labelledby="hero-heading">
        <div className="text-center mb-6">
          <h2 id="hero-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Favorite Restaurant</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Explore thousands of restaurants, read authentic reviews, and discover the perfect spot for any occasion.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="mx-auto max-w-6xl px-4 pb-4" aria-label="Search and filter restaurants">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <label htmlFor="restaurant-search" className="sr-only">Search restaurants</label>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="restaurant-search"
              type="search"
              placeholder="Search by name, location, or cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none ring-amber-500/20 transition-all focus:border-amber-400 focus:ring-3 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              showFilters || cuisineFilter !== 'all' || sortBy !== 'rating'
                ? 'border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div
            id="filter-panel"
            className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cuisine Type</legend>
                <div className="flex flex-wrap gap-2" role="group">
                  <button
                    onClick={() => setCuisineFilter('all')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      cuisineFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    aria-pressed={cuisineFilter === 'all'}
                  >
                    All ({restaurants.length})
                  </button>
                  {(Object.keys(CUISINE_LABELS) as CuisineType[]).map((c) =>
                    cuisineCounts[c] ? (
                      <button
                        key={c}
                        onClick={() => setCuisineFilter(c)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          cuisineFilter === c
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        aria-pressed={cuisineFilter === c}
                      >
                        {CUISINE_LABELS[c]} ({cuisineCounts[c]})
                      </button>
                    ) : null
                  )}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort By</legend>
                <div className="flex gap-2" role="group">
                  {[
                    { key: 'rating' as const, label: 'Top Rated', icon: Sparkles },
                    { key: 'reviews' as const, label: 'Most Reviewed', icon: TrendingUp },
                    { key: 'newest' as const, label: 'Newest' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setSortBy(opt.key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        sortBy === opt.key
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      aria-pressed={sortBy === opt.key}
                    >
                      {opt.icon && <opt.icon size={12} />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      {restaurants.length > 0 && !loading && (
        <section className="mx-auto max-w-6xl px-4 pb-6" aria-label="Restaurant statistics">
          <div className="flex items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{restaurants.length}</span> restaurants
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{CUISINE_LABELS && Object.keys(CUISINE_LABELS).length}</span> cuisines
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{restaurants.filter(r => r.average_rating >= 4.5).length}</span> highly rated
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Restaurant Grid */}
      <main id="main-content" className="mx-auto max-w-6xl px-4 pb-12" role="main">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading restaurants">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <article key={i} className="animate-pulse rounded-2xl bg-white p-0 shadow-sm ring-1 ring-slate-200">
                <div className="h-48 rounded-t-2xl bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                </div>
              </article>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center" role="status">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <ChefHat size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No restaurants found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {search || cuisineFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to add a restaurant!'}
            </p>
            {!search && cuisineFilter === 'all' && (
              <button
                onClick={onAddRestaurant}
                className="mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl"
              >
                Add Restaurant
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filtered.length}</span> restaurant{filtered.length !== 1 ? 's' : ''} found
              </p>
              {topRated.length > 0 && filtered.length >= 3 && (
                <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles size={12} className="text-amber-500" />
                  Top rated shown first
                </p>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Restaurant list">
              {filtered.map((r, idx) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  onClick={() => onSelectRestaurant(r.id)}
                  priority={idx < 3}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-auto" role="contentinfo">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <ChefHat size={16} />
            </div>
            <span className="font-semibold text-slate-900">FlavorVault</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Your trusted destination for discovering and reviewing restaurants.
          </p>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} FlavorVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
