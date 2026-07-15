import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CompareProducts } from "@/components/ai/CompareProducts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/ProductCard";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const { data: products = [] } = useQuery({
    queryKey: ["compare-all"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories!inner(slug)").limit(4);
      return ((data as any[]) ?? []).map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[];
    },
  });

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-2">Compare Products</h1>
        <p className="text-muted-foreground mb-8">See how our products stack up side by side</p>
        <CompareProducts products={products} />
      </div>
    </AppShell>
  );
}
