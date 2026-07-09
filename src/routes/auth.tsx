import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { motion } from "framer-motion";

type S = { redirect?: string; mode?: "signin" | "signup" | "forgot" };
export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): S => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    mode: (s.mode === "signup" || s.mode === "forgot") ? s.mode : "signin",
  }),
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Lumière" }] }),
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectTo = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/account";

  const handleGoogle = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) { toast.error(res.error.message); setBusy(false); return; }
    if (res.redirected) return;
    nav({ to: redirectTo as any });
    setBusy(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        nav({ to: redirectTo as any });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast.success("Account created — check your email if verification is required");
        nav({ to: redirectTo as any });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Password reset email sent");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setBusy(false); }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-6 py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-4xl bg-card-gradient shadow-luxe p-10">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Join us" : "Recover"}
            </p>
            <h1 className="mt-2 font-display text-3xl">
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
            </h1>
          </div>

          <Button variant="outline" onClick={handleGoogle} disabled={busy} className="mt-8 w-full rounded-full h-11">
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.54 1 10.22 1 12s.43 3.46 1.18 4.96l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-[0.2em]">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field label="Full name" value={name} onChange={setName} />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            {mode !== "forgot" && <Field label="Password" type="password" value={password} onChange={setPassword} />}
            <Button type="submit" disabled={busy} size="lg" className="w-full rounded-full h-11 text-xs uppercase tracking-[0.2em]">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset email"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" && (<>
              <button onClick={() => setMode("forgot")} className="hover:text-primary">Forgot password?</button>
              <div className="mt-2">New here? <button onClick={() => setMode("signup")} className="text-primary underline">Create an account</button></div>
            </>)}
            {mode === "signup" && (<>Already have an account? <button onClick={() => setMode("signin")} className="text-primary underline">Sign in</button></>)}
            {mode === "forgot" && (<button onClick={() => setMode("signin")} className="text-primary underline">Back to sign in</button>)}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} maxLength={200}
        className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary transition" />
    </label>
  );
}
