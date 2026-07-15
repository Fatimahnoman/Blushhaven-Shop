// SEO Utilities for Lumière Ecommerce

export type SEOData = {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
  author?: string;
};

const SITE_NAME = "Lumière";
const DEFAULT_DESCRIPTION = "Discover luxury beauty at Lumière. Premium skincare, makeup, and beauty tools handcrafted for everyday radiance.";
const DEFAULT_IMAGE = "/og-image.jpg";

export function generateSEO(data: Partial<SEOData> = {}) {
  const title = data.title ? `${data.title} | ${SITE_NAME}` : `${SITE_NAME} — Luxury Beauty & Makeup`;
  const description = data.description || DEFAULT_DESCRIPTION;
  const image = data.image || DEFAULT_IMAGE;
  const url = data.url || "";
  const type = data.type || "website";

  return {
    title,
    meta: [
      { name: "description", content: description },
      { name: "keywords", content: data.keywords?.join(", ") || "luxury beauty, skincare, makeup, lipstick, foundation, serum, Lumière" },
      { name: "author", content: data.author || "Lumière Beauty" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "robots", content: "index, follow" },
    ],
  };
}

export function generateProductSEO(product: {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  slug: string;
  rating?: number;
  review_count?: number;
}) {
  return {
    ...generateSEO({
      title: product.name,
      description: product.description?.slice(0, 160) || `Shop ${product.name} at Lumière. $${product.price.toFixed(2)}`,
      image: product.image_url,
      url: `/product/${product.slug}`,
      type: "product",
      keywords: [product.name, "beauty", "skincare", "makeup", product.slug],
    }),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.image_url,
      brand: { "@type": "Brand", name: "Lumière" },
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: product.rating ? {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.review_count,
      } : undefined,
    },
  };
}

export function generateBreadcrumbSEO(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSEO() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lumière",
    url: "https://lumiere-beauty.com",
    logo: "https://lumiere-beauty.com/logo.png",
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      "https://instagram.com/lumierebeauty",
      "https://twitter.com/lumierebeauty",
      "https://facebook.com/lumierebeauty",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@lumiere-beauty.com",
    },
  };
}
