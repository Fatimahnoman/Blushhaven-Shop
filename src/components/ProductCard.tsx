import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  stock: number;
  rating: number;
  review_count: number;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_flash_sale?: boolean;
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-blush-soft">
          <img
            src={productImage(product.image_url)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_flash_sale && discount > 0 && (
              <span className="text-[10px] tracking-wider uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-semibold">-{discount}%</span>
            )}
            {product.is_new && (
              <span className="text-[10px] tracking-wider uppercase glass px-2.5 py-1 rounded-full">New</span>
            )}
            {product.is_bestseller && !product.is_new && (
              <span className="text-[10px] tracking-wider uppercase glass px-2.5 py-1 rounded-full">Bestseller</span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] tracking-wider uppercase bg-ink/85 text-cream px-2.5 py-1 rounded-full">Only {product.stock} left</span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggleWish(product.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
            className={`absolute top-3 right-3 grid place-items-center w-10 h-10 rounded-full glass transition-colors ${wished ? "text-primary" : ""}`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wished ? "fill-current" : ""}`} />
          </button>
          <div className="absolute inset-x-3 bottom-3 translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <button
              onClick={(e) => {
                e.preventDefault();
                add({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: Number(product.price), image_key: product.image_url ?? "lipstick" });
                toast.success(`${product.name} added to bag`);
              }}
              className="w-full h-11 rounded-full bg-ink text-cream text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-primary transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Add to bag
            </button>
          </div>
        </div>
        <div className="pt-4 px-1">
          {product.brand && <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{product.brand}</p>}
          <h3 className="mt-1 font-display text-lg leading-tight line-clamp-1">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-current text-rose-gold" />
            <span>{Number(product.rating).toFixed(1)}</span>
            <span>·</span>
            <span>{product.review_count} reviews</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-medium">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
