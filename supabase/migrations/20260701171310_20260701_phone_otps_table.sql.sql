/*
# Create phone_otps table for custom OTP verification

1. New Tables
- `phone_otps` - stores OTP codes for phone verification
  - `id` (uuid, primary key)
  - `phone` (text, not null) - normalized phone number (10 digits or E.164)
  - `otp_code` (text, not null) - 6-digit OTP code
  - `purpose` (text, not null) - 'signup', 'login', or 'reset'
  - `used` (boolean, default false)
  - `expires_at` (timestamptz, not null)
  - `created_at` (timestamptz, default now())

2. Security
- RLS disabled (Edge functions use service role to manage)
- OTPs are short-lived (10 minute expiry)
- Auto-cleanup via scheduled job recommended

3. Notes
- This table replaces the previous otp_verifications table
- WhatsApp API or Indian SMS gateways deliver the OTP
- In development mode, OTP is shown in UI and logged
*/

-- Drop old table if exists (from previous Twilio setup)
DROP TABLE IF EXISTS otp_verifications CASCADE;

-- Create fresh phone_otps table
CREATE TABLE IF NOT EXISTS phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL DEFAULT 'signup',
  used boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone_purpose ON phone_otps(phone, purpose);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires ON phone_otps(expires_at);

-- RLS not needed - table is only accessed via service role from edge functions
-- No direct client access to this table
