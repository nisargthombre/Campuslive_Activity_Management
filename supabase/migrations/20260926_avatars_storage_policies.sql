-- ==============================================================================
-- CAMPUS LIVE: STORAGE RLS POLICIES FOR 'avatars' BUCKET
-- ==============================================================================
-- 1. Ensure bucket configuration constraints (2MB max, images only, public)
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 2097152, -- 2 MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'avatars';

-- 2. Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing avatar policies to prevent naming collisions and stale rules
DROP POLICY IF EXISTS "Public Read Access for Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public and authenticated to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to select their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;

-- 4. Policy: SELECT (Required for public image viewing and authenticated upload RETURNING *)
-- Allows public/anon users to view avatars and authenticated users to read newly inserted metadata
CREATE POLICY "Allow public and authenticated to read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. Policy: INSERT (Strictly restricted to authenticated users & user's own folder)
-- Path format: <auth.uid()>/avatar-<unique-name>.<ext>
CREATE POLICY "Allow authenticated users to insert their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy: UPDATE (Strictly restricted to authenticated users & user's own folder)
CREATE POLICY "Allow authenticated users to update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Policy: DELETE (Strictly restricted to authenticated users & user's own files)
CREATE POLICY "Allow authenticated users to delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
