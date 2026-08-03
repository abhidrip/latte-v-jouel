-- Update Products Table
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- Create Site Content Table
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read site_content
CREATE POLICY "Allow public read access to site_content"
  ON site_content FOR SELECT
  USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access to site_content"
  ON site_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert Default Content
INSERT INTO site_content (key, value) VALUES
('hero_video_url', ''),
('hero_kicker', '— Maison Lattév Jouel —'),
('hero_title_1', 'Crafted for the Bold'),
('hero_title_2', 'Made to be Worn'),
('hero_subtitle', 'Fine contemporary jewellery · Mumbai'),
('marquee_text', 'RINGS · BRACELETS · CUFFS · BANGLES · PENDANTS · EARRINGS · '),
('showcase_1_kicker', 'The Métier'),
('showcase_1_title', 'Sculpted in light.'),
('showcase_1_desc', 'Every contour shaped by hand — 22k gold reflections cast through the prism of intention.'),
('showcase_2_kicker', 'The Geometry'),
('showcase_2_title', 'Circles that spiral into devotion.'),
('showcase_2_desc', 'Seven rings, one orbit. A meditation in concentric symmetry, drawn from the maison''s first archive.'),
('showcase_3_kicker', 'The Maison'),
('showcase_3_title', 'A ring, awakened.'),
('showcase_3_desc', 'Forged in 22k gold, polished by hand — an heirloom drawn from the maison''s first archive.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
