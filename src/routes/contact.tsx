import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({ component: Contact, head: () => ({ meta: [{ title: "Contact — Lumière" }, { name: "description", content: "Reach the Lumière care team." }] }) });

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(1000),
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) return toast.error(r.error.issues[0].message);
    toast.success("Thank you — we'll be in touch shortly");
    setF({ name: "", email: "", message: "" });
  };
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Care team</p>
          <h1 className="mt-2 font-display text-5xl">Get in touch</h1>
          <p className="mt-4 text-muted-foreground">We're here to help — whether it's a shade match, a shipping question, or press.</p>
          <ul className="mt-8 space-y-4">
            <li className="flex gap-3"><Mail className="w-5 h-5 text-primary" /> care@lumiere.beauty</li>
            <li className="flex gap-3"><Phone className="w-5 h-5 text-primary" /> +1 (555) 010-9010</li>
            <li className="flex gap-3"><MapPin className="w-5 h-5 text-primary" /> 24 Rue Saint-Honoré, Paris</li>
          </ul>
        </div>
        <form onSubmit={submit} className="rounded-3xl bg-card-gradient shadow-soft p-8 space-y-4">
          {[["Name","name"],["Email","email"]].map(([l, k]) => (
            <label key={k} className="block">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{l}</span>
              <input value={(f as any)[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} maxLength={200}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>
          ))}
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Message</span>
            <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={1000}
              className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm min-h-32 outline-none focus:border-primary" />
          </label>
          <Button type="submit" size="lg" className="rounded-full w-full">Send message</Button>
        </form>
      </div>
    </AppShell>
  );
}
