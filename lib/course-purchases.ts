export type PurchaseKey = "turning-forward" | "thought-to-freedom" | "bundle";
export type EnrollableCourseSlug = "turning-forward" | "thought-to-freedom";

export const PURCHASE_OPTIONS: Record<PurchaseKey, { label: string; amountCents: number; envPriceId: string }> = {
  "turning-forward": { label: "Turning Forward", amountCents: 9700, envPriceId: "STRIPE_TURNING_FORWARD_PRICE_ID" },
  "thought-to-freedom": { label: "Thought to Freedom", amountCents: 9700, envPriceId: "STRIPE_THOUGHT_TO_FREEDOM_PRICE_ID" },
  bundle: { label: "TCF Learn Bundle — Buy One, Get One Half Off", amountCents: 14550, envPriceId: "STRIPE_TCF_LEARN_BUNDLE_PRICE_ID" },
};

const FALLBACK_PRICE_IDS: Record<PurchaseKey, string> = {
  "turning-forward": "price_1UArD3D9JGdKoOvukMYQKkjS",
  "thought-to-freedom": "price_1UBckQD9JGdKoOvujCCd9jrM",
  bundle: "price_1UBckYD9JGdKoOvuNOdGdLLQ",
};

const RETIRED_PRICE_IDS = new Set([
  "price_1Tvf7pD9JGdKoOvuktXx2rHz",
]);

export function isPurchaseKey(value: unknown): value is PurchaseKey {
  return typeof value === "string" && value in PURCHASE_OPTIONS;
}

export function coursesForPurchase(purchase: PurchaseKey): EnrollableCourseSlug[] {
  return purchase === "bundle" ? ["turning-forward", "thought-to-freedom"] : [purchase];
}

export function configuredPriceId(purchase: PurchaseKey) {
  const configured = process.env[PURCHASE_OPTIONS[purchase].envPriceId]?.trim();
  if (configured && !RETIRED_PRICE_IDS.has(configured)) return configured;
  return FALLBACK_PRICE_IDS[purchase];
}
