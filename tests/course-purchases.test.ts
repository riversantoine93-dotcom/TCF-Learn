import { describe, expect, it } from "vitest";
import { PURCHASE_OPTIONS, coursesForPurchase } from "../lib/course-purchases";

describe("course purchase options", () => {
  it("prices each standalone course at $97 and the bundle at $145.50", () => {
    expect(PURCHASE_OPTIONS["turning-forward"].amountCents).toBe(9700);
    expect(PURCHASE_OPTIONS["thought-to-freedom"].amountCents).toBe(9700);
    expect(PURCHASE_OPTIONS.bundle.amountCents).toBe(14550);
  });

  it("grants both course enrollments for the bundle", () => {
    expect(coursesForPurchase("bundle")).toEqual(["turning-forward", "thought-to-freedom"]);
  });

  it("grants only the selected course for a standalone purchase", () => {
    expect(coursesForPurchase("thought-to-freedom")).toEqual(["thought-to-freedom"]);
  });
});
