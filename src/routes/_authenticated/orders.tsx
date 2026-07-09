import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { productImage } from "@/lib/product-images";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/orders")({ component: Orders, head: () => ({ meta: [{ title: "Orders — Lumière" }] }) });

function Orders() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-5xl">Orders</h1>
        {(!data || data.length === 0) && <p className="mt-6 text-muted-foreground">No orders yet.</p>}
        <div className="mt-8 space-y-6">
          {data?.map((o: any) => (
            <div key={o.id} className="rounded-3xl bg-card-gradient shadow-soft p-6">
              <div className="flex flex-wrap justify-between gap-4 items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Order</p>
                  <p className="font-mono">{o.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-xs text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</div>
                <span className="capitalize text-sm rounded-full bg-blush px-3 py-1">{o.status}</span>
                <div className="font-display text-xl">${Number(o.total).toFixed(2)}</div>
              </div>
              <div className="mt-4 grid gap-3">
                {o.order_items?.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-blush-soft"><img src={productImage(it.image_url)} alt="" className="w-full h-full object-cover" /></div>
                    <div className="flex-1 text-sm">{it.name} <span className="text-muted-foreground">× {it.quantity}</span></div>
                    <div className="text-sm tabular-nums">${(Number(it.price) * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
