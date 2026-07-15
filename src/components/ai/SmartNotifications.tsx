import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ShoppingBag, Heart, Tag, Package, Sparkles, Star, Check, Trash2, X,
} from "lucide-react";

type NotificationType = "cart" | "wishlist" | "promo" | "order" | "restock" | "review";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

const TYPE_CONFIG: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  cart: { icon: <ShoppingBag className="w-4 h-4" />, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  wishlist: { icon: <Heart className="w-4 h-4" />, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-900/30" },
  promo: { icon: <Tag className="w-4 h-4" />, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  order: { icon: <Package className="w-4 h-4" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  restock: { icon: <Sparkles className="w-4 h-4" />, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  review: { icon: <Star className="w-4 h-4" />, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
};

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "cart", title: "Don't forget your cart!", description: "You left 3 items in your cart. Complete your purchase before they sell out.", timestamp: "5 min ago", read: false },
  { id: "2", type: "wishlist", title: "Price drop on your wishlist!", description: "Velvet Matte Lipstick is now 25% off — down from $34 to $25.50.", timestamp: "12 min ago", read: false },
  { id: "3", type: "promo", title: "Flash Sale: 40% Off Skincare", description: "Use code GLOW40 at checkout. Ends tonight at midnight!", timestamp: "1 hour ago", read: false },
  { id: "4", type: "order", title: "Your order has shipped!", description: "Order #BH-2847 is on its way. Track your package for live updates.", timestamp: "2 hours ago", read: true },
  { id: "5", type: "restock", title: "Back in stock!", description: "Hydra-Glow Serum is available again. Grab yours before it sells out.", timestamp: "3 hours ago", read: true },
  { id: "6", type: "review", title: "How did we do?", description: "Rate your recent purchase of Vitamin C Brightening Cream and earn 50 points.", timestamp: "5 hours ago", read: true },
  { id: "7", type: "promo", title: "Free gift with purchase", description: "Spend $60+ and receive a deluxe sample set. Automatically added at checkout.", timestamp: "Yesterday", read: true },
  { id: "8", type: "cart", title: "Almost gone!", description: "The Rose Quartz Face Roller in your cart has only 2 left in stock.", timestamp: "Yesterday", read: true },
];

function NotificationItem({ notification, index, onRead }: { notification: Notification; index: number; onRead: (id: string) => void }) {
  const config = TYPE_CONFIG[notification.type];
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => onRead(notification.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
        notification.read
          ? "hover:bg-muted/40"
          : "bg-primary/5 hover:bg-primary/8"
      }`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground line-clamp-1">{notification.title}</p>
          {!notification.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{notification.timestamp}</p>
      </div>
    </motion.button>
  );
}

/* ─── Bell + Dropdown Panel (used in Navbar) ─── */
export function NotificationBell() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative hidden sm:block">
      {/* Bell button */}
      <button
        ref={bellRef}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-2xl hover:bg-primary/5 transition-colors"
        aria-label="Notifications"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
        >
          <Bell className="w-5 h-5" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[9px] w-[18px] h-[18px] rounded-full grid place-items-center font-semibold shadow-sm"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[380px] max-h-[520px] rounded-2xl bg-background/95 backdrop-blur-2xl border border-border/40 shadow-elevated overflow-hidden z-[70]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-display font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors">
                    <Check className="w-3 h-3" /> Mark all
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/5 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto max-h-[420px] p-2 space-y-0.5">
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <NotificationItem key={n.id} notification={n} index={i} onRead={markAsRead} />
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                    <Bell className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs mt-1">No notifications</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Toast Popups (used in AppShell) ─── */
export function NotificationToasts() {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const toastData: Omit<Notification, "id">[] = [
      { type: "promo", title: "Limited-time offer!", description: "20% off all lip products. Use code LIPS20.", timestamp: "Just now", read: false },
      { type: "restock", title: "Selling fast!", description: "Cloud Skin Moisturizer is almost sold out again.", timestamp: "Just now", read: false },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index >= toastData.length) { clearInterval(interval); return; }
      const toast: Notification = { ...toastData[index], id: `toast-${Date.now()}` };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 5000);
      index++;
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none md:bottom-6 bottom-24">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = TYPE_CONFIG[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto flex items-start gap-3 p-4 w-[calc(100vw-3rem)] max-w-[340px] rounded-2xl bg-background/95 backdrop-blur-2xl border border-border/40 shadow-elevated"
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{toast.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{toast.description}</p>
              </div>
              <button onClick={() => dismiss(toast.id)} className="flex-shrink-0 p-1 rounded-lg text-muted-foreground/40 hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
