import { supabase } from "./supabase";

export type ProgressData = Record<string, string | boolean | number>;

const LOCAL_KEY = "turning-forward-progress";

export function loadLocalProgress(): ProgressData {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); }
  catch { return {}; }
}

export function saveLocalProgress(data: ProgressData) {
  if (typeof window !== "undefined") localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export async function loadCloudProgress(userId: string): Promise<ProgressData> {
  if (!supabase) return {};
  const { data, error } = await supabase.from("course_progress").select("progress").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data?.progress as ProgressData) || {};
}

export async function saveCloudProgress(userId: string, progress: ProgressData) {
  if (!supabase) return;
  const { error } = await supabase.from("course_progress").upsert({ user_id: userId, course_slug: "turning-forward", progress, updated_at: new Date().toISOString() }, { onConflict: "user_id,course_slug" });
  if (error) throw error;
}
