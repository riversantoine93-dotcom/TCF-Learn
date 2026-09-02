export type CourseSlug = "turning-forward" | "thought-to-freedom";

export type CourseAccessCard = {
  slug: CourseSlug;
  purchased: boolean;
  primaryAction: "preview" | "open";
  showPurchaseCta: boolean;
};

const COURSE_SLUGS: CourseSlug[] = ["turning-forward", "thought-to-freedom"];

export function courseCardsForUser(isLoggedIn: boolean, enrolledCourses: CourseSlug[]): CourseAccessCard[] {
  return COURSE_SLUGS.map((slug) => {
    const purchased = isLoggedIn && enrolledCourses.includes(slug);
    return {
      slug,
      purchased,
      primaryAction: purchased ? "open" : "preview",
      showPurchaseCta: !purchased,
    };
  });
}
