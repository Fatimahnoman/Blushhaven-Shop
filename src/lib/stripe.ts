// Stripe integration for Lumière Ecommerce
// In production, these would call Stripe API via server functions

export const STRIPE_CONFIG = {
  currency: "usd",
  payment_method_types: ["card"],
  shipping_rates: [
    { id: "standard", name: "Standard Shipping", amount: 0, delivery_estimate: "3-5 business days" },
    { id: "express", name: "Express Shipping", amount: 12.99, delivery_estimate: "1-2 business days" },
  ],
};

export type StripeProduct = {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  currency: string;
  metadata?: Record<string, string>;
};

export type CheckoutSession = {
  id: string;
  url: string;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number;
  currency: string;
  customer_email?: string;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
};

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
  payment_method?: string;
  metadata?: Record<string, string>;
};

export type Refund = {
  id: string;
  payment_intent: string;
  amount: number;
  reason: "duplicate" | "fraudulent" | "requested_by_customer";
  status: "pending" | "succeeded" | "failed";
};

// Create checkout session (server-side)
export async function createCheckoutSession(items: {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}[], options?: {
  customer_email?: string;
  coupon_code?: string;
  shipping_method?: string;
  success_url?: string;
  cancel_url?: string;
}): Promise<CheckoutSession> {
  // In production, this calls Stripe API
  // For now, return a mock session
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    id: `cs_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    url: options?.success_url ?? "/checkout/success",
    status: "open",
    payment_status: "unpaid",
    amount_total: total,
    currency: "usd",
    customer_email: options?.customer_email,
  };
}

// Confirm payment (server-side)
export async function confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
  return {
    id: paymentIntentId,
    amount: 0,
    currency: "usd",
    status: "succeeded",
  };
}

// Create refund
export async function createRefund(paymentIntentId: string, amount: number, reason: Refund["reason"]): Promise<Refund> {
  return {
    id: `re_${Date.now()}`,
    payment_intent: paymentIntentId,
    amount,
    reason,
    status: "succeeded",
  };
}

// Format currency
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

// Validate card number (Luhn algorithm)
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let alternate = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

// Get card brand from number
export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (/^4/.test(cleaned)) return "visa";
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "mastercard";
  if (/^3[47]/.test(cleaned)) return "amex";
  if (/^6(?:011|5)/.test(cleaned)) return "discover";
  return "unknown";
}
