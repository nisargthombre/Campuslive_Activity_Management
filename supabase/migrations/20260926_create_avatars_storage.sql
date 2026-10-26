-- ==============================================================================
-- CAMPUS LIVE: SUPABASE STORAGE FOUNDATION FOR AVATARS
-- ==============================================================================
-- Architecture & Security Constraints:
-- 1. Bucket Name: 'avatars' (publicly accessible for CDN image rendering)
-- 2. Max File Size: 2 MB (2,097,152 bytes)
-- 3. Allowed MIME Types: image/jpeg, image/png, image/webp
-- 4. Path Convention: <auth.uid()>/avatar-<unique-name>.<ext>
-- 5. RLS Policies:
--    - SELECT: Public & authenticated read access (satisfies RETURNING * during upload)
--    - INSERT: Authenticated users only, restricted to (storage.foldername(name))[1] = auth.uid()::text
--    - UPDATE: Authenticated users only, restricted to (storage.foldername(name))[1] = auth.uid()::text
--    - DELETE: Authenticated users only, restricted to (storage.foldername(name))[1] = auth.uid()::text
-- ==============================================================================

-- 1. Create or update the 'avatars' bucket with security constraints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing avatar policies to prevent naming collisions
DROP POLICY IF EXISTS "Public Read Access for Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public and authenticated to read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to select their avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;

-- 4. Policy: SELECT (Required for public viewing & authenticated read-after-write RETURNING *)
CREATE POLICY "Allow public and authenticated to read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. Policy: INSERT (Strictly restricted to authenticated user's own folder)
CREATE POLICY "Allow authenticated users to insert their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy: UPDATE (Strictly restricted to authenticated user's own folder)
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

-- 7. Policy: DELETE (Strictly restricted to authenticated user's own folder)
CREATE POLICY "Allow authenticated users to delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
