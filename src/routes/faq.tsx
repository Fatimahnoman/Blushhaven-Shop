import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({ component: FAQ, head: () => ({ meta: [{ title: "FAQ — Lumière" }] }) });

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
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Help center</p>
        <h1 className="mt-2 font-display text-5xl">Frequently asked</h1>
        <Accordion type="single" collapsible className="mt-10">
          {QA.map(([q, a], i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger className="text-left font-display text-lg">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AppShell>
  );
}
