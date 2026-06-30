-- ─── Fix pandits table RLS policies ─────────────────────────────────────────────
-- Previously allowed anyone to insert/update/delete any pandit record.
-- New approach:
--   - Anyone can view pandits (public directory)
--   - Only authenticated users can create pandit profiles (during signup)
--   - Only the pandit who owns the record (linked via user_profiles.pandit_id) can update it
--   - Deleting pandits should not be allowed via client (admin operation)

-- Drop old overly-permissive policies
DROP POLICY IF EXISTS "pandits_insert" ON pandits;
DROP POLICY IF EXISTS "pandits_update" ON pandits;
DROP POLICY IF EXISTS "pandits_delete" ON pandits;

-- Create secure pandit via user_profiles linkage
CREATE POLICY "pandits_insert_authenticated" ON pandits FOR INSERT
  TO authenticated WITH CHECK (true);

-- Only allow pandits to update their own record (matched via user_profiles.pandit_id)
CREATE POLICY "pandits_update_own" ON pandits FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.pandit_id = pandits.id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.pandit_id = pandits.id
    )
  );

-- Prevent client-side deletion of pandits (should be admin operation)
CREATE POLICY "pandits_delete_none" ON pandits FOR DELETE
  TO authenticated USING (false);

-- ─── Add index for user_profiles.pandit_id for RLS checks ───────────────────────
CREATE INDEX IF NOT EXISTS user_profiles_pandit_id_idx ON user_profiles(pandit_id);

-- ─── Add unique constraint: one account per role per phone ─────────────────────
-- This allows the same phone to have both a pandit AND a yajmaan account,
-- but not multiple pandit accounts or multiple yajmaan accounts.
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_phone_role_unique_idx ON user_profiles(phone, role)
  WHERE phone IS NOT NULL AND phone != '';
