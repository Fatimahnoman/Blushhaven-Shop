import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, TrendingUp, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/ProductCard";

type ProductRow = Product & {
  category_id?: string | null;
  is_trending?: boolean;
};

const RECENTLY_VIEWED_KEY = "lumiere-recently-viewed";
const MAX_RECENT = 8;

function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(productId: string) {
  try {
    const ids = getRecentlyViewedIds().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
  } catch {}
}

function shuffleArray<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function RecommendationRow({
  icon,
  title,
  products,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  products: Product[];
  index: number;
}) {
  if (products.length === 0) return null;

  return (
    <motion.section
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center text-primary">
          {icon}
        </div>
        <h3 className="font-display text-xl md:text-2xl">{title}</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x -mx-1 px-1">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            className="min-w-[220px] max-w-[220px] snap-start"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductCard product={p} index={i} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export function AIRecommendations({ product }: { product: Product }) {
  const p = product as ProductRow;
  const categoryId = p.category_id;

  const { data: sameCategory = [] } = useQuery({
    queryKey: ["ai-rec-same-cat", categoryId],
    enabled: !!categoryId,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId!)
        .neq("id", p.id)
        .limit(8);
      return (data as Product[]) ?? [];
    },
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ["ai-rec-all"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").limit(50);
      return (data as Product[]) ?? [];
    },
  });

  const { data: trending = [] } = useQuery({
    queryKey: ["ai-rec-trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_trending", true)
        .limit(8);
      return (data as Product[]) ?? [];
    },
  });

  const recentlyViewedIds = useMemo(() => {
    return getRecentlyViewedIds().filter((id) => id !== p.id).slice(0, 6);
  }, [p.id]);

  const { data: recentProducts = [] } = useQuery({
    queryKey: ["ai-rec-recent", recentlyViewedIds.join(",")],
    enabled: recentlyViewedIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", recentlyViewedIds);
      const rows = (data as Product[]) ?? [];
      return recentlyViewedIds.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Product[];
    },
  });

  const recommendedForYou = useMemo(
    () => shuffleArray(sameCategory, 4),
    [sameCategory]
  );

  const frequentlyBoughtTogether = useMemo(
    () => shuffleArray(allProducts.filter((p) => p.id !== product.id), 2),
    [allProducts, product.id]
  );

  const similarProducts = useMemo(() => {
    return shuffleArray(
      sameCategory.filter((p) => !recommendedForYou.find((r) => r.id === p.id)),
      4
    );
  }, [sameCategory, recommendedForYou]);

  const trendingProducts = useMemo(() => shuffleArray(trending, 4), [trending]);

  return (
    <div className="space-y-14 py-10">
      <RecommendationRow
        icon={<Sparkles className="w-4 h-4" />}
        title="Recommended For You"
        products={recommendedForYou}
        index={0}
      />

      <RecommendationRow
        icon={<ShoppingBag className="w-4 h-4" />}
        title="Frequently Bought Together"
        products={frequentlyBoughtTogether}
        index={1}
      />

      <RecommendationRow
        icon={<Zap className="w-4 h-4" />}
        title="Similar Products"
        products={similarProducts}
        index={2}
      />

      <RecommendationRow
        icon={<TrendingUp className="w-4 h-4" />}
        title="Trending Now"
        products={trendingProducts}
        index={3}
      />

      <RecommendationRow
        icon={<Clock className="w-4 h-4" />}
        title="Recently Viewed"
        products={recentProducts}
        index={4}
      />
    </div>
  );
}
