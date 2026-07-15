import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      {/* Floating circles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/5"
          style={{ width: 100 + i * 60, height: 100 + i * 60, left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="max-w-lg text-center relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
          <h1 className="font-display text-[120px] md:text-[160px] leading-none bg-gradient-to-br from-primary via-primary/70 to-blush bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-2xl md:text-3xl mt-4">
          Page not found
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 text-muted-foreground leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a new location.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/" className="inline-flex items-center justify-center rounded-full px-8 py-3 text-xs uppercase tracking-[0.2em] btn-primary">
            Go Home
          </Link>
          <Link to="/shop" className="rounded-full border border-border/60 px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-muted transition-colors">
            Shop Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-destructive/5"
          style={{ width: 80 + i * 50, height: 80 + i * 50, right: `${5 + i * 20}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 5 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="max-w-lg text-center relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 grid place-items-center mx-auto mb-8">
            <span className="text-destructive text-3xl font-semibold">!</span>
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="font-display text-4xl md:text-5xl">
          Something went wrong
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 text-muted-foreground text-lg">
          An unexpected error occurred. Please try again in a moment.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-10 flex flex-wrap justify-center gap-4">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full px-8 py-3 text-xs uppercase tracking-[0.2em] btn-primary">
            Try again
          </button>
          <Link to="/" className="rounded-full border border-border/60 px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-muted transition-colors">
            Go Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Lumière — Luxury Beauty & Makeup" },
      { name: "description", content: "Modern luxury beauty. Discover Lumière's signature lipsticks, foundations, skincare and more, handcrafted for the ritual of everyday radiance." },
      { name: "author", content: "Lumière" },
      { property: "og:title", content: "Lumière — Luxury Beauty & Makeup" },
      { property: "og:description", content: "Modern luxury beauty. Discover Lumière's signature lipsticks, foundations, skincare and more, handcrafted for the ritual of everyday radiance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lumière — Luxury Beauty & Makeup" },
      { name: "twitter:description", content: "Modern luxury beauty. Discover Lumière's signature lipsticks, foundations, skincare and more, handcrafted for the ritual of everyday radiance." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4b5b7172-7b0c-46a3-88a2-c1dc3fd242cb/id-preview-b11a3478--61612afd-340c-45e2-abe9-e2cea71fe7dc.lovable.app-1783555927615.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4b5b7172-7b0c-46a3-88a2-c1dc3fd242cb/id-preview-b11a3478--61612afd-340c-45e2-abe9-e2cea71fe7dc.lovable.app-1783555927615.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('lumiere-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
        <HeadContent />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
