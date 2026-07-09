import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-32 border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display text-2xl">Lumière</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Modern luxury beauty, handcrafted for the ritual of everyday radiance.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex items-center gap-2 rounded-full bg-background border p-1 pl-4 max-w-sm">
            <input placeholder="Email for 10% off" className="bg-transparent outline-none text-sm flex-1" maxLength={120} />
            <Button size="sm" type="submit" className="rounded-full">Subscribe</Button>
          </form>
        </div>
        {[
          { title: "Shop", links: [["Shop all", "/shop"], ["New arrivals", "/shop"], ["Bestsellers", "/shop"], ["Gift cards", "/shop"]] },
          { title: "Help", links: [["Contact", "/contact"], ["FAQ", "/faq"], ["Shipping & returns", "/faq"], ["Track order", "/orders"]] },
          { title: "About", links: [["Our story", "/about"], ["Sustainability", "/about"], ["Careers", "/about"], ["Press", "/about"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-sm hover:text-primary transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Lumière Beauty. All rights reserved.</p>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
            <a href="#" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
            <a href="#" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
