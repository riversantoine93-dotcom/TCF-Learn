import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("organization admin navigation shortcut", () => {
  const header = readFileSync(resolve(process.cwd(), "components/Header.tsx"), "utf8");
  const accessRoute = readFileSync(resolve(process.cwd(), "app/api/organization/access/route.ts"), "utf8");

  it("shows a direct Admin Dashboard link only after role access is confirmed", () => {
    expect(header).toContain("canAccessAdmin && <Link");
    expect(header).toContain('href="/organization/admin"');
    expect(header).toContain(">Admin Dashboard</Link>");
  });

  it("checks only active admin and co-admin memberships", () => {
    expect(accessRoute).toContain('.eq("status", "active")');
    expect(accessRoute).toContain('.in("role", ["admin", "co_admin"])');
    expect(accessRoute).toContain("canAccessAdmin: Boolean(membership)");
  });

  it("defaults to no admin access when the access check fails", () => {
    expect(accessRoute).toContain("canAccessAdmin: false");
  });
});
