import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2, Truck, Tag, Gift, Sparkles } from "lucide-react";
import { useCart, cartTotals } from "@/store/cart";
import { productImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, setQty, remove, couponCode, couponPercent, applyCoupon, removeCoupon } = useCart();
  const { subtotal, discount, shipping, tax, total } = cartTotals(items, couponPercent);
  const [code, setCode] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const nav = useNavigate();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const FREE_SHIPPING_THRESHOLD = 75;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFree = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const apply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", trimmed).eq("active", true).maybeSingle();
    if (!data) { toast.error("Invalid coupon code"); return; }
    applyCoupon(data.code, data.discount_percent);
    toast.success(`${data.discount_percent}% off applied`);
    setCode("");
  };

  const handleRemove = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      remove(id);
      setRemoving(null);
    }, 300);
  };

  const handleCheckout = () => {
    onClose();
    setTimeout(() => nav({ to: "/checkout" }), 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-background shadow-elevated flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg">Your bag</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
                    {count} {count === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 rounded-2xl hover:bg-muted transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-7 pt-4"
              >
                <div className="flex items-center gap-2 text-xs mb-2">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">
                    {amountToFree > 0 ? (
                      <>Add <span className="font-semibold text-foreground">${amountToFree.toFixed(2)}</span> more for free shipping</>
                    ) : (
                      <span className="text-green-600 font-medium">You've unlocked free shipping!</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                  />
                </div>
              </motion.div>
            )}

            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-7 pt-4"
              >
                <div className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                  <Gift className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600 font-medium">Free shipping unlocked!</span>
                </div>
              </motion.div>
            )}

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-7">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-blush to-blush-soft grid place-items-center mx-auto mb-6"
                  >
                    <ShoppingBag className="w-8 h-8 text-primary/40" />
                  </motion.div>
                  <p className="font-display text-xl">Your bag is empty</p>
                  <p className="mt-2 text-sm text-muted-foreground">Discover something you love</p>
                  <Link to="/shop" onClick={onClose} className="inline-block mt-6">
                    <Button className="rounded-full btn-primary px-8">Shop now</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-7 py-5">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: removing === item.id ? 0.5 : 1, x: 0, scale: removing === item.id ? 0.95 : 1 }}
                      exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-4 py-4 border-b border-border/30 last:border-0"
                    >
                      <Link to="/product/$slug" params={{ slug: item.slug }} onClick={onClose} className="shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-blush-soft shadow-card">
                          <img src={productImage(item.image_key, item.category_slug)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {item.brand && <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">{item.brand}</p>}
                            <Link to="/product/$slug" params={{ slug: item.slug }} onClick={onClose} className="text-sm font-display leading-tight hover:text-primary transition-colors">
                              {item.name}
                            </Link>
                          </div>
                          <button onClick={() => handleRemove(item.id)} className="p-1 -mr-1 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-destructive transition-colors shrink-0" aria-label="Remove item">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-0.5 rounded-full border border-border/50 p-0.5">
                            <button onClick={() => setQty(item.id, item.quantity - 1)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="Decrease quantity">
                              <Minus className="w-3 h-3" />
                            </button>
                            <motion.span key={item.quantity} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-6 text-center text-xs font-semibold tabular-nums">
                              {item.quantity}
                            </motion.span>
                            <button onClick={() => setQty(item.id, item.quantity + 1)} className="w-7 h-7 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="Increase quantity">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <motion.p key={item.price * item.quantity} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-sm font-semibold tabular-nums">
                            ${(item.price * item.quantity).toFixed(2)}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border/50 px-7 py-5 space-y-4">
                {/* Coupon */}
                {couponCode ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between text-sm bg-primary/8 rounded-xl px-4 py-3">
                    <span className="flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-primary" /><b className="text-xs">{couponCode}</b></span>
                    <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Remove</button>
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && apply()} placeholder="Promo code" maxLength={30}
                      className="flex-1 rounded-xl border border-border/50 px-4 py-2.5 text-sm outline-none focus:border-primary/40 transition-colors bg-background" />
                    <Button variant="outline" size="sm" onClick={apply} className="rounded-xl px-4 text-xs">Apply</Button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
                  {discount > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex justify-between text-green-600">
                      <span>Discount</span><span className="tabular-nums">-${discount.toFixed(2)}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : "tabular-nums"}>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/40">
                    <span className="font-display text-lg">Total</span>
                    <motion.span key={total} initial={{ scale: 1.08, color: "var(--primary)" }} animate={{ scale: 1, color: "var(--foreground)" }} transition={{ duration: 0.3 }} className="font-display text-lg tabular-nums">
                      ${total.toFixed(2)}
                    </motion.span>
                  </div>
                </div>

                {/* Checkout */}
                <Button size="lg" onClick={handleCheckout} className="w-full rounded-full h-13 text-xs uppercase tracking-[0.2em] btn-primary">
                  Checkout <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Link to="/cart" onClick={onClose} className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.15em]">
                  View full bag
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
