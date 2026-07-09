import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck, Gift } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard, type Product } from "@/components/ProductCard";
import { HERO, productImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: Home });

function useProducts(where: (q: any) => any, key: string) {
  return useQuery({
    queryKey: ["products", key],
    queryFn: async () => {
      const q = where(supabase.from("products").select("*"));
      const { data, error } = await q;
      if (error) throw error;
      return data as Product[];
    },
  });
}

function Home() {
  const bestsellers = useProducts((q) => q.eq("is_bestseller", true).limit(8), "best");
  const newArrivals = useProducts((q) => q.eq("is_new", true).limit(4), "new");
  const flash = useProducts((q) => q.eq("is_flash_sale", true).limit(4), "flash");
  const trending = useProducts((q) => q.eq("is_trending", true).limit(8), "trending");
  const { data: categories } = useQuery({
    queryKey: ["cats-home"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order").limit(6)).data ?? [],
  });

  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-12 lg:pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] uppercase tracking-[0.2em]">
              <Sparkles className="w-3 h-3 text-primary" /> Autumn Edit 2026
            </span>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
              The ritual of<br /><span className="gradient-text italic">radiance</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Handcrafted color, skin-loving formulas, and objects worth keeping. Discover the pieces our editors are wearing now.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop"><Button size="lg" className="rounded-full px-8 h-12 text-xs uppercase tracking-[0.2em]">Shop the edit <ArrowRight className="w-4 h-4" /></Button></Link>
              <Link to="/shop" search={{ filter: "new" } as any}><Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-xs uppercase tracking-[0.2em]">New arrivals</Button></Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current text-rose-gold" />)}
              </div>
              <span>Loved by 250,000+ beauty editors and enthusiasts</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.1 }} className="relative">
            <div className="relative rounded-4xl overflow-hidden shadow-luxe">
              <img src={HERO} alt="Luxury beauty editorial" width={1600} height={1200} className="w-full h-[520px] lg:h-[640px] object-cover" />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 flex items-center gap-3 shadow-soft">
              <div className="w-12 h-12 rounded-xl bg-rose-gradient grid place-items-center text-cream"><Gift className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Free gift</p>
                <p className="text-sm font-medium">On orders over $95</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {[[Truck, "Free shipping over $75"],[ShieldCheck, "100-day returns"],[Sparkles, "Cruelty-free"],[Gift, "Complimentary samples"]].map(([Icon, label]: any) => (
            <div key={label} className="flex items-center justify-center gap-2"><Icon className="w-4 h-4 text-primary" /> {label}</div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <SectionHead eyebrow="Shop by category" title="The essentials" href="/shop" cta="View all" />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to="/category/$slug" params={{ slug: c.slug }} className="group block">
                <div className="aspect-square rounded-3xl bg-blush grid place-items-center hover-lift">
                  <span className="font-display text-lg text-center px-2 group-hover:text-primary transition-colors">{c.name}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured — Bestsellers */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <SectionHead eyebrow="Loved by all" title="Bestsellers" href="/shop" cta="Shop bestsellers" />
        <ProductGrid data={bestsellers.data} />
      </section>

      {/* Flash sale banner */}
      {flash.data && flash.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
          <div className="rounded-4xl bg-ink text-cream p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-rose-gradient opacity-40 blur-3xl" />
            <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-cream/70">48 hours only</span>
                <h2 className="mt-3 font-display text-4xl md:text-5xl">Flash Edit</h2>
                <p className="mt-3 text-cream/80 max-w-md">Up to 25% off editor favorites — while supplies last.</p>
                <Link to="/shop" search={{ filter: "flash" } as any} className="inline-block mt-6"><Button size="lg" className="rounded-full bg-cream text-ink hover:bg-cream/90 px-8">Shop the sale</Button></Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {flash.data.slice(0, 4).map((p) => (
                  <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="rounded-2xl overflow-hidden bg-blush-soft aspect-square relative group">
                    <img src={productImage(p.image_url)} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 text-cream text-xs">
                      <p className="truncate">{p.name}</p>
                      <p className="font-semibold">${Number(p.price).toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <SectionHead eyebrow="Just landed" title="New arrivals" href="/shop" cta="Shop new" />
        <ProductGrid data={newArrivals.data} />
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <SectionHead eyebrow="This week" title="Trending now" href="/shop" cta="Explore" />
        <ProductGrid data={trending.data} />
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Word of mouth</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Editor loved</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Amelia R.", role: "Beauty editor", quote: "The Velvet Rouge is the best matte lipstick I've tried in ten years of testing. Truly comfortable, truly opaque." },
            { name: "Priya K.", role: "Makeup artist", quote: "Silk Veil Foundation is my new pro-kit staple. It looks like skin, not makeup." },
            { name: "Sofia D.", role: "Skincare enthusiast", quote: "Radiance C+ gave me the glow I chase every fall. Zero irritation, real results." },
          ].map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-3xl bg-card-gradient p-8 shadow-soft">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current text-rose-gold" />)}
              </div>
              <p className="font-display text-lg leading-relaxed">"{r.quote}"</p>
              <p className="mt-6 text-sm"><b>{r.name}</b> · <span className="text-muted-foreground">{r.role}</span></p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
        <div className="rounded-4xl bg-blush p-12 md:p-16 text-center">
          <h2 className="font-display text-4xl md:text-5xl">Enter our world</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">Join for 10% off your first order and early access to new drops.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-6 max-w-md mx-auto flex items-center gap-2 rounded-full bg-background border p-1 pl-5">
            <input placeholder="Email address" maxLength={120} className="flex-1 bg-transparent outline-none text-sm py-2" />
            <Button className="rounded-full">Join</Button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href: string; cta: string }) {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">{title}</h2>
      </div>
      <Link to={href} className="text-xs uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2">
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ProductGrid({ data }: { data: Product[] | undefined }) {
  if (!data) return <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse" />)}</div>;
  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}
