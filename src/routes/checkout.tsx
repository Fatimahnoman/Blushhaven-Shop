import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCart, cartTotals } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { productImage } from "@/lib/product-images";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { Field } from "@/components/Field";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({ meta: [{ title: "Checkout — Lumiere" }] }),
});

const WEB3FORMS_KEY = "066501e6-598b-4b8c-83da-4bf18935a738";

type Address = {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};
type PaymentMethod = "cod" | "card";

function Checkout() {
  const { items, couponPercent, couponCode, clear } = useCart();
  const nav = useNavigate();
  const [addr, setAddr] = useState<Address>({
    fullName: "", email: "", phone: "",
    address1: "", city: "", state: "", postal: "", country: "Pakistan",
  });
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [step, setStep] = useState<"shipping" | "payment" | "review">("shipping");
  const [placing, setPlacing] = useState(false);

  const t = cartTotals(items, couponPercent);

  if (items.length === 0)
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-6 py-28 text-center">
          <h1 className="font-display text-3xl">Your bag is empty</h1>
          <Link to="/shop" className="inline-block mt-6">
            <Button className="rounded-full">Shop</Button>
          </Link>
        </div>
      </AppShell>
    );

  const shippingValid =
    addr.fullName.trim() && addr.email.trim() && addr.phone.trim() &&
    addr.address1.trim() && addr.city.trim() && addr.postal.trim();

  const buildOrderItems = () =>
    items.map((i) => `${i.name} x${i.quantity} @ $${i.price.toFixed(2)} = $${(i.price * i.quantity).toFixed(2)}`).join(" | ");

  const placeOrder = async () => {
    if (!shippingValid) { toast.error("Please complete all required fields"); return; }
    setPlacing(true);

    try {
      const orderData = {
        access_key: WEB3FORMS_KEY,
        subject: `New Order — $${t.total.toFixed(2)} — ${addr.fullName}`,
        from_name: "Lumiere Order",
        Customer_Name: addr.fullName,
        Customer_Email: addr.email,
        Customer_Phone: addr.phone,
        Shipping_Address: `${addr.address1}, ${addr.city}${addr.state ? ", " + addr.state : ""} ${addr.postal}, ${addr.country}`,
        Payment_Method: payment === "cod" ? "Cash on Delivery" : "Credit / Debit Card",
        Order_Items: buildOrderItems(),
        Subtotal: `$${t.subtotal.toFixed(2)}`,
        Discount: t.discount > 0 ? `-$${t.discount.toFixed(2)}` : "$0.00",
        Shipping: t.shipping === 0 ? "Free" : `$${t.shipping.toFixed(2)}`,
        Tax: `$${t.tax.toFixed(2)}`,
        Total_Amount: `$${t.total.toFixed(2)}`,
        Coupon_Code: couponCode || "None",
        Order_Time: new Date().toLocaleString(),
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Failed");

      clear();
      nav({ to: "/order-success" });
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const steps = [
    { key: "shipping" as const, label: "Shipping", icon: Truck },
    { key: "payment" as const, label: "Payment", icon: CreditCard },
    { key: "review" as const, label: "Review", icon: Check },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
        {/* Back + step indicator */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/cart" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to bag
          </Link>
          <div className="flex items-center gap-3">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2.5">
                <button
                  onClick={() => { if (i < currentIdx) setStep(s.key); }}
                  className={`w-9 h-9 rounded-full grid place-items-center text-xs font-semibold transition-all ${
                    i === currentIdx
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow scale-110"
                      : i < currentIdx
                        ? "bg-primary/15 text-primary cursor-pointer hover:bg-primary/25"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentIdx ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </button>
                <span className={`text-xs uppercase tracking-wider font-medium hidden sm:block ${i === currentIdx ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < 2 && <div className={`w-10 h-px mx-1 ${i < currentIdx ? "bg-gradient-to-r from-primary to-primary/30" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-[1fr_440px] gap-12">
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {/* ─── STEP: Shipping ─── */}
              {step === "shipping" && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Section title="Shipping address" icon={<Truck className="w-4 h-4" />}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Full name *" value={addr.fullName} onChange={(v) => setAddr({ ...addr, fullName: v })} required />
                      <Field label="Email *" type="email" value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} required />
                      <Field label="Phone *" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v })} required />
                      <Field label="Country" value={addr.country} onChange={(v) => setAddr({ ...addr, country: v })} />
                      <div className="md:col-span-2">
                        <Field label="Street address *" value={addr.address1} onChange={(v) => setAddr({ ...addr, address1: v })} required />
                      </div>
                      <Field label="City *" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} required />
                      <Field label="State / Region" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
                      <Field label="Postal code *" value={addr.postal} onChange={(v) => setAddr({ ...addr, postal: v })} required />
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                      <Button onClick={() => shippingValid ? setStep("payment") : toast.error("Please fill all required fields")} className="rounded-full px-10 btn-primary w-full sm:w-auto">
                        Continue to payment
                      </Button>
                    </div>
                  </Section>
                </motion.div>
              )}

              {/* ─── STEP: Payment ─── */}
              {step === "payment" && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Section title="Payment method" icon={<CreditCard className="w-4 h-4" />}>
                    <div className="grid gap-3">
                      {[
                        { id: "cod" as const, label: "Cash on delivery", desc: "Pay when your parcel arrives" },
                        { id: "card" as const, label: "Credit / debit card", desc: "Pay securely online" },
                      ].map((m) => (
                        <button key={m.id} onClick={() => setPayment(m.id)}
                          className={`text-left rounded-2xl border p-6 transition-all duration-400 ${
                            payment === m.id ? "border-primary/30 bg-primary/5 shadow-soft" : "hover:border-foreground/15 hover:bg-muted/30"
                          }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{m.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                            </div>
                            <AnimatePresence>
                              {payment === m.id && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-glow">
                                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
                      <Button variant="outline" onClick={() => setStep("shipping")} className="rounded-full px-8 order-2 sm:order-1">Back</Button>
                      <Button onClick={() => setStep("review")} className="rounded-full px-10 btn-primary w-full sm:w-auto order-1 sm:order-2">Review order</Button>
                    </div>
                  </Section>
                </motion.div>
              )}

              {/* ─── STEP: Review ─── */}
              {step === "review" && (
                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Section title="Review your order" icon={<Check className="w-4 h-4" />}>
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-muted/30 p-5">
                        <p className="section-label mb-2">Shipping to</p>
                        <p className="text-sm font-medium">{addr.fullName}</p>
                        <p className="text-sm text-muted-foreground">{addr.address1}</p>
                        <p className="text-sm text-muted-foreground">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.postal}</p>
                        <p className="text-sm text-muted-foreground">{addr.country}</p>
                        <p className="text-sm text-muted-foreground mt-1">{addr.email} · {addr.phone}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/30 p-5">
                        <p className="section-label mb-2">Payment</p>
                        <p className="text-sm font-medium">{payment === "cod" ? "Cash on Delivery" : "Credit / Debit Card"}</p>
                      </div>
                      <div className="space-y-3">
                        <p className="section-label">Items</p>
                        {items.map((i) => (
                          <div key={i.id} className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-blush-soft shrink-0">
                              <img src={productImage(i.image_key, i.category_slug)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{i.name}</p>
                              <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                            </div>
                            <p className="text-sm tabular-nums font-medium">${(i.price * i.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
                      <Button variant="outline" onClick={() => setStep("payment")} className="rounded-full px-8 order-2 sm:order-1">Back</Button>
                      <Button onClick={placeOrder} disabled={placing} className="rounded-full px-10 btn-primary w-full sm:w-auto order-1 sm:order-2">
                        {placing ? "Placing order..." : `Place order — $${t.total.toFixed(2)}`}
                      </Button>
                    </div>
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /><span>Secure checkout</span></div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-green-600" /><span>SSL encrypted</span></div>
            </div>
          </div>

          {/* ─── Order summary sidebar ─── */}
          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:sticky lg:top-24 h-fit rounded-[2rem] glass-card p-7 space-y-6">
            <h2 className="font-display text-xl">Order summary</h2>
            <div className="space-y-3 max-h-80 overflow-auto pr-2">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-blush-soft shrink-0">
                    <img src={productImage(i.image_key, i.category_slug)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                  </div>
                  <p className="text-sm tabular-nums font-medium">${(i.price * i.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border/50 pt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={`$${t.subtotal.toFixed(2)}`} />
              {t.discount > 0 && <Row label="Discount" value={`-$${t.discount.toFixed(2)}`} highlight />}
              <Row label="Shipping" value={t.shipping === 0 ? "Free" : `$${t.shipping.toFixed(2)}`} highlight={t.shipping === 0} />
              <Row label="Tax" value={`$${t.tax.toFixed(2)}`} />
            </div>
            <div className="border-t border-border/50 pt-4 flex justify-between font-display text-xl">
              <span>Total</span>
              <span>${t.total.toFixed(2)}</span>
            </div>
          </motion.aside>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl flex items-center gap-2.5">{icon}{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
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
