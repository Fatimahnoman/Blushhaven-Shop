import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";

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
  category_slug?: string | null;
};

function getCartIconRect(): DOMRect | null {
  const btn = document.querySelector('[aria-label="Open cart"]');
  return btn ? btn.getBoundingClientRect() : null;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const [imgLoaded, setImgLoaded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [flyAnim, setFlyAnim] = useState<{ from: DOMRect; to: DOMRect; img: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Fly-to-cart animation
    if (cardRef.current) {
      const fromRect = cardRef.current.getBoundingClientRect();
      const toRect = getCartIconRect();
      if (toRect) {
        setFlyAnim({
          from: fromRect,
          to: toRect,
          img: productImage(product.image_url, product.category_slug),
        });
        setTimeout(() => setFlyAnim(null), 700);
      }
    }

    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      image_key: product.image_url ?? "lipstick",
    });
    setJustAdded(true);
    toast.success(`${product.name} added to bag`, {
      style: { fontFamily: "var(--font-sans)" },
    });
    setTimeout(() => setJustAdded(false), 1500);
  }, [add, product]);

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(product.id);
    toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <>
      {/* Fly-to-cart ghost */}
      <AnimatePresence>
        {flyAnim && (
          <motion.div
            className="fixed z-[200] pointer-events-none rounded-2xl overflow-hidden shadow-elevated"
            initial={{
              left: flyAnim.from.left,
              top: flyAnim.from.top,
              width: flyAnim.from.width,
              height: flyAnim.from.height,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              left: flyAnim.to.left + flyAnim.to.width / 2 - 16,
              top: flyAnim.to.top + flyAnim.to.height / 2 - 16,
              width: 32,
              height: 32,
              opacity: 0.7,
              scale: 0.4,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <img src={flyAnim.img} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, delay: Math.min(index * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
        className="group relative"
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative"
          >
            {/* Image container */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-blush-soft">
              {/* Glare overlay */}
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: useTransform(
                    [glareX, glareY],
                    ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, oklch(1 0 0 / 0.08), transparent 60%)`
                  ),
                }}
              />

              {/* Shimmer placeholder */}
              {!imgLoaded && <div className="absolute inset-0 skeleton" />}

              <img
                src={productImage(product.image_url, product.category_slug)}
                alt={product.name}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                {product.is_flash_sale && discount > 0 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="badge-sale text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full font-semibold shadow-lg"
                  >
                    -{discount}%
                  </motion.span>
                )}
                {product.is_new && (
                  <span className="badge-new text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full font-semibold shadow-sm">
                    New
                  </span>
                )}
                {product.is_bestseller && !product.is_new && (
                  <span className="glass-elevated text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full font-medium">
                    Bestseller
                  </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="badge-stock text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full font-medium">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Wishlist button */}
              <motion.button
                onClick={handleWish}
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                className={`absolute top-4 right-4 grid place-items-center w-11 h-11 rounded-full glass-elevated backdrop-blur-xl transition-all duration-400 z-20 ${
                  wished
                    ? "bg-primary/15 text-primary border-primary/25 shadow-glow"
                    : "hover:bg-white/80 dark:hover:bg-white/10"
                }`}
                aria-label="Wishlist"
              >
                <motion.svg
                  width="18"
                  height="18"
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

              {/* Add to bag — slides up on hover */}
              <div className="absolute inset-x-4 bottom-4 translate-y-24 group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] z-20">
                <motion.button
                  onClick={handleAdd}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full h-12 rounded-full text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all duration-400 font-semibold ${
                    justAdded
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-ink/90 text-cream backdrop-blur-sm hover:bg-primary shadow-elevated"
                  }`}
                >
                  {justAdded ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      Added!
                    </motion.span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to bag
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Product info */}
            <div className="pt-4 px-1" style={{ transform: "translateZ(20px)" }}>
              {product.brand && (
                <p className="section-label text-[10px]">
                  {product.brand}
                </p>
              )}
              <h3 className="mt-1.5 font-display text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-400">
                {product.name}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-current text-gold" />
                <span className="font-medium text-foreground/80">{Number(product.rating).toFixed(1)}</span>
                <span className="opacity-30">·</span>
                <span>{product.review_count} reviews</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2.5">
                <span className="font-semibold text-lg text-foreground">${Number(product.price).toFixed(2)}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-muted-foreground/50 line-through">
                    ${Number(product.compare_at_price).toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-[10px] font-semibold text-primary tracking-wide">Save {discount}%</span>
                )}
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.article>
    </>
  );
}
