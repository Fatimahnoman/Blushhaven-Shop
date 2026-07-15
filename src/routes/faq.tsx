import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

export const Route = createFileRoute("/faq")({ component: FAQ, head: () => ({ meta: [{ title: "FAQ — Lumiere" }] }) });

const QA = [
  ["How long does shipping take?", "Standard shipping arrives in 3-5 business days. Express in 1-2. Free over $75."],
  ["What is the return policy?", "100 days, free returns. Items must be gently used and in original packaging."],
  ["Are your products cruelty-free?", "Yes, entirely. And 92% of our range is vegan."],
  ["Do you ship internationally?", "We ship to 42 countries. Duties are calculated at checkout."],
  ["How can I track my order?", "Sign in and visit your Orders page, or use the link in your confirmation email."],
  ["How do I contact support?", "Email care@lumiere.beauty or use the contact form. We respond within 24h."],
];

function FAQ() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="section-label">Help center</p>
          <h1 className="mt-4 font-display text-3xl md:text-5xl lg:text-6xl">Frequently asked</h1>
        </motion.div>
        <Accordion type="single" collapsible className="mt-14">
          {QA.map(([q, a], i) => (
            <AccordionItem key={i} value={`q${i}`} className="border-border/40">
              <AccordionTrigger className="text-left font-display text-lg py-6 hover:no-underline hover:text-primary transition-colors">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AppShell>
  );
}
