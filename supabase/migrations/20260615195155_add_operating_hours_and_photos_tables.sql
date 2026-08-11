CREATE TABLE operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false
);

CREATE INDEX idx_operating_hours_restaurant_id ON operating_hours(restaurant_id);
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operating_hours_select" ON operating_hours FOR SELECT TO authenticated USING (true);
CREATE POLICY "operating_hours_insert" ON operating_hours FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "operating_hours_update" ON operating_hours FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "operating_hours_delete" ON operating_hours FOR DELETE TO authenticated USING (true);

CREATE TABLE restaurant_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_restaurant_photos_restaurant_id ON restaurant_photos(restaurant_id);
ALTER TABLE restaurant_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "restaurant_photos_select" ON restaurant_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "restaurant_photos_insert" ON restaurant_photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "restaurant_photos_update" ON restaurant_photos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "restaurant_photos_delete" ON restaurant_photos FOR DELETE TO authenticated USING (true);
