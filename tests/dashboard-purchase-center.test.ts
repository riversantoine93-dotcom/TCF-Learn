import { describe, expect, it } from "vitest";
import { DASHBOARD_PURCHASE_PRODUCTS } from "../lib/dashboard-purchase-products";

describe("dashboard purchase center", () => {
  it("offers both courses separately plus the bundle in one catalog", () => {
    expect(DASHBOARD_PURCHASE_PRODUCTS.map((item) => item.purchase)).toEqual([
      "turning-forward",
      "thought-to-freedom",
      "bundle",
    ]);
  });

  it("uses the existing course thumbnails as product artwork", () => {
    expect(DASHBOARD_PURCHASE_PRODUCTS[0].images).toEqual(["/course-thumbnails/turning-forward.png"]);
    expect(DASHBOARD_PURCHASE_PRODUCTS[1].images).toEqual(["/course-thumbnails/from-thought-to-freedom.png"]);
    expect(DASHBOARD_PURCHASE_PRODUCTS[2].images).toEqual([
      "/course-thumbnails/turning-forward.png",
      "/course-thumbnails/from-thought-to-freedom.png",
    ]);
  });

  it("keeps the approved prices", () => {
    expect(DASHBOARD_PURCHASE_PRODUCTS.map((item) => item.amountCents)).toEqual([9700, 9700, 14550]);
  });
});
