import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type DemoUser = { email: string; name: string };

function getDemoUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem("lumiere-session");
    if (!raw) return null;
    return JSON.parse(raw) as DemoUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  const isSupabaseConfigured = !!(
    import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode — read from localStorage
      setDemoUser(getDemoUser());
      setLoading(false);

      // Listen for storage changes (e.g., after login/logout in another tab)
      const onStorage = () => setDemoUser(getDemoUser());
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s) setDemoUser(null); // Clear demo user if real session exists
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  // Merge: prefer real Supabase user, fallback to demo
  const effectiveUser = user ?? (demoUser ? { id: "demo", email: demoUser.email, user_metadata: { full_name: demoUser.name } } as User : null);
  const effectiveSession = session ?? (demoUser ? { user: effectiveUser } as Session : null);

  return { session: effectiveSession, user: effectiveUser, loading, isDemo: !isSupabaseConfigured && !!demoUser };
}

export function useIsAdmin(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!userId || userId === "demo") { setIsAdmin(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId]);
  return isAdmin;
}

export function signOutDemo() {
  localStorage.removeItem("lumiere-session");
  window.dispatchEvent(new Event("storage"));
}
