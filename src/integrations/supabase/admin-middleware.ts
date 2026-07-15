import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";

/**
 * Server-side middleware that verifies the authenticated user has admin role.
 * Use on server functions that should only be callable by admins.
 *
 * Usage in a server function:
 *   export const myServerFn = createServerFn({ method: "POST" })
 *     .middleware(requireAdmin)
 *     .handler(async ({ context }) => { ... });
 */
export const requireAdmin = createMiddleware({ type: "function" }).server(
  async ({ next, context }) => {
    // First, ensure the user is authenticated via the existing middleware
    const authResult = await requireSupabaseAuth.client(() => ({} as never));
    const ctx = authResult as { supabase: any; userId: string };

    if (!ctx.userId) {
      throw new Error("Unauthorized: No user ID found");
    }

    const { data, error } = await ctx.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", ctx.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Forbidden: Admin access required");
    }

    return next({ context: ctx });
  },
);
