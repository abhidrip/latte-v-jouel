-- 1. Create the 'media' bucket and make it public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow absolutely anyone on the internet to view the images/videos
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'media');

-- 3. Allow logged-in admins to upload new files
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'media');

-- 4. Allow logged-in admins to update/replace files
CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'media');

-- 5. Allow logged-in admins to delete files
CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'media');
