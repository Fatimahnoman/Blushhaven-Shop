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

export function productImage(key: string | null | undefined): string {
  if (!key) return lipstick;
  return MAP[key] ?? lipstick;
}

export const ALL_IMAGES = [lipstick, foundation, eyeshadow, mascara, serum, brushes, moisturizer];
