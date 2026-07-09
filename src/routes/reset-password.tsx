import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: Reset, head: () => ({ meta: [{ title: "Reset password — Lumière" }] }) });

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
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-4xl bg-card-gradient shadow-luxe p-10">
          <h1 className="font-display text-3xl text-center">Set a new password</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">New password</span>
              <input type="password" required minLength={8} maxLength={200} value={pw} onChange={(e) => setPw(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>
            <Button type="submit" disabled={busy} size="lg" className="w-full rounded-full h-11">{busy ? "Updating…" : "Update password"}</Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
