import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Home, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/error-404")({
  component: Error404Page,
});

function Error404Page() {
  const { data: recentProducts = [] } = useQuery({
    queryKey: ["error-404-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .limit(4);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 20, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.15, 0.85, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-[10rem] font-black leading-none bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-2xl font-semibold mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page Not Found
        </motion.p>

        <motion.p
          className="text-muted-foreground mt-3 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl font-medium hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop Now
          </Link>
        </motion.div>
      </motion.div>

      {recentProducts.length > 0 && (
        <motion.div
          className="relative z-10 mt-16 w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-center text-sm text-muted-foreground mb-6">
            You might like these products
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentProducts.map((product: any) => (
              <Link
                key={product.id}
                to="/product/$slug"
                params={{ slug: product.slug || product.id }}
                className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:border-pink-500/30 transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-sm text-pink-400 font-semibold">
                    ${(product.price || 0).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
