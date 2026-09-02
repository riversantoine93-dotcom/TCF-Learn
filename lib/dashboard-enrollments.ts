export type EnrollmentRow = {
  course_slug: string;
  active: boolean | null;
};

const SUPPORTED_COURSES = ["turning-forward", "thought-to-freedom"] as const;
export type DashboardCourseSlug = (typeof SUPPORTED_COURSES)[number];

export function activeCourseSlugs(rows: EnrollmentRow[] | null | undefined): DashboardCourseSlug[] {
  const active = new Set<DashboardCourseSlug>();
  for (const row of rows ?? []) {
    if (row.active !== true) continue;
    if (SUPPORTED_COURSES.includes(row.course_slug as DashboardCourseSlug)) {
      active.add(row.course_slug as DashboardCourseSlug);
    }
  }
  return SUPPORTED_COURSES.filter((slug) => active.has(slug));
}
