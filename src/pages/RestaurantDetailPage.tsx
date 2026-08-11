import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Phone, Globe, Clock, MessageSquare, Send, UtensilsCrossed, Flame, Camera, ChevronRight, Star, Quote, BadgeCheck } from 'lucide-react';
import { supabase, type Restaurant, type Review, type MenuItem, type OperatingHours, type RestaurantPhoto, type CuisineType, CUISINE_LABELS } from '../lib/supabase';
import StarRating from '../components/StarRating';
import PriceRange from '../components/PriceRange';
import CuisineBadge from '../components/CuisineBadge';

interface RestaurantDetailPageProps {
  restaurantId: string;
  onBack: () => void;
}

const CUISINE_IMAGES: Record<string, string> = {
  italian: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=800',
  japanese: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=800',
  mexican: 'https://images.pexels.com/photos/1126865/pexels-photo-1126865.jpeg?auto=compress&cs=tinysrgb&w=800',
  indian: 'https://images.pexels.com/photos/9580408/pexels-photo-9580408.jpeg?auto=compress&cs=tinysrgb&w=800',
  chinese: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
  french: 'https://images.pexels.com/photos/3310097/pexels-photo-3310097.jpeg?auto=compress&cs=tinysrgb&w=800',
  thai: 'https://images.pexels.com/photos/10854178/pexels-photo-10854178.jpeg?auto=compress&cs=tinysrgb&w=800',
  american: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800',
  mediterranean: 'https://images.pexels.com/photos/4109119/pexels-photo-4109119.jpeg?auto=compress&cs=tinysrgb&w=800',
  korean: 'https://images.pexels.com/photos/2310641/pexels-photo-2310641.jpeg?auto=compress&cs=tinysrgb&w=800',
  other: 'https://images.pexels.com/photos/2608049/pexels-photo-2608049.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function RestaurantDetailPage({ restaurantId, onBack }: RestaurantDetailPageProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [hours, setHours] = useState<OperatingHours[]>([]);
  const [photos, setPhotos] = useState<RestaurantPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newAuthor, setNewAuthor] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  // Update document meta for SEO
  useEffect(() => {
    if (restaurant) {
      document.title = `${restaurant.name} - FlavorVault | Reviews, Menu & Hours`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `Read ${restaurant.review_count} reviews for ${restaurant.name}. ${CUISINE_LABELS[restaurant.cuisine]} cuisine in ${restaurant.address}. View menu, hours, photos & more on FlavorVault.`
        );
      }
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${restaurant.name} - FlavorVault Restaurant Reviews`);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', `${restaurant.average_rating.toFixed(1)} rating from ${restaurant.review_count} reviews. ${CUISINE_LABELS[restaurant.cuisine]} restaurant.`);
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && restaurant.image_url) ogImage.setAttribute('content', restaurant.image_url);
    }
    return () => {
      document.title = 'FlavorVault - Discover & Review the Best Restaurants Near You';
    };
  }, [restaurant]);

  async function fetchData() {
    setLoading(true);
    const [restRes, revRes, menuRes, hoursRes, photosRes] = await Promise.all([
      supabase.from('restaurants').select('*').eq('id', restaurantId).single(),
      supabase.from('reviews').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false }),
      supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('category', { ascending: true }),
      supabase.from('operating_hours').select('*').eq('restaurant_id', restaurantId).order('day_of_week', { ascending: true }),
      supabase.from('restaurant_photos').select('*').eq('restaurant_id', restaurantId).order('uploaded_at', { ascending: false }),
    ]);
    if (restRes.data) setRestaurant(restRes.data as Restaurant);
    if (revRes.data) setReviews(revRes.data as Review[]);
    if (menuRes.data) setMenuItems(menuRes.data as MenuItem[]);
    if (hoursRes.data) setHours(hoursRes.data as OperatingHours[]);
    if (photosRes.data) setPhotos(photosRes.data as RestaurantPhoto[]);
    setLoading(false);
  }

  async function submitReview() {
    if (!newRating || !newAuthor.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      restaurant_id: restaurantId,
      author_name: newAuthor.trim(),
      rating: newRating,
      comment: newComment.trim() || null,
    });
    if (!error) {
      setNewRating(0);
      setNewAuthor('');
      setNewComment('');
      setShowReviewForm(false);
      fetchData();
    }
    setSubmitting(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Generate LocalBusiness Schema.org structured data
  const localBusinessSchema = useMemo(() => {
    if (!restaurant) return null;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hoursSpec = hours.length > 0
      ? hours
          .filter(h => !h.is_closed)
          .map(h => `${dayNames[h.day_of_week]} ${h.open_time.slice(0, 5)}-${h.close_time.slice(0, 5)}`)
          .join(', ')
      : undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': `https://flavorvault.app/restaurant/${restaurant.id}`,
      name: restaurant.name,
      description: restaurant.description || `${restaurant.name} - ${CUISINE_LABELS[restaurant.cuisine]} restaurant`,
      url: `https://flavorvault.app/restaurant/${restaurant.id}`,
      telephone: restaurant.phone || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: restaurant.address,
        addressCountry: 'US',
      },
      servesCuisine: CUISINE_LABELS[restaurant.cuisine],
      priceRange: '$'.repeat(restaurant.price_range),
      image: restaurant.image_url || CUISINE_IMAGES[restaurant.cuisine] || CUISINE_IMAGES.other,
      aggregateRating: restaurant.review_count > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: restaurant.average_rating,
        reviewCount: restaurant.review_count,
        bestRating: 5,
        worstRating: 1,
      } : undefined,
      review: reviews.slice(0, 10).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author_name },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.comment || undefined,
        datePublished: r.created_at,
      })),
      menu: menuItems.length > 0 ? {
        '@type': 'Menu',
        hasMenuSection: [...new Set(menuItems.map(m => m.category))].map(cat => ({
          '@type': 'MenuSection',
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          hasMenuItem: menuItems.filter(m => m.category === cat).map(m => ({
            '@type': 'MenuItem',
            name: m.name,
            description: m.description || undefined,
            offers: {
              '@type': 'Offer',
              price: m.price.toFixed(2),
              priceCurrency: 'USD',
            },
          })),
        })),
      } : undefined,
      openingHoursSpecification: hours.length > 0 ? hours.map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: dayNames[h.day_of_week],
        opens: h.is_closed ? undefined : h.open_time.slice(0, 5),
        closes: h.is_closed ? undefined : h.close_time.slice(0, 5),
      })) : undefined,
    };
  }, [restaurant, reviews, menuItems, hours]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" role="status" aria-label="Loading restaurant details" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-500 mb-3">Restaurant not found</p>
        <button onClick={onBack} className="text-sm text-amber-600 hover:underline font-medium">
          Go back to restaurants
        </button>
      </div>
    );
  }

  const imageSrc = restaurant.image_url || CUISINE_IMAGES[restaurant.cuisine] || CUISINE_IMAGES.other;
  const ratingDist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => ratingDist[r.rating - 1]++);
  const maxDist = Math.max(...ratingDist, 1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* LocalBusiness Schema.org JSON-LD */}
      {localBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      )}

      {/* Breadcrumb Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flavorvault.app/' },
              { '@type': 'ListItem', position: 2, name: restaurant.name, item: `https://flavorvault.app/restaurant/${restaurant.id}` },
            ],
          }),
        }}
      />

      {/* breadcrumb navigation (screen readers) */}
      <nav aria-label="Breadcrumb" className="sr-only">
        <ol>
          <li><a href="/">Home</a></li>
          <li><span aria-current="page">{restaurant.name}</span></li>
        </ol>
      </nav>

      {/* Hero image */}
      <header className="relative h-80 sm:h-96">
        <img
          src={imageSrc}
          alt={`${restaurant.name} - ${CUISINE_LABELS[restaurant.cuisine]} restaurant exterior and interior photos`}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Back button */}
        <nav className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-105"
            aria-label="Back to restaurant list"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </nav>

        {/* Restaurant badge in hero */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="inline-block mb-3">
            <CuisineBadge cuisine={restaurant.cuisine} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {restaurant.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold">{restaurant.average_rating.toFixed(1)}</span>
              <span className="text-white/70">({restaurant.review_count} reviews)</span>
            </span>
            <PriceRange range={restaurant.price_range} size={14} variant="light" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 -mt-8 relative z-10 pb-12" role="main">
        {/* Info card */}
        <article className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/80">
          {restaurant.description && (
            <p className="text-slate-600 leading-relaxed mb-5">{restaurant.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-slate-100 pt-5">
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-1.5 hover:text-amber-600 transition-colors"
                aria-label={`Call ${restaurant.name} at ${restaurant.phone}`}
              >
                <Phone size={14} className="text-slate-400" /> {restaurant.phone}
              </a>
            )}
            {restaurant.website && (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:underline"
                aria-label={`Visit ${restaurant.name}'s website (opens in new tab)`}
              >
                <Globe size={14} /> Website
              </a>
            )}
          </div>
        </article>

        {/* Rating Summary */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200/80" aria-labelledby="rating-heading">
          <h2 id="rating-heading" className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Star size={20} className="text-amber-500" /> Rating Summary
          </h2>
          <div className="flex items-start gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900">{restaurant.average_rating.toFixed(1)}</div>
              <div className="mt-1 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= Math.round(restaurant.average_rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">{reviews.length} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-4 text-right text-xs font-medium text-slate-500">{stars}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${(ratingDist[stars - 1] / maxDist) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-slate-400">{ratingDist[stars - 1]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Operating Hours */}
        {hours.length > 0 && (() => {
          const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = new Date().getDay();
          const grouped: Record<number, { open: string; close: string; closed: boolean }[]> = {};
          hours.forEach((h) => {
            if (!grouped[h.day_of_week]) grouped[h.day_of_week] = [];
            if (!h.is_closed) {
              grouped[h.day_of_week].push({ open: h.open_time, close: h.close_time, closed: false });
            } else {
              grouped[h.day_of_week] = [{ open: '', close: '', closed: true }];
            }
          });
          const isOpenNow = (() => {
            const now = new Date();
            const todayHours = grouped[today];
            if (!todayHours || todayHours[0]?.closed) return false;
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            return todayHours.some((slot) => {
              const [oh, om] = slot.open.split(':').map(Number);
              const [ch, cm] = slot.close.split(':').map(Number);
              const openMin = oh * 60 + om;
              let closeMin = ch * 60 + cm;
              if (closeMin < openMin) closeMin += 24 * 60;
              return nowMinutes >= openMin && nowMinutes <= closeMin;
            });
          })();

          return (
            <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200/80" aria-labelledby="hours-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="hours-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={18} /> Hours
                </h2>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    isOpenNow
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {isOpenNow ? 'Open Now' : 'Closed'}
                </span>
              </div>
              <div className="space-y-1.5" role="list" aria-label="Operating hours by day">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const slots = grouped[day];
                  const isToday = day === today;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${isToday ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}
                      role="listitem"
                    >
                      <span className={`font-medium ${isToday ? 'text-amber-700' : 'text-slate-500'}`}>
                        {DAYS[day]}
                        {isToday && <span className="ml-1 text-xs">(Today)</span>}
                      </span>
                      <span className={`${isToday ? 'text-amber-900 font-semibold' : 'text-slate-700'}`}>
                        {slots ? slots.map((s) => s.closed ? 'Closed' : `${s.open.slice(0, 5)} - ${s.close.slice(0, 5)}`).join(' / ') : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* Photos Gallery */}
        {photos.length > 0 && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200/80" aria-labelledby="photos-heading">
            <h2 id="photos-heading" className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera size={18} /> Photos
            </h2>
            <div className="grid grid-cols-3 gap-3" role="list">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200 transition-all hover:ring-2 hover:ring-amber-400 hover:shadow-lg"
                  aria-label={`View photo ${idx + 1}${photo.caption ? `: ${photo.caption}` : ''}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `${restaurant.name} photo ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5">
                      <p className="text-xs font-medium text-white leading-tight truncate">{photo.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Photo Lightbox */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setSelectedPhoto(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Full size photo viewer"
          >
            <img
              src={selectedPhoto}
              alt={`${restaurant.name} full size photo`}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors ring-1 ring-white/20"
              aria-label="Close photo viewer"
            >
              <ChevronRight size={20} className="rotate-45" />
            </button>
          </div>
        )}

        {/* Menu Items */}
        {menuItems.length > 0 && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200/80" aria-labelledby="menu-heading">
            <h2 id="menu-heading" className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UtensilsCrossed size={18} /> Menu
            </h2>
            {(() => {
              const categories = [...new Set(menuItems.map((m) => m.category))];
              const CATEGORY_ORDER = ['appetizer', 'bread', 'sides', 'topping', 'main', 'roll', 'sashimi', 'drinks', 'dessert'];
              const sorted = categories.sort((a, b) => {
                const ai = CATEGORY_ORDER.indexOf(a);
                const bi = CATEGORY_ORDER.indexOf(b);
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
              });
              const CATEGORY_LABELS: Record<string, string> = {
                appetizer: 'Appetizers',
                bread: 'Bread & Rolls',
                sides: 'Sides',
                topping: 'Add-Ons',
                main: 'Main Courses',
                roll: 'Sushi Rolls',
                sashimi: 'Sashimi',
                drinks: 'Drinks',
                dessert: 'Desserts',
              };
              return sorted.map((cat) => {
                const items = menuItems.filter((m) => m.category === cat);
                return (
                  <div key={cat} className="mb-6 last:mb-0">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      {CATEGORY_LABELS[cat] || cat}
                    </h3>
                    <ul className="space-y-3" role="list">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-4 group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                                {item.name}
                              </span>
                              {item.is_popular && (
                                <span className="flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600 ring-1 ring-orange-200">
                                  <Flame size={10} /> Popular
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-sm font-bold text-slate-900">${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              });
            })()}
          </section>
        )}

        {/* Reviews */}
        <section className="mt-6" aria-labelledby="reviews-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="reviews-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} /> Reviews
            </h2>
            <button
              onClick={() => setShowReviewForm(true)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:brightness-110 active:scale-95"
            >
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-lg mb-4">
              <h3 className="font-semibold text-slate-900 text-lg">Share Your Experience</h3>
              <p className="text-sm text-slate-600 mt-1 mb-4">Help others discover great restaurants by sharing your honest review.</p>

              <div className="space-y-4">
                <fieldset>
                  <legend className="text-sm font-medium text-slate-700 mb-2">Your Rating</legend>
                  <div className="flex items-center gap-3">
                    <StarRating rating={newRating} size={28} interactive onRate={setNewRating} />
                    {newRating > 0 && (
                      <span className="text-sm font-semibold text-amber-600">{RATING_LABELS[newRating]}</span>
                    )}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="reviewer-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reviewer-name"
                    type="text"
                    placeholder="Enter your name"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-3 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Your Review <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="review-comment"
                    placeholder="Tell us about your experience..."
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-3 resize-none shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={submitReview}
                    disabled={!newRating || !newAuthor.trim() || submitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewRating(0);
                      setNewAuthor('');
                      setNewComment('');
                    }}
                    className="rounded-xl px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200/80">
              <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <ul className="space-y-4" role="list" aria-label="Restaurant reviews">
              {reviews.map((review) => (
                <li key={review.id}>
                  <article className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200/80 transition-all hover:shadow-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600 ring-1 ring-slate-200/50">
                          {review.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{review.author_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} size={14} />
                            <span className="text-xs font-semibold text-amber-600">{RATING_LABELS[review.rating]}</span>
                          </div>
                        </div>
                      </div>
                      <time className="flex items-center gap-1 text-xs text-slate-400" dateTime={review.created_at}>
                        <Clock size={12} /> {formatDate(review.created_at)}
                      </time>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-14">{review.comment}</p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
