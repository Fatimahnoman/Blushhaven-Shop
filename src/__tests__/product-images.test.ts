import { describe, it, expect } from "vitest";
import { productImage, ALL_IMAGES, HERO } from "@/lib/product-images";

describe("productImage", () => {
  it("returns a fallback for null/undefined key", () => {
    expect(typeof productImage(null)).toBe("string");
    expect(typeof productImage(undefined)).toBe("string");
  });

  it("returns the mapped image for known keys", () => {
    const result = productImage("lipstick");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns fallback for unknown keys", () => {
    const fallback = productImage("nonexistent");
    const defaultImg = productImage(null);
    expect(fallback).toBe(defaultImg);
  });
});

describe("ALL_IMAGES", () => {
  it("contains at least 7 images", () => {
    expect(ALL_IMAGES.length).toBeGreaterThanOrEqual(7);
  });

  it("all entries are non-empty strings", () => {
    ALL_IMAGES.forEach((img) => {
      expect(typeof img).toBe("string");
      expect(img.length).toBeGreaterThan(0);
    });
  });
});

describe("HERO", () => {
  it("is a non-empty string", () => {
    expect(typeof HERO).toBe("string");
    expect(HERO.length).toBeGreaterThan(0);
  });
});
