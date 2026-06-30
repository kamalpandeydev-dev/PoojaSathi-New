/*
# Avatar Storage Bucket

1. Purpose
- Creates a public storage bucket named `avatars` for user profile images.
- Users upload their profile photo at signup; the public URL is stored in `user_profiles.avatar_url`.

2. Storage
- Bucket `avatars` is PUBLIC (public read, authenticated write).
- Files are stored at path `{user_id}/avatar.{ext}`.

3. Security
- Public read: anyone can view avatar images (they are profile photos, not sensitive).
- Authenticated write: only logged-in users can upload, and only to their own folder via a storage policy.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read of avatars
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'avatars');

-- Allow authenticated users to upload to their own folder: {user_id}/avatar.{ext}
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own avatar
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own avatar
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );