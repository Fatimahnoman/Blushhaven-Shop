import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-32 relative">
      {/* Decorative gradient top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 grid place-items-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-2xl tracking-tight">Lumiere</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Modern luxury beauty, handcrafted for the ritual of everyday radiance.
            </p>
          </div>
          {[
            {
              title: "Shop",
              links: [
                ["Our Collection", "/shop"],
                ["New arrivals", "/shop?filter=new"],
                ["Bestsellers", "/shop?filter=best"],
                ["Gift cards", "/shop"],
              ],
            },
            {
              title: "Help",
              links: [
                ["Contact", "/contact"],
                ["FAQ", "/faq"],
                ["Shipping & returns", "/faq"],
                ["Track order", "/orders"],
              ],
            },
            {
              title: "About",
              links: [
                ["Our story", "/about"],
                ["Sustainability", "/about"],
                ["Careers", "/about"],
                ["Press", "/about"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="section-label mb-6">{col.title}</h4>
              <ul className="space-y-3.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="editorial-divider" />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lumiere Beauty. All rights reserved.</p>
          <div className="flex gap-7">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
