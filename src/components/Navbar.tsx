import { Link, useNavigate, useRouter, useMatchRoute } from "@tanstack/react-router";
import { Search, ShoppingBag, Heart, User, Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchOverlay } from "@/components/SearchOverlay";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { NotificationBell } from "@/components/ai/SmartNotifications";

const NAV = [
  { to: "/shop" as const, label: "Shop" },
  { to: "/shop" as const, label: "New", search: { filter: "new" } },
  { to: "/shop" as const, label: "Bestsellers", search: { filter: "best" } },
  { to: "/skin-quiz" as const, label: "Skin Quiz" },
  { to: "/shade-finder" as const, label: "Shade Finder" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const wish = useWishlist((s) => s.ids.length);
  const { user } = useAuth();
  const admin = useIsAdmin(user?.id);
  const { toggle: toggleTheme, isDark } = useTheme();
  const router = useRouter();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const matchRoute = useMatchRoute();
  const cartIconControls = useAnimation();

  useEffect(() => { setMounted(true); }, []);

  const onScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 8);
    setHidden(y > 200 && y > (window as any).__lastScrollY);
    (window as any).__lastScrollY = y;
  }, []);

  useEffect(() => {
    (window as any).__lastScrollY = 0;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (count > prevCount && prevCount > 0) {
      cartIconControls.start({
        scale: [1, 1.35, 0.9, 1.15, 1],
        rotate: [0, -12, 10, -5, 0],
        transition: { duration: 0.6, ease: "easeInOut" },
      });
    }
    setPrevCount(count);
  }, [count, prevCount, cartIconControls]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* Promo bar */}
      <motion.div
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        className="w-full bg-ink text-cream text-[10px] tracking-[0.25em] uppercase py-2.5 text-center relative z-50 font-medium"
      >
        <span className="opacity-70">Complimentary shipping on orders over $75</span>
        <span className="mx-4 opacity-20">|</span>
        <span className="opacity-70">Free returns within 100 days</span>
      </motion.div>

      {/* Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? "glass-nav shadow-soft" : "bg-transparent"
        } ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 py-4">
            {/* Left: hamburger + logo */}
            <div className="flex items-center gap-7">
              <button
                className="lg:hidden p-2 -ml-2 rounded-2xl hover:bg-primary/5 transition-colors"
                onClick={() => setOpen(true)}
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center transition-all duration-400 group-hover:from-primary/25 group-hover:to-primary/10 group-hover:shadow-glow">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="font-display text-2xl tracking-tight">Lumiere</span>
              </Link>
            </div>

            {/* Center: desktop nav */}
            <nav className="hidden lg:flex items-center justify-center gap-9">
              {NAV.map((n) => {
                const isActive = n.search
                  ? matchRoute({ to: n.to, search: n.search })
                  : matchRoute({ to: n.to, fuzzy: n.to === "/shop" });
                return (
                  <Link
                    key={n.label}
                    to={n.to}
                    search={n.search as never}
                    className={`nav-link ${isActive ? "!text-foreground after:!w-full" : ""}`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: search + icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 justify-end">
              {/* Desktop search — expands on hover then opens overlay */}
              <motion.button
                onClick={() => setSearchOpen(true)}
                whileHover={{ width: "auto" }}
                className="hidden md:flex items-center gap-2.5 mr-3 rounded-full bg-muted/40 hover:bg-muted/70 border border-transparent hover:border-border/60 hover:px-5 px-3 py-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] text-sm text-muted-foreground/60 cursor-text overflow-hidden group"
              >
                <Search className="w-4 h-4 shrink-0 group-hover:text-primary transition-colors" />
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">Search luxury beauty</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-border/60 bg-background/80 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 shrink-0">
                  <span className="text-[10px]">⌘</span>K
                </kbd>
              </motion.button>

              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2.5 rounded-2xl hover:bg-primary/5 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle — hidden until mounted to prevent hydration mismatch */}
              {mounted ? (
                <motion.button
                  whileTap={{ scale: 0.85, rotate: 180 }}
                  onClick={toggleTheme}
                  className="p-2.5 rounded-2xl hover:bg-primary/5 transition-colors hidden sm:block"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <AnimatePresence mode="wait">
                    {isDark ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ) : (
                <div className="p-2.5 w-[38px] h-[38px] hidden sm:block" />
              )}

              {/* Notifications */}
              <NotificationBell />

              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-2xl hover:bg-primary/5 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wish > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[9px] w-[18px] h-[18px] rounded-full grid place-items-center font-semibold shadow-sm"
                  >
                    {wish}
                  </motion.span>
                )}
              </Link>

              <Link
                to="/account"
                className="p-2.5 rounded-2xl hover:bg-primary/5 transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart — opens drawer instead of navigating */}
              <motion.button
                animate={cartIconControls}
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-2xl hover:bg-primary/5 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0, y: 4 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[9px] w-[18px] h-[18px] rounded-full grid place-items-center font-semibold shadow-sm"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xl"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="w-[88%] max-w-sm h-full bg-background shadow-elevated flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-7 py-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-display text-xl">Lumiere</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 -mr-2 rounded-2xl hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 px-7 py-8 flex flex-col gap-1 stagger-children">
                {NAV.map((n) => {
                  const isActive = n.search
                    ? matchRoute({ to: n.to, search: n.search })
                    : matchRoute({ to: n.to, fuzzy: n.to === "/shop" });
                  return (
                    <Link
                      key={n.label}
                      to={n.to}
                      search={n.search as never}
                      onClick={() => setOpen(false)}
                      className={`py-3.5 px-4 rounded-2xl font-display text-xl transition-all duration-300 ${
                        isActive ? "bg-primary/8 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      {n.label}
                    </Link>
                  );
                })}
                <Link
                  to="/faq"
                  onClick={() => setOpen(false)}
                  className="py-3.5 px-4 rounded-2xl font-display text-xl hover:bg-muted transition-colors"
                >
                  FAQ
                </Link>
                <div className="my-2 border-t border-border/30" />
                <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">AI Tools</p>
                <Link to="/routine-builder" onClick={() => setOpen(false)} className="py-2.5 px-4 rounded-2xl text-sm hover:bg-muted transition-colors">
                  Routine Builder
                </Link>
                <Link to="/compare" onClick={() => setOpen(false)} className="py-2.5 px-4 rounded-2xl text-sm hover:bg-muted transition-colors">
                  Compare Products
                </Link>
                <Link to="/blog" onClick={() => setOpen(false)} className="py-2.5 px-4 rounded-2xl text-sm hover:bg-muted transition-colors">
                  Beauty Blog
                </Link>
                <Link to="/loyalty" onClick={() => setOpen(false)} className="py-2.5 px-4 rounded-2xl text-sm hover:bg-muted transition-colors">
                  Loyalty Program
                </Link>
                <Link to="/track-order" onClick={() => setOpen(false)} className="py-2.5 px-4 rounded-2xl text-sm hover:bg-muted transition-colors">
                  Track Order
                </Link>
                {admin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="py-3.5 px-4 rounded-2xl font-display text-xl hover:bg-muted transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </nav>

              {/* Drawer footer */}
              <div className="px-7 py-6 border-t border-border/50 space-y-4">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3.5 py-3 px-4 rounded-2xl hover:bg-muted transition-colors text-sm"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
                {user ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground truncate px-4">{user.email}</p>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.invalidate();
                        setOpen(false);
                      }}
                      className="w-full rounded-full border border-border/60 px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-muted transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link to="/account" onClick={() => setOpen(false)}>
                    <button className="w-full rounded-full btn-primary px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold">
                      My Account
                    </button>
                  </Link>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom navigation */}
      <MobileBottomNav onSearchOpen={() => setSearchOpen(true)} />
    </>
  );
}
