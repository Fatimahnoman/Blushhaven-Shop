import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/order-success/$id")({ component: Success, head: () => ({ meta: [{ title: "Order confirmed — Lumière" }, { name: "robots", content: "noindex" }] }) });

function Success() {
  const { id } = Route.useParams();
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle()).data,
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto w-20 h-20 rounded-full bg-blush grid place-items-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="mt-6 font-display text-5xl">Thank you</h1>
        <p className="mt-3 text-muted-foreground">Your order has been received.<br />A confirmation email is on its way.</p>
        {order && (
          <div className="mt-8 rounded-3xl bg-card-gradient shadow-soft p-6 text-left">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Order</p>
            <p className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</p>
            <div className="mt-4 flex justify-between font-display text-xl"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
          </div>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/orders"><Button variant="outline" className="rounded-full">View orders</Button></Link>
          <Link to="/shop"><Button className="rounded-full">Continue shopping</Button></Link>
        </div>
      </div>
    </AppShell>
  );
}
