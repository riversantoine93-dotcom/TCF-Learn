import { describe, expect, it } from "vitest";
import { purchaseAvailability } from "../lib/dashboard-purchase-ownership";

describe("purchaseAvailability", () => {
  it("keeps all products purchasable with no enrollments", () => {
    expect(purchaseAvailability([])).toEqual({
      "turning-forward": "available",
      "thought-to-freedom": "available",
      bundle: "available",
    });
  });

  it("marks an owned single course as purchased but keeps the other and bundle available", () => {
    expect(purchaseAvailability(["turning-forward"])).toEqual({
      "turning-forward": "purchased",
      "thought-to-freedom": "available",
      bundle: "available",
    });
  });

  it("marks both singles and the bundle as purchased when both courses are owned", () => {
    expect(purchaseAvailability(["turning-forward", "thought-to-freedom"])).toEqual({
      "turning-forward": "purchased",
      "thought-to-freedom": "purchased",
      bundle: "purchased",
    });
  });
});
