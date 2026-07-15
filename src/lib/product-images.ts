import hero from "@/assets/hero.jpg";
import lipstick from "@/assets/product-lipstick.jpg";
import foundation from "@/assets/product-foundation.jpg";
import eyeshadow from "@/assets/product-eyeshadow.jpg";
import mascara from "@/assets/product-mascara.jpg";
import serum from "@/assets/product-serum.jpg";
import brushes from "@/assets/product-brushes.jpg";
import moisturizer from "@/assets/product-moisturizer.jpg";

export const HERO = hero;

const MAP: Record<string, string> = {
  lipstick,
  foundation,
  eyeshadow,
  mascara,
  serum,
  brushes,
  moisturizer,
};

const CATEGORY_MAP: Record<string, string> = {
  "lip-color": "lipstick",
  face: "foundation",
  eye: "eyeshadow",
  skincare: "serum",
  tools: "brushes",
  fragrance: "serum",
  "bath-body": "moisturizer",
  "gift-sets": "brushes",
};

export function productImage(
  imageKey: string | null | undefined,
  categorySlug?: string | null,
): string {
  if (categorySlug) {
    const key = CATEGORY_MAP[categorySlug];
    if (key) return MAP[key] ?? lipstick;
  }
  if (!imageKey) return lipstick;
  return MAP[imageKey] ?? lipstick;
}

export const ALL_IMAGES = [
  lipstick,
  foundation,
  eyeshadow,
  mascara,
  serum,
  brushes,
  moisturizer,
];
