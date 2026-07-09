import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCart, cartTotals } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { productImage } from "@/lib/product-images";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/cart")({ component: CartPage, head: () => ({ meta: [{ title: "Cart — Lumière" }] }) });

function CartPage() {
  const { items, setQty, remove, couponCode, couponPercent, applyCoupon, removeCoupon } = useCart();
  const { subtotal, discount, shipping, tax, total } = cartTotals(items, couponPercent);
  const [code, setCode] = useState("");
  const nav = useNavigate();

  const apply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", trimmed).eq("active", true).maybeSingle();
    if (!data) { toast.error("Invalid coupon code"); return; }
    applyCoupon(data.code, data.discount_percent);
    toast.success(`${data.discount_percent}% off applied`);
  };

  if (items.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <ShoppingBag className="w-14 h-14 mx-auto text-muted-foreground/60" />
          <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
          <p className="mt-3 text-muted-foreground">Discover the pieces our editors are wearing now.</p>
          <Link to="/shop" className="inline-block mt-8"><Button size="lg" className="rounded-full px-8">Shop the edit</Button></Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <h1 className="font-display text-4xl md:text-5xl mb-10">Your bag</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div className="divide-y">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="py-6 grid grid-cols-[100px_1fr_auto] gap-6 items-center">
                  <Link to="/product/$slug" params={{ slug: item.slug }} className="w-24 h-24 rounded-2xl overflow-hidden bg-blush-soft shrink-0">
                    <img src={productImage(item.image_key)} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="min-w-0">
                    {item.brand && <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.brand}</p>}
                    <Link to="/product/$slug" params={{ slug: item.slug }} className="font-display text-lg hover:text-primary">{item.name}</Link>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-1 rounded-full border p-0.5">
                        <button onClick={() => setQty(item.id, item.quantity - 1)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-muted"><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => setQty(item.id, item.quantity + 1)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-muted"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
                    </div>
                  </div>
                  <p className="font-medium tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <aside className="lg:sticky lg:top-24 h-fit rounded-3xl bg-card-gradient shadow-soft p-8 space-y-5">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              {discount > 0 && <Row label={`Discount (${couponPercent}%)`} value={`-$${discount.toFixed(2)}`} />}
              <Row label={shipping === 0 ? "Shipping (free)" : "Shipping"} value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
              <Row label="Estimated tax" value={`$${tax.toFixed(2)}`} />
            </div>
            <div className="border-t pt-4 flex justify-between font-display text-xl">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div>
              {couponCode ? (
                <div className="flex items-center justify-between text-sm bg-blush rounded-full px-4 py-2">
                  <span>Applied: <b>{couponCode}</b></span>
                  <button onClick={removeCoupon} className="text-xs underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" maxLength={30}
                    className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:border-primary" />
                  <Button variant="outline" size="sm" onClick={apply} className="rounded-full">Apply</Button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-2">Try WELCOME10, LUXE20, or ROSEGOLD15</p>
            </div>
            <Button size="lg" className="w-full rounded-full h-12 text-xs uppercase tracking-[0.2em]" onClick={() => nav({ to: "/checkout" })}>
              Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="tabular-nums">{value}</span></div>;
}
