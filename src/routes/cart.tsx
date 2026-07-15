import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCart, cartTotals } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { productImage } from "@/lib/product-images";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({ meta: [{ title: "Cart — Lumiere" }] }),
});

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
    setCode("");
  };

  if (items.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blush to-blush-soft grid place-items-center mx-auto mb-8 shadow-soft">
            <ShoppingBag className="w-10 h-10 text-primary/50" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-3xl md:text-5xl lg:text-6xl">
            Your bag is empty
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 text-muted-foreground text-lg">
            Discover the pieces our editors are wearing now.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/shop" className="inline-block mt-8">
              <Button size="lg" className="rounded-full px-12 btn-primary h-13 text-xs uppercase tracking-[0.2em]">Shop the edit</Button>
            </Link>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-12">Your bag</h1>
        <div className="grid lg:grid-cols-[1fr_420px] gap-12">
          {/* Items */}
          <div className="divide-y divide-border/50">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
                  className="py-7 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_auto] gap-4 sm:gap-6 items-center">
                  <Link to="/product/$slug" params={{ slug: item.slug }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-blush-soft shrink-0 shadow-card hover:shadow-card-hover transition-shadow duration-400">
                    <img src={productImage(item.image_key, item.category_slug)} alt={item.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="min-w-0">
                    {item.brand && <p className="section-label text-[10px]">{item.brand}</p>}
                    <Link to="/product/$slug" params={{ slug: item.slug }} className="font-display text-sm sm:text-lg hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                    <p className="sm:hidden font-semibold text-sm tabular-nums mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1 rounded-full border border-border/60 p-0.5">
                        <button onClick={() => setQty(item.id, item.quantity - 1)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                        <button onClick={() => setQty(item.id, item.quantity + 1)} className="w-8 h-8 grid place-items-center rounded-full hover:bg-muted transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => remove(item.id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                  <p className="hidden sm:block font-semibold tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:sticky lg:top-24 h-fit rounded-[2rem] glass-card p-8 space-y-6">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="space-y-3 text-sm">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              {discount > 0 && <Row label={`Discount (${couponPercent}%)`} value={`-$${discount.toFixed(2)}`} highlight />}
              <Row label={shipping === 0 ? "Shipping (free)" : "Shipping"} value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} highlight={shipping === 0} />
              <Row label="Estimated tax" value={`$${tax.toFixed(2)}`} />
            </div>
            <div className="border-t border-border/50 pt-5 flex justify-between font-display text-xl">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {couponCode ? (
              <div className="flex items-center justify-between text-sm bg-primary/8 rounded-full px-5 py-3">
                <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-primary" /><b>{couponCode}</b></span>
                <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && apply()} placeholder="Promo code" maxLength={30}
                  className="flex-1 rounded-full border border-border/60 px-5 py-3 text-sm outline-none focus:border-primary/40 transition-colors bg-background" />
                <Button variant="outline" size="sm" onClick={apply} className="rounded-full px-5">Apply</Button>
              </div>
            )}
            <Button size="lg" className="w-full rounded-full h-13 text-xs uppercase tracking-[0.2em] btn-primary" onClick={() => nav({ to: "/checkout" })}>
              Checkout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.aside>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${highlight ? "text-green-600 font-medium" : ""}`}>{value}</span>
    </div>
  );
}
