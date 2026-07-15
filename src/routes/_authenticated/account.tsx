import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Package, Heart, LogOut, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/account")({
  component: Account,
  head: () => ({ meta: [{ title: "Account — Lumiere" }] }),
});

function Account() {
  const { user, isDemo } = useAuth();
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user && user.id !== "demo",
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders-count", user?.id],
    enabled: !!user && user.id !== "demo",
    queryFn: async () =>
      (await supabase.from("orders").select("id, total, status, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(3)).data ?? [],
  });

  const signOut = async () => {
    if (isDemo) {
      localStorage.removeItem("lumiere-session");
      router.invalidate();
      return;
    }
    await supabase.auth.signOut();
    router.invalidate();
  };

  const displayName = isDemo
    ? (user?.user_metadata?.full_name as string)?.split(" ")[0] ?? (user?.email as string)?.split("@")[0] ?? "beautiful"
    : profile?.full_name?.split(" ")[0] ?? "beautiful";

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label">Your account</p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl lg:text-6xl">Hello, {displayName}</h1>
          <p className="mt-3 text-muted-foreground">{user?.email}</p>
          {isDemo && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-1.5 inline-block">
              Demo mode — sign up with Supabase for full features
            </p>
          )}
        </motion.div>

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          {[
            { to: "/wishlist", icon: Heart, title: "Wishlist", desc: "Your saved pieces" },
            { to: "/track-order", icon: Package, title: "Track order", desc: "See delivery status" },
          ].map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <Link to={card.to} className="group block card-luxe p-7 hover-lift">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-blush-soft grid place-items-center shadow-soft">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-xl">{card.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{card.desc}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-4 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {!isDemo && orders && orders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 card-luxe p-7">
            <h3 className="font-display text-xl">Recent orders</h3>
            <ul className="mt-5 divide-y divide-border/50">
              {orders.map((o) => (
                <li key={o.id} className="py-4 flex justify-between items-center text-sm">
                  <span className="font-mono text-xs bg-muted/60 px-2.5 py-1 rounded-lg">{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="capitalize text-muted-foreground text-xs bg-primary/8 text-primary px-3 py-1 rounded-full font-medium">{o.status}</span>
                  <span className="tabular-nums font-medium">${Number(o.total).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {isDemo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 card-luxe p-7 text-center">
            <Package className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Connect Supabase to see order history here.</p>
          </motion.div>
        )}

        <div className="mt-10">
          <Button variant="outline" onClick={signOut} className="rounded-full">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
