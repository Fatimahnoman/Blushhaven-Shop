import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { ProductCard, type Product } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Lumière` }] }),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: cat } = useQuery({
    queryKey: ["cat", slug],
    queryFn: async () => (await supabase.from("categories").select("*").eq("slug", slug).maybeSingle()).data,
  });
  const { data: products } = useQuery({
    queryKey: ["cat-products", cat?.id],
    enabled: !!cat?.id,
    queryFn: async () => (await supabase.from("products").select("*").eq("category_id", cat!.id)).data as Product[],
  });

  return (
    <AppShell>
      <section className="bg-hero py-20 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Category</p>
          <h1 className="mt-3 font-display text-5xl md:text-7xl">{cat?.name ?? slug}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {(products ?? []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
        {products && products.length === 0 && <p className="text-center text-muted-foreground py-20">No products yet in this category.</p>}
      </div>
    </AppShell>
  );
}
