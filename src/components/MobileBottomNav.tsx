import { Link, useMatchRoute } from "@tanstack/react-router";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/hooks/useAuth";

type MobileBottomNavProps = {
  onSearchOpen: () => void;
};

const TABS = [
  { to: "/", icon: Home, label: "Home", match: { to: "/", fuzzy: true } },
  { to: "/shop", icon: Search, label: "Shop", match: { to: "/shop", fuzzy: true } },
  { to: "/wishlist", icon: Heart, label: "Wishlist", match: { to: "/wishlist" } },
  { to: "/cart", icon: ShoppingBag, label: "Bag", match: { to: "/cart" } },
] as const;

export function MobileBottomNav({ onSearchOpen }: MobileBottomNavProps) {
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { user } = useAuth();
  const matchRoute = useMatchRoute();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-nav border-t border-border/40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {TABS.map(({ to, icon: Icon, label, match }) => {
          const isActive = matchRoute(match);
          const badge =
            label === "Bag" ? count :
            label === "Wishlist" ? wishCount : 0;

          if (label === "Shop") {
            return (
              <button
                key={label}
                onClick={onSearchOpen}
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-colors relative"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-md -mt-4">
                  <Search className="w-4.5 h-4.5 text-primary-foreground" />
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-colors relative"
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1.5 bg-primary text-primary-foreground text-[8px] min-w-[14px] h-[14px] rounded-full grid place-items-center font-semibold px-0.5"
                  >
                    {badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-[9px] transition-colors ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}

        {/* Account */}
        <Link
          to="/account"
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-colors relative"
        >
          <User className={`w-5 h-5 ${matchRoute({ to: "/account" }) ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-[9px] text-muted-foreground">Account</span>
        </Link>
      </div>
    </nav>
  );
}
