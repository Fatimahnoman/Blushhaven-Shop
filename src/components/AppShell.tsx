import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { AIBeautyAssistant } from "@/components/ai/AIBeautyAssistant";
import { SocialProof } from "@/components/ai/SocialProof";
import { NotificationToasts } from "@/components/ai/SmartNotifications";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1 page-enter pb-20 md:pb-0" key={pathname}>
        {children}
      </main>
      <Footer />
      <AIBeautyAssistant />
      <NotificationToasts />
      <SocialProof />
    </div>
  );
}
