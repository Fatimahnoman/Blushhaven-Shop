import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Check, Clock, Share2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/product-images";
import type { Product } from "@/components/ProductCard";

type TimeOfDay = "morning" | "night";

type Category = {
  id: string;
  label: string;
  time: TimeOfDay[];
  estimatedMinutes: number;
};

const CATEGORIES: Category[] = [
  { id: "cleanser", label: "Cleanser", time: ["morning", "night"], estimatedMinutes: 2 },
  { id: "toner", label: "Toner", time: ["morning", "night"], estimatedMinutes: 1 },
  { id: "serum", label: "Serum", time: ["morning", "night"], estimatedMinutes: 1 },
  { id: "moisturizer", label: "Moisturizer", time: ["morning", "night"], estimatedMinutes: 2 },
  { id: "spf", label: "SPF", time: ["morning"], estimatedMinutes: 1 },
  { id: "eye_cream", label: "Eye Cream", time: ["morning", "night"], estimatedMinutes: 1 },
  { id: "exfoliant", label: "Exfoliant", time: ["night"], estimatedMinutes: 3 },
  { id: "night_cream", label: "Night Cream", time: ["night"], estimatedMinutes: 2 },
];

type RoutineSelections = Record<string, Product | null>;

const STORAGE_KEY = "blushhaven-routine";

function loadSavedRoutine(): { morning: RoutineSelections; night: RoutineSelections } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoutine(data: { morning: RoutineSelections; night: RoutineSelections }) {
  const serializable: Record<string, Record<string, object | null>> = { morning: {}, night: {} };
  for (const key of Object.keys(data.morning)) {
    serializable.morning[key] = data.morning[key] ? { ...data.morning[key] } : null;
  }
  for (const key of Object.keys(data.night)) {
    serializable.night[key] = data.night[key] ? { ...data.night[key] } : null;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

function getTotalTime(selections: RoutineSelections): number {
  return Object.entries(selections).reduce((acc, [catId, product]) => {
    if (!product) return acc;
    const cat = CATEGORIES.find((c) => c.id === catId);
    return acc + (cat?.estimatedMinutes ?? 0);
  }, 0);
}

function buildShareText(timeOfDay: TimeOfDay, label: string, selections: RoutineSelections): string {
  const lines = [`My ${label} Routine — Blushhaven`, ""];
  let step = 1;
  for (const cat of CATEGORIES.filter((c) => c.time.includes(timeOfDay))) {
    const product = selections[cat.id];
    if (product) {
      lines.push(`${step}. ${cat.label}: ${product.name}`);
      step++;
    }
  }
  lines.push("");
  lines.push(`Total time: ~${getTotalTime(selections)} min`);
  return lines.join("\n");
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

export function RoutineBuilder() {
  const saved = loadSavedRoutine();
  const [activeTab, setActiveTab] = useState<TimeOfDay>("morning");
  const [selections, setSelections] = useState<{ morning: RoutineSelections; night: RoutineSelections }>({
    morning: saved?.morning ?? {},
    night: saved?.night ?? {},
  });
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["routine-builder-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories!inner(slug)").limit(100);
      return (data as Product[]) ?? [];
    },
  });

  const currentCategories = CATEGORIES.filter((c) => c.time.includes(activeTab));
  const currentSelections = selections[activeTab];
  const totalTime = getTotalTime(currentSelections);
  const selectedCount = Object.values(currentSelections).filter(Boolean).length;

  const productsForCategory = useCallback(
    (catId: string): Product[] => {
      return products.filter((p) => {
        const name = (p.name ?? "").toLowerCase();
        const brand = (p.brand ?? "").toLowerCase();
        const cat = catId.toLowerCase();
        return name.includes(cat) || brand.includes(cat) || p.category_id?.toLowerCase() === cat;
      }).slice(0, 3);
    },
    [products]
  );

  const selectProduct = (catId: string, product: Product) => {
    setSelections((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [catId]: prev[activeTab][catId]?.id === product.id ? null : product,
      },
    }));
  };

  const handleSave = () => {
    saveRoutine(selections);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleShare = async () => {
    const text = buildShareText(activeTab, activeTab === "morning" ? "Morning" : "Night", currentSelections);
    await navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl md:text-5xl mb-2">Routine Builder</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Craft your perfect skincare ritual — one step at a time
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex justify-center mb-10"
        >
          <div className="relative inline-flex bg-muted/30 rounded-full p-1 border border-border/30">
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-background shadow-soft"
              animate={{ left: activeTab === "morning" ? "4px" : "50%", width: "calc(50% - 4px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab("morning")}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === "morning" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Sun className="w-4 h-4" /> Morning
            </button>
            <button
              onClick={() => setActiveTab("night")}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === "night" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Moon className="w-4 h-4" /> Night
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Category Selection */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="space-y-4"
              >
                {currentCategories.map((cat) => {
                  const available = productsForCategory(cat.id);
                  const selected = currentSelections[cat.id];

                  return (
                    <motion.div
                      key={cat.id}
                      variants={itemVariants}
                      className="glass-card rounded-2xl p-5 border border-border/30 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center">
                            <span className="text-xs font-semibold text-primary">{cat.label.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{cat.label}</h3>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ~{cat.estimatedMinutes} min
                            </p>
                          </div>
                        </div>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-primary/15 grid place-items-center"
                          >
                            <Check className="w-3 h-3 text-primary" />
                          </motion.div>
                        )}
                      </div>

                      {available.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {available.map((product) => {
                            const isSelected = selected?.id === product.id;
                            return (
                              <motion.button
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => selectProduct(cat.id, product)}
                                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
                                  isSelected
                                    ? "bg-primary/10 border border-primary/30 shadow-glow"
                                    : "bg-muted/20 border border-border/20 hover:border-border/40"
                                }`}
                              >
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-blush-soft shrink-0">
                                  <img
                                   src={productImage(product.image_url, (product as any).category_slug)}
                                   alt={product.name}
                                   className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{product.brand}</p>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          {isLoading ? "Loading products..." : "No matching products found"}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Timeline Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 border border-border/30"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg">
                  {activeTab === "morning" ? "☀️ AM Routine" : "🌙 PM Routine"}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> ~{totalTime} min
                </div>
              </div>

              {selectedCount === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">Select products to build your routine</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {currentCategories
                    .filter((c) => currentSelections[c.id])
                    .map((cat, i, arr) => {
                      const product = currentSelections[cat.id]!;
                      const isLast = i === arr.length - 1;
                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="relative flex gap-3"
                        >
                          {/* Timeline connector */}
                          {!isLast && (
                            <div className="absolute left-[15px] top-[32px] w-px h-[calc(100%-8px)] bg-border/40" />
                          )}
                          {/* Step number */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 grid place-items-center shrink-0 z-10">
                            <span className="text-[10px] font-semibold text-primary">{i + 1}</span>
                          </div>
                          {/* Content */}
                          <div className="flex-1 pb-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
                              {cat.label}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-6 h-6 rounded overflow-hidden bg-blush-soft shrink-0">
                                <img
                                    src={productImage(product.image_url, (product as any).category_slug)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-5 pt-4 border-t border-border/30">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs btn-primary"
                >
                  {savedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {savedFeedback ? "Saved!" : "Save"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs border border-border/40 hover:bg-muted/40 transition-colors"
                >
                  {copiedFeedback ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedFeedback ? "Copied!" : "Share"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
