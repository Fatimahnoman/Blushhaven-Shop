import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { productImage } from "@/lib/product-images";
import { format } from "date-fns";
import { Package, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/orders")({ component: Orders, head: () => ({ meta: [{ title: "Orders — Lumiere" }] }) });

function Orders() {
  const { user, isDemo } = useAuth();
  const { data } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user && !isDemo,
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl">Orders</h1>
        {isDemo && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 text-center py-16 card-luxe">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-lg font-display">Demo mode</p>
            <p className="mt-2 text-sm text-muted-foreground">Connect Supabase to see real order history.</p>
          </motion.div>
        )}
        {!isDemo && (!data || data.length === 0) && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-20 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush to-blush-soft grid place-items-center mx-auto mb-8 shadow-soft">
              <ShoppingBag className="w-10 h-10 text-primary/40" />
            </div>
            <p className="text-xl font-display">No orders yet</p>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">Your order history will appear here once you make a purchase.</p>
            <Link to="/shop" className="inline-block mt-8"><button className="rounded-full btn-primary px-8 py-3 text-xs uppercase tracking-[0.2em] font-semibold">Start shopping</button></Link>
          </motion.div>
        )}
        <div className="mt-10 space-y-5">
          {data?.map((o: any, i: number) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card-luxe p-7 hover-lift">
              <div className="flex flex-wrap justify-between gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blush to-blush-soft grid place-items-center shadow-soft">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="section-label text-[10px]">Order</p>
                    <p className="font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{format(new Date(o.created_at), "MMM d, yyyy")}</div>
                <span className="capitalize text-xs rounded-full bg-primary/10 text-primary px-3.5 py-1.5 font-medium">{o.status}</span>
                <div className="font-display text-xl">${Number(o.total).toFixed(2)}</div>
              </div>
              <div className="mt-5 grid gap-3">
                {o.order_items?.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-blush-soft">
                      <img src={productImage(it.image_url)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">{it.name} <span className="text-muted-foreground">× {it.quantity}</span></div>
                    <div className="text-sm tabular-nums font-medium">${(Number(it.price) * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
