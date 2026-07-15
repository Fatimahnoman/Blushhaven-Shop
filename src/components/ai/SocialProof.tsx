import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, TrendingUp, X } from "lucide-react";
import { productImage } from "@/lib/product-images";

type PurchasePopup = {
  id: string;
  city: string;
  product: {
    name: string;
    image: string;
  };
  timeAgo: string;
};

const CITIES = [
  "New York",
  "Los Angeles",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Dubai",
  "Toronto",
  "Berlin",
  "Mumbai",
];

const PRODUCTS = [
  { name: "Velvet Matte Lipstick", image: "lipstick" },
  { name: "Silk Foundation Primer", image: "foundation" },
  { name: "Rose Quartz Eye Palette", image: "eyeshadow" },
  { name: "Lash Volume Mascara", image: "mascara" },
  { name: "Hydra-Glow Serum", image: "serum" },
  { name: "Pro Brush Set", image: "brushes" },
  { name: "Cloud Skin Moisturizer", image: "moisturizer" },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function LiveVisitorCounter() {
  const [count, setCount] = useState(127);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return Math.max(47, Math.min(189, next));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <Eye className="w-3.5 h-3.5 text-neutral-400" />
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
        people browsing right now
      </span>
    </div>
  );
}

function PurchasePopupItem({
  popup,
  onDismiss,
}: {
  popup: PurchasePopup;
  onDismiss: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className="flex items-center gap-3 p-3 w-[320px] rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 shadow-2xl shadow-black/10 dark:shadow-black/30"
    >
      <div className="relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={productImage(popup.product.image)}
          alt={popup.product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          <ShoppingBag className="inline w-3 h-3 mr-1 -mt-0.5" />
          Recent purchase
        </p>
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          Someone in{" "}
          <span className="text-rose-500 dark:text-rose-400">{popup.city}</span>{" "}
          just bought
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {popup.product.name}
        </p>
      </div>
      <button
        onClick={() => onDismiss(popup.id)}
        className="flex-shrink-0 p-1 rounded-full text-neutral-300 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

function TrendingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold shadow-lg"
    >
      <TrendingUp className="w-3 h-3" />
      Trending
    </motion.div>
  );
}

function ViewCountBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
      <Eye className="w-3 h-3" />
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 4, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="tabular-nums"
        >
          {count} people viewing this
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function BoughtCountBadge({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
      <ShoppingBag className="w-3 h-3" />
      <span className="tabular-nums">{count} people bought this</span>
    </div>
  );
}

export function SocialProof() {
  const [popups, setPopups] = useState<PurchasePopup[]>([]);
  const [viewingCounts, setViewingCounts] = useState<Record<string, number>>({});
  const [boughtCounts] = useState<Record<string, number>>({
    lipstick: 342,
    foundation: 218,
    eyeshadow: 156,
    mascara: 289,
    serum: 412,
    brushes: 97,
    moisturizer: 264,
  });
  const dismissedRef = useRef<Set<string>>(new Set());

  const dismissPopup = useCallback((id: string) => {
    dismissedRef.current.add(id);
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => {
    function spawnPopup() {
      const product = randomFrom(PRODUCTS);
      const city = randomFrom(CITIES);
      const popup: PurchasePopup = {
        id: `purchase-${Date.now()}`,
        city,
        product: { name: product.name, image: product.image },
        timeAgo: "Just now",
      };
      setPopups((prev) => {
        const next = [popup, ...prev];
        return next.slice(0, 3);
      });

      setTimeout(() => {
        if (!dismissedRef.current.has(popup.id)) {
          setPopups((prev) => prev.filter((p) => p.id !== popup.id));
        }
      }, 5000);
    }

    const firstDelay = setTimeout(spawnPopup, 5000);

    const interval = setInterval(spawnPopup, 18000);

    return () => {
      clearTimeout(firstDelay);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function updateViewers() {
      const keys = PRODUCTS.map((p) => p.image);
      const next: Record<string, number> = {};
      keys.forEach((k) => {
        const prev = viewingCounts[k] || Math.floor(Math.random() * 40) + 10;
        const delta = Math.floor(Math.random() * 7) - 3;
        next[k] = Math.max(5, Math.min(80, prev + delta));
      });
      setViewingCounts(next);
    }
    updateViewers();
    const interval = setInterval(updateViewers, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
        <AnimatePresence>
          {popups.map((popup) => (
            <PurchasePopupItem
              key={popup.id}
              popup={popup}
              onDismiss={dismissPopup}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center py-4">
        <LiveVisitorCounter />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <TrendingBadge />
        </div>
        <ViewCountBadge count={viewingCounts["lipstick"] ?? 42} />
        <BoughtCountBadge count={boughtCounts["lipstick"] ?? 342} />
      </div>
    </>
  );
}

export { TrendingBadge, ViewCountBadge, BoughtCountBadge, LiveVisitorCounter };
