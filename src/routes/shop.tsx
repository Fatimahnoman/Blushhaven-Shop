import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

type Search = { q?: string; category?: string; filter?: string; sort?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    filter: typeof s.filter === "string" ? s.filter : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
  }),
  component: Shop,
  head: () => ({ meta: [{ title: "Shop All — Lumière" }, { name: "description", content: "Explore all Lumière beauty and skincare products." }] }),
});

function Shop() {
  const search = useSearch({ from: "/shop" });
  const [sort, setSort] = useState(search.sort ?? "featured");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data, isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: async () => (await supabase.from("products").select("*")).data as Product[] | null,
  });

  const filtered = useMemo(() => {
    let out = (data ?? []).slice();
    if (search.q) out = out.filter((p) => (p.name + " " + (p.brand ?? "")).toLowerCase().includes(search.q!.toLowerCase()));
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

  return (
    <AppShell>
      <section className="bg-hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 md:py-24 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">The edit</p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-display text-5xl md:text-7xl">
            Shop {search.category ? categories?.find(c => c.slug === search.category)?.name ?? "all" : "all"}
          </motion.h1>
          <p className="mt-3 text-muted-foreground">{filtered.length} products</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12 grid lg:grid-cols-[240px_1fr] gap-10">
        <aside className="lg:sticky lg:top-24 h-fit">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Categories</h3>
          <ul className="space-y-1.5 text-sm">
            <li><a href="/shop" className={`block py-1 hover:text-primary ${!search.category ? "text-primary font-medium" : ""}`}>All products</a></li>
            {categories?.map((c) => (
              <li key={c.id}>
                <a href={`/shop?category=${c.slug}`} className={`block py-1 hover:text-primary ${search.category === c.slug ? "text-primary font-medium" : ""}`}>{c.name}</a>
              </li>
            ))}
          </ul>
        </aside>
        <div>
          <div className="flex items-center justify-between gap-4 mb-8">
            <p className="text-sm text-muted-foreground">Showing {filtered.length} results</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm bg-transparent border rounded-full px-4 py-2">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] rounded-3xl bg-muted animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No products match your search.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
