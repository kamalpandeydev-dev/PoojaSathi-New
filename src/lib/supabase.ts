import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// ─── Database row types ───────────────────────────────────────────────────────

export interface PanditRow {
  id: string;
  name: string;
  name_en: string | null;
  phone: string | null;
  specialty: string | null;
  qualifications: string | null;
  address: string | null;
  address_en: string | null;
  city: string | null;
  city_en: string | null;
  avatar_initials: string | null;
  available: boolean;
  created_at: string;
}

export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_preparation"
  | "ready"
  | "completed"
  | "cancelled";

export interface BookingRow {
  id: string;
  yajmaan_name: string;
  yajmaan_name_en: string | null;
  yajmaan_phone: string;
  yajmaan_city: string | null;
  pandit_id: string | null;
  puja_type: string;
  puja_date: string; // ISO date YYYY-MM-DD
  puja_time: string; // HH:MM
  venue: string;
  city: string | null;
  occasion: string | null;
  expected_guests: number | null;
  notes: string | null;
  budget: number | null;
  cover_illustration: string | null;
  invite_code: string | null;
  status: BookingStatus;
  samagri_published: boolean;
  samagri_published_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  pandits?: PanditRow;
}

export type YajmaanStatus =
  | "not_started"
  | "searching"
  | "arranged"
  | "purchased"
  | "unable"
  | "requested_pandit";

export interface SamagriItemRow {
  id: string;
  booking_id: string;
  serial_no: number | null;
  hindi_name: string;
  english_name: string | null;
  category: string | null;
  qty: number;
  unit: string;
  mandatory: boolean;
  responsible: "Pandit" | "Yajmaan" | "Shared";
  pandit_note: string | null;
  yajmaan_status: YajmaanStatus;
  yajmaan_note: string | null;
  source: "library" | "custom";
  master_item_id: string | null;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = "pending" | "approved" | "declined" | "fulfilled";

export interface SamagriRequestRow {
  id: string;
  booking_id: string;
  item_id: string | null;
  item_hindi_name: string | null;
  message: string | null;
  status: RequestStatus;
  pandit_reply: string | null;
  created_at: string;
  resolved_at: string | null;
}
