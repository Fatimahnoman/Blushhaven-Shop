import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Check demo session first
    try {
      const raw = localStorage.getItem("lumiere-session");
      if (raw) {
        const demo = JSON.parse(raw);
        if (demo?.email) {
          return { user: { id: "demo", email: demo.email, user_metadata: { full_name: demo.name } } };
        }
      }
    } catch { /* ignore */ }

    // Real Supabase check
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) return { user: data.user };
    } catch { /* ignore */ }

    throw redirect({ to: "/account" });
  },
  component: () => <Outlet />,
});
