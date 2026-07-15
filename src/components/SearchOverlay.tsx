import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { productImage } from "@/lib/product-images";
import type { Product } from "@/components/ProductCard";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

const TRENDING = [
  { label: "Bestsellers", tag: "bestseller" },
  { label: "New arrivals", tag: "new" },
  { label: "Under $50", tag: "sale" },
  { label: "Gift sets", tag: "gift" },
];

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const stored = localStorage.getItem("lumiere-recent-searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const saveRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("lumiere-recent-searches", JSON.stringify(updated));
  };

  const searchProducts = useCallback(async (term: string) => {
    if (!term.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${term}%,brand.ilike.%${term}%`)
        .limit(6);
      setResults((data as Product[]) ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(value), 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecent(query);
      onClose();
    }
  };

  const handleResultClick = (slug: string) => {
    saveRecent(query);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -20, scaleY: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-[60] origin-top"
          >
            <div className="max-w-2xl mx-auto px-4 pt-4">
              <div className="bg-background rounded-3xl shadow-elevated overflow-hidden border border-border/30">
                {/* Search input */}
                <form onSubmit={handleSubmit} className="flex items-center gap-3 px-7 py-5 border-b border-border/30">
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground shrink-0 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Search products, brands..."
                    className="flex-1 bg-transparent outline-none text-lg font-display placeholder:text-muted-foreground/50"
                  />
                  {query && (
                    <button type="button" onClick={() => { setQuery(""); setResults([]); }} className="p-1 rounded-lg hover:bg-muted transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    Esc
                  </button>
                </form>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto px-7 py-5 space-y-6">
                  {/* Live search results from DB */}
                  {query.trim() && (
                    <div>
                      {loading ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> Searching...
                        </div>
                      ) : results.length > 0 ? (
                        <>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium mb-3 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Products
                          </p>
                          <div className="space-y-1">
                            {results.map((p) => (
                              <Link
                                key={p.id}
                                to="/product/$slug"
                                params={{ slug: p.slug }}
                                onClick={() => handleResultClick(p.slug)}
                                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/60 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-blush-soft shrink-0">
                                  <img src={productImage(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-display truncate group-hover:text-primary transition-colors">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)}</p>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                              </Link>
                            ))}
                          </div>
                          <Link
                            to="/shop"
                            search={{ q: query.trim() }}
                            onClick={() => { saveRecent(query); onClose(); }}
                            className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/40 text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                          >
                            View all results for "{query.trim()}"
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm">No results for "{query}"</p>
                          <p className="text-xs text-muted-foreground/50 mt-1">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent searches */}
                  {!query && recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Recent
                        </p>
                        <button
                          onClick={() => { setRecentSearches([]); localStorage.removeItem("lumiere-recent-searches"); }}
                          className="text-[10px] text-muted-foreground/50 hover:text-foreground uppercase tracking-wider transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => { setQuery(term); searchProducts(term); }}
                            className="px-3.5 py-2 rounded-full border border-border/50 text-xs hover:border-primary/40 hover:text-primary transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  {!query && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {TRENDING.map((t) => (
                          <Link
                            key={t.tag}
                            to="/shop"
                            search={{ sort: t.tag === "sale" ? "price-asc" : undefined, q: t.tag === "gift" ? "gift" : undefined }}
                            onClick={onClose}
                            className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors group"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            <span className="text-xs font-medium">{t.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
