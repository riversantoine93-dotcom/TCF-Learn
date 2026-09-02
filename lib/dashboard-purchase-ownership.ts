import type { DashboardCourseSlug } from "./dashboard-enrollments";
import type { PurchaseKey } from "./course-purchases";

export type PurchaseAvailability = "available" | "purchased";

export function purchaseAvailability(enrolledCourses: DashboardCourseSlug[]): Record<PurchaseKey, PurchaseAvailability> {
  const ownsTurningForward = enrolledCourses.includes("turning-forward");
  const ownsThoughtToFreedom = enrolledCourses.includes("thought-to-freedom");

  return {
    "turning-forward": ownsTurningForward ? "purchased" : "available",
    "thought-to-freedom": ownsThoughtToFreedom ? "purchased" : "available",
    bundle: ownsTurningForward && ownsThoughtToFreedom ? "purchased" : "available",
  };
}
