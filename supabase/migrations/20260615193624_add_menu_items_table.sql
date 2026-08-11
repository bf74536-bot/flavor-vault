CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(6,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL DEFAULT 'main',
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_items_select" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "menu_items_insert" ON menu_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "menu_items_update" ON menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "menu_items_delete" ON menu_items FOR DELETE TO authenticated USING (true);
