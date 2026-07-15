import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LoyaltyProgram } from "@/components/ai/LoyaltyProgram";

export const Route = createFileRoute("/loyalty")({ component: LoyaltyPage });

function LoyaltyPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <LoyaltyProgram />
      </div>
    </AppShell>
  );
}
