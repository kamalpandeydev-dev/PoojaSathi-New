import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type UserRole = "pandit" | "yajmaan";

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  email: string | null;
  location_text: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  pandit_id: string | null;
  verified: boolean;
}

interface AuthCtx {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    console.log("Fetching profile:", uid);

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      console.log("Profile data:", data);
      console.log("Profile error:", error);

      if (error) throw error;

      setProfile(data ?? null);
    } catch (err) {
      console.error("fetchProfile failed:", err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { session: s },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(s);

        if (s) {
          await fetchProfile(s.user.id);
        }
      } catch (e) {
        console.error("Init auth error:", e);
      } finally {
        if (mounted) {
          console.log("Loading finished");
          setLoading(false);
        }
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log("AUTH EVENT:", event);

      setSession(s);

      if (s) {
        await fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  async function refreshProfile() {
    if (session?.user.id) await fetchProfile(session.user.id);
  }

  return (
    <Ctx.Provider
      value={{ session, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
