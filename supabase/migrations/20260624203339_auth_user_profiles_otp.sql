/*
# Auth: user_profiles + otp_verifications

## Purpose
Enable role-based login/signup for PoojaSathi.
- Pandits and Yajmaans register separately; their role is stored here.
- OTP verification uses a DB table (no SMS gateway required in demo mode).

## New Tables

### user_profiles
One row per Supabase auth user.
- id          : references auth.users(id)
- role        : 'pandit' | 'yajmaan'
- full_name   : display name
- phone       : mobile number (used for OTP)
- email       : optional
- location_text, city, state, latitude, longitude : address fields
- pandit_id   : FK → pandits (only for pandit role)
- verified    : true once OTP confirmed

### otp_verifications
6-digit codes for sign-up / login verification.
- phone / email : target
- otp_code      : 6-digit string
- purpose       : 'signup' | 'login'
- used          : consumed flag
- expires_at    : now() + 10 minutes

## Security
- user_profiles: RLS on, owner-scoped (auth.uid() = id)
- otp_verifications: RLS on, anon can insert+select+update (needed for verify flow before auth)
*/

-- ─── user_profiles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('pandit','yajmaan')),
  full_name     text NOT NULL,
  phone         text NOT NULL,
  email         text,
  location_text text,
  city          text,
  state         text,
  latitude      numeric,
  longitude     numeric,
  pandit_id     uuid REFERENCES pandits(id) ON DELETE SET NULL,
  avatar_url    text,
  verified      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_profiles_phone_idx ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx  ON user_profiles(role);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile_select_own"  ON user_profiles;
DROP POLICY IF EXISTS "profile_insert_own"  ON user_profiles;
DROP POLICY IF EXISTS "profile_update_own"  ON user_profiles;
DROP POLICY IF EXISTS "profile_delete_own"  ON user_profiles;

CREATE POLICY "profile_select_own"  ON user_profiles FOR SELECT    TO authenticated USING      (auth.uid() = id);
CREATE POLICY "profile_insert_own"  ON user_profiles FOR INSERT    TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_update_own"  ON user_profiles FOR UPDATE    TO authenticated USING      (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_delete_own"  ON user_profiles FOR DELETE    TO authenticated USING      (auth.uid() = id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── otp_verifications ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_verifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      text,
  email      text,
  otp_code   text NOT NULL,
  purpose    text NOT NULL DEFAULT 'signup' CHECK (purpose IN ('signup','login')),
  used       boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_phone_idx ON otp_verifications(phone, used);

ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "otp_insert_anon"  ON otp_verifications;
DROP POLICY IF EXISTS "otp_select_anon"  ON otp_verifications;
DROP POLICY IF EXISTS "otp_update_anon"  ON otp_verifications;

CREATE POLICY "otp_insert_anon"  ON otp_verifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "otp_select_anon"  ON otp_verifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "otp_update_anon"  ON otp_verifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
