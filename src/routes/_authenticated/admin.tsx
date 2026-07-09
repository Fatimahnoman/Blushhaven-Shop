import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { Package, DollarSign, Users, ShoppingCart, Tag, Plus, Edit3, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin")({ component: Admin, head: () => ({ meta: [{ title: "Admin — Lumière" }, { name: "robots", content: "noindex" }] }) });

function Admin() {
  const { user } = useAuth();
  const admin = useIsAdmin(user?.id);
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "customers" | "coupons">("overview");

  if (!admin) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="font-display text-4xl">Admin only</h1>
          <p className="mt-3 text-muted-foreground">You don't have access to this area.</p>
          <p className="mt-6 text-sm text-muted-foreground">To become an admin, run in the database SQL editor:</p>
          <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-auto text-left">insert into public.user_roles (user_id, role)
values ('{user?.id}', 'admin');</pre>
          <Link to="/account" className="inline-block mt-6 text-primary underline">Back to account</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
            <h1 className="mt-2 font-display text-5xl">Store control</h1>
          </div>
          <div className="flex gap-1 rounded-full bg-muted p-1 text-sm">
            {(["overview", "products", "orders", "customers", "coupons"] as const).map((k) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-4 py-2 rounded-full capitalize transition ${tab === k ? "bg-background shadow-soft" : "text-muted-foreground"}`}>{k}</button>
            ))}
          </div>
        </div>
        {tab === "overview" && <Overview />}
        {tab === "products" && <ProductsPanel />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "customers" && <CustomersPanel />}
        {tab === "coupons" && <CouponsPanel />}
      </div>
    </AppShell>
  );
}

function Overview() {
  const { data: orders } = useQuery({ queryKey: ["adm-orders"], queryFn: async () => (await supabase.from("orders").select("id, total, status, created_at")).data ?? [] });
  const { data: products } = useQuery({ queryKey: ["adm-products"], queryFn: async () => (await supabase.from("products").select("id, stock")).data ?? [] });
  const { data: customers } = useQuery({ queryKey: ["adm-customers"], queryFn: async () => (await supabase.from("profiles").select("id")).data ?? [] });

  const stats = useMemo(() => {
    const revenue = orders?.reduce((s, o) => s + Number(o.total), 0) ?? 0;
    const lowStock = products?.filter((p) => p.stock < 10).length ?? 0;
    return { revenue, orders: orders?.length ?? 0, products: products?.length ?? 0, customers: customers?.length ?? 0, lowStock };
  }, [orders, products, customers]);

  const chart = useMemo(() => {
    const buckets = [...Array(14)].map((_, i) => {
      const d = subDays(new Date(), 13 - i);
      const key = format(d, "MMM d");
      const val = orders?.filter((o) => format(new Date(o.created_at), "MMM d") === key).reduce((s, o) => s + Number(o.total), 0) ?? 0;
      return { day: key, revenue: Math.round(val) };
    });
    return buckets;
  }, [orders]);

  const byStatus = useMemo(() => {
    const groups: Record<string, number> = {};
    orders?.forEach((o) => { groups[o.status] = (groups[o.status] ?? 0) + 1; });
    return Object.entries(groups).map(([status, count]) => ({ status, count }));
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<DollarSign />} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
        <StatCard icon={<ShoppingCart />} label="Orders" value={stats.orders} />
        <StatCard icon={<Package />} label="Products" value={stats.products} sub={`${stats.lowStock} low stock`} />
        <StatCard icon={<Users />} label="Customers" value={stats.customers} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card-gradient shadow-soft p-6">
          <h3 className="font-display text-xl mb-4">Revenue · 14 days</h3>
          <div className="h-64">
            <ResponsiveContainer><LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="oklch(0.55 0.11 20)" strokeWidth={2} dot={false} />
            </LineChart></ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-card-gradient shadow-soft p-6">
          <h3 className="font-display text-xl mb-4">Orders by status</h3>
          <div className="h-64">
            <ResponsiveContainer><BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="oklch(0.75 0.09 40)" radius={[6, 6, 0, 0]} />
            </BarChart></ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-3xl bg-card-gradient shadow-soft p-6">
      <div className="w-10 h-10 rounded-xl bg-blush grid place-items-center text-primary">{icon}</div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function ProductsPanel() {
  const qc = useQueryClient();
  const { data: products } = useQuery({ queryKey: ["adm-products-list"], queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data ?? [] });
  const { data: categories } = useQuery({ queryKey: ["adm-cats"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [] });
  const [edit, setEdit] = useState<any | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["adm-products-list"] }); }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="font-display text-2xl">Products</h2>
        <Button onClick={() => setEdit({})} className="rounded-full"><Plus className="w-4 h-4" /> New product</Button>
      </div>
      <div className="rounded-3xl border overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <tr>{["Product", "Price", "Stock", "Rating", ""].map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {products?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-blush-soft shrink-0"><img src={productImage(p.image_url)} className="w-full h-full object-cover" alt="" /></div>
                    <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 tabular-nums">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.rating}★ ({p.review_count})</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEdit(p)} className="p-2 hover:bg-muted rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 hover:bg-muted rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <ProductModal initial={edit} categories={categories ?? []} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); qc.invalidateQueries({ queryKey: ["adm-products-list"] }); }} />}
    </div>
  );
}

function ProductModal({ initial, categories, onClose, onSaved }: { initial: any; categories: any[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    slug: initial.slug ?? "", name: initial.name ?? "", brand: initial.brand ?? "", category_id: initial.category_id ?? categories[0]?.id ?? "",
    description: initial.description ?? "", price: initial.price ?? 0, compare_at_price: initial.compare_at_price ?? null,
    image_url: initial.image_url ?? "lipstick", stock: initial.stock ?? 10,
    is_bestseller: !!initial.is_bestseller, is_new: !!initial.is_new, is_featured: !!initial.is_featured, is_flash_sale: !!initial.is_flash_sale, is_trending: !!initial.is_trending,
  });
  const save = async () => {
    const payload = { ...f, price: Number(f.price), compare_at_price: f.compare_at_price ? Number(f.compare_at_price) : null, stock: Number(f.stock) };
    const res = initial.id
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload as any);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved"); onSaved();
  };
  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-background rounded-3xl p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between mb-4">
          <h3 className="font-display text-2xl">{initial.id ? "Edit product" : "New product"}</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <F label="Slug" v={f.slug} on={(v) => setF({ ...f, slug: v })} />
          <F label="Name" v={f.name} on={(v) => setF({ ...f, name: v })} />
          <F label="Brand" v={f.brand} on={(v) => setF({ ...f, brand: v })} />
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Category</span>
            <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })} className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <F label="Price" v={String(f.price)} on={(v) => setF({ ...f, price: v as any })} type="number" />
          <F label="Compare price" v={String(f.compare_at_price ?? "")} on={(v) => setF({ ...f, compare_at_price: (v as any) || null })} type="number" />
          <F label="Stock" v={String(f.stock)} on={(v) => setF({ ...f, stock: v as any })} type="number" />
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Image key</span>
            <select value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm">
              {["lipstick","foundation","eyeshadow","mascara","serum","brushes","moisturizer"].map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
          <div className="col-span-2">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Description</span>
              <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={2000}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm min-h-24" />
            </label>
          </div>
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-5 gap-2">
            {(["is_bestseller","is_new","is_featured","is_flash_sale","is_trending"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
                <input type="checkbox" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} />
                {k.replace("is_", "")}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
}
function F({ label, v, on, type = "text" }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} maxLength={500}
        className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}

function OrdersPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adm-orders-list"], queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [] });
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["adm-orders-list"] }); }
  };
  return (
    <div className="rounded-3xl border overflow-hidden bg-background">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.15em] text-muted-foreground">
          <tr>{["Order","Date","Total","Status"].map((h) => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
        </thead>
        <tbody>
          {data?.map((o: any) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-3 font-mono">{o.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-4 py-3">{format(new Date(o.created_at), "MMM d, yyyy")}</td>
              <td className="px-4 py-3 tabular-nums">${Number(o.total).toFixed(2)}</td>
              <td className="px-4 py-3">
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="text-sm rounded-full border bg-background px-3 py-1 capitalize">
                  {["pending","processing","shipped","delivered","cancelled"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomersPanel() {
  const { data } = useQuery({ queryKey: ["adm-customers-list"], queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [] });
  return (
    <div className="rounded-3xl border overflow-hidden bg-background">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase tracking-[0.15em] text-muted-foreground"><tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Joined</th></tr></thead>
        <tbody>
          {data?.map((p: any) => (
            <tr key={p.id} className="border-t"><td className="px-4 py-3">{p.full_name ?? "—"}</td><td className="px-4 py-3">{format(new Date(p.created_at), "MMM d, yyyy")}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CouponsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adm-coupons"], queryFn: async () => (await supabase.from("coupons").select("*")).data ?? [] });
  const [c, setC] = useState({ code: "", discount_percent: 10, description: "" });
  const add = async () => {
    if (!c.code) return;
    const { error } = await supabase.from("coupons").insert({ code: c.code.toUpperCase(), discount_percent: Number(c.discount_percent), description: c.description, active: true } as any);
    if (error) toast.error(error.message); else { toast.success("Coupon created"); setC({ code: "", discount_percent: 10, description: "" }); qc.invalidateQueries({ queryKey: ["adm-coupons"] }); }
  };
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-3xl border overflow-hidden bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-[0.15em] text-muted-foreground"><tr><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">%</th><th className="text-left px-4 py-3">Active</th></tr></thead>
          <tbody>{data?.map((k: any) => <tr key={k.id} className="border-t"><td className="px-4 py-3 font-mono">{k.code}</td><td className="px-4 py-3">{k.discount_percent}%</td><td className="px-4 py-3">{k.active ? "Yes" : "No"}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="rounded-3xl bg-card-gradient shadow-soft p-6">
        <h3 className="font-display text-xl mb-3 flex items-center gap-2"><Tag className="w-5 h-5" /> New coupon</h3>
        <F label="Code" v={c.code} on={(v) => setC({ ...c, code: v.toUpperCase() })} />
        <div className="mt-3"><F label="Discount %" v={String(c.discount_percent)} on={(v) => setC({ ...c, discount_percent: Number(v) })} type="number" /></div>
        <div className="mt-3"><F label="Description" v={c.description} on={(v) => setC({ ...c, description: v })} /></div>
        <Button className="mt-4 w-full rounded-full" onClick={add}>Create</Button>
      </div>
    </div>
  );
}
