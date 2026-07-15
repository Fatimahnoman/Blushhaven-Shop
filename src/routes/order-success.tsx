import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight, Home, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Particles } from "@/components/Particles";

export const Route = createFileRoute("/order-success")({
  component: Success,
  head: () => ({ meta: [{ title: "Order Confirmed — Lumiere" }] }),
});

function Success() {
  return (
    <AppShell>
      <div className="relative">
        <Particles seed={123} count={25} minSize={3} maxSize={9} color="0.75 0.2 145" glowColor="0.75 0.2 145" glowIntensity={0.5} />
        <div className="relative mx-auto max-w-2xl px-6 py-28 text-center">
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mx-auto w-28 h-28"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.4, 1] }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="absolute inset-0 rounded-full bg-green-400/20"
          />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 grid place-items-center shadow-glow">
            <CheckCircle2 className="w-14 h-14 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 font-display text-3xl md:text-5xl lg:text-6xl"
        >
          Order placed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-muted-foreground text-lg leading-relaxed"
        >
          Thank you for your order. We&apos;ve received your details and will contact you shortly to confirm.
        </motion.p>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 rounded-[2rem] bg-card-gradient shadow-card p-8 space-y-5"
        >
          <div className="flex items-center gap-3 justify-center">
            <Mail className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium">A confirmation will be sent to your email</p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground text-left max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 grid place-items-center shrink-0 text-xs font-semibold text-primary">1</span>
              <p>We&apos;ll review and confirm your order within 24 hours.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 grid place-items-center shrink-0 text-xs font-semibold text-primary">2</span>
              <p>Your order will be carefully packed and shipped.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 grid place-items-center shrink-0 text-xs font-semibold text-primary">3</span>
              <p>You&apos;ll receive tracking info once it&apos;s on the way.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link to="/">
            <Button variant="outline" className="rounded-full px-8">
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button className="rounded-full px-8 btn-primary">
              Continue shopping <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
