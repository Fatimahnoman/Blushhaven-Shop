import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OrderTracking } from "@/components/ai/OrderTracking";

export const Route = createFileRoute("/track-order")({ component: TrackOrderPage });

function TrackOrderPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-2 text-center">Track Your Order</h1>
        <p className="text-muted-foreground text-center mb-10">Real-time updates on your delivery</p>
        <OrderTracking
          orderId="LUM-2026-001"
          status="shipped"
          createdAt={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()}
        />
      </div>
    </AppShell>
  );
}
