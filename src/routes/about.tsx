import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { HERO } from "@/lib/product-images";
import { Sparkles, Leaf, HeartHandshake, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [{ title: "About — Lumiere" }, { name: "description", content: "The story behind Lumiere — modern luxury beauty crafted for the ritual of everyday radiance." }] }),
});

function About() {
  return (
    <AppShell>
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute inset-0 bg-glow opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-28 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-label">Our story</p>
            <h1 className="mt-5 font-display text-3xl md:text-5xl lg:text-6xl leading-tight">
              A modern ritual of <span className="gradient-text italic">radiance</span>
            </h1>
            <p className="mt-7 text-lg text-muted-foreground max-w-md leading-relaxed">
              Lumiere was born from a simple belief — that beauty is a daily ceremony. We craft objects worth keeping, formulas rooted in science, and colors that celebrate every skin.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="rounded-[2.5rem] overflow-hidden shadow-elevated">
            <img src={HERO} alt="" className="w-full h-96 object-cover" />
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-28 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { i: Sparkles, t: "Handcrafted", d: "Every formula is small-batch tested with pro artists." },
          { i: Leaf, t: "Clean & vegan", d: "Cruelty-free, without silicones or synthetic dyes." },
          { i: HeartHandshake, t: "For everyone", d: "Wide shade ranges, undertones for all skin." },
          { i: Award, t: "Editor loved", d: "Featured in Vogue, Elle, and Harper's Bazaar." },
        ].map((v, i) => (
          <motion.div key={v.t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="glass-card p-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blush to-blush-soft grid place-items-center text-primary shadow-soft">
              <v.i className="w-5 h-5" />
            </div>
            <h3 className="mt-6 font-display text-xl">{v.t}</h3>
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
          </motion.div>
        ))}
      </section>
    </AppShell>
  );
}
