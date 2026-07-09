import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { Search, ShoppingBag, Heart, User, Menu, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "New", search: { filter: "new" } },
  { to: "/shop", label: "Bestsellers", search: { filter: "best" } },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const items = useCart((s) => s.items);
  const wish = useWishlist((s) => s.ids.length);
  const { user } = useAuth();
  const admin = useIsAdmin(user?.id);
  const nav = useNavigate();
  const router = useRouter();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav({ to: "/shop", search: { q: q.trim() } as any });
  };

  return (
    <>
      <div className="w-full bg-ink text-cream text-[11px] tracking-[0.2em] uppercase py-2.5 text-center">
        Complimentary shipping on orders over $75 · Free returns
      </div>
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "glass-nav shadow-soft" : "bg-transparent"}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-4">
            <div className="flex items-center gap-6">
              <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="w-5 h-5" /></button>
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-display text-2xl tracking-tight">Lumière</span>
              </Link>
            </div>
            <nav className="hidden lg:flex items-center justify-center gap-8 text-sm">
              {NAV.map((n) => (
                <Link key={n.label} to={n.to} search={(n as any).search}
                  className="relative uppercase tracking-[0.15em] text-[11px] text-foreground/70 hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1 sm:gap-2 justify-end">
              <form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 mr-2 rounded-full bg-muted/60 px-3 py-1.5 min-w-[220px]">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search luxury beauty" maxLength={80}
                  className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground/70" />
              </form>
              <Link to="/wishlist" className="relative p-2.5 rounded-full hover:bg-accent/40 transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wish > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full grid place-items-center">{wish}</span>}
              </Link>
              <Link to={user ? "/account" : "/auth"} className="p-2.5 rounded-full hover:bg-accent/40 transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="relative p-2.5 rounded-full hover:bg-accent/40 transition-colors" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full grid place-items-center font-semibold">
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="w-[86%] max-w-sm h-full bg-background p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-2xl">Lumière</span>
                <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex flex-col gap-4">
                {NAV.map((n) => (
                  <Link key={n.label} to={n.to} search={(n as any).search} onClick={() => setOpen(false)}
                    className="text-xl font-display">{n.label}</Link>
                ))}
                <Link to="/faq" onClick={() => setOpen(false)} className="text-xl font-display">FAQ</Link>
                {admin && <Link to="/admin" onClick={() => setOpen(false)} className="text-xl font-display">Admin</Link>}
                {user ? (
                  <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.invalidate(); setOpen(false); }}>Sign out</Button>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)}><Button className="w-full">Sign in</Button></Link>
                )}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
