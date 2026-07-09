import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCart, cartTotals } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { productImage } from "@/lib/product-images";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, CreditCard, Truck } from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: Checkout, head: () => ({ meta: [{ title: "Checkout — Lumière" }] }) });

type Address = { fullName: string; email: string; phone: string; address1: string; city: string; state: string; postal: string; country: string };

function Checkout() {
  const { items, couponPercent, couponCode, clear } = useCart();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [addr, setAddr] = useState<Address>({ fullName: "", email: user?.email ?? "", phone: "", address1: "", city: "", state: "", postal: "", country: "United States" });
  const [payment, setPayment] = useState<"cod" | "stripe">("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => { if (user?.email && !addr.email) setAddr((a) => ({ ...a, email: user.email! })); }, [user]);

  const t = cartTotals(items, couponPercent);

  if (!loading && !user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-4xl">Sign in to checkout</h1>
          <p className="mt-3 text-muted-foreground">Save your order history and address for faster future orders.</p>
          <Link to="/auth" search={{ redirect: "/checkout" } as any} className="inline-block mt-6"><Button size="lg" className="rounded-full px-8">Sign in / Sign up</Button></Link>
        </div>
      </AppShell>
    );
  }

  if (items.length === 0) {
    return <AppShell><div className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="font-display text-3xl">Your bag is empty</h1><Link to="/shop" className="inline-block mt-6"><Button className="rounded-full">Shop</Button></Link></div></AppShell>;
  }

  const placeOrder = async () => {
    if (!user) return;
    if (!addr.fullName || !addr.address1 || !addr.city || !addr.postal || !addr.email) {
      toast.error("Please complete the shipping address"); return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, tax: t.tax, total: t.total,
      coupon_code: couponCode, payment_method: payment, shipping_address: addr as any, status: "processing",
    }).select().single();
    if (error || !order) { setPlacing(false); toast.error("Could not place order"); return; }
    const { error: iErr } = await supabase.from("order_items").insert(items.map((i) => ({
      order_id: order.id, product_id: i.id, name: i.name, image_url: i.image_key, price: i.price, quantity: i.quantity,
    })));
    if (iErr) { setPlacing(false); toast.error("Could not save order items"); return; }
    clear();
    toast.success("Order placed successfully");
    nav({ to: "/order-success/$id", params: { id: order.id } });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <h1 className="font-display text-4xl md:text-5xl mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-[1fr_420px] gap-10">
          <div className="space-y-10">
            <Section title="Shipping address" icon={<Truck className="w-4 h-4" />}>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full name" value={addr.fullName} onChange={(v) => setAddr({ ...addr, fullName: v })} />
                <Field label="Email" type="email" value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} />
                <Field label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v })} />
                <Field label="Country" value={addr.country} onChange={(v) => setAddr({ ...addr, country: v })} />
                <div className="md:col-span-2"><Field label="Address" value={addr.address1} onChange={(v) => setAddr({ ...addr, address1: v })} /></div>
                <Field label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
                <Field label="State / Region" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
                <Field label="Postal code" value={addr.postal} onChange={(v) => setAddr({ ...addr, postal: v })} />
              </div>
            </Section>

            <Section title="Payment method" icon={<CreditCard className="w-4 h-4" />}>
              <div className="grid gap-3">
                {[
                  { id: "cod", label: "Cash on delivery", desc: "Pay when your parcel arrives" },
                  { id: "stripe", label: "Credit / debit card", desc: "Stripe (demo — no charge)" },
                ].map((m) => (
                  <button key={m.id} onClick={() => setPayment(m.id as any)}
                    className={`text-left rounded-2xl border p-5 transition ${payment === m.id ? "border-primary bg-blush-soft" : "hover:border-foreground/30"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      {payment === m.id && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          <motion.aside initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-24 h-fit rounded-3xl bg-card-gradient shadow-soft p-6 space-y-5">
            <h2 className="font-display text-xl">Order summary</h2>
            <div className="space-y-3 max-h-80 overflow-auto pr-2">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-blush-soft shrink-0"><img src={productImage(i.image_key)} alt="" className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm truncate">{i.name}</p><p className="text-xs text-muted-foreground">Qty {i.quantity}</p></div>
                  <p className="text-sm tabular-nums">${(i.price * i.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={`$${t.subtotal.toFixed(2)}`} />
              {t.discount > 0 && <Row label={`Discount`} value={`-$${t.discount.toFixed(2)}`} />}
              <Row label="Shipping" value={t.shipping === 0 ? "Free" : `$${t.shipping.toFixed(2)}`} />
              <Row label="Tax" value={`$${t.tax.toFixed(2)}`} />
            </div>
            <div className="border-t pt-4 flex justify-between font-display text-xl">
              <span>Total</span><span>${t.total.toFixed(2)}</span>
            </div>
            <Button size="lg" onClick={placeOrder} disabled={placing} className="w-full rounded-full h-12 text-xs uppercase tracking-[0.2em]">
              {placing ? "Placing…" : "Place order"}
            </Button>
          </motion.aside>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl flex items-center gap-2">{icon}{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={200}
        className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary transition" />
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="tabular-nums">{value}</span></div>;
}
