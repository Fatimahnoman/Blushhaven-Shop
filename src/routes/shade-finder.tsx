import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ShadeFinder } from "@/components/ai/ShadeFinder";

export const Route = createFileRoute("/shade-finder")({ component: ShadeFinderPage });

function ShadeFinderPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <ShadeFinder />
      </div>
    </AppShell>
  );
}
