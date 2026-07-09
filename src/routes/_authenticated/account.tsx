import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Package, Heart, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({ component: Account, head: () => ({ meta: [{ title: "Account — Lumière" }] }) });

function Account() {
  const { user } = useAuth();
  const admin = useIsAdmin(user?.id);
  const router = useRouter();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders-count", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("id, total, status, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(3)).data ?? [],
  });

  const signOut = async () => { await supabase.auth.signOut(); router.invalidate(); };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Your account</p>
        <h1 className="mt-2 font-display text-5xl">Hello, {profile?.full_name?.split(" ")[0] ?? "beautiful"}</h1>
        <p className="mt-2 text-muted-foreground">{user?.email}</p>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Link to="/orders" className="rounded-3xl bg-card-gradient shadow-soft p-6 hover-lift">
            <Package className="w-6 h-6 text-primary" />
            <h3 className="mt-3 font-display text-xl">Orders</h3>
            <p className="text-sm text-muted-foreground">Track and review</p>
          </Link>
          <Link to="/wishlist" className="rounded-3xl bg-card-gradient shadow-soft p-6 hover-lift">
            <Heart className="w-6 h-6 text-primary" />
            <h3 className="mt-3 font-display text-xl">Wishlist</h3>
            <p className="text-sm text-muted-foreground">Your saved pieces</p>
          </Link>
          {admin && (
            <Link to="/admin" className="rounded-3xl bg-ink text-cream p-6 hover-lift">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="mt-3 font-display text-xl">Admin</h3>
              <p className="text-sm opacity-80">Manage store</p>
            </Link>
          )}
        </div>

        <div className="mt-10 rounded-3xl border p-6">
          <h3 className="font-display text-xl">Recent orders</h3>
          {(!orders || orders.length === 0) ? (
            <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y">
              {orders.map((o) => (
                <li key={o.id} className="py-3 flex justify-between text-sm">
                  <span className="font-mono">{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="capitalize text-muted-foreground">{o.status}</span>
                  <span className="tabular-nums">${Number(o.total).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10">
          <Button variant="outline" onClick={signOut} className="rounded-full"><LogOut className="w-4 h-4" /> Sign out</Button>
        </div>
      </div>
    </AppShell>
  );
}
