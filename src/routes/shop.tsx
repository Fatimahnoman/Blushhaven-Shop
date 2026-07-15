import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Particles } from "@/components/Particles";

type Search = { q?: string; category?: string; filter?: string; sort?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    filter: typeof s.filter === "string" ? s.filter : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
  }),
  component: Shop,
  head: () => ({
    meta: [
      { title: "Our Collection — Lumiere" },
      { name: "description", content: "Explore all Lumiere beauty and skincare products." },
    ],
  }),
});

function Shop() {
  const search = useSearch({ from: "/shop" });
  const [sort, setSort] = useState(search.sort ?? "featured");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data, isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => {
      const rows = (await supabase.from("products").select("*, categories!inner(slug)")).data as any[] | null;
      return rows?.map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[] | null;
    },
  });

  const filtered = useMemo(() => {
    let out = (data ?? []).slice();
    if (search.q)
      out = out.filter((p) =>
        (p.name + " " + (p.brand ?? "")).toLowerCase().includes(search.q!.toLowerCase())
      );
    if (search.category) {
      const cat = categories?.find((c) => c.slug === search.category);
      if (cat) out = out.filter((p: any) => p.category_id === cat.id);
    }
    if (search.filter === "new") out = out.filter((p: any) => p.is_new);
    if (search.filter === "best") out = out.filter((p: any) => p.is_bestseller);
    if (search.filter === "flash") out = out.filter((p: any) => p.is_flash_sale);
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    else if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    return out;
  }, [data, categories, search, sort]);

  const activeFilter = search.filter
    ? { new: "New Arrivals", best: "Bestsellers", flash: "Flash Sale" }[search.filter as string]
    : null;

  return (
    <AppShell>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-glow opacity-40" />
        <Particles seed={77} count={20} minSize={3} maxSize={10} />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-32 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label"
          >
            The edit
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 font-display text-3xl md:text-5xl lg:text-7xl"
          >
            {search.category
              ? categories?.find((c) => c.slug === search.category)?.name ?? "Our Collection"
              : "Our Collection"}
          </motion.h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid lg:grid-cols-[260px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-10">
          <div>
            <h3 className="section-label mb-5">Categories</h3>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/shop"
                  className={`block py-2.5 px-4 rounded-2xl text-sm transition-all duration-300 ${
                    !search.category
                      ? "bg-primary/8 text-primary font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All products
                </Link>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/shop"
                    search={{ category: c.slug }}
                    className={`block py-2.5 px-4 rounded-2xl text-sm transition-all duration-300 ${
                      search.category === c.slug
                        ? "bg-primary/8 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Active filters */}
          {activeFilter && (
            <div className="rounded-2xl bg-primary/8 p-3.5 flex items-center justify-between">
              <span className="text-sm font-medium text-primary">{activeFilter}</span>
              <Link to="/shop" className="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                <X className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          )}
        </aside>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-10">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> results
            </p>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-muted/40 border border-border/50 rounded-full px-5 py-2.5 pr-10 text-sm outline-none focus:border-primary/30 transition-colors cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] skeleton rounded-[2rem]" />
                  <div className="h-3 skeleton w-1/3" />
                  <div className="h-4 skeleton w-2/3" />
                  <div className="h-3 skeleton w-1/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28"
            >
              <div className="w-16 h-16 rounded-full bg-muted grid place-items-center mx-auto mb-6">
                <SlidersHorizontal className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <p className="text-xl font-display">No products found</p>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
                Try adjusting your filters or search terms to discover more.
              </p>
              <Link to="/shop" className="inline-block mt-6 text-sm text-primary hover:underline font-medium">
                Clear all filters
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
