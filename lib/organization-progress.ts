import { modules as turningForwardModules } from "./course";
import { thoughtToFreedomCourse } from "./courses/thought-to-freedom";

export type ProgressItemStatus = "complete" | "in_progress" | "not_started";

export type ProgressItemSummary = {
  key: string;
  label: string;
  status: ProgressItemStatus;
};

export type ProgressModuleSummary = {
  number: number;
  title: string;
  completed: number;
  total: number;
  introWatched?: boolean;
  items: ProgressItemSummary[];
};

export type ProgressCourseSummary = {
  courseSlug: "turning-forward" | "thought-to-freedom";
  title: string;
  completed: number;
  total: number;
  percent: number;
  status: ProgressItemStatus;
  currentItem: string | null;
  lastActivity: string | null;
  modules: ProgressModuleSummary[];
};

export type LearnerProgressSummary = {
  userId: string;
  completed: number;
  total: number;
  percent: number;
  status: ProgressItemStatus;
  lastActivity: string | null;
  courses: ProgressCourseSummary[];
};

type ProgressRow = {
  user_id: string;
  course_slug: string;
  progress: Record<string, unknown> | null;
  updated_at: string | null;
};

function statusForItems(items: { key: string; label: string; complete: boolean }[], hasActivity: boolean) {
  const firstIncomplete = items.findIndex((item) => !item.complete);
  return items.map((item, index): ProgressItemSummary => ({
    key: item.key,
    label: item.label,
    status: item.complete ? "complete" : hasActivity && index === firstIncomplete ? "in_progress" : "not_started",
  }));
}

function buildCourseStatus(completed: number, total: number, hasActivity: boolean): ProgressItemStatus {
  if (completed >= total && total > 0) return "complete";
  if (hasActivity || completed > 0) return "in_progress";
  return "not_started";
}

function pct(completed: number, total: number) {
  return total ? Math.round((completed / total) * 100) : 0;
}

export function summarizeTurningForward(row?: ProgressRow): ProgressCourseSummary {
  const progress = row?.progress || {};
  const hasActivity = Object.keys(progress).length > 0;
  const flatItems: { key: string; label: string; complete: boolean }[] = [];
  const modules = turningForwardModules.map((module) => {
    const items = [
      ...[1, 2, 3].map((lessonNumber) => {
        const key = module.number === 1 ? `lesson${lessonNumber}` : `m${module.number}lesson${lessonNumber}`;
        return { key, label: `Lesson ${lessonNumber}`, complete: Boolean(progress[key]) };
      }),
      {
        key: module.number === 1 ? "challenge" : `m${module.number}challenge`,
        label: "Forward Challenge",
        complete: Boolean(progress[module.number === 1 ? "challenge" : `m${module.number}challenge`]),
      },
    ];
    flatItems.push(...items.map((item) => ({ ...item, label: `Module ${module.number}: ${item.label}` })));
    const statuses = statusForItems(items, hasActivity);
    return {
      number: module.number,
      title: module.title,
      completed: items.filter((item) => item.complete).length,
      total: items.length,
      introWatched: Boolean(progress[`m${module.number}opener`]),
      items: statuses,
    };
  });

  const completed = flatItems.filter((item) => item.complete).length;
  const total = flatItems.length;
  const firstOpen = flatItems.find((item) => !item.complete);

  return {
    courseSlug: "turning-forward",
    title: "Turning Forward",
    completed,
    total,
    percent: pct(completed, total),
    status: buildCourseStatus(completed, total, hasActivity),
    currentItem: firstOpen?.label || null,
    lastActivity: row?.updated_at || null,
    modules,
  };
}

export function summarizeThoughtToFreedom(row?: ProgressRow): ProgressCourseSummary {
  const progress = row?.progress || {};
  const hasActivity = Object.keys(progress).length > 0;
  const orientation = {
    key: "m0lesson0",
    label: "Course Orientation",
    complete: Boolean(progress.m0lesson0 || progress.orientationComplete),
  };

  const flatItems: { key: string; label: string; complete: boolean }[] = [orientation];
  const moduleSummaries = thoughtToFreedomCourse.modules.map((module) => {
    const items = module.lessons.map((lesson) => {
      const key = `m${module.number}lesson${lesson.number}`;
      return { key, label: `Lesson ${lesson.number}: ${lesson.title}`, complete: Boolean(progress[key]) };
    });
    flatItems.push(...items.map((item) => ({ ...item, label: `Module ${module.number}: ${item.label}` })));
    return {
      number: module.number,
      title: module.title,
      completed: items.filter((item) => item.complete).length,
      total: items.length,
      items: statusForItems(items, hasActivity),
    };
  });

  const modules: ProgressModuleSummary[] = [
    {
      number: 0,
      title: "Orientation",
      completed: orientation.complete ? 1 : 0,
      total: 1,
      items: statusForItems([orientation], hasActivity),
    },
    ...moduleSummaries,
  ];

  const completed = flatItems.filter((item) => item.complete).length;
  const total = flatItems.length;
  const firstOpen = flatItems.find((item) => !item.complete);

  return {
    courseSlug: "thought-to-freedom",
    title: "Thought to Freedom",
    completed,
    total,
    percent: pct(completed, total),
    status: buildCourseStatus(completed, total, hasActivity),
    currentItem: firstOpen?.label || null,
    lastActivity: row?.updated_at || null,
    modules,
  };
}

export function summarizeLearnerProgress(userId: string, rows: ProgressRow[]): LearnerProgressSummary {
  const turningRow = rows.find((row) => row.course_slug === "turning-forward");
  const thoughtRow = rows.find((row) => row.course_slug === "thought-to-freedom");
  const courses = [summarizeTurningForward(turningRow), summarizeThoughtToFreedom(thoughtRow)];
  const completed = courses.reduce((sum, course) => sum + course.completed, 0);
  const total = courses.reduce((sum, course) => sum + course.total, 0);
  const activityDates = courses.map((course) => course.lastActivity).filter(Boolean) as string[];
  const lastActivity = activityDates.sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;

  return {
    userId,
    completed,
    total,
    percent: pct(completed, total),
    status: buildCourseStatus(completed, total, Boolean(lastActivity)),
    lastActivity,
    courses,
  };
}
