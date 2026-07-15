import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BeautyBlog } from "@/components/ai/BeautyBlog";

export const Route = createFileRoute("/blog")({ component: BlogPage });

function BlogPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <BeautyBlog />
      </div>
    </AppShell>
  );
}
