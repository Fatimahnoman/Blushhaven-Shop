import { describe, it, expect } from "vitest";

describe("Field component", () => {
  it("exports are defined", async () => {
    const mod = await import("@/components/Field");
    expect(mod.Field).toBeDefined();
    expect(mod.TextareaField).toBeDefined();
    expect(mod.SelectField).toBeDefined();
  });
});
