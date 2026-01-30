-- 1. Create the 'notifications' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notifications', 'notifications', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload" ON storage.objects;
DROP POLICY IF EXISTS "Notifications Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Notifications Upload Access" ON storage.objects;

-- 3. Create Policy: Allow Public Read Access (so users can see the images)
CREATE POLICY "Notifications Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'notifications' );

-- 4. Create Policy: Allow Authenticated Users to Upload (INSERT)
CREATE POLICY "Notifications Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'notifications' );

-- 5. (Optional) Allow Update/Delete for authenticated users if needed
CREATE POLICY "Notifications Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'notifications' );

CREATE POLICY "Notifications Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'notifications' );
