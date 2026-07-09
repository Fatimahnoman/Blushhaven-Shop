import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { HERO } from "@/lib/product-images";
import { Sparkles, Leaf, HeartHandshake, Award } from "lucide-react";

export const Route = createFileRoute("/about")({ component: About, head: () => ({ meta: [{ title: "About — Lumière" }, { name: "description", content: "The story behind Lumière — modern luxury beauty crafted for the ritual of everyday radiance." }] }) });

function About() {
  return (
    <AppShell>
      <section className="bg-hero">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Our story</p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl leading-tight">A modern ritual of <span className="gradient-text italic">radiance</span></h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Lumière was born from a simple belief — that beauty is a daily ceremony. We craft objects
              worth keeping, formulas rooted in science, and colors that celebrate every skin.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-4xl overflow-hidden shadow-luxe">
            <img src={HERO} alt="" className="w-full h-96 object-cover" />
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { i: Sparkles, t: "Handcrafted", d: "Every formula is small-batch tested with pro artists." },
          { i: Leaf, t: "Clean & vegan", d: "Cruelty-free, without silicones or synthetic dyes." },
          { i: HeartHandshake, t: "For everyone", d: "Wide shade ranges, undertones for all skin." },
          { i: Award, t: "Editor loved", d: "Featured in Vogue, Elle, and Harper's Bazaar." },
        ].map((v, i) => (
          <motion.div key={v.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="rounded-3xl bg-card-gradient shadow-soft p-6">
            <div className="w-11 h-11 rounded-xl bg-blush grid place-items-center text-primary"><v.i className="w-5 h-5" /></div>
            <h3 className="mt-4 font-display text-xl">{v.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
          </motion.div>
        ))}
      </section>
    </AppShell>
  );
}
