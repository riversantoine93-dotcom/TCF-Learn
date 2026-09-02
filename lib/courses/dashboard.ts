import type { ProgressData } from "../progress";

export function courseProgressSummary(progress: ProgressData, totalLessons: number) {
  const complete = Object.entries(progress).filter(([key, value]) => value === true && /^m\d+lesson\d+$/.test(key)).length;
  return { complete, percent: totalLessons > 0 ? Math.min(100, Math.round((complete / totalLessons) * 100)) : 0 };
}
