import { describe, expect, it } from "vitest";
import { ORGANIZATION_PLANS } from "../lib/organization-plans";

describe("organization plans",()=>{
  it("bundles the requested learner seat counts",()=>{
    expect(ORGANIZATION_PLANS["org-10"].seats).toBe(10);
    expect(ORGANIZATION_PLANS["org-50"].seats).toBe(50);
    expect(ORGANIZATION_PLANS["org-100"].seats).toBe(100);
  });

  it("issues one primary admin license separately from learner licenses",()=>{
    expect(ORGANIZATION_PLANS["org-10"].adminLicenses).toBe(1);
    expect(ORGANIZATION_PLANS["org-50"].adminLicenses).toBe(1);
    expect(ORGANIZATION_PLANS["org-100"].adminLicenses).toBe(1);
  });

  it("defines the $970 package as 10 learner logins plus 1 admin login",()=>{
    const plan=ORGANIZATION_PLANS["org-10"];
    expect(plan.amountCents).toBe(97000);
    expect(plan.seats).toBe(10);
    expect(plan.adminLicenses).toBe(1);
    expect(plan.salesMode).toBe("checkout");
  });

  it("only enables co-admins above 50 seats",()=>{
    expect(ORGANIZATION_PLANS["org-10"].coAdminLimit).toBe(0);
    expect(ORGANIZATION_PLANS["org-50"].coAdminLimit).toBe(0);
    expect(ORGANIZATION_PLANS["org-100"].coAdminLimit).toBeGreaterThan(0);
  });

  it("makes larger packages contact-only",()=>{
    expect(ORGANIZATION_PLANS["org-50"].amountCents).toBeNull();
    expect(ORGANIZATION_PLANS["org-50"].displayPrice).toBe("Contact for pricing");
    expect(ORGANIZATION_PLANS["org-50"].salesMode).toBe("contact");
    expect(ORGANIZATION_PLANS["org-100"].amountCents).toBeNull();
    expect(ORGANIZATION_PLANS["org-100"].displayPrice).toBe("Contact for pricing");
    expect(ORGANIZATION_PLANS["org-100"].salesMode).toBe("contact");
  });
});
