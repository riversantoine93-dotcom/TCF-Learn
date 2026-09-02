import { describe, expect, it } from "vitest";
import { courseCardsForUser } from "../lib/courses-access";

describe("courseCardsForUser", () => {
  it("shows previews with dashboard purchase CTAs when logged out", () => {
    const cards = courseCardsForUser(false, []);
    expect(cards).toEqual([
      { slug: "turning-forward", purchased: false, primaryAction: "preview", showPurchaseCta: true },
      { slug: "thought-to-freedom", purchased: false, primaryAction: "preview", showPurchaseCta: true },
    ]);
  });

  it("shows purchased access and an unpurchased purchase CTA for a partially enrolled user", () => {
    const cards = courseCardsForUser(true, ["turning-forward"]);
    expect(cards).toEqual([
      { slug: "turning-forward", purchased: true, primaryAction: "open", showPurchaseCta: false },
      { slug: "thought-to-freedom", purchased: false, primaryAction: "preview", showPurchaseCta: true },
    ]);
  });

  it("shows both courses as purchased for a bundle user", () => {
    const cards = courseCardsForUser(true, ["turning-forward", "thought-to-freedom"]);
    expect(cards.every((card) => card.purchased && !card.showPurchaseCta)).toBe(true);
  });
});
