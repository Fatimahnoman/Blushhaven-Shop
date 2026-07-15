import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: Reset,
  head: () => ({ meta: [{ title: "Reset password — Lumiere" }] }),
});

function Reset() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/account" });
  };
  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md">
          <div className="rounded-[2rem] bg-card-gradient shadow-elevated p-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-glow opacity-30 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-blush opacity-30 blur-3xl" />
            <div className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center mx-auto mb-6 shadow-soft">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-display text-3xl">Set a new password</h1>
              <p className="mt-3 text-sm text-muted-foreground">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="section-label">New password</span>
                <input type="password" required minLength={8} maxLength={200} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-2 w-full input-premium" />
              </label>
              <Button type="submit" disabled={busy} size="lg" className="w-full rounded-full h-13 btn-primary text-xs uppercase tracking-[0.2em]">
                {busy ? "Updating..." : "Update password"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
