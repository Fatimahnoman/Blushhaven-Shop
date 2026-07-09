import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useWishlist } from "@/store/wishlist";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage, head: () => ({ meta: [{ title: "Wishlist — Lumière" }] }) });

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const { data } = useQuery({
    queryKey: ["wishlist-products", ids],
    enabled: ids.length > 0,
    queryFn: async () => (await supabase.from("products").select("*").in("id", ids)).data as Product[],
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <h1 className="font-display text-5xl">Your wishlist</h1>
        <p className="mt-2 text-muted-foreground">{ids.length} saved pieces</p>
        {ids.length === 0 ? (
          <div className="mt-16 text-center max-w-md mx-auto">
            <Heart className="w-14 h-14 mx-auto text-muted-foreground/40" />
            <p className="mt-4 text-muted-foreground">Save your favorites by tapping the heart on any product.</p>
            <Link to="/shop" className="inline-block mt-6"><Button size="lg" className="rounded-full px-8">Discover</Button></Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {(data ?? []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
