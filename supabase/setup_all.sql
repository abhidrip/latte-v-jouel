-- ==========================================
-- 1. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. PRODUCTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC,
    was NUMERIC,
    img TEXT,
    link TEXT,
    sold BOOLEAN DEFAULT FALSE,
    category TEXT NOT NULL,
    has_image BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to SELECT products
CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (true);

-- Allow authenticated users (you, via AI Studio) full access
CREATE POLICY "Allow authenticated full access to products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert Product Data
INSERT INTO products (name, price, was, img, link, sold, category, has_image) VALUES
('Amora Petite', 325, 450, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/YtdXSrYl5Slz.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/788f08b465c127843ee691c949863078', FALSE, 'rings', TRUE),
('Amora Curve', 325, 425, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/HGZR92wMDeDv.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/9d0ca460b9b4905ffd866603b3e8a356', FALSE, 'rings', TRUE),
('Amora Midnight', 350, 425, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/Z1l8jE0ybAte.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/554d5dd3b50c4edb230c7805ceb743ac', FALSE, 'rings', TRUE),
('Volna Cuff (Golden)', 475, 550, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/kXEIbslhkuCz.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/82ea27b888071fc71fdee75d384a70af', FALSE, 'cuffs', TRUE),
('Astra Band (Silver)', 450, 525, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/qBPT042CNIse.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/dbabb75b126f14704c4dd3504849e69d', FALSE, 'rings', TRUE),
('Sculptura Bangle (Golden)', 400, 475, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/m956BXjLLHVL.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/f495860af1d0f89f1480c8afc2a929c6', FALSE, 'bangles', TRUE),
('Lunara', 475, 550, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/m9d5eTMsOTuZ.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/d169f53180edbd70999658bf83d245b2', FALSE, 'rings', TRUE),
('Eterna Ring', 375, 450, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/3PWp9ZODKYtR.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/1d5aba6c2c7b8e5d5d46c60709ebf045', FALSE, 'rings', TRUE),
('Valoria Ring', 450, 550, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/HngaudqdwG4J.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/85105d9a717ff32dd6f2172dc78eb6c5', FALSE, 'rings', TRUE),
('Sphère Ring', 475, 550, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/wVpwYYygsMFL.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/3a1216b7e61df439f0b47888bce43c2d', FALSE, 'rings', TRUE),
('Chunky Bracelet (Textured)', 400, 450, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/h78oijM9KeU4.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/b16608167cbbdb250ee9c25f16b8ae75', FALSE, 'bracelets', TRUE),
('Grande Marqué Tennis Bracelet (Golden)', 425, 500, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/A7LIDUDwIKot.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/917c117e1546aa1e3d4cbb40b62bc062', FALSE, 'bracelets', TRUE),
('Solara Ring', 375, 450, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/tXDicBDBe0iX.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/ecf06a50ec3b46cc564297b607efac87', FALSE, 'rings', TRUE),
('Bamboura Bangle (Golden)', 475, 550, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/9yspGk8CICCx.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/526c378b8739b894e169e5d524e4de25', FALSE, 'bangles', TRUE),
('Infiné Cuff (Golden)', 500, 625, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/3tFOYzKmNF66.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/5490afbbfb615f9a1cb073b9f7cc183c', FALSE, 'cuffs', TRUE),
('Soleil Band (Golden)', 400, 475, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/h9E2rI48JAtV.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/dc5c6b05ed2146b7970d8f8b17384a80', FALSE, 'rings', TRUE),
('Slinky Cuff (Golden)', 250, 325, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/rgh2fvsN9BNs.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/beb5aebaff38fdd9dba5cafefa12e535', FALSE, 'cuffs', TRUE),
('Petite Marqué Tennis Bracelet (Golden)', 375, 450, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/VKqpK3gEhHmE.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/6ea4f6f116a764d3d5f66521bc48c994', FALSE, 'bracelets', TRUE),
('Ondine Cuff (Silver)', 400, 475, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/64cJP4BE3J3B.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/588b64aef84c90f9a18985daafa2ac43', FALSE, 'cuffs', TRUE),
('Aurora Cuff (Golden)', 475, 550, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/3c0BMBz7dGs0.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/8bd37950b3633106bb234b85c02b4ab0', FALSE, 'cuffs', TRUE),
('Nova Cuff (Silver)', 375, 420, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/N1AUCKknnBfL.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/1c0b7d0ef30269ee739ce841da8d87ae', FALSE, 'cuffs', TRUE),
('Ciel Curve Cuff (Silver)', 375, 420, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/gJHgU954f3Du.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/3761fdb33a0429d4dc4c5a5894d98408', FALSE, 'cuffs', TRUE),
('Terra Edge Cuff (Silver)', 375, 420, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/6a1146b5c2a39f3cd93f12fd3eef0ddc', 'https://lattevjouel.dm2buy.com/product/6a1146b5c2a39f3cd93f12fd3eef0ddc', FALSE, 'cuffs', TRUE),
('Wavy Chunky Bracelet (Textured)', 400, 450, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/wUAiRkgskLSe.jpg?width=400&height=400', 'https://lattevjouel.dm2buy.com/product/7e584036075b31c70c72bb63e435f680', FALSE, 'bracelets', TRUE),
('Glitz and Glam Bracelet (Silver)', NULL, NULL, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/yTMFoYWVGla7.jpg?width=400&height=400', NULL, TRUE, 'bracelets', TRUE),
('Glitz and Glam Bracelet (Golden)', NULL, NULL, 'https://dm2buy-resize-dynamic-cebdcaefgydgh6hu.z02.azurefd.net/dm2buy/duemTU1ffwsW.jpg?width=400&height=400', NULL, TRUE, 'bracelets', TRUE),
('Celestial Halo', 350, NULL, NULL, 'https://lattevjouel.dm2buy.com/product/47bf3b5b058feb61271d36cd1c78c31c', FALSE, 'pendants', FALSE),
('Ethereal Loop', 350, NULL, NULL, 'https://lattevjouel.dm2buy.com/product/d8ae948d5a8d41d3ae7ef0a917ddbdab', FALSE, 'pendants', FALSE),
('Amora Muse Pendant', 325, 400, NULL, 'https://lattevjouel.dm2buy.com/product/1a0e2a8a1654d32b1e07856089588b61', FALSE, 'pendants', FALSE),
('Amora Sculpt', 400, 550, NULL, 'https://lattevjouel.dm2buy.com/product/75472b6d3e57deace755459e268876ed', FALSE, 'rings', FALSE),
('Amora Quilted', 400, 550, NULL, 'https://lattevjouel.dm2buy.com/product/710deb7b69daf90b1fd4604b35988d8c', FALSE, 'rings', FALSE),
('Amora Volé', 400, 550, NULL, 'https://lattevjouel.dm2buy.com/product/52ade1e839fe470c12fdbd1763ba26fb', FALSE, 'rings', FALSE),
('Helixé Cuff (Golden)', 400, 500, NULL, 'https://lattevjouel.dm2buy.com/product/6d42c7356f5f020d86d5df7307f228d8', FALSE, 'cuffs', FALSE),
('Nazaré', 400, 475, NULL, 'https://lattevjouel.dm2buy.com/product/708833a162d7307780aee0b489f0a2e0', FALSE, 'pendants', FALSE),
('Elytra Ring', 425, 550, NULL, 'https://lattevjouel.dm2buy.com/product/23a781cbe369f90990e5bdc5274d3c08', FALSE, 'rings', FALSE),
('Rhéa Bloom Ring', 400, 525, NULL, 'https://lattevjouel.dm2buy.com/product/dfd8b6a4d9bcfff09b1e722875c82897', FALSE, 'rings', FALSE);

-- ==========================================
-- 3. SITE CONTENT TABLE
-- ==========================================
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
('showcase_3_desc', 'Forged in 22k gold, polished by hand — an heirloom drawn from the maison''s first archive.'),
('about_image_url', ''),
('about_kicker', 'Our Ethos'),
('about_title_1', 'Jewellery is not decoration.'),
('about_title_2', 'It is identity.'),
('about_desc', 'Lattév Jouel is crafted in India, by hand, for those who wear meaning. Each piece draws from the cosmos and the feminine form — silhouettes that hold memory, motion, and the quiet power of being seen.'),
('about_tagline', '— Founded in Mumbai')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
