CREATE TYPE cuisine_type AS ENUM (
  'italian', 'japanese', 'mexican', 'indian', 'chinese', 'french',
  'thai', 'american', 'mediterranean', 'korean', 'other'
);

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cuisine cuisine_type NOT NULL DEFAULT 'other',
  price_range SMALLINT NOT NULL DEFAULT 2 CHECK (price_range BETWEEN 1 AND 4),
  address TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  average_rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurants_select" ON restaurants FOR SELECT TO authenticated USING (true);
CREATE POLICY "restaurants_insert" ON restaurants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "restaurants_update" ON restaurants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "restaurants_delete" ON restaurants FOR DELETE TO authenticated USING (true);

CREATE POLICY "reviews_select" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "reviews_delete" ON reviews FOR DELETE TO authenticated USING (true);

-- Function to update average rating on restaurant when review is added/changed/removed
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_avg NUMERIC(2,1);
  new_count INTEGER;
BEGIN
  SELECT ROUND(AVG(rating)::numeric, 1), COUNT(*)
  INTO new_avg, new_count
  FROM reviews
  WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

  UPDATE restaurants
  SET average_rating = COALESCE(new_avg, 0),
      review_count = new_count
  WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
AFTER INSERT OR UPDATE OF rating OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();
