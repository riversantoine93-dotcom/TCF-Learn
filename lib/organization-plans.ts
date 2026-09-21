export type OrganizationPlanKey = "org-10" | "org-50" | "org-100";
export type OrganizationSalesMode = "checkout" | "contact";

export type OrganizationPlan = {
  key: OrganizationPlanKey;
  label: string;
  seats: number;
  amountCents: number | null;
  displayPrice: string;
  perSeatLabel: string;
  coAdminLimit: number;
  envPriceId: string;
  badge: string;
  description: string;
  salesMode: OrganizationSalesMode;
};

export const ORGANIZATION_PLANS: Record<OrganizationPlanKey, OrganizationPlan> = {
  "org-10": {
    key: "org-10",
    label: "Starter Organization",
    seats: 10,
    amountCents: 97000,
    displayPrice: "$970",
    perSeatLabel: "$97 per learner",
    coAdminLimit: 0,
    envPriceId: "STRIPE_TCF_ORG_10_PRICE_ID",
    badge: "10 LEARNER SEATS",
    description: "Designed for a small cohort, pilot program, ministry, or community-based organization.",
    salesMode: "checkout",
  },
  "org-50": {
    key: "org-50",
    label: "Growth Organization",
    seats: 50,
    amountCents: null,
    displayPrice: "Contact for pricing",
    perSeatLabel: "Custom organization pricing",
    coAdminLimit: 0,
    envPriceId: "STRIPE_TCF_ORG_50_PRICE_ID",
    badge: "50 LEARNER SEATS",
    description: "Built for larger programs that need centralized enrollment and learner progress tracking.",
    salesMode: "contact",
  },
  "org-100": {
    key: "org-100",
    label: "Institution Organization",
    seats: 100,
    amountCents: null,
    displayPrice: "Contact for pricing",
    perSeatLabel: "Custom institutional pricing",
    coAdminLimit: 5,
    envPriceId: "STRIPE_TCF_ORG_100_PRICE_ID",
    badge: "100 LEARNER SEATS",
    description: "Institutional access for high-volume programs, agencies, schools, and multi-cohort deployments.",
    salesMode: "contact",
  },
};

export const ORGANIZATION_PLAN_KEYS = Object.keys(ORGANIZATION_PLANS) as OrganizationPlanKey[];

export function isOrganizationPlanKey(value: unknown): value is OrganizationPlanKey {
  return typeof value === "string" && value in ORGANIZATION_PLANS;
}

export function configuredOrganizationPriceId(planKey: OrganizationPlanKey) {
  return process.env[ORGANIZATION_PLANS[planKey].envPriceId]?.trim() || "";
}

export function organizationPlanAllowsCoAdmins(planKey: OrganizationPlanKey) {
  return ORGANIZATION_PLANS[planKey].coAdminLimit > 0;
}

export function organizationPlanRequiresContact(planKey: OrganizationPlanKey) {
  return ORGANIZATION_PLANS[planKey].salesMode === "contact";
}
