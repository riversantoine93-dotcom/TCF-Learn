import type { PurchaseKey } from "./course-purchases";

export type DashboardPurchaseProduct = {
  purchase: PurchaseKey;
  title: string;
  subtitle: string;
  amountCents: number;
  displayPrice: string;
  images: string[];
  badge: string;
  description: string;
  cta: string;
};

export const DASHBOARD_PURCHASE_PRODUCTS: DashboardPurchaseProduct[] = [
  {
    purchase: "turning-forward",
    title: "Turning Forward",
    subtitle: "The Work Beyond Fear",
    amountCents: 9700,
    displayPrice: "$97",
    images: ["/course-thumbnails/turning-forward.png"],
    badge: "SINGLE COURSE",
    description: "A structured path from survival mode to clarity, discipline, purpose, and forward momentum.",
    cta: "Buy Turning Forward — $97",
  },
  {
    purchase: "thought-to-freedom",
    title: "Thought to Freedom",
    subtitle: "Correcting Criminal Thinking Errors",
    amountCents: 9700,
    displayPrice: "$97",
    images: ["/course-thumbnails/from-thought-to-freedom.png"],
    badge: "SINGLE COURSE",
    description: "Identify recurring thinking errors, challenge the thought before it becomes action, and practice responsible replacement thinking.",
    cta: "Buy Thought to Freedom — $97",
  },
  {
    purchase: "bundle",
    title: "TCF Learn Course Bundle",
    subtitle: "Buy One, Get One Half Off",
    amountCents: 14550,
    displayPrice: "$145.50",
    images: ["/course-thumbnails/turning-forward.png", "/course-thumbnails/from-thought-to-freedom.png"],
    badge: "BEST VALUE · SAVE $48.50",
    description: "Get the second course for half price. Unlock Turning Forward and Thought to Freedom together for 25% off the $194 combined price.",
    cta: "Get Both Courses — $145.50",
  },
];
