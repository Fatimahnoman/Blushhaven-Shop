import { describe, it, expect, beforeEach } from "vitest";
import { useWishlist } from "@/store/wishlist";

describe("Wishlist store", () => {
  beforeEach(() => {
    useWishlist.getState().clear();
  });

  it("toggles item on", () => {
    useWishlist.getState().toggle("prod-1");
    expect(useWishlist.getState().ids).toContain("prod-1");
  });

  it("toggles item off", () => {
    useWishlist.getState().toggle("prod-1");
    useWishlist.getState().toggle("prod-1");
    expect(useWishlist.getState().ids).not.toContain("prod-1");
  });

  it("checks if item is in wishlist", () => {
    expect(useWishlist.getState().has("prod-1")).toBe(false);
    useWishlist.getState().toggle("prod-1");
    expect(useWishlist.getState().has("prod-1")).toBe(true);
  });

  it("clears wishlist", () => {
    useWishlist.getState().toggle("a");
    useWishlist.getState().toggle("b");
    useWishlist.getState().clear();
    expect(useWishlist.getState().ids).toHaveLength(0);
  });
});
