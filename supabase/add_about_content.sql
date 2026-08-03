INSERT INTO site_content (key, value) VALUES
('about_image_url', ''),
('about_kicker', 'Our Ethos'),
('about_title_1', 'Jewellery is not decoration.'),
('about_title_2', 'It is identity.'),
('about_desc', 'Lattév Jouel is crafted in India, by hand, for those who wear meaning. Each piece draws from the cosmos and the feminine form — silhouettes that hold memory, motion, and the quiet power of being seen.'),
('about_tagline', '— Founded in Mumbai')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
