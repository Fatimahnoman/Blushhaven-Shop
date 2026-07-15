import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { productImage, ALL_IMAGES } from "@/lib/product-images";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useState, useEffect } from "react";
import {
  Heart, Minus, Plus, ShoppingBag, Star, Check, Truck, ShieldCheck, Sparkles, MessageSquare, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { ProductCard, type Product } from "@/components/ProductCard";
import { AIRecommendations, trackRecentlyViewed } from "@/components/ai/AIRecommendations";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Lumiere` }] }),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const nav = useNavigate();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*, categories!inner(slug)").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data ? { ...data, category_slug: (data as any).categories?.slug } : data;
    },
  });
  useEffect(() => { if (product?.id) trackRecentlyViewed(product.id); }, [product?.id]);
  const { data: related } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => {
      const rows = (await supabase.from("products").select("*, categories!inner(slug)").eq("category_id", product!.category_id!).neq("id", product!.id).limit(4)).data as any[] | null;
      return rows?.map((r) => ({ ...r, category_slug: r.categories?.slug })) as Product[] | null;
    },
  });
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ing" | "use">("desc");
  const [selectedImg, setSelectedImg] = useState(0);
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => product ? s.ids.includes(product.id) : false);
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: !!product?.id,
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").eq("product_id", product!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const submitReview = async () => {
    if (!user || !product) return;
    if (!reviewBody.trim()) { toast.error("Please write a review"); return; }
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id, user_id: user.id, rating: reviewRating,
      title: reviewTitle.trim() || null, body: reviewBody.trim(),
    });
    setSubmittingReview(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Review submitted");
    setReviewTitle(""); setReviewBody(""); setReviewRating(5);
    qc.invalidateQueries({ queryKey: ["reviews", product.id] });
  };

  if (isLoading) return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-14">
        <div className="aspect-square skeleton rounded-[2.5rem]" />
        <div className="space-y-5 pt-4">
          <div className="h-4 skeleton w-1/4" />
          <div className="h-12 skeleton w-3/4" />
          <div className="h-6 skeleton w-1/3" />
          <div className="h-24 skeleton w-full mt-8" />
        </div>
      </div>
    </AppShell>
  );
  if (!product) return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <p className="text-lg text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="inline-block mt-4 text-primary underline">Return to shop</Link>
      </div>
    </AppShell>
  );

  const img = productImage(product.image_url, (product as any).category_slug);
  const galleryImages = [img, ...ALL_IMAGES.filter((i) => i !== img).slice(0, 3)];
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

  const handleAdd = () => {
    add({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: Number(product.price), image_key: product.image_url ?? "lipstick", category_slug: (product as any).category_slug }, qty);
    toast.success(`${product.name} added to bag`);
  };
  const handleBuyNow = () => { handleAdd(); nav({ to: "/checkout" }); };

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8">
        <nav className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 pb-20 grid lg:grid-cols-2 gap-14 lg:gap-20">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-[2.5rem] overflow-hidden bg-blush-soft aspect-square shadow-elevated relative">
            <motion.img
              key={selectedImg}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={galleryImages[selectedImg]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className={`rounded-2xl overflow-hidden bg-blush-soft aspect-square transition-all duration-400 ${
                  selectedImg === i
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {product.brand && <p className="section-label">{product.brand}</p>}
          <h1 className="mt-3 font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex">{[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-current text-gold" : "text-muted-foreground/30"}`} />
            ))}</div>
            <span className="text-muted-foreground">{Number(product.rating).toFixed(1)} · {product.review_count} reviews</span>
          </div>
          <div className="mt-7 flex items-baseline gap-3">
            <span className="text-4xl font-display font-semibold">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-muted-foreground/50 line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                <span className="text-xs bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full px-3 py-1 font-semibold">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-7 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-6 flex items-center gap-2.5 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 grid place-items-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <span>{product.stock > 0 ? `In stock — ${product.stock} available` : "Out of stock"}</span>
          </div>

          {/* Quantity selector - full width on mobile */}
          <div className="mt-6 flex items-center justify-center sm:justify-start gap-1 rounded-full border border-border/60 p-1 w-fit mx-auto sm:mx-0">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {/* Add to bag + Wishlist */}
          <div className="mt-4 flex items-center gap-3">
            <Button size="lg" className="flex-1 rounded-full h-13 text-xs uppercase tracking-[0.2em] btn-primary" onClick={handleAdd} disabled={product.stock === 0}>
              <ShoppingBag className="w-4 h-4" /> Add to bag
            </Button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { toggleWish(product.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
              className={`w-13 h-13 shrink-0 grid place-items-center rounded-full border transition-all duration-400 ${
                wished ? "bg-blush text-primary border-primary/25 shadow-glow" : "hover:bg-blush border-border/60"
              }`}
            >
              <motion.svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-current"
              >
                <motion.path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  initial={false}
                  animate={wished ? { fill: "currentColor", pathLength: 1, opacity: 1 } : { fill: "transparent", pathLength: 0.9, opacity: 0.7 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.svg>
            </motion.button>
          </div>
          <Button variant="outline" size="lg" onClick={handleBuyNow} disabled={product.stock === 0} className="mt-4 w-full rounded-full h-13 text-xs uppercase tracking-[0.2em] hover-lift">
            Buy now
          </Button>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-xs">
            {[
              [Truck, "Free ship $75+"],
              [ShieldCheck, "100-day returns"],
              [Sparkles, "Free samples"],
            ].map(([I, l]: any) => (
              <div key={l} className="rounded-2xl bg-muted/40 p-4 flex flex-col items-center text-center gap-2">
                <I className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">{l}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-12 border-t border-border/50 pt-10">
            <div className="flex gap-8 text-[11px] uppercase tracking-[0.2em]">
              {([["desc", "Description"], ["ing", "Ingredients"], ["use", "How to use"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`pb-3 border-b-2 transition-all duration-300 font-medium ${tab === k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="pt-6 text-sm text-muted-foreground leading-relaxed">
              {tab === "desc" && <p>{product.description} {product.benefits && <><br /><br /><b className="text-foreground">Benefits:</b> {product.benefits}</>}</p>}
              {tab === "ing" && <p>{product.ingredients ?? "Ingredient list unavailable."}</p>}
              {tab === "use" && <p>{product.how_to_use ?? "Apply as desired."}</p>}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
          <h2 className="font-display text-3xl md:text-4xl mb-10">You may also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* AI Recommendations */}
      {product && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 border-t border-border/50">
          <AIRecommendations product={product as Product} />
        </section>
      )}

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-20 border-t border-border/50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-blush grid place-items-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Customer Reviews</h2>
            {reviews && <span className="text-sm text-muted-foreground">({reviews.length})</span>}
          </div>
        </div>

        {user && (
          <div className="rounded-3xl glass-card p-8 mb-10">
            <h3 className="font-display text-xl mb-5">Write a review</h3>
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setReviewRating(r)}>
                  <Star className={`w-6 h-6 transition-colors ${r <= reviewRating ? "fill-current text-gold" : "text-muted-foreground/30 hover:text-gold/50"}`} />
                </button>
              ))}
            </div>
            <input value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Title (optional)" maxLength={100} className="w-full input-premium mb-3" />
            <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="Share your experience with this product..." maxLength={1000} rows={4} className="w-full input-premium resize-none mb-4" />
            <Button onClick={submitReview} disabled={submittingReview || !reviewBody.trim()} className="rounded-full btn-primary w-full sm:w-auto">
              {submittingReview ? "Submitting..." : "Submit review"}
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-sm text-muted-foreground mb-8">
            <Link to="/account" className="text-primary underline hover:no-underline">Sign in</Link> to leave a review.
          </p>
        )}

        {reviews && reviews.length === 0 && (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-full bg-muted grid place-items-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}

        <div className="space-y-6">
          {reviews?.map((review) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-luxe p-7">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-0.5 mb-1">{[1, 2, 3, 4, 5].map((r) => (
                    <Star key={r} className={`w-3.5 h-3.5 ${r <= review.rating ? "fill-current text-gold" : "text-muted-foreground/30"}`} />
                  ))}</div>
                  {review.title && <h4 className="font-medium text-sm">{review.title}</h4>}
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM d, yyyy")}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.body}</p>
              <p className="mt-3 text-xs text-muted-foreground/70">— {(review as any).profiles?.full_name ?? "Anonymous"}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
