import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useCallback, useState } from "react";
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck, Gift, ChevronRight, Quote, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard, type Product } from "@/components/ProductCard";
import { HERO, productImage } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Particles } from "@/components/Particles";

export const Route = createFileRoute("/")({ component: Home });

function useProducts(where: (q: any) => any, key: string) {
  return useQuery({
    queryKey: ["products", key],
    queryFn: async () => {
      const q = where(supabase.from("products").select("*, categories!inner(slug)"));
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[])?.map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[];
    },
  });
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-label"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 font-display text-4xl md:text-5xl"
        >
          {title}
        </motion.h2>
      </div>
      {href && cta && (
        <Link to={href} as={href} className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
          {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
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

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const cursorX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const cursorY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const spotlightX = useTransform(cursorX, [0, 1], [-10, 10]);
  const spotlightY = useTransform(cursorY, [0, 1], [-10, 10]);
  const glowX = useTransform(cursorX, [0, 1], [0, 100]);
  const glowY = useTransform(cursorY, [0, 1], [0, 100]);

  const handleHeroMouse = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  return (
    <AppShell>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden" onMouseMove={handleHeroMouse}>
        <div className="absolute inset-0 bg-hero" />
        <motion.div
          className="absolute inset-0 bg-mesh"
          style={{ x: spotlightX, y: spotlightY }}
        />
        <motion.div
          className="absolute inset-0 opacity-60"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([gx, gy]) => `radial-gradient(ellipse 60% 50% at ${gx}% ${gy}%, oklch(0.65 0.18 18 / 0.15), transparent 70%)`
            ),
          }}
        />
        <div className="absolute inset-0 bg-glow opacity-50" />
        <Particles />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 lg:pt-28 pb-16 md:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 rounded-full glass-elevated px-5 py-2 section-label"
            >
              <Sparkles className="w-3 h-3 text-gold" /> Autumn Edit 2026
            </motion.span>
            <h1 className="mt-8 font-display text-3xl md:text-5xl lg:text-7xl xl:text-[5.5rem] leading-[0.9] tracking-tight">
              The ritual of
              <br />
              <span className="gradient-text italic">radiance</span>
            </h1>
            <p className="mt-7 text-lg text-muted-foreground max-w-md leading-relaxed">
              Handcrafted beauty for the ceremony of everyday glow. Premium formulas, conscious ingredients, timeless elegance.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="rounded-full px-10 btn-primary h-13 text-xs uppercase tracking-[0.2em]">
                  Shop the edit
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="rounded-full px-10 h-13 text-xs uppercase tracking-[0.2em] hover-lift">
                  Our story
                </Button>
              </Link>
            </div>
            {/* Trust bar */}
            <div className="mt-12 flex flex-wrap items-center gap-3 sm:gap-8 text-xs text-muted-foreground">
              {[
                [Truck, "Free shipping $75+"],
                [ShieldCheck, "100-day returns"],
                [Gift, "Free samples"],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary/60" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero image / floating products */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative w-full max-w-[320px] mx-auto lg:max-w-none lg:w-full aspect-square">
              {/* Main image */}
              <div className="absolute inset-4 sm:inset-8 lg:inset-8 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-elevated">
                <img src={HERO} alt="Lumiere beauty" className="w-full h-full object-cover" />
              </div>
              {/* Floating card 1 - hidden on mobile */}
              <motion.div
                className="float absolute top-0 right-0 hidden lg:flex glass-elevated rounded-3xl p-4 items-center gap-3 shadow-elevated"
              >
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blush-soft">
                  <img src={productImage("lipstick")} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-medium">Velvet Rouge</p>
                  <p className="text-xs text-muted-foreground">$42.00</p>
                </div>
              </motion.div>
              {/* Floating card 2 - hidden on mobile */}
              <motion.div
                className="float-delayed absolute bottom-4 left-0 hidden lg:flex glass-elevated rounded-3xl p-4 items-center gap-3 shadow-elevated"
              >
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blush-soft">
                  <img src={productImage("serum")} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-medium">Glow Serum</p>
                  <p className="text-xs text-muted-foreground">$68.00</p>
                </div>
              </motion.div>
              {/* Floating card 3 - hidden on mobile */}
              <motion.div
                className="float-slow absolute top-1/2 -left-4 hidden lg:block glass-elevated rounded-3xl p-3 shadow-elevated"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current text-gold" />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">4.9 · 2.4k reviews</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* AI Tools */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <SectionHead eyebrow="Intelligent Beauty" title="Your Personal AI Tools" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔬", title: "Skin Quiz", desc: "Find your perfect routine", href: "/skin-quiz" },
            { icon: "🎨", title: "Shade Finder", desc: "Match your ideal shades", href: "/shade-finder" },
            { icon: "📋", title: "Routine Builder", desc: "Build AM/PM routines", href: "/routine-builder" },
            { icon: "⚖️", title: "Compare", desc: "Side-by-side comparison", href: "/compare" },
          ].map((tool, i) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={tool.href} className="block p-6 rounded-2xl bg-muted/20 border border-border/30 hover:border-primary/20 hover:bg-muted/40 transition-all group">
                <span className="text-3xl">{tool.icon}</span>
                <h3 className="mt-3 font-display text-sm font-semibold group-hover:text-primary transition-colors">{tool.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{tool.desc}</p>
                <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-16 lg:py-20">
          <SectionHead eyebrow="Browse by" title="Collections" href="/shop" cta="View all" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat: any, i: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to="/shop"
                  search={{ category: cat.slug }}
                  className="group block text-center"
                >
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-blush to-blush-soft overflow-hidden shadow-card group-hover:shadow-card-hover transition-all duration-500 flex items-center justify-center relative">
                    <span className="font-display text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-500 text-primary/30">{cat.name?.charAt(0)}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent" />
                  </div>
                  <p className="mt-3 font-display text-sm group-hover:text-primary transition-colors">{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
        <SectionHead eyebrow="Most loved" title="Bestsellers" href="/shop" cta="Shop bestsellers" />
        <ProductGrid data={bestsellers.data} />
      </section>

      {/* Flash sale banner */}
      {flash.data && flash.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="rounded-[2.5rem] overflow-hidden relative" style={{ backgroundColor: "#1e1520" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/5" />
            <Particles seed={99} count={15} minSize={2} maxSize={7} color="0.85 0.15 80" glowColor="0.85 0.15 80" glowIntensity={0.5} />
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: "#c4879e" }} />
            <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "#d4a574" }} />
            <div className="relative p-6 md:p-10 lg:p-14 grid md:grid-cols-[1fr_1fr] gap-10 items-center">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {flash.data[0] && (
                  <Link to="/product/$slug" params={{ slug: flash.data[0].slug }} className="shrink-0 w-40 h-40 md:w-52 md:h-52 rounded-3xl overflow-hidden bg-white/10 group shadow-elevated">
                    <img src={productImage(flash.data[0].image_url)} alt={flash.data[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </Link>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                    48 hours only
                  </span>
                  <h2 className="mt-3 font-display text-3xl md:text-5xl text-white">Flash Edit</h2>
                  <p className="mt-3 max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Up to 25% off editor favorites — while supplies last.
                  </p>
                  <Link to="/shop" search={{ filter: "flash" }} className="inline-block mt-6">
                    <Button size="lg" className="rounded-full bg-white text-ink hover:bg-white/90 px-9 text-xs uppercase tracking-[0.2em]">
                      Shop the sale
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {flash.data.slice(0, 4).map((p) => (
                  <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="rounded-2xl overflow-hidden aspect-square relative group bg-white/5 hover:bg-white/10 transition-colors">
                    <img src={productImage(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 text-white">
                      <p className="text-xs truncate font-medium">{p.name}</p>
                      <p className="font-semibold text-sm mt-0.5">${Number(p.price).toFixed(2)}</p>
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

      {/* Editorial banner */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
        <div className="rounded-[2.5rem] overflow-hidden relative bg-gradient-to-br from-blush via-blush-soft to-champagne p-6 md:p-12 lg:p-16 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="absolute inset-0 bg-mesh opacity-40" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <p className="section-label">The Lumiere Promise</p>
            <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight">
              Beauty that <span className="italic gradient-text">honors</span> your skin
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
              Every formula is small-batch crafted with ethically sourced ingredients. Clean, vegan, and designed for the modern ritual.
            </p>
            <Link to="/about" className="inline-block mt-8">
              <Button size="lg" className="rounded-full px-10 btn-primary h-13 text-xs uppercase tracking-[0.2em]">
                Our story <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden shadow-elevated"
          >
            <img src={HERO} alt="" className="w-full h-80 object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Trending */}
      {trending.data && trending.data.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
          <SectionHead eyebrow="Trending now" title="What's hot" href="/shop" cta="Shop trending" />
          <ProductGrid data={trending.data} />
        </section>
      )}

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-16 lg:py-20">
        <SectionHead eyebrow="What they say" title="Loved by thousands" />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Sophia M.", text: "The Velvet Rouge lipstick is absolutely divine. The formula is silky, the color payoff is incredible, and it lasts all day.", rating: 5 },
            { name: "Aria K.", text: "Finally, a beauty brand that understands luxury without compromise. The Glow Serum transformed my morning routine.", rating: 5 },
            { name: "Lena R.", text: "Beautiful packaging, clean ingredients, and products that actually perform. Lumiere is my new go-to for everything.", rating: 5 },
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-luxe p-8"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed italic">{review.text}</p>
              <div className="mt-6 flex items-center gap-1">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-current text-gold" />
                ))}
              </div>
              <p className="mt-3 text-sm font-display">{review.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </AppShell>
  );
}

function ProductGrid({ data }: { data: Product[] | undefined }) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/5] skeleton rounded-[2rem]" />
            <div className="h-3 skeleton w-1/3" />
            <div className="h-4 skeleton w-2/3" />
            <div className="h-3 skeleton w-1/4" />
          </div>
        ))}
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {data.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email });
    setLoading(false);
    if (dbError) {
      if (dbError.code === "23505") {
        setSubscribed(true);
      } else {
        setError("Something went wrong. Try again.");
      }
    } else {
      setSubscribed(true);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
      <div className="rounded-[2.5rem] bg-card-gradient shadow-card p-6 md:p-12 lg:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-glow opacity-30" />
        <div className="relative">
          <p className="section-label">Stay luminous</p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">Join the inner circle</h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Early access to new collections, exclusive offers, and beauty insights delivered to your inbox.
          </p>
          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 grid place-items-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium">Welcome to the inner circle!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row items-center gap-3 rounded-full bg-background border border-border/60 p-1.5 pl-5 max-w-lg mx-auto shadow-card">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground/50 w-full sm:w-auto"
                maxLength={120}
                disabled={loading}
              />
              <Button size="sm" type="submit" disabled={loading} className="rounded-full px-7 btn-primary w-full sm:w-auto">
                {loading ? "Joining..." : "Subscribe"}
              </Button>
            </form>
          )}
          {error && (
            <p className="mt-3 text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
