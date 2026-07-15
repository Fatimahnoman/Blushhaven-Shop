import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Lumiere` }],
  }),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cat } = useQuery({
    queryKey: ["cat", slug],
    queryFn: async () =>
      (
        await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .maybeSingle()
      ).data,
  });
  const { data: products } = useQuery({
    queryKey: ["cat-products", cat?.id],
    enabled: !!cat?.id,
    queryFn: async () => {
      const rows = (await supabase
        .from("products")
        .select("*, categories!inner(slug)")
        .eq("category_id", cat!.id)
      ).data as any[] | null;
      return rows?.map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[];
    },
  });

  return (
    <AppShell>
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-glow opacity-40" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground font-medium"
          >
            Category
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display text-3xl md:text-5xl lg:text-7xl"
          >
            {cat?.name ?? slug}
          </motion.h1>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {(products ?? []).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        {products && products.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            No products yet in this category.
          </p>
        )}
      </div>
    </AppShell>
  );
}
