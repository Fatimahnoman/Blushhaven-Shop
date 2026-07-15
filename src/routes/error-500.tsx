import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, RefreshCw, Mail } from "lucide-react";

export const Route = createFileRoute("/error-500")({
  component: Error500Page,
});

function Error500Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 25, -25, 0],
            y: [0, -25, 25, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mx-auto mb-6 w-24 h-24 rounded-full border-2 border-dashed border-red-500/40 flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-12 h-12 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M13.5 10.5L9.75 14.25" strokeLinecap="round" />
            <path d="M10.5 10.5L14.25 14.25" strokeLinecap="round" />
            <path
              d="M7.5 3.75L4.125 6.375a1.5 1.5 0 00-.625 1.219v8.25a1.5 1.5 0 00.625 1.219L7.5 19.875"
              strokeLinecap="round"
            />
            <path
              d="M16.5 3.75L19.875 6.375a1.5 1.5 0 01.625 1.219v8.25a1.5 1.5 0 01-.625 1.219L16.5 19.875"
              strokeLinecap="round"
            />
            <path
              d="M3.375 12h5.625m0 0l-1.5-6m1.5 6l-1.5 6m6-12h5.625m0 0l-1.5-6m1.5 6l-1.5 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <motion.h1
          className="text-[10rem] font-black leading-none bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          500
        </motion.h1>

        <motion.p
          className="text-2xl font-semibold mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Something Went Wrong
        </motion.p>

        <motion.p
          className="text-muted-foreground mt-3 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          We encountered an unexpected error. Our team has been notified and is
          working to fix the issue.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-xl font-medium hover:bg-white/10 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="mailto:hello@lumiere-beauty.com"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
