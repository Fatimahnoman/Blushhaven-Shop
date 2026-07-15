import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AISkinQuiz } from "@/components/ai/AISkinQuiz";

export const Route = createFileRoute("/skin-quiz")({ component: SkinQuizPage });

function SkinQuizPage() {
  return (
    <AppShell>
      <AISkinQuiz />
    </AppShell>
  );
}
