import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useWishlist } from "@/store/wishlist";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/wishlist")({ component: WishlistPage, head: () => ({ meta: [{ title: "Wishlist — Lumiere" }] }) });

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const { data } = useQuery({ queryKey: ["wishlist-products", ids], enabled: ids.length > 0, queryFn: async () => {
    const { data } = await supabase.from("products").select("*, categories!inner(slug)").in("id", ids);
    return ((data as any[]) ?? []).map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[];
  }});

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl">Your wishlist</h1>
        <p className="mt-3 text-muted-foreground">{ids.length} saved pieces</p>
        {ids.length === 0 ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-24 text-center max-w-md mx-auto glass-card p-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush to-blush-soft grid place-items-center mx-auto mb-8 shadow-soft">
              <Heart className="w-10 h-10 text-primary/40" />
            </div>
            <p className="text-lg text-muted-foreground">Save your favorites by tapping the heart on any product.</p>
            <Link to="/shop" className="inline-block mt-8"><button className="rounded-full btn-primary px-10 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold">Discover</button></Link>
          </motion.div>
        ) : (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {(data ?? []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
