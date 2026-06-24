/*
# PoojaSathi Core Schema

## Overview
This migration creates the complete backend for PoojaSathi — a collaborative
pooja management platform where Yajmaan (devotee) books a pooja with a Pandit,
and they collaborate on samagri (ritual items) preparation together.

## Core Flow
1. Yajmaan creates a booking request (puja_bookings)
2. Pandit receives the booking, accepts or declines
3. Pandit builds the samagri checklist (samagri_items) — marks each as required/optional
4. Pandit "publishes" the list to Yajmaan
5. Yajmaan sees the list and marks each item: arranged / not arranged / ask pandit
6. Yajmaan can request Pandit to bring specific items (samagri_requests)

## Tables

### pandits
Registered Pandit profiles. Pre-seeded with Pandit Vijay Kumar Mishra.
- id, name (Hindi), name_en (English), phone, specialty, address, city

### puja_bookings
A Yajmaan's booking request for a pooja.
- id, yajmaan_name, yajmaan_phone, pandit_id (→ pandits)
- puja_type, puja_date, puja_time, venue, city, notes, budget
- status: pending | accepted | declined | in_preparation | ready | completed

### samagri_items
The Pandit's samagri checklist for a specific booking.
- id, booking_id (→ puja_bookings), serial_no, hindi_name, english_name
- category, qty, unit, mandatory (Pandit marks required/optional)
- responsible: Pandit | Yajmaan | Shared
- pandit_note (Pandit's instruction for this item)
- yajmaan_status: not_started | arranged | purchased | unable | requested_pandit
- yajmaan_note (Yajmaan's note when arranging/requesting)
- list_published (whether Pandit has sent this list to Yajmaan)

### samagri_requests
Formal requests from Yajmaan to Pandit to bring specific items.
- id, booking_id, item_id (→ samagri_items), message
- status: pending | approved | declined

## Security
Single-tenant (no login required for demo) — policies allow anon + authenticated access.
All tables have RLS enabled with open policies for the demo.
*/

-- ─── pandits ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pandits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  phone text,
  specialty text,
  qualifications text,
  address text,
  address_en text,
  city text,
  city_en text,
  avatar_initials text DEFAULT 'पं',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pandits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pandits_select" ON pandits;
CREATE POLICY "pandits_select" ON pandits FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "pandits_insert" ON pandits;
CREATE POLICY "pandits_insert" ON pandits FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pandits_update" ON pandits;
CREATE POLICY "pandits_update" ON pandits FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pandits_delete" ON pandits;
CREATE POLICY "pandits_delete" ON pandits FOR DELETE TO anon, authenticated USING (true);

-- ─── puja_bookings ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS puja_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Yajmaan details (no auth needed for demo)
  yajmaan_name text NOT NULL,
  yajmaan_name_en text,
  yajmaan_phone text NOT NULL,
  yajmaan_city text,
  -- Pandit
  pandit_id uuid REFERENCES pandits(id) ON DELETE SET NULL,
  -- Pooja details
  puja_type text NOT NULL,
  puja_date date NOT NULL,
  puja_time time NOT NULL DEFAULT '09:00',
  venue text NOT NULL,
  city text,
  occasion text,
  expected_guests integer DEFAULT 10,
  notes text,
  budget integer,
  cover_illustration text DEFAULT 'kalash',
  invite_code text UNIQUE DEFAULT 'PS-' || upper(substr(md5(random()::text), 1, 4)) || '-' || floor(1000 + random() * 9000)::text,
  -- Status lifecycle
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined','in_preparation','ready','completed','cancelled')),
  -- Samagri state
  samagri_published boolean DEFAULT false,
  samagri_published_at timestamptz,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE puja_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select" ON puja_bookings;
CREATE POLICY "bookings_select" ON puja_bookings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "bookings_insert" ON puja_bookings;
CREATE POLICY "bookings_insert" ON puja_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_update" ON puja_bookings;
CREATE POLICY "bookings_update" ON puja_bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_delete" ON puja_bookings;
CREATE POLICY "bookings_delete" ON puja_bookings FOR DELETE TO anon, authenticated USING (true);

-- ─── samagri_items ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS samagri_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES puja_bookings(id) ON DELETE CASCADE,
  serial_no integer,
  -- Names (bilingual)
  hindi_name text NOT NULL,
  english_name text,
  category text DEFAULT 'General Pooja',
  -- Pandit-set fields
  qty numeric DEFAULT 1,
  unit text DEFAULT 'नग',
  mandatory boolean DEFAULT true,  -- Pandit marks required/optional
  responsible text DEFAULT 'Yajmaan' CHECK (responsible IN ('Pandit','Yajmaan','Shared')),
  pandit_note text,                -- Pandit's instruction to Yajmaan for this item
  -- Yajmaan tracking
  yajmaan_status text DEFAULT 'not_started'
    CHECK (yajmaan_status IN ('not_started','searching','arranged','purchased','unable','requested_pandit')),
  yajmaan_note text,               -- Yajmaan's note when they update status
  -- Meta
  source text DEFAULT 'library' CHECK (source IN ('library','custom')),
  master_item_id text,             -- reference back to the 75-item master list
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS samagri_items_booking_idx ON samagri_items(booking_id);

ALTER TABLE samagri_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "samagri_select" ON samagri_items;
CREATE POLICY "samagri_select" ON samagri_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "samagri_insert" ON samagri_items;
CREATE POLICY "samagri_insert" ON samagri_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "samagri_update" ON samagri_items;
CREATE POLICY "samagri_update" ON samagri_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "samagri_delete" ON samagri_items;
CREATE POLICY "samagri_delete" ON samagri_items FOR DELETE TO anon, authenticated USING (true);

-- ─── samagri_requests ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS samagri_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES puja_bookings(id) ON DELETE CASCADE,
  item_id uuid REFERENCES samagri_items(id) ON DELETE SET NULL,
  item_hindi_name text,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','declined','fulfilled')),
  pandit_reply text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS samagri_requests_booking_idx ON samagri_requests(booking_id);

ALTER TABLE samagri_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select" ON samagri_requests;
CREATE POLICY "requests_select" ON samagri_requests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "requests_insert" ON samagri_requests;
CREATE POLICY "requests_insert" ON samagri_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "requests_update" ON samagri_requests;
CREATE POLICY "requests_update" ON samagri_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "requests_delete" ON samagri_requests;
CREATE POLICY "requests_delete" ON samagri_requests FOR DELETE TO anon, authenticated USING (true);

-- ─── Seed: Pandit Vijay Kumar Mishra ────────────────────────────────────────
INSERT INTO pandits (id, name, name_en, phone, specialty, qualifications, address, address_en, city, city_en, avatar_initials, available)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'पंडित विजय कुमार मिश्रा',
  'Pandit Vijay Kumar Mishra',
  '9899769768',
  'सत्यनारायण कथा, गृह प्रवेश, विवाह संस्कार',
  'शास्त्री एम.ए.',
  'शिव मंदिर सेवा समिति, सुभाष मार्किट, खिचड़ीपुर, 5 ब्लॉक, दिल्ली - 110091',
  'Shiv Mandir Seva Samiti, Subhash Market, Khichdipur, 5 Block, Delhi - 110091',
  'दिल्ली',
  'Delhi',
  'वि',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ─── Trigger: auto-update updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS puja_bookings_updated_at ON puja_bookings;
CREATE TRIGGER puja_bookings_updated_at
  BEFORE UPDATE ON puja_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS samagri_items_updated_at ON samagri_items;
CREATE TRIGGER samagri_items_updated_at
  BEFORE UPDATE ON samagri_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
