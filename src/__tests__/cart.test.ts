import { describe, it, expect, beforeEach } from "vitest";
import { useCart, cartTotals } from "@/store/cart";

describe("Cart store", () => {
  beforeEach(() => {
    useCart.getState().clear();
  });

  it("adds an item to the cart", () => {
    useCart.getState().add({
      id: "1",
      slug: "test-product",
      name: "Test Product",
      brand: "Test",
      price: 29.99,
      image_key: "lipstick",
    });
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(1);
  });

  it("increments quantity for existing items", () => {
    const item = { id: "1", slug: "test", name: "Test", brand: null, price: 10, image_key: "lipstick" };
    useCart.getState().add(item);
    useCart.getState().add(item);
    expect(useCart.getState().items[0].quantity).toBe(2);
  });

  it("removes an item", () => {
    useCart.getState().add({ id: "1", slug: "a", name: "A", brand: null, price: 10, image_key: "lipstick" });
    useCart.getState().add({ id: "2", slug: "b", name: "B", brand: null, price: 20, image_key: "serum" });
    useCart.getState().remove("1");
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].id).toBe("2");
  });

  it("sets quantity with minimum of 1", () => {
    useCart.getState().add({ id: "1", slug: "a", name: "A", brand: null, price: 10, image_key: "lipstick" });
    useCart.getState().setQty("1", 0);
    expect(useCart.getState().items[0].quantity).toBe(1);
    useCart.getState().setQty("1", 5);
    expect(useCart.getState().items[0].quantity).toBe(5);
  });

  it("clears the cart", () => {
    useCart.getState().add({ id: "1", slug: "a", name: "A", brand: null, price: 10, image_key: "lipstick" });
    useCart.getState().clear();
    expect(useCart.getState().items).toHaveLength(0);
    expect(useCart.getState().couponCode).toBeNull();
  });

  it("applies and removes coupons", () => {
    useCart.getState().applyCoupon("WELCOME10", 10);
    expect(useCart.getState().couponCode).toBe("WELCOME10");
    expect(useCart.getState().couponPercent).toBe(10);
    useCart.getState().removeCoupon();
    expect(useCart.getState().couponCode).toBeNull();
  });
});

describe("cartTotals", () => {
  it("calculates subtotal correctly", () => {
    const items = [
      { id: "1", slug: "a", name: "A", brand: null, price: 25, image_key: "lipstick", quantity: 2 },
      { id: "2", slug: "b", name: "B", brand: null, price: 50, image_key: "serum", quantity: 1 },
    ];
    const t = cartTotals(items, 0);
    expect(t.subtotal).toBe(100);
  });

  it("applies discount percentage", () => {
    const items = [{ id: "1", slug: "a", name: "A", brand: null, price: 100, image_key: "lipstick", quantity: 1 }];
    const t = cartTotals(items, 20);
    expect(t.discount).toBe(20);
  });

  it("free shipping over $75", () => {
    const items = [{ id: "1", slug: "a", name: "A", brand: null, price: 80, image_key: "lipstick", quantity: 1 }];
    expect(cartTotals(items, 0).shipping).toBe(0);
  });

  it("charges $8 shipping under $75", () => {
    const items = [{ id: "1", slug: "a", name: "A", brand: null, price: 50, image_key: "lipstick", quantity: 1 }];
    expect(cartTotals(items, 0).shipping).toBe(8);
  });

  it("calculates tax at 8%", () => {
    const items = [{ id: "1", slug: "a", name: "A", brand: null, price: 100, image_key: "lipstick", quantity: 1 }];
    const t = cartTotals(items, 0);
    expect(t.tax).toBe(8);
  });

  it("returns zero totals for empty cart", () => {
    const t = cartTotals([], 0);
    expect(t.subtotal).toBe(0);
    expect(t.total).toBe(0);
  });
});
