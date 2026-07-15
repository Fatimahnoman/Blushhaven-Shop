import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RoutineBuilder } from "@/components/ai/RoutineBuilder";

export const Route = createFileRoute("/routine-builder")({ component: RoutineBuilderPage });

function RoutineBuilderPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <RoutineBuilder />
      </div>
    </AppShell>
  );
}
