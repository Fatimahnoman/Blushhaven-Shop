import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Mail, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — Lumiere" }, { name: "description", content: "Reach the Lumiere care team." }] }),
});

const WEB3FORMS_KEY = "066501e6-598b-4b8c-83da-4bf18935a738";

function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-20 grid lg:grid-cols-2 gap-14">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label">Care team</p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl lg:text-6xl">Get in touch</h1>
          <p className="mt-6 text-muted-foreground leading-relaxed text-lg">
            We&apos;re here to help — whether it&apos;s a shade match, a shipping question, or press.
          </p>
          <ul className="mt-12 space-y-5">
            {[
              { Icon: Mail, text: "fatimahnoman452@gmail.com" },
              { Icon: Phone, text: "Available upon request" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-sm">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-blush-soft grid place-items-center shrink-0 shadow-soft">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="thankyou"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-[2rem] glass-card p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 grid place-items-center mx-auto shadow-glow"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 font-display text-3xl"
                >
                  Thank you!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 text-muted-foreground"
                >
                  Your message has been sent successfully.<br />
                  We&apos;ll get back to you within 24 hours.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <button onClick={() => { setSent(false); }} className="rounded-full px-8 py-3 text-xs uppercase tracking-[0.2em] btn-primary">
                    Send another message
                  </button>
                  <Link to="/shop" className="rounded-full px-8 py-3 text-xs uppercase tracking-[0.2em] border border-border/60 hover:bg-muted transition-colors text-center">
                    Continue shopping <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="rounded-[2rem] glass-card p-9 space-y-5"
              >
                <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
                <input type="hidden" name="subject" value="New Message from Lumiere Website!" />
                <input type="hidden" name="from_name" value="Lumiere Contact Form" />

                <label className="block">
                  <span className="section-label">Name</span>
                  <input type="text" name="name" required maxLength={100} placeholder="Your name"
                    className="mt-2 w-full input-premium" />
                </label>

                <label className="block">
                  <span className="section-label">Email</span>
                  <input type="email" name="email" required maxLength={200} placeholder="you@example.com"
                    className="mt-2 w-full input-premium" />
                </label>

                <label className="block">
                  <span className="section-label">Message</span>
                  <textarea name="message" required rows={5} maxLength={1000} placeholder="How can we help?"
                    className="mt-2 w-full input-premium min-h-32 resize-none" />
                </label>

                <button type="submit" disabled={sending}
                  className="rounded-full w-full btn-primary h-13 text-xs uppercase tracking-[0.2em] font-semibold disabled:opacity-50">
                  {sending ? "Sending..." : "Send message"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppShell>
  );
}
