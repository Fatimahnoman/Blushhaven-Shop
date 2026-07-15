// Analytics & Tracking for Lumière Ecommerce

// Google Analytics
export function initGA(measurementId: string) {
  if (typeof window === "undefined") return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push("js", new Date());
  window.dataLayer.push("config", measurementId);
}

export function trackPageView(url: string, title?: string) {
  window.dataLayer?.push({ event: "page_view", page_url: url, page_title: title });
}

export function trackAddToCart(productId: string, name: string, price: number) {
  window.dataLayer?.push({
    event: "add_to_cart",
    items: [{ item_id: productId, item_name: name, price, quantity: 1 }],
  });
}

export function trackPurchase(orderId: string, items: { name: string; price: number; quantity: number }[], total: number) {
  window.dataLayer?.push({
    event: "purchase",
    transaction_id: orderId,
    value: total,
    currency: "USD",
    items: items.map((item, i) => ({
      item_id: `item_${i}`,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

export function trackSearch(query: string, resultsCount: number) {
  window.dataLayer?.push({ event: "search", search_term: query, results_count: resultsCount });
}

export function trackViewItem(productId: string, name: string, price: number) {
  window.dataLayer?.push({
    event: "view_item",
    items: [{ item_id: productId, item_name: name, price }],
  });
}

// Microsoft Clarity
export function initClarity(projectId: string) {
  if (typeof window === "undefined") return;
  (function(c: any, l: any, a: any, r: i: any, i: any) {
    c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
    const t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    const s = l.getElementsByTagName(r)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, "clarity", "script", projectId);
}

// Facebook Pixel
export function initFBPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function trackFBAddToCart(productId: string, value: number) {
  window.fbq?.("track", "AddToCart", { content_ids: [productId], content_type: "product", value, currency: "USD" });
}

export function trackFBPurchase(value: number, orderId: string) {
  window.fbq?.("track", "Purchase", { value, currency: "USD", content_ids: [orderId] });
}

// Declare global types
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}
