import type { CourseDefinition } from "./types";
import { thoughtToFreedomCourse } from "./thought-to-freedom";

export const COURSE_SLUGS = ["turning-forward", "thought-to-freedom"] as const;

const turningForwardCourse: CourseDefinition = {
  slug: "turning-forward",
  title: "Turning Forward",
  subtitle: "The Work Beyond Fear",
  description: "A structured path from survival mode to clarity, discipline, purpose, and forward momentum.",
  modules: [],
};

export const courseRegistry: CourseDefinition[] = [turningForwardCourse, thoughtToFreedomCourse];

export function getCourseDefinition(slug: string) {
  return courseRegistry.find((course) => course.slug === slug);
}

export function getCourseModule(courseSlug: string, moduleSlug: string) {
  return getCourseDefinition(courseSlug)?.modules.find((module) => module.slug === moduleSlug);
}

export function getCourseLesson(courseSlug: string, moduleSlug: string, lessonSlug: string) {
  return getCourseModule(courseSlug, moduleSlug)?.lessons.find((lesson) => lesson.slug === lessonSlug);
}
