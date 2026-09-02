import { supabase } from "./supabase";
import type { CourseSlug } from "./courses/types";

export type ProgressData = Record<string, string | boolean | number>;

export function progressStorageKey(courseSlug: CourseSlug = "turning-forward") {
  return `${courseSlug}-progress`;
}

export function loadLocalProgress(courseSlug: CourseSlug = "turning-forward"): ProgressData {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(progressStorageKey(courseSlug)) || "{}"); }
  catch { return {}; }
}

export function saveLocalProgress(data: ProgressData, courseSlug: CourseSlug = "turning-forward") {
  if (typeof window !== "undefined") localStorage.setItem(progressStorageKey(courseSlug), JSON.stringify(data));
}

export async function loadCloudProgress(userId: string, courseSlug: CourseSlug = "turning-forward"): Promise<ProgressData> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("course_progress")
    .select("progress")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .maybeSingle();
  if (error) throw error;
  return (data?.progress as ProgressData) || {};
}

export async function saveCloudProgress(userId: string, progress: ProgressData, courseSlug: CourseSlug = "turning-forward") {
  if (!supabase) return;
  const { error } = await supabase
    .from("course_progress")
    .upsert({ user_id: userId, course_slug: courseSlug, progress, updated_at: new Date().toISOString() }, { onConflict: "user_id,course_slug" });
  if (error) throw error;
}
