import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Star, Check, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard, type Product } from "@/components/ProductCard";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Lumière` }] }),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: related } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => (await supabase.from("products").select("*").eq("category_id", product!.category_id!).neq("id", product!.id).limit(4)).data as Product[] | null,
  });
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ing" | "use">("desc");
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => product ? s.ids.includes(product.id) : false);

  if (isLoading) return <AppShell><div className="mx-auto max-w-7xl px-6 py-24">Loading…</div></AppShell>;
  if (!product) return <AppShell><div className="mx-auto max-w-7xl px-6 py-24 text-center"><p>Product not found.</p><Link to="/shop" className="text-primary underline">Return to shop</Link></div></AppShell>;

  const img = productImage(product.image_url);
  const discount = product.compare_at_price ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

  const handleAdd = () => {
    add({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: Number(product.price), image_key: product.image_url ?? "lipstick" }, qty);
    toast.success(`${product.name} added to bag`);
  };
  const handleBuyNow = () => { handleAdd(); nav({ to: "/checkout" }); };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-10">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" className="hover:text-primary">Shop</Link> / <span>{product.name}</span>
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-20 grid lg:grid-cols-2 gap-12 lg:gap-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-4xl overflow-hidden bg-blush-soft aspect-square shadow-luxe">
            <img src={img} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[img, img, img, img].map((src, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-blush-soft aspect-square cursor-pointer hover:opacity-80 transition-opacity">
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {product.brand && <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{product.brand}</p>}
          <h1 className="mt-2 font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-current text-rose-gold" : "text-muted-foreground/40"}`} />)}</div>
            <span className="text-muted-foreground">{Number(product.rating).toFixed(1)} · {product.review_count} reviews</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-display">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary" />
            <span>{product.stock > 0 ? `In stock — ${product.stock} available` : "Out of stock"}</span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted"><Plus className="w-4 h-4" /></button>
            </div>
            <Button size="lg" className="flex-1 rounded-full h-12 text-xs uppercase tracking-[0.2em]" onClick={handleAdd} disabled={product.stock === 0}>
              <ShoppingBag className="w-4 h-4" /> Add to bag
            </Button>
            <button onClick={() => { toggleWish(product.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
              className={`w-12 h-12 grid place-items-center rounded-full border hover:bg-blush ${wished ? "bg-blush text-primary" : ""}`}>
              <Heart className={`w-4 h-4 ${wished ? "fill-current" : ""}`} />
            </button>
          </div>
          <Button variant="outline" size="lg" onClick={handleBuyNow} disabled={product.stock === 0} className="mt-3 w-full rounded-full h-12 text-xs uppercase tracking-[0.2em]">Buy now</Button>

          <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
            {[[Truck, "Free ship $75+"], [ShieldCheck, "100-day returns"], [Sparkles, "Free samples"]].map(([I, l]: any) => (
              <div key={l} className="rounded-2xl bg-muted/60 p-3 flex flex-col items-center text-center gap-1"><I className="w-4 h-4 text-primary" /><span>{l}</span></div>
            ))}
          </div>

          <div className="mt-10 border-t pt-8">
            <div className="flex gap-6 text-xs uppercase tracking-[0.2em]">
              {[["desc","Description"],["ing","Ingredients"],["use","How to use"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k as any)} className={`pb-2 border-b-2 transition ${tab === k ? "border-primary" : "border-transparent text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
            <div className="pt-4 text-sm text-muted-foreground leading-relaxed">
              {tab === "desc" && <p>{product.description} {product.benefits && <><br /><br /><b className="text-foreground">Benefits:</b> {product.benefits}</>}</p>}
              {tab === "ing" && <p>{product.ingredients ?? "Ingredient list unavailable."}</p>}
              {tab === "use" && <p>{product.how_to_use ?? "Apply as desired."}</p>}
            </div>
          </div>
        </motion.div>
      </div>

      {related && related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
          <h2 className="font-display text-3xl md:text-4xl mb-8">You may also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </AppShell>
  );
}
