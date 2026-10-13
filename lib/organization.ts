import learningCatalog from "./learning/catalog.json";

export type OrganizationRole = "admin" | "co_admin" | "learner";
export type OrganizationMemberStatus = "invited" | "active" | "removed";

export type OrganizationMembership = {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  role: OrganizationRole;
  status: OrganizationMemberStatus;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  plan_key: string;
  seat_limit: number;
  co_admin_limit: number;
  status: string;
};

export const ORGANIZATION_COURSE_SLUGS: string[] = learningCatalog.map(course => course.slug);

export function coursesForOrganizationRole(role: OrganizationRole, available: string[]) {
  return role === "learner" ? available : available.filter(slug => ["turning-forward", "thought-to-freedom"].includes(slug));
}

export function learnerSeatsUsed(rows: Array<Pick<OrganizationMembership, "role" | "status">>) {
  return rows.filter((row) => row.role === "learner" && row.status !== "removed").length;
}

export function coAdminSeatsUsed(rows: Array<Pick<OrganizationMembership, "role" | "status">>) {
  return rows.filter((row) => row.role === "co_admin" && row.status !== "removed").length;
}

export function canManageOrganization(role: OrganizationRole | null | undefined) {
  return role === "admin" || role === "co_admin";
}
