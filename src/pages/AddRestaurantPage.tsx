import { useState } from 'react';
import { ArrowLeft, Plus, Upload, ChefHat, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, type CuisineType, CUISINE_LABELS } from '../lib/supabase';

interface AddRestaurantPageProps {
  onBack: () => void;
  onAdded: (id: string) => void;
}

export default function AddRestaurantPage({ onBack, onAdded }: AddRestaurantPageProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState<CuisineType>('other');
  const [priceRange, setPriceRange] = useState(2);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Restaurant name is required';
    if (!address.trim()) e.address = 'Address is required';
    if (website.trim() && !website.trim().match(/^https?:\/\/.+/)) e.website = 'Must be a valid URL (https://...)';
    if (imageUrl.trim() && !imageUrl.trim().match(/^https?:\/\/.+/)) e.imageUrl = 'Must be a valid URL (https://...)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        cuisine,
        price_range: priceRange,
        address: address.trim(),
        phone: phone.trim() || null,
        website: website.trim() || null,
        image_url: imageUrl.trim() || null,
      })
      .select('id')
      .single();

    if (!error && data) {
      onAdded(data.id);
    } else {
      setErrors({ form: error?.message || 'Failed to add restaurant' });
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <nav className="flex items-center gap-4" aria-label="Page navigation">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 shadow-sm"
              aria-label="Back to home"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <ChefHat size={16} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">Add Restaurant</h1>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto max-w-2xl px-4 py-8" role="main">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900">Share Your Favorite Restaurant</h2>
          <p className="mt-1 text-sm text-slate-500">Help others discover great dining spots by adding a restaurant to our directory.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/80 sm:p-8">
          {errors.form && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2" role="alert">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="restaurant-name" className="mb-2 block text-sm font-semibold text-slate-700">
                Restaurant Name <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurant-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sakura Sushi"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 transition-all focus:ring-3 shadow-sm ${
                  errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-amber-400'
                }`}
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="restaurant-description" className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                id="restaurant-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the restaurant, atmosphere, specialties..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-3 resize-none shadow-sm"
              />
            </div>

            {/* Cuisine + Price */}
            <div className="grid gap-6 sm:grid-cols-2">
              <fieldset>
                <label htmlFor="cuisine-select" className="mb-2 block text-sm font-semibold text-slate-700">
                  Cuisine Type
                </label>
                <select
                  id="cuisine-select"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value as CuisineType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-3 shadow-sm"
                >
                  {(Object.keys(CUISINE_LABELS) as CuisineType[]).map((c) => (
                    <option key={c} value={c}>{CUISINE_LABELS[c]}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset>
                <legend className="mb-2 block text-sm font-semibold text-slate-700">Price Range</legend>
                <div className="flex gap-2" role="radiogroup" aria-label="Price range selection">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPriceRange(n)}
                      className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                        n === priceRange
                          ? 'bg-emerald-500 text-white shadow-md'
                          : n < priceRange
                          ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                          : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200 hover:bg-slate-150'
                      }`}
                      role="radio"
                      aria-checked={n === priceRange}
                    >
                      {'$'.repeat(n)}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="restaurant-address" className="mb-2 block text-sm font-semibold text-slate-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="restaurant-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St, New York, NY"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 transition-all focus:ring-3 shadow-sm ${
                  errors.address ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-amber-400'
                }`}
                required
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? 'address-error' : undefined}
              />
              {errors.address && (
                <p id="address-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.address}
                </p>
              )}
            </div>

            {/* Phone + Website */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="restaurant-phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  id="restaurant-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. (555) 123-4567"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 focus:border-amber-400 focus:ring-3 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="restaurant-website" className="mb-2 block text-sm font-semibold text-slate-700">
                  Website
                </label>
                <input
                  id="restaurant-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 transition-all focus:ring-3 shadow-sm ${
                    errors.website ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-amber-400'
                  }`}
                  aria-invalid={!!errors.website}
                  aria-describedby={errors.website ? 'website-error' : undefined}
                />
                {errors.website && (
                  <p id="website-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.website}
                  </p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="restaurant-image" className="mb-2 block text-sm font-semibold text-slate-700">
                Cover Image URL
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 text-slate-400 shrink-0">
                  <Upload size={16} />
                </div>
                <input
                  id="restaurant-image"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg (leave blank for default)"
                  className={`flex-1 rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 transition-all focus:ring-3 shadow-sm ${
                    errors.imageUrl ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-amber-400'
                  }`}
                  aria-invalid={!!errors.imageUrl}
                  aria-describedby={errors.imageUrl ? 'image-error' : 'image-hint'}
                />
              </div>
              {errors.imageUrl ? (
                <p id="image-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.imageUrl}
                </p>
              ) : (
                <p id="image-hint" className="mt-1.5 text-xs text-slate-400">
                  A high-quality photo helps your restaurant stand out
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50 active:scale-95"
            >
              <Plus size={16} /> {submitting ? 'Adding...' : 'Add Restaurant'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
